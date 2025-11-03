<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

// Get optional filters
$productId = isset($_GET['id']) ? intval($_GET['id']) : null;
$sex = isset($_GET['sex']) ? trim($_GET['sex']) : '';
$type = isset($_GET['type']) ? trim($_GET['type']) : '';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    // Build WHERE clause for filtering
    $whereConditions = [];
    $params = [];

    if ($productId) {
        $whereConditions[] = 'p.id = :product_id';
        $params[':product_id'] = $productId;
    }

    if (!empty($sex)) {
        $allowedSex = ['male', 'female', 'unisex'];
        if (in_array($sex, $allowedSex)) {
            $whereConditions[] = 'p.sex = :sex';
            $params[':sex'] = $sex;
        }
    }

    if (!empty($type)) {
        $allowedTypes = ['casual', 'arch', 'track_field', 'accessories'];
        if (in_array($type, $allowedTypes)) {
            $whereConditions[] = 'p.type = :type';
            $params[':type'] = $type;
        }
    }

    if (!empty($search)) {
        $whereConditions[] = '(p.name LIKE :search OR p.description LIKE :search OR p.materials LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }

    $whereClause = '';
    if (!empty($whereConditions)) {
        $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
    }

    // Fetch all products
    $productsSql = "
        SELECT
            p.id,
            p.name,
            p.description,
            p.materials,
            p.sex,
            p.type,
            p.created_at,
            p.updated_at
        FROM products p
        $whereClause
        ORDER BY p.created_at DESC
    ";

    $productsStmt = $pdo->prepare($productsSql);
    $productsStmt->execute($params);
    $products = $productsStmt->fetchAll();

    if (empty($products)) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => []
        ]);
        exit();
    }

    // Get all product IDs
    $productIds = array_column($products, 'id');
    $placeholders = str_repeat('?,', count($productIds) - 1) . '?';

    // Fetch all colors for these products
    $colorsSql = "
        SELECT
            pc.id,
            pc.product_id,
            pc.color,
            pc.image_url,
            pc.image_url_2,
            pc.created_at,
            pc.updated_at
        FROM product_colors pc
        WHERE pc.product_id IN ($placeholders)
        ORDER BY pc.product_id, pc.id
    ";

    $colorsStmt = $pdo->prepare($colorsSql);
    $colorsStmt->execute($productIds);
    $colors = $colorsStmt->fetchAll();

    // Get all color IDs
    $colorIds = array_column($colors, 'id');

    // Fetch all options for these colors
    $optionsByColor = [];
    if (!empty($colorIds)) {
        $colorPlaceholders = str_repeat('?,', count($colorIds) - 1) . '?';

        $optionsSql = "
            SELECT
                po.id,
                po.product_color_id,
                po.size,
                po.price,
                po.discount_percentage,
                po.stock,
                po.created_at,
                po.updated_at
            FROM product_options po
            WHERE po.product_color_id IN ($colorPlaceholders)
              AND po.stock > 0
            ORDER BY po.product_color_id, po.size
        ";

        $optionsStmt = $pdo->prepare($optionsSql);
        $optionsStmt->execute($colorIds);
        $options = $optionsStmt->fetchAll();

        // Group options by product_color_id
        foreach ($options as $option) {
            $optionsByColor[$option['product_color_id']][] = [
                'id' => intval($option['id']),
                'size' => $option['size'],
                'price' => floatval($option['price']),
                'discount_percentage' => intval($option['discount_percentage']),
                'stock' => intval($option['stock'])
            ];
        }
    }

    // Add options to colors and group by product_id
    $colorsByProduct = [];
    foreach ($colors as $color) {
        // Add options array to this color
        $colorWithOptions = $color;
        $colorWithOptions['options'] = $optionsByColor[$color['id']] ?? [];

        // Group by product_id
        $colorsByProduct[$color['product_id']][] = $colorWithOptions;
    }

    // Build the final nested structure
    $result = [];
    foreach ($products as $product) {
        $productColors = $colorsByProduct[$product['id']] ?? [];

        // Clean up color data and ensure options are included
        $cleanColors = [];
        foreach ($productColors as $color) {
            $colorOptions = $color['options'] ?? [];

            if (empty($colorOptions)) {
                continue;
            }

            $cleanColors[] = [
                'id' => intval($color['id']),
                'color' => $color['color'],
                'image_url' => $color['image_url'],
                'image_url_2' => $color['image_url_2'],
                'options' => $colorOptions
            ];
        }

        if (empty($cleanColors)) {
            continue;
        }

        $result[] = [
            'id' => intval($product['id']),
            'name' => $product['name'],
            'description' => $product['description'],
            'materials' => $product['materials'],
            'sex' => $product['sex'],
            'type' => $product['type'],
            'created_at' => $product['created_at'],
            'updated_at' => $product['updated_at'],
            'colors' => $cleanColors
        ];
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $result
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch products']);
    error_log("Fetch products error: " . $e->getMessage());
}
