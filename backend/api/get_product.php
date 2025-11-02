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

$productId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if (!$productId) {
    http_response_code(400);
    echo json_encode(['error' => 'Product ID is required']);
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
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    error_log("Database connection error: " . $e->getMessage());
    exit();
}

try {
    $productStmt = $pdo->prepare("
        SELECT id, name, description, materials, sex, type, created_at, updated_at
        FROM products
        WHERE id = ?
        LIMIT 1
    ");
    $productStmt->execute([$productId]);
    $product = $productStmt->fetch();

    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit();
    }

    $colorStmt = $pdo->prepare("
        SELECT id, color, image_url, image_url_2, created_at, updated_at
        FROM product_colors
        WHERE product_id = ?
        ORDER BY id ASC
    ");
    $colorStmt->execute([$productId]);
    $colors = $colorStmt->fetchAll();

    $colorOptions = [];
    $options = [];

    if (!empty($colors)) {
        $colorIds = array_column($colors, 'id');
        $placeholders = implode(',', array_fill(0, count($colorIds), '?'));

        $optionsStmt = $pdo->prepare("
            SELECT id, product_color_id, size, price, discount_percentage, stock, created_at, updated_at
            FROM product_options
            WHERE product_color_id IN ($placeholders)
            ORDER BY size ASC
        ");
        $optionsStmt->execute($colorIds);
        $options = $optionsStmt->fetchAll();

        foreach ($options as $option) {
            $colorId = (int) $option['product_color_id'];

            if (!isset($colorOptions[$colorId])) {
                $colorOptions[$colorId] = [];
            }

            $colorOptions[$colorId][] = [
                'id' => (int) $option['id'],
                'size' => (string) $option['size'],
                'price' => (float) $option['price'],
                'discount_percentage' => (int) $option['discount_percentage'],
                'stock' => (int) $option['stock'],
                'created_at' => $option['created_at'],
                'updated_at' => $option['updated_at'],
            ];
        }
    }

    $product['colors'] = array_map(function ($color) use ($colorOptions) {
        $colorId = (int) $color['id'];

        return [
            'id' => $colorId,
            'color' => (string) $color['color'],
            'image_url' => $color['image_url'],
            'image_url_2' => $color['image_url_2'],
            'created_at' => $color['created_at'],
            'updated_at' => $color['updated_at'],
            'options' => $colorOptions[$colorId] ?? [],
        ];
    }, $colors);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'product' => [
            'id' => (int) $product['id'],
            'name' => (string) $product['name'],
            'description' => (string) $product['description'],
            'materials' => $product['materials'],
            'sex' => (string) $product['sex'],
            'type' => (string) $product['type'],
            'created_at' => $product['created_at'],
            'updated_at' => $product['updated_at'],
            'colors' => $product['colors'],
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch product']);
    error_log("Get product error: " . $e->getMessage());
    exit();
}
