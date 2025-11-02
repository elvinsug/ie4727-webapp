<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
session_start();

// Check if user is authenticated
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized - Please login first']);
    exit();
}

// Check if user is admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden - Admin access required']);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Database connection
try {
    $host = getenv('DB_HOST') ?: 'localhost';
    $dbname = getenv('DB_NAME') ?: 'miona_app';
    $username = getenv('DB_USER') ?: 'root';
    $db_password = getenv('DB_PASSWORD') ?: '';

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $db_password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    error_log("Database connection error: " . $e->getMessage());
    exit();
}

// Function to handle file upload
function uploadImage($file) {
    $uploadDir = __DIR__ . '/../../uploads/products/';

    // Ensure upload directory exists
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
            throw new Exception('Failed to create upload directory : ' . $uploadDir);
        }
    }

    if (!is_writable($uploadDir)) {
        throw new Exception('Upload directory is not writable');
    }

    // Validate file
    if (!isset($file['error']) || is_array($file['error'])) {
        throw new Exception('Invalid file upload');
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('File upload error: ' . $file['error']);
    }

    // Validate file size (max 5MB)
    if ($file['size'] > 5242880) {
        throw new Exception('File size exceeds 5MB limit');
    }

    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('product_', true) . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Failed to move uploaded file');
    }

    // Return relative URL
    return '/miona/uploads/products/' . $filename;
}

// Get POST data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$description = isset($_POST['description']) ? trim($_POST['description']) : '';
$materials = isset($_POST['materials']) ? trim($_POST['materials']) : '';
$sex = isset($_POST['sex']) ? trim($_POST['sex']) : 'male';
$type = isset($_POST['type']) ? trim($_POST['type']) : 'casual';
$colorsData = isset($_POST['colors_data']) ? $_POST['colors_data'] : '[]';

// Validate required fields
if (empty($name)) {
    http_response_code(400);
    echo json_encode(['error' => 'Product name is required']);
    exit();
}

if (empty($description)) {
    http_response_code(400);
    echo json_encode(['error' => 'Product description is required']);
    exit();
}

// Validate enum values
$validSex = ['male', 'female', 'unisex'];
if (!in_array($sex, $validSex)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid sex value. Must be male, female, or unisex']);
    exit();
}

