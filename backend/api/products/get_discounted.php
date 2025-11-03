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

$limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 3;

try {
    // Query to get product_colors with discounts
    // Group by product_color to avoid duplicates
    $sql = "
        SELECT
            p.id as product_id,
            p.name as product_name,
            pc.id as product_color_id,
            pc.color,
            MIN(po.price) as price,
            MAX(po.discount_percentage) as discount_percentage,
            pc.image_url,
            pc.image_url_2,
            SUM(po.stock) as total_stock,
            p.description,
            p.materials,
            p.sex,
            p.type
        FROM products p
        INNER JOIN product_colors pc ON p.id = pc.product_id
        INNER JOIN product_options po ON pc.id = po.product_color_id
        WHERE po.discount_percentage > 0 AND po.stock > 0
        GROUP BY p.id, p.name, pc.id, pc.color, pc.image_url, pc.image_url_2, p.description, p.materials, p.sex, p.type
        ORDER BY po.discount_percentage DESC, RAND()
        LIMIT :limit
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $items = $stmt->fetchAll();

    // Fetch all product options for each product_color
    if (!empty($items)) {
        $productColorIds = array_unique(array_column($items, 'product_color_id'));

        if (!empty($productColorIds)) {
            $placeholders = str_repeat('?,', count($productColorIds) - 1) . '?';

            $optionsSql = "
                SELECT
                    po.product_color_id,
                    po.id,
                    po.size,
                    po.price,
                    po.discount_percentage,
                    po.stock
                FROM product_options po
                WHERE po.product_color_id IN ($placeholders)
                ORDER BY po.product_color_id, po.size
            ";

            $optionsStmt = $pdo->prepare($optionsSql);
            $optionsStmt->execute(array_values($productColorIds));
            $allOptions = $optionsStmt->fetchAll();

            // Group options by product_color_id
            $optionsByProductColor = [];
            foreach ($allOptions as $option) {
                $optionsByProductColor[$option['product_color_id']][] = $option;
            }

            // Add options array to each item
            foreach ($items as &$item) {
                $item['options'] = $optionsByProductColor[$item['product_color_id']] ?? [];
            }
        }
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $items
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch discounted products']);
    error_log("Fetch discounted products error: " . $e->getMessage());
}
