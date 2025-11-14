<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    return app_json_response(200, ['success' => true]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    return app_json_error(405, 'Method not allowed');
}

$productId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (($productId === null || $productId === false) && isset($_GET['id'])) {
    $productId = filter_var($_GET['id'], FILTER_VALIDATE_INT);
}

if (!$productId) {
    return app_json_error(400, 'Product ID is required');
}

try {
    $pdo = app_get_pdo();
} catch (PDOException $e) {
    error_log("Database connection error: " . $e->getMessage());
    return app_json_error(500, 'Database connection failed');
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
        return app_json_error(404, 'Product not found');
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
              AND stock > 0
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

    return app_json_response(200, [
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
    error_log("Get product error: " . $e->getMessage());
    return app_json_error(500, 'Failed to fetch product');
}