$validTypes = ['casual', 'arch', 'track_field', 'accessories'];
if (!in_array($type, $validTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid type value. Must be casual, arch, track_field, or accessories']);
    exit();
}

// Parse colors data
$colors = json_decode($colorsData, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid colors data format']);
    exit();
}

// Validate colors data
if (empty($colors) || !is_array($colors)) {
    http_response_code(400);
    echo json_encode(['error' => 'At least one color variant is required']);
    exit();
}

try {
    // Begin transaction
    $pdo->beginTransaction();

    // Insert product
    $sql = "INSERT INTO products (name, description, materials, sex, type, created_at, updated_at)
            VALUES (:name, :description, :materials, :sex, :type, NOW(), NOW())";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name' => $name,
        ':description' => $description,
        ':materials' => $materials,
        ':sex' => $sex,
        ':type' => $type
    ]);

    $productId = $pdo->lastInsertId();

    // Process each color variant
    foreach ($colors as $index => $colorData) {
        $color = isset($colorData['color']) ? trim($colorData['color']) : '';

        if (empty($color)) {
            throw new Exception("Color name is required for variant at index $index");
        }

        // Handle image uploads
        $imageUrl1 = null;
        $imageUrl2 = null;

        $imageKey1 = "color_{$index}_image_1";
        $imageKey2 = "color_{$index}_image_2";

        if (isset($_FILES[$imageKey1]) && $_FILES[$imageKey1]['error'] !== UPLOAD_ERR_NO_FILE) {
            $imageUrl1 = uploadImage($_FILES[$imageKey1]);
        }

        if (isset($_FILES[$imageKey2]) && $_FILES[$imageKey2]['error'] !== UPLOAD_ERR_NO_FILE) {
            $imageUrl2 = uploadImage($_FILES[$imageKey2]);
        }

        // Insert product color
        $colorSql = "INSERT INTO product_colors (product_id, color, image_url, image_url_2, created_at, updated_at)
                     VALUES (:product_id, :color, :image_url, :image_url_2, NOW(), NOW())";

        $colorStmt = $pdo->prepare($colorSql);
        $colorStmt->execute([
            ':product_id' => $productId,
            ':color' => $color,
            ':image_url' => $imageUrl1,
            ':image_url_2' => $imageUrl2
        ]);

        $colorId = $pdo->lastInsertId();

        // Process size/price options for this color
        $options = isset($colorData['options']) ? $colorData['options'] : [];

        if (empty($options) || !is_array($options)) {
            throw new Exception("At least one size option is required for color: $color");
        }

        foreach ($options as $optionIndex => $option) {
            $size = isset($option['size']) ? trim($option['size']) : '';
            $price = isset($option['price']) ? floatval($option['price']) : 0;
            $discount = isset($option['discount_percentage']) ? intval($option['discount_percentage']) : 0;
            $stock = isset($option['stock']) ? intval($option['stock']) : 0;

            if (empty($size)) {
                throw new Exception("Size is required for option at index $optionIndex in color: $color");
            }

            if ($price < 0) {
                throw new Exception("Price cannot be negative for size: $size in color: $color");
            }

            if ($discount < 0 || $discount > 100) {
                throw new Exception("Discount must be between 0 and 100 for size: $size in color: $color");
            }

            if ($stock < 0) {
                throw new Exception("Stock cannot be negative for size: $size in color: $color");
            }

            // Insert product option
            $optionSql = "INSERT INTO product_options (product_color_id, size, price, discount_percentage, stock, created_at, updated_at)
                         VALUES (:product_color_id, :size, :price, :discount_percentage, :stock, NOW(), NOW())";

            $optionStmt = $pdo->prepare($optionSql);
            $optionStmt->execute([
                ':product_color_id' => $colorId,
                ':size' => $size,
                ':price' => $price,
                ':discount_percentage' => $discount,
                ':stock' => $stock
            ]);
        }
    }

    // Commit transaction
    $pdo->commit();

    // Fetch the created product with all related data
    $fetchSql = "SELECT p.*,
                        pc.id as color_id, pc.color, pc.image_url, pc.image_url_2,
                        po.id as option_id, po.size, po.price, po.discount_percentage, po.stock
                 FROM products p
                 LEFT JOIN product_colors pc ON p.id = pc.product_id
                 LEFT JOIN product_options po ON pc.id = po.product_color_id
                 WHERE p.id = :id
                 ORDER BY pc.id, po.id";

    $fetchStmt = $pdo->prepare($fetchSql);
    $fetchStmt->execute([':id' => $productId]);
    $results = $fetchStmt->fetchAll();

    // Structure the response
    $product = [
        'id' => $results[0]['id'],
        'name' => $results[0]['name'],
        'description' => $results[0]['description'],
        'materials' => $results[0]['materials'],
        'sex' => $results[0]['sex'],
        'type' => $results[0]['type'],
        'created_at' => $results[0]['created_at'],
        'updated_at' => $results[0]['updated_at'],
        'colors' => []
    ];

    $colorsMap = [];
    foreach ($results as $row) {
        if (!isset($colorsMap[$row['color_id']])) {
            $colorsMap[$row['color_id']] = [
                'id' => $row['color_id'],
                'color' => $row['color'],
                'image_url' => $row['image_url'],
                'image_url_2' => $row['image_url_2'],
                'options' => []
            ];
        }

        if ($row['option_id']) {
            $colorsMap[$row['color_id']]['options'][] = [
                'id' => $row['option_id'],
                'size' => $row['size'],
                'price' => floatval($row['price']),
                'discount_percentage' => intval($row['discount_percentage']),
                'stock' => intval($row['stock'])
            ];
        }
    }

    $product['colors'] = array_values($colorsMap);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Product created successfully',
        'data' => $product
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    error_log("Create product error: " . $e->getMessage());
}
