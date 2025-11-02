<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized - Please login first']);
    exit();
}

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden - Admin access required']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

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

    if (!isset($file['error']) || is_array($file['error'])) {
        throw new Exception('Invalid file upload');
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('File upload error: ' . $file['error']);
    }

    if ($file['size'] > 5242880) {
        throw new Exception('File size exceeds 5MB limit');
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('product_', true) . '.' . $extension;
    $filepath = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Failed to move uploaded file');
    }

    return '/uploads/products/' . $filename;
}

// Function to delete image file
function deleteImageFile($imageUrl) {
    if (empty($imageUrl)) return;

    $uploadDir = __DIR__ . '/../../uploads/products/';
    $filename = basename($imageUrl);
    $filepath = $uploadDir . $filename;

    if (file_exists($filepath)) {
        @unlink($filepath);
    }
}

$productId = isset($_POST['id']) ? intval($_POST['id']) : (isset($_GET['id']) ? intval($_GET['id']) : 0);

if ($productId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid product ID is required']);
    exit();
}

// Get POST data
$name = isset($_POST['name']) ? trim($_POST['name']) : null;
$description = isset($_POST['description']) ? trim($_POST['description']) : null;
$materials = isset($_POST['materials']) ? trim($_POST['materials']) : null;
$sex = isset($_POST['sex']) ? trim($_POST['sex']) : null;
$type = isset($_POST['type']) ? trim($_POST['type']) : null;
$colorsData = isset($_POST['colors_data']) ? $_POST['colors_data'] : null;

// Validate enum values if provided
if ($sex !== null) {
    $validSex = ['male', 'female', 'unisex'];
    if (!in_array($sex, $validSex)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid sex value. Must be male, female, or unisex']);
        exit();
    }
}

