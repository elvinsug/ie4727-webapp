<?php
session_start();

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

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized - Please login']);
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

// Verify user is admin
try {
    $userStmt = $pdo->prepare("SELECT role FROM users WHERE id = :user_id");
    $userStmt->execute([':user_id' => $_SESSION['user_id']]);
    $user = $userStmt->fetch();

    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden - Admin access required']);
        exit();
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to verify user']);
    error_log("User verification error: " . $e->getMessage());
    exit();
}

// Get query parameters
$sort = isset($_GET['sort']) ? trim($_GET['sort']) : 'income';
$order = isset($_GET['order']) ? trim($_GET['order']) : 'desc';
$limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 50;
$offset = isset($_GET['offset']) ? max(0, intval($_GET['offset'])) : 0;

// Validate sort parameter
$allowedSorts = ['quantity', 'income'];
if (!in_array($sort, $allowedSorts)) {
    $sort = 'income';
}

// Validate order parameter
$allowedOrders = ['asc', 'desc'];
if (!in_array($order, $allowedOrders)) {
    $order = 'desc';
}

// Build ORDER BY clause
$orderByClause = $sort === 'quantity'
    ? "ORDER BY total_quantity $order"
    : "ORDER BY total_income $order";

try {
    // Get sales report data aggregated by product_color
    $sql = "
        SELECT
            pc.id as product_color_id,
            p.id as product_id,
            p.name as product_name,
            p.sex,
            p.type,
            pc.color,
            pc.image_url,
            SUM(t.quantity) as total_quantity,
            SUM(t.total_amount) as total_income,
            COUNT(DISTINCT t.id) as transaction_count,
            AVG(t.price_paid) as avg_price_paid,
            MIN(t.transaction_date) as first_sale_date,
            MAX(t.transaction_date) as last_sale_date
        FROM transactions t
        INNER JOIN product_options po ON t.product_option_id = po.id
        INNER JOIN product_colors pc ON po.product_color_id = pc.id
        INNER JOIN products p ON pc.product_id = p.id
        WHERE t.status = 'completed'
        GROUP BY pc.id, p.id, p.name, p.sex, p.type, pc.color, pc.image_url
        $orderByClause
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $salesData = $stmt->fetchAll();

    // Format numeric values
    foreach ($salesData as &$item) {
        $item['total_quantity'] = (int)$item['total_quantity'];
        $item['transaction_count'] = (int)$item['transaction_count'];
        $item['total_income'] = number_format((float)$item['total_income'], 2, '.', '');
        $item['avg_price_paid'] = number_format((float)$item['avg_price_paid'], 2, '.', '');
    }

    // Get total count
    $countSql = "
        SELECT COUNT(DISTINCT pc.id) as total
        FROM transactions t
        INNER JOIN product_options po ON t.product_option_id = po.id
        INNER JOIN product_colors pc ON po.product_color_id = pc.id
        WHERE t.status = 'completed'
    ";
    $countStmt = $pdo->query($countSql);
    $totalCount = $countStmt->fetch()['total'];

    // Get summary statistics
    $summarySql = "
        SELECT
            SUM(t.quantity) as total_units_sold,
            SUM(t.total_amount) as total_revenue,
            COUNT(DISTINCT t.id) as total_transactions,
            COUNT(DISTINCT t.user_id) as unique_customers
        FROM transactions t
        WHERE t.status = 'completed'
    ";
    $summaryStmt = $pdo->query($summarySql);
    $summary = $summaryStmt->fetch();

    $summary['total_units_sold'] = (int)$summary['total_units_sold'];
    $summary['total_transactions'] = (int)$summary['total_transactions'];
    $summary['unique_customers'] = (int)$summary['unique_customers'];
    $summary['total_revenue'] = number_format((float)$summary['total_revenue'], 2, '.', '');

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $salesData,
        'summary' => $summary,
        'pagination' => [
            'limit' => $limit,
            'offset' => $offset,
            'total' => (int)$totalCount
        ],
        'sort' => [
            'by' => $sort,
            'order' => $order
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch sales report']);
    error_log("Sales report error: " . $e->getMessage());
}
