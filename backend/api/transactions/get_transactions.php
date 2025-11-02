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
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    error_log("Database connection error: " . $e->getMessage());
    exit();
}

$search = isset($_GET['search']) ? trim((string) $_GET['search']) : null;
$startDateRaw = isset($_GET['start_date']) ? trim((string) $_GET['start_date']) : null;
$endDateRaw = isset($_GET['end_date']) ? trim((string) $_GET['end_date']) : null;
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 200;

if ($limit <= 0 || $limit > 1000) {
    $limit = 200;
}

$conditions = [];
$params = [];

if ($search !== null && $search !== '') {
    $conditions[] = '(p.name LIKE :search OR pc.color LIKE :search OR po.size LIKE :search OR u.email LIKE :search)';
    $params[':search'] = '%' . $search . '%';
}

if ($startDateRaw !== null && $startDateRaw !== '') {
    $startTimestamp = strtotime($startDateRaw);
    if ($startTimestamp !== false) {
        $startDate = date('Y-m-d 00:00:00', $startTimestamp);
        $conditions[] = 't.transaction_date >= :start_date';
        $params[':start_date'] = $startDate;
    }
}

if ($endDateRaw !== null && $endDateRaw !== '') {
    $endTimestamp = strtotime($endDateRaw);
    if ($endTimestamp !== false) {
        $endDate = date('Y-m-d 23:59:59', $endTimestamp);
        $conditions[] = 't.transaction_date <= :end_date';
        $params[':end_date'] = $endDate;
    }
}

$sql = "
    SELECT
        t.id,
        t.user_id,
        t.product_option_id,
        t.quantity,
        t.price_paid,
        t.total_amount,
        t.status,
        t.payment_method,
        t.shipping_address,
        t.notes,
        t.transaction_date,
        u.email AS user_email,
        p.id AS product_id,
        p.name AS product_name,
        pc.color AS product_color,
        po.size AS product_size,
        po.price AS option_price,
        po.discount_percentage
    FROM transactions t
    INNER JOIN users u ON t.user_id = u.id
    INNER JOIN product_options po ON t.product_option_id = po.id
    INNER JOIN product_colors pc ON po.product_color_id = pc.id
    INNER JOIN products p ON pc.product_id = p.id
";

if (!empty($conditions)) {
    $sql .= ' WHERE ' . implode(' AND ', $conditions);
}

$sql .= ' ORDER BY t.transaction_date DESC, t.id DESC';
$sql .= ' LIMIT ' . $limit;

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $transactions = array_map(function ($row) {
        return [
            'id' => (int) $row['id'],
            'transaction_code' => sprintf('TXN%06d', (int) $row['id']),
            'transaction_date' => $row['transaction_date'],
            'quantity' => (int) $row['quantity'],
            'price_paid' => (float) $row['price_paid'],
            'total_amount' => (float) $row['total_amount'],
            'status' => $row['status'],
            'payment_method' => $row['payment_method'],
            'shipping_address' => $row['shipping_address'],
            'notes' => $row['notes'],
            'user' => [
                'id' => (int) $row['user_id'],
                'email' => $row['user_email'],
            ],
            'product' => [
                'id' => (int) $row['product_id'],
                'name' => $row['product_name'],
                'color' => $row['product_color'],
                'size' => $row['product_size'],
                'base_price' => (float) $row['option_price'],
                'discount_percentage' => (int) $row['discount_percentage'],
            ],
        ];
    }, $rows);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'count' => count($transactions),
        'transactions' => $transactions,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch transactions']);
    error_log("Get transactions error: " . $e->getMessage());
    exit();
}
