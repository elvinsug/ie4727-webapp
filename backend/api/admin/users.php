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
            $stmt = $pdo->prepare("
                SELECT id, email, role, created_at, updated_at
                FROM users
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $users = $stmt->fetchAll();

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'users' => $users,
                'count' => count($users)
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
