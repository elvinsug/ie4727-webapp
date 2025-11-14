<?php
declare(strict_types=1);

require_once __DIR__ . '/InMemoryDatabase.php';

/**
 * Executes API endpoints in-process using an in-memory data store.
 */
final class TestEnvironment
{
    private InMemoryDatabase $database;
    private InMemoryPdo $connection;
    private string $apiBasePath;
    private string $sessionPath;

    public function __construct()
    {
        $this->database = new InMemoryDatabase();
        $this->connection = new InMemoryPdo($this->database);
        $this->apiBasePath = realpath(__DIR__ . '/../../api');
        $this->sessionPath = sys_get_temp_dir() . '/miona_sessions';

        if (!is_dir($this->sessionPath)) {
            mkdir($this->sessionPath, 0777, true);
        }

        if (session_status() === PHP_SESSION_ACTIVE) {
            session_write_close();
        }

        ini_set('session.use_cookies', '0');
        ini_set('session.use_only_cookies', '0');
        ini_set('session.save_path', $this->sessionPath);
    }

    public function cleanup(): void
    {
        unset($GLOBALS['__app_test_pdo']);
    }

    public function seedUser(string $email, string $passwordHash, string $role = 'user'): int
    {
        return $this->database->insertUser($email, $passwordHash, $role);
    }

    public function getUserByEmail(string $email): ?array
    {
        return $this->database->findUserByEmail($email);
    }

    public function seedProduct(array $attributes = []): int
    {
        $defaults = [
            'name' => 'Test Shoe',
            'description' => 'Comfort-first sneaker',
            'materials' => 'Mesh, Rubber',
            'sex' => 'unisex',
            'type' => 'casual',
        ];

        return $this->database->insertProduct(array_merge($defaults, $attributes));
    }

    public function seedColor(int $productId, array $attributes = []): int
    {
        $defaults = [
            'color' => 'Black',
            'image_url' => 'https://example.com/black.png',
            'image_url_2' => 'https://example.com/black-2.png',
        ];

        return $this->database->insertColor($productId, array_merge($defaults, $attributes));
    }

    public function seedOption(int $colorId, array $attributes = []): int
    {
        $defaults = [
            'size' => '40',
            'price' => 180.0,
            'discount_percentage' => 0,
            'stock' => 10,
        ];

        return $this->database->insertOption($colorId, array_merge($defaults, $attributes));
    }

    /**
     * Execute a relative API script (e.g. 'signup.php') and capture the response.
     *
     * @param array{
     *     method?: string,
     *     query?: array<string, mixed>,
     *     post?: array<string, mixed>,
     *     session?: array<string, mixed>
     * } $options
     */
    public function runEndpoint(string $relativePath, array $options = []): array
    {
        $method = strtoupper($options['method'] ?? 'GET');
        $query = $options['query'] ?? [];
        $post = $options['post'] ?? [];
        $sessionData = $options['session'] ?? [];

        $_GET = $query;
        $_POST = $post;
        $_SESSION = $sessionData;
        $_SERVER['REQUEST_METHOD'] = $method;

        if (session_status() === PHP_SESSION_ACTIVE) {
            session_write_close();
        }

        header_remove();
        $sessionId = 'test-' . bin2hex(random_bytes(6));
        session_id($sessionId);

        $GLOBALS['__app_test_pdo'] = $this->connection;

        ob_start();
        try {
            $response = include $this->apiBasePath . '/' . ltrim($relativePath, '/');
        } finally {
            ob_end_clean();
            unset($GLOBALS['__app_test_pdo']);
        }

        $status = is_array($response) && isset($response['status'])
            ? $response['status']
            : http_response_code();
        $body = is_array($response) && isset($response['body'])
            ? $response['body']
            : [];

        return [
            'status' => $status,
            'body' => $body,
            'session' => $_SESSION,
        ];
    }
}
