<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    return app_json_response(200, ['success' => true]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    return app_json_error(405, 'Method not allowed');
}

// Get form data
if (!isset($_POST['email']) || !isset($_POST['password'])) {
    return app_json_error(400, 'Email and password are required');
}

$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$password = $_POST['password'];
$role = isset($_POST['role']) ? $_POST['role'] : 'user';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    return app_json_error(400, 'Invalid email format');
}

if (strlen($password) < 8) {
    return app_json_error(400, 'Password must be at least 8 characters long');
}

if (!in_array($role, ['user', 'admin'])) {
    return app_json_error(400, 'Invalid role');
}

try {
    $pdo = app_get_pdo();
} catch (PDOException $e) {
    error_log("Database connection error: " . $e->getMessage());
    return app_json_error(500, 'Database connection failed');
}

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        return app_json_error(409, 'User with this email already exists');
    }
} catch (PDOException $e) {
    error_log("Check user error: " . $e->getMessage());
    return app_json_error(500, 'Failed to check existing user');
}

$hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

try {
    $stmt = $pdo->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)");
    $stmt->execute([$email, $hashedPassword, $role]);

    $userId = $pdo->lastInsertId();

    session_start();
    $_SESSION['user_id'] = $userId;
    $_SESSION['email'] = $email;
    $_SESSION['role'] = $role;
    $_SESSION['authenticated'] = true;

    return app_json_response(201, [
        'success' => true,
        'message' => 'User created successfully',
        'user' => [
            'id' => $userId,
            'email' => $email,
            'role' => $role
        ]
    ]);

} catch (PDOException $e) {
    error_log("Create user error: " . $e->getMessage());
    return app_json_error(500, 'Failed to create user');
}
