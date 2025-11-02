<?php
require_once __DIR__ . '/../load_env.php';
require_once __DIR__ . '/EmailHelper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

$productOptionId = filter_input(INPUT_POST, 'product_option_id', FILTER_VALIDATE_INT);
$quantity = filter_input(INPUT_POST, 'quantity', FILTER_VALIDATE_INT);
$paymentMethod = isset($_POST['payment_method']) ? trim((string) $_POST['payment_method']) : null;
$shippingAddress = isset($_POST['shipping_address']) ? trim((string) $_POST['shipping_address']) : null;
$notes = isset($_POST['notes']) ? trim((string) $_POST['notes']) : null;

if ($paymentMethod === '') {
    $paymentMethod = null;
}

if ($shippingAddress === '') {
    $shippingAddress = null;
}

if ($notes === '') {
    $notes = null;
}

if (!$productOptionId) {
    http_response_code(400);
    echo json_encode(['error' => 'Product option ID is required']);
    exit();
}

if (!$quantity || $quantity < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Quantity must be at least 1']);
    exit();
}

$userId = isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;

if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'User session is invalid']);
    exit();
}

try {
    $pdo->beginTransaction();

    $optionStmt = $pdo->prepare(
        "SELECT 
            po.id,
            po.price,
            po.discount_percentage,
            po.stock,
            po.size,
            pc.color,
            pc.product_id,
            p.name AS product_name
         FROM product_options po
         INNER JOIN product_colors pc ON po.product_color_id = pc.id
         INNER JOIN products p ON pc.product_id = p.id
         WHERE po.id = :id 
         FOR UPDATE"
    );
    $optionStmt->execute([':id' => $productOptionId]);
    $option = $optionStmt->fetch();

    if (!$option) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['error' => 'Product option not found']);
        exit();
    }

    if ((int) $option['stock'] < $quantity) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['error' => 'Insufficient stock for the requested quantity']);
        exit();
    }

    $basePrice = (float) $option['price'];
    $discount = (int) $option['discount_percentage'];
    $effectivePrice = $basePrice;

    if ($discount > 0) {
        $effectivePrice = round($basePrice * (1 - ($discount / 100)), 2);
    }

    $totalAmount = round($effectivePrice * $quantity, 2);

    $updateStmt = $pdo->prepare(
        "UPDATE product_options 
         SET stock = stock - :quantity, updated_at = NOW() 
         WHERE id = :id"
    );
    $updateStmt->execute([
        ':quantity' => $quantity,
        ':id' => $productOptionId,
    ]);

    $transactionStmt = $pdo->prepare(
        "INSERT INTO transactions 
            (user_id, product_option_id, quantity, price_paid, total_amount, status, payment_method, shipping_address, notes, transaction_date, created_at, updated_at)
         VALUES 
            (:user_id, :product_option_id, :quantity, :price_paid, :total_amount, 'completed', :payment_method, :shipping_address, :notes, NOW(), NOW(), NOW())"
    );
    $transactionStmt->execute([
        ':user_id' => $userId,
        ':product_option_id' => $productOptionId,
        ':quantity' => $quantity,
        ':price_paid' => $effectivePrice,
        ':total_amount' => $totalAmount,
        ':payment_method' => $paymentMethod,
        ':shipping_address' => $shippingAddress,
        ':notes' => $notes,
    ]);

    $transactionId = (int) $pdo->lastInsertId();

    $pdo->commit();

    $responsePayload = [
        'success' => true,
        'transaction_id' => $transactionId,
        'product_option_id' => $productOptionId,
        'quantity' => $quantity,
        'price_paid' => $effectivePrice,
        'total_amount' => $totalAmount,
    ];

    $userEmail = isset($_SESSION['email']) ? filter_var($_SESSION['email'], FILTER_VALIDATE_EMAIL) : null;

    if ($userEmail) {
        $productName = htmlspecialchars($option['product_name'] ?? 'Product', ENT_QUOTES, 'UTF-8');
        $productColor = htmlspecialchars($option['color'] ?? 'N/A', ENT_QUOTES, 'UTF-8');
        $productSize = htmlspecialchars($option['size'] ?? 'N/A', ENT_QUOTES, 'UTF-8');

        $subject = "MIONA Purchase Confirmation #" . $transactionId;

        // Build HTML email
        $message = '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #000000; padding: 30px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: 2px;">MIONA</h1>
                        </td>
                    </tr>

                    <!-- Success Badge -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                            <div style="display: inline-block; background-color: #22c55e; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                                ✓ Order Confirmed
                            </div>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <h2 style="margin: 0 0 10px; color: #111827; font-size: 24px; font-weight: 600; text-align: center;">Thank you for your purchase!</h2>
                            <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5; text-align: center;">Your order has been confirmed and will be shipped soon.</p>
                        </td>
                    </tr>

                    <!-- Order Details Box -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: 600;">Order Details</h3>

                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order ID</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">#' . $transactionId . '</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="border-bottom: 1px solid #e5e7eb; padding: 8px 0;"></td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Product</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">' . $productName . '</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Color</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">' . $productColor . '</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Size</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">' . $productSize . '</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Quantity</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">' . $quantity . '</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="border-bottom: 1px solid #e5e7eb; padding: 8px 0;"></td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Price per item</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">S$' . number_format($effectivePrice, 2) . '</td>
                                            </tr>';

        if (!empty($shippingAddress)) {
            $safeAddress = htmlspecialchars($shippingAddress, ENT_QUOTES, 'UTF-8');
            $message .= '
                                            <tr>
                                                <td colspan="2" style="border-bottom: 1px solid #e5e7eb; padding: 8px 0;"></td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Shipping Address</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">' . $safeAddress . '</td>
                                            </tr>';
        }

        if (!empty($paymentMethod)) {
            $safePayment = htmlspecialchars($paymentMethod, ENT_QUOTES, 'UTF-8');
            $message .= '
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Method</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">' . $safePayment . '</td>
                                            </tr>';
        }

        $message .= '
                                            <tr>
                                                <td colspan="2" style="border-bottom: 2px solid #e5e7eb; padding: 8px 0;"></td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0 0; color: #111827; font-size: 16px; font-weight: 600;">Total Paid</td>
                                                <td style="padding: 12px 0 0; color: #111827; font-size: 18px; font-weight: 700; text-align: right;">S$' . number_format($totalAmount, 2) . '</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>';

        if (!empty($notes)) {
            $safeNotes = htmlspecialchars($notes, ENT_QUOTES, 'UTF-8');
            $safeNotes = nl2br($safeNotes);
            $message .= '
                    <!-- Notes Section -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
                                <p style="margin: 0 0 5px; color: #92400e; font-size: 13px; font-weight: 600;">Order Notes:</p>
                                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">' . $safeNotes . '</p>
                            </div>
                        </td>
                    </tr>';
        }

        $message .= '
                    <!-- Footer Info -->
                    <tr>
                        <td style="padding: 0 40px 30px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                You can review your purchase history in your account dashboard.
                            </p>
                            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                If you have any questions, please contact our support team.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #111827; font-size: 14px; font-weight: 600;">Thank you for shopping with us!</p>
                            <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">— The MIONA Team</p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © ' . date('Y') . ' MIONA. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>';

        $emailHelper = new EmailHelper();
        $emailSent = $emailHelper->sendEmail($userEmail, $subject, $message, true);

        if (!$emailSent) {
            error_log("Failed to send purchase confirmation email to {$userEmail} for transaction {$transactionId}");

            // Save email to log file as fallback
            $logDir = __DIR__ . '/../logs/emails';
            if (!is_dir($logDir) && !mkdir($logDir, 0755, true) && !is_dir($logDir)) {
                error_log('Unable to create email log directory: ' . $logDir);
            } else {
                $filename = $logDir . '/transaction_' . $transactionId . '_' . time() . '.txt';
                $logMessage = "To: {$userEmail}\nSubject: {$subject}\n\n{$message}";
                file_put_contents($filename, $logMessage);
            }
        }
    }

    http_response_code(200);
    echo json_encode($responsePayload);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['error' => 'Failed to process purchase']);
    error_log("Buy product options error: " . $e->getMessage());
    exit();
}
