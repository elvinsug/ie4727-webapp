<?php
declare(strict_types=1);

define('APP_TEST_MODE', true);

require __DIR__ . '/support/Assertions.php';
require __DIR__ . '/support/TestRunner.php';
require __DIR__ . '/support/TestEnvironment.php';

$runner = new TestRunner();

$runner->add('Signup creates new user and session', function (): void {
    $env = new TestEnvironment();

    try {
        $response = $env->runEndpoint('signup.php', [
            'method' => 'POST',
            'post' => [
                'email' => 'newuser@example.com',
                'password' => 'StrongPass123',
                'role' => 'user',
            ],
        ]);

        assertSame(201, $response['status']);
        assertTrue($response['body']['success'] ?? false, 'Expected success flag in signup response.');
        assertEquals('newuser@example.com', $response['body']['user']['email'] ?? null);

        $user = $env->getUserByEmail('newuser@example.com');
        assertEquals('user', $user['role'] ?? '', 'User role should default to user.');
        assertTrue(password_verify('StrongPass123', $user['password'] ?? ''), 'Stored password hash mismatch.');
        assertTrue($response['session']['authenticated'] ?? false, 'Session should be authenticated after signup.');
    } finally {
        $env->cleanup();
    }
});

$runner->add('Signup rejects duplicate email addresses', function (): void {
    $env = new TestEnvironment();

    try {
        $env->seedUser('duplicate@example.com', password_hash('Password123', PASSWORD_BCRYPT));

        $response = $env->runEndpoint('signup.php', [
            'method' => 'POST',
            'post' => [
                'email' => 'duplicate@example.com',
                'password' => 'AnotherPass123',
            ],
        ]);

        assertSame(409, $response['status']);
        assertSame('User with this email already exists', $response['body']['error'] ?? '');
    } finally {
        $env->cleanup();
    }
});

$runner->add('Login authenticates valid credentials', function (): void {
    $env = new TestEnvironment();

    try {
        $env->seedUser('valid@example.com', password_hash('LetMeIn123', PASSWORD_BCRYPT), 'admin');

        $response = $env->runEndpoint('login.php', [
            'method' => 'POST',
            'post' => [
                'email' => 'valid@example.com',
                'password' => 'LetMeIn123',
            ],
        ]);

        assertSame(200, $response['status']);
        assertTrue($response['body']['success'] ?? false, 'Login response should flag success.');
        assertEquals('admin', $response['body']['user']['role'] ?? '');
        assertTrue($response['session']['authenticated'] ?? false, 'Session should be authenticated after login.');
    } finally {
        $env->cleanup();
    }
});

$runner->add('Login rejects invalid password', function (): void {
    $env = new TestEnvironment();

    try {
        $env->seedUser('fail@example.com', password_hash('Secret123', PASSWORD_BCRYPT));

        $response = $env->runEndpoint('login.php', [
            'method' => 'POST',
            'post' => [
                'email' => 'fail@example.com',
                'password' => 'WrongPassword!',
            ],
        ]);

        assertSame(401, $response['status']);
        assertSame('Invalid email or password', $response['body']['error'] ?? '');
    } finally {
        $env->cleanup();
    }
});

$runner->add('get_products returns nested product data with filters applied', function (): void {
    $env = new TestEnvironment();

    try {
        $productId = $env->seedProduct(['name' => 'Velocity', 'sex' => 'male', 'type' => 'casual']);
        $colorId = $env->seedColor($productId, ['color' => 'Red']);
        $env->seedOption($colorId, [
            'size' => '41',
            'price' => 220,
            'discount_percentage' => 10,
            'stock' => 8,
        ]);

        // Product that should be filtered out because stock is zero.
        $otherProduct = $env->seedProduct(['name' => 'Ghost', 'sex' => 'female', 'type' => 'arch']);
        $otherColor = $env->seedColor($otherProduct, ['color' => 'Blue']);
        $env->seedOption($otherColor, ['size' => '38', 'stock' => 0]);

        $response = $env->runEndpoint('products/get_products.php', [
            'method' => 'GET',
            'query' => [
                'sex' => 'male',
                'type' => 'casual',
            ],
        ]);

        assertSame(200, $response['status']);
        assertTrue($response['body']['success'] ?? false);

        $data = $response['body']['data'] ?? [];
        assertSame(1, count($data), 'Expected only one product to match filters.');
        $product = $data[0];
        assertEquals('Velocity', $product['name'] ?? null);
        assertNotEmpty($product['colors'] ?? [], 'Product colors missing.');
        $option = $product['colors'][0]['options'][0];
        assertEquals('41', $option['size'] ?? null);
        assertEquals(220.0, $option['price'] ?? null);
        assertEquals(10, $option['discount_percentage'] ?? null);
    } finally {
        $env->cleanup();
    }
});

$runner->add('get_product returns a single product with colors and options', function (): void {
    $env = new TestEnvironment();

    try {
        $productId = $env->seedProduct(['name' => 'Orbit', 'sex' => 'unisex', 'type' => 'track_field']);
        $colorId = $env->seedColor($productId, ['color' => 'Black']);
        $env->seedOption($colorId, ['size' => '40', 'price' => 150, 'stock' => 3]);
        $env->seedOption($colorId, ['size' => '42', 'price' => 155, 'stock' => 5]);

        $response = $env->runEndpoint('get_product.php', [
            'method' => 'GET',
            'query' => ['id' => $productId],
        ]);

        assertSame(200, $response['status']);
        assertTrue($response['body']['success'] ?? false);
        assertEquals($productId, $response['body']['product']['id'] ?? null);
        assertEquals('Orbit', $response['body']['product']['name'] ?? null);
        assertSame(2, count($response['body']['product']['colors'][0]['options'] ?? []));
    } finally {
        $env->cleanup();
    }
});

exit($runner->run());
