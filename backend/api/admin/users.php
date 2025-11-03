<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
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

// Handle different HTTP methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get all users (without password hashes)
        try {
            $roleFilterRaw = isset($_GET['role']) ? strtolower(trim((string) $_GET['role'])) : null;
            $searchRaw = isset($_GET['search']) ? trim((string) $_GET['search']) : null;

            $conditions = [];
            $params = [];

            if ($roleFilterRaw && in_array($roleFilterRaw, ['user', 'admin'], true)) {
                $conditions[] = 'u.role = :role';
                $params[':role'] = $roleFilterRaw;
            }

            if ($searchRaw !== null && $searchRaw !== '') {
                $conditions[] = '(u.email LIKE :search)';
                $params[':search'] = '%' . $searchRaw . '%';
            }

            $whereClause = '';
            if (!empty($conditions)) {
                $whereClause = 'WHERE ' . implode(' AND ', $conditions);
            }

            $sql = "
                SELECT
                    u.id,
                    u.email,
                    u.role,
                    u.created_at,
                    u.updated_at,
                    COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.total_amount ELSE 0 END), 0) AS total_spent,
                    COALESCE(COUNT(CASE WHEN t.status = 'completed' THEN t.id END), 0) AS completed_orders,
                    MIN(CASE WHEN t.status = 'completed' THEN t.transaction_date END) AS first_purchase_at
                FROM users u
                LEFT JOIN transactions t ON t.user_id = u.id
                $whereClause
                GROUP BY u.id, u.email, u.role, u.created_at, u.updated_at
                ORDER BY u.created_at DESC
            ";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $users = $stmt->fetchAll();

            // Normalize numeric values
            $normalizedUsers = array_map(function ($user) {
                return [
                    'id' => (int) $user['id'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'created_at' => $user['created_at'],
                    'updated_at' => $user['updated_at'],
                    'total_spent' => (float) $user['total_spent'],
                    'completed_orders' => (int) $user['completed_orders'],
                    'first_purchase_at' => $user['first_purchase_at'],
                ];
            }, $users);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'users' => $normalizedUsers,
                'count' => count($normalizedUsers),
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch users']);
            error_log("Fetch users error: " . $e->getMessage());
        }
        break;

    case 'DELETE':
        // Delete a user
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            exit();
        }

        $userId = filter_var($_GET['id'], FILTER_VALIDATE_INT);

        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid user ID']);
            exit();
        }

        // Prevent admin from deleting themselves
        if ($userId == $_SESSION['user_id']) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot delete your own account']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);

            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'User deleted successfully'
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete user']);
            error_log("Delete user error: " . $e->getMessage());
        }
        break;

    case 'POST':
        // Update user role
        if (!isset($_POST['user_id']) || !isset($_POST['role'])) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID and role are required']);
            exit();
        }

        $userId = filter_var($_POST['user_id'], FILTER_VALIDATE_INT);
        $newRole = $_POST['role'];

        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid user ID']);
            exit();
        }

        if (!in_array($newRole, ['user', 'admin'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid role']);
            exit();
        }

        // Prevent admin from changing their own role
        if ($userId == $_SESSION['user_id']) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot change your own role']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
            $stmt->execute([$newRole, $userId]);

            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'User role updated successfully'
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found or no changes made']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update user role']);
            error_log("Update user role error: " . $e->getMessage());
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
