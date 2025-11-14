<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    return app_json_response(200, ['success' => true]);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    return app_json_error(405, 'Method not allowed');
}

// Start session
session_start();

// Get form data
if (!isset($_POST['email']) || !isset($_POST['password'])) {
    return app_json_error(400, 'Email and password are required');
}

$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$password = $_POST['password'];

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    return app_json_error(400, 'Invalid email format');
}

// Database connection
try {
    $pdo = app_get_pdo();
} catch (PDOException $e) {
    error_log("Database connection error: " . $e->getMessage());
    return app_json_error(500, 'Database connection failed');
}

// Query user by email
try {
    $stmt = $pdo->prepare("SELECT id, email, password, role FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        return app_json_error(401, 'Invalid email or password');
    }

    // Verify password
    if (!password_verify($password, $user['password'])) {
        return app_json_error(401, 'Invalid email or password');
    }

    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['authenticated'] = true;

    // Return success response (don't send password hash)
    return app_json_response(200, [
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);

} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    return app_json_error(500, 'Login failed');
}