if ($type !== null) {
    $validTypes = ['casual', 'arch', 'track_field', 'accessories'];
    if (!in_array($type, $validTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid type value. Must be casual, arch, track_field, or accessories']);
        exit();
    }
}

try {
    // Check if product exists
    $checkSql = "SELECT id FROM products WHERE id = :id";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':id' => $productId]);

    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit();
    }

    // Begin transaction
    $pdo->beginTransaction();

    // Update basic product fields
    $updateFields = [];
    $params = [':id' => $productId];

    if ($name !== null) {
        if (empty($name)) {
            throw new Exception('Product name cannot be empty');
        }
        $updateFields[] = "name = :name";
        $params[':name'] = $name;
    }

    if ($description !== null) {
        $updateFields[] = "description = :description";
        $params[':description'] = $description;
    }

    if ($materials !== null) {
        $updateFields[] = "materials = :materials";
        $params[':materials'] = $materials;
    }

    if ($sex !== null) {
        $updateFields[] = "sex = :sex";
        $params[':sex'] = $sex;
    }

    if ($type !== null) {
        $updateFields[] = "type = :type";
        $params[':type'] = $type;
    }

    if (!empty($updateFields)) {
        $updateFields[] = "updated_at = NOW()";
        $sql = "UPDATE products SET " . implode(', ', $updateFields) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    // Handle colors update if provided
    if ($colorsData !== null) {
        $colors = json_decode($colorsData, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid colors data format');
        }

        if (!is_array($colors)) {
            throw new Exception('Colors data must be an array');
        }

        // Fetch existing colors
        $existingColorsSql = "SELECT id, color, image_url, image_url_2 FROM product_colors WHERE product_id = :product_id";
        $existingColorsStmt = $pdo->prepare($existingColorsSql);
        $existingColorsStmt->execute([':product_id' => $productId]);
        $existingColors = $existingColorsStmt->fetchAll(PDO::FETCH_ASSOC);

        $existingColorsMap = [];
        foreach ($existingColors as $existingColor) {
            $existingColorsMap[$existingColor['id']] = $existingColor;
        }

        $processedColorIds = [];

        // Process each color in the update
        foreach ($colors as $index => $colorData) {
            $colorId = isset($colorData['id']) ? intval($colorData['id']) : 0;
            $color = isset($colorData['color']) ? trim($colorData['color']) : '';
            $keepImage1 = isset($colorData['keep_image_1']) ? filter_var($colorData['keep_image_1'], FILTER_VALIDATE_BOOLEAN) : true;
            $keepImage2 = isset($colorData['keep_image_2']) ? filter_var($colorData['keep_image_2'], FILTER_VALIDATE_BOOLEAN) : true;

            if (empty($color)) {
                throw new Exception("Color name is required for variant at index $index");
            }

            $imageUrl1 = null;
            $imageUrl2 = null;

            // Handle existing color update
            if ($colorId > 0 && isset($existingColorsMap[$colorId])) {
                $processedColorIds[] = $colorId;

                // Keep existing images by default
                $imageUrl1 = $keepImage1 ? $existingColorsMap[$colorId]['image_url'] : null;
                $imageUrl2 = $keepImage2 ? $existingColorsMap[$colorId]['image_url_2'] : null;

                // Check for new image uploads
                $imageKey1 = "color_{$index}_image_1";
                $imageKey2 = "color_{$index}_image_2";

                if (isset($_FILES[$imageKey1]) && $_FILES[$imageKey1]['error'] !== UPLOAD_ERR_NO_FILE) {
                    // Delete old image if replacing
                    if (!empty($existingColorsMap[$colorId]['image_url'])) {
                        deleteImageFile($existingColorsMap[$colorId]['image_url']);
                    }
                    $imageUrl1 = uploadImage($_FILES[$imageKey1]);
                }

                if (isset($_FILES[$imageKey2]) && $_FILES[$imageKey2]['error'] !== UPLOAD_ERR_NO_FILE) {
                    // Delete old image if replacing
                    if (!empty($existingColorsMap[$colorId]['image_url_2'])) {
                        deleteImageFile($existingColorsMap[$colorId]['image_url_2']);
                    }
                    $imageUrl2 = uploadImage($_FILES[$imageKey2]);
                }

                // Update existing color
                $updateColorSql = "UPDATE product_colors SET color = :color, image_url = :image_url, image_url_2 = :image_url_2, updated_at = NOW() WHERE id = :id";
                $updateColorStmt = $pdo->prepare($updateColorSql);
                $updateColorStmt->execute([
                    ':id' => $colorId,
                    ':color' => $color,
                    ':image_url' => $imageUrl1,
                    ':image_url_2' => $imageUrl2
                ]);

            } else {
                // Handle new color
                $imageKey1 = "color_{$index}_image_1";
                $imageKey2 = "color_{$index}_image_2";

                if (isset($_FILES[$imageKey1]) && $_FILES[$imageKey1]['error'] !== UPLOAD_ERR_NO_FILE) {
                    $imageUrl1 = uploadImage($_FILES[$imageKey1]);
                }

                if (isset($_FILES[$imageKey2]) && $_FILES[$imageKey2]['error'] !== UPLOAD_ERR_NO_FILE) {
                    $imageUrl2 = uploadImage($_FILES[$imageKey2]);
                }

                // Insert new color
                $insertColorSql = "INSERT INTO product_colors (product_id, color, image_url, image_url_2, created_at, updated_at) VALUES (:product_id, :color, :image_url, :image_url_2, NOW(), NOW())";
                $insertColorStmt = $pdo->prepare($insertColorSql);
                $insertColorStmt->execute([
                    ':product_id' => $productId,
                    ':color' => $color,
                    ':image_url' => $imageUrl1,
                    ':image_url_2' => $imageUrl2
                ]);

                $colorId = $pdo->lastInsertId();
                $processedColorIds[] = $colorId;
            }

            // Handle options for this color
            $options = isset($colorData['options']) ? $colorData['options'] : [];

            if (empty($options) || !is_array($options)) {
                throw new Exception("At least one size option is required for color: $color");
            }

            // Fetch existing options for this color
            $existingOptionsSql = "SELECT id, size, price, discount_percentage, stock FROM product_options WHERE product_color_id = :color_id";
            $existingOptionsStmt = $pdo->prepare($existingOptionsSql);
            $existingOptionsStmt->execute([':color_id' => $colorId]);
            $existingOptions = $existingOptionsStmt->fetchAll(PDO::FETCH_ASSOC);

            $existingOptionsMap = [];
            foreach ($existingOptions as $existingOption) {
                $existingOptionsMap[$existingOption['id']] = $existingOption;
            }

            $processedOptionIds = [];

            // Process each option
            foreach ($options as $optionIndex => $option) {
                $optionId = isset($option['id']) ? intval($option['id']) : 0;
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

                // Update or insert option
                if ($optionId > 0 && isset($existingOptionsMap[$optionId])) {
                    $processedOptionIds[] = $optionId;

                    // Update existing option
                    $updateOptionSql = "UPDATE product_options SET size = :size, price = :price, discount_percentage = :discount_percentage, stock = :stock, updated_at = NOW() WHERE id = :id";
                    $updateOptionStmt = $pdo->prepare($updateOptionSql);
                    $updateOptionStmt->execute([
                        ':id' => $optionId,
                        ':size' => $size,
                        ':price' => $price,
                        ':discount_percentage' => $discount,
                        ':stock' => $stock
                    ]);
                } else {
                    // Insert new option
                    $insertOptionSql = "INSERT INTO product_options (product_color_id, size, price, discount_percentage, stock, created_at, updated_at) VALUES (:product_color_id, :size, :price, :discount_percentage, :stock, NOW(), NOW())";
                    $insertOptionStmt = $pdo->prepare($insertOptionSql);
                    $insertOptionStmt->execute([
                        ':product_color_id' => $colorId,
                        ':size' => $size,
                        ':price' => $price,
                        ':discount_percentage' => $discount,
                        ':stock' => $stock
                    ]);

                    $processedOptionIds[] = $pdo->lastInsertId();
                }
            }

            // Delete options that were not in the update
            foreach ($existingOptionsMap as $existingOptionId => $existingOption) {
                if (!in_array($existingOptionId, $processedOptionIds)) {
                    $deleteOptionSql = "DELETE FROM product_options WHERE id = :id";
                    $deleteOptionStmt = $pdo->prepare($deleteOptionSql);
                    $deleteOptionStmt->execute([':id' => $existingOptionId]);
                }
            }
        }

        // Delete colors that were not in the update
        foreach ($existingColorsMap as $existingColorId => $existingColor) {
            if (!in_array($existingColorId, $processedColorIds)) {
                // Delete associated images
                deleteImageFile($existingColor['image_url']);
                deleteImageFile($existingColor['image_url_2']);

                // Delete color (CASCADE will handle options)
                $deleteColorSql = "DELETE FROM product_colors WHERE id = :id";
                $deleteColorStmt = $pdo->prepare($deleteColorSql);
                $deleteColorStmt->execute([':id' => $existingColorId]);
            }
        }
    }

    // Commit transaction
    $pdo->commit();

    // Fetch the updated product with all related data
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
    if (empty($results)) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found after update']);
        exit();
    }

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
        if ($row['color_id']) {
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
    }

    $product['colors'] = array_values($colorsMap);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Product updated successfully',
        'data' => $product
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    error_log("Update product error: " . $e->getMessage());
}
