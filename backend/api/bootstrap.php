<?php
declare(strict_types=1);

if (!function_exists('app_is_test_mode')) {
    /**
     * Detect when the API is being executed from the lightweight test harness.
     */
    function app_is_test_mode(): bool
    {
        return defined('APP_TEST_MODE') && APP_TEST_MODE === true;
    }

    /**
     * Build a PDO instance based on environment configuration.
     * Supports overriding the DSN via DB_DSN which enables SQLite-backed tests.
     *
     * @throws PDOException
     */
    function app_get_pdo()
    {
        if (app_is_test_mode() && isset($GLOBALS['__app_test_pdo'])) {
            return $GLOBALS['__app_test_pdo'];
        }

        $dsn = getenv('DB_DSN') ?: null;
        $username = null;
        $password = null;

        if ($dsn === null) {
            $host = getenv('DB_HOST') ?: 'localhost';
            $dbname = getenv('DB_NAME') ?: 'miona_app';
            $username = getenv('DB_USER') ?: 'root';
            $password = getenv('DB_PASSWORD') ?: '';
            $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
        } else {
            $username = getenv('DB_DSN_USER');
            $password = getenv('DB_DSN_PASSWORD');

            $username = $username === false ? null : $username;
            $password = $password === false ? null : $password;
        }

        return new PDO(
            $dsn,
            $username,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    }

    /**
     * Output a JSON response and stop execution unless we are inside tests.
     */
    function app_json_response(int $status, array $payload): array
    {
        http_response_code($status);
        echo json_encode($payload);

        if (app_is_test_mode()) {
            return [
                'status' => $status,
                'body' => $payload,
            ];
        }

        exit();
    }

    /**
     * Convenience wrapper for returning an error payload.
     */
    function app_json_error(int $status, string $message, array $extra = []): array
    {
        return app_json_response($status, array_merge(['error' => $message], $extra));
    }
}
