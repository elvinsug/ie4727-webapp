<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: DELETE, POST, OPTIONS');
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

// Only allow DELETE/POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
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

// Get product ID
$productId = isset($_GET['id']) ? intval($_GET['id']) : (isset($_POST['id']) ? intval($_POST['id']) : 0);

if ($productId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid product ID is required']);
    exit();
}

try {
    // Check if product exists
    $checkSql = "SELECT id, name FROM products WHERE id = :id";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':id' => $productId]);
    $product = $checkStmt->fetch();

    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit();
    }

    // Fetch all images associated with this product before deletion
    $imagesSql = "SELECT image_url, image_url_2 FROM product_colors WHERE product_id = :id";
    $imagesStmt = $pdo->prepare($imagesSql);
    $imagesStmt->execute([':id' => $productId]);
    $images = $imagesStmt->fetchAll();

    // Begin transaction
    $pdo->beginTransaction();

    // Delete the product (CASCADE will handle product_colors and product_options)
    $deleteProductSql = "DELETE FROM products WHERE id = :id";
    $deleteProductStmt = $pdo->prepare($deleteProductSql);
    $deleteProductStmt->execute([':id' => $productId]);

    // Commit transaction
    $pdo->commit();

    // Delete image files from filesystem (after successful database deletion)
    $uploadDir = __DIR__ . '/../../uploads/products/';
    foreach ($images as $imageRow) {
        if (!empty($imageRow['image_url'])) {
            $filename = basename($imageRow['image_url']);
            $filepath = $uploadDir . $filename;
            if (file_exists($filepath)) {
                @unlink($filepath);
            }
        }
        if (!empty($imageRow['image_url_2'])) {
            $filename = basename($imageRow['image_url_2']);
            $filepath = $uploadDir . $filename;
            if (file_exists($filepath)) {
                @unlink($filepath);
            }
        }
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Product deleted successfully',
        'data' => [
            'id' => $productId,
            'name' => $product['name']
        ]
    ]);

} catch (PDOException $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete product']);
    error_log("Delete product error: " . $e->getMessage());
}
