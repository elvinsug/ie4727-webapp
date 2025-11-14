<?php
declare(strict_types=1);

final class InMemoryDatabase
{
    public array $users = [];
    public array $products = [];
    public array $productColors = [];
    public array $productOptions = [];

    private int $userId = 1;
    private int $productId = 1;
    private int $colorId = 1;
    private int $optionId = 1;

    public function insertUser(string $email, string $password, string $role): int
    {
        $id = $this->userId++;
        $timestamp = $this->now();
        $this->users[$id] = [
            'id' => $id,
            'email' => $email,
            'password' => $password,
            'role' => $role,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ];

        return $id;
    }

    public function findUserByEmail(string $email): ?array
    {
        foreach ($this->users as $user) {
            if ($user['email'] === $email) {
                return $user;
            }
        }

        return null;
    }

    public function insertProduct(array $data): int
    {
        $id = $this->productId++;
        $timestamp = $this->now();
        $this->products[$id] = [
            'id' => $id,
            'name' => $data['name'],
            'description' => $data['description'],
            'materials' => $data['materials'],
            'sex' => $data['sex'],
            'type' => $data['type'],
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ];

        return $id;
    }

    public function getProductById(int $productId): ?array
    {
        return $this->products[$productId] ?? null;
    }

    public function selectProducts(array $filters): array
    {
        $results = array_filter($this->products, function (array $product) use ($filters) {
            if (isset($filters[':product_id']) && $product['id'] !== (int) $filters[':product_id']) {
                return false;
            }

            if (isset($filters[':sex']) && $product['sex'] !== $filters[':sex']) {
                return false;
            }

            if (isset($filters[':type']) && $product['type'] !== $filters[':type']) {
                return false;
            }

            if (isset($filters[':search'])) {
                $needle = str_replace('%', '', $filters[':search']);
                $haystack = strtolower($product['name'] . ' ' . $product['description'] . ' ' . $product['materials']);
                if (strpos($haystack, strtolower($needle)) === false) {
                    return false;
                }
            }

            return true;
        });

        usort($results, function (array $a, array $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        return array_values($results);
    }

    public function insertColor(int $productId, array $data): int
    {
        $id = $this->colorId++;
        $timestamp = $this->now();
        $this->productColors[$id] = [
            'id' => $id,
            'product_id' => $productId,
            'color' => $data['color'],
            'image_url' => $data['image_url'],
            'image_url_2' => $data['image_url_2'],
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ];

        return $id;
    }

    public function insertOption(int $colorId, array $data): int
    {
        $id = $this->optionId++;
        $timestamp = $this->now();
        $this->productOptions[$id] = [
            'id' => $id,
            'product_color_id' => $colorId,
            'size' => $data['size'],
            'price' => $data['price'],
            'discount_percentage' => $data['discount_percentage'],
            'stock' => $data['stock'],
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ];

        return $id;
    }

    /**
     * @param int[] $productIds
     * @return array<int, array<string, mixed>>
     */
    public function selectColorsByProductIds(array $productIds): array
    {
        $results = array_filter($this->productColors, function (array $color) use ($productIds) {
            return in_array($color['product_id'], $productIds, true);
        });

        usort($results, function (array $a, array $b) {
            if ($a['product_id'] === $b['product_id']) {
                return $a['id'] <=> $b['id'];
            }

            return $a['product_id'] <=> $b['product_id'];
        });

        return array_values($results);
    }

    public function selectColorsByProduct(int $productId): array
    {
        $results = array_filter($this->productColors, function (array $color) use ($productId) {
            return $color['product_id'] === $productId;
        });

        usort($results, fn (array $a, array $b) => $a['id'] <=> $b['id']);

        return array_values($results);
    }

    /**
     * @param int[] $colorIds
     */
    public function selectOptionsByColorIds(array $colorIds, bool $orderBySize = false): array
    {
        $results = array_filter($this->productOptions, function (array $option) use ($colorIds) {
            return in_array($option['product_color_id'], $colorIds, true) && $option['stock'] > 0;
        });

        usort($results, function (array $a, array $b) use ($orderBySize) {
            if ($a['product_color_id'] === $b['product_color_id']) {
                if ($orderBySize) {
                    return strcmp($a['size'], $b['size']);
                }

                return $a['size'] <=> $b['size'];
            }

            return $a['product_color_id'] <=> $b['product_color_id'];
        });

        return array_values($results);
    }

    private function now(): string
    {
        return date('Y-m-d H:i:s');
    }
}

final class InMemoryPdo
{
    private InMemoryDatabase $database;
    private int $lastInsertId = 0;

    public function __construct(InMemoryDatabase $database)
    {
        $this->database = $database;
    }

    public function prepare(string $sql): InMemoryStatement
    {
        return new InMemoryStatement($this, $this->database, $sql);
    }

    public function lastInsertId(): int
    {
        return $this->lastInsertId;
    }

    public function setLastInsertId(int $id): void
    {
        $this->lastInsertId = $id;
    }
}

final class InMemoryStatement
{
    private InMemoryPdo $pdo;
    private InMemoryDatabase $database;
    private string $sql;
    private array $results = [];
    private int $cursor = 0;

    public function __construct(InMemoryPdo $pdo, InMemoryDatabase $database, string $sql)
    {
        $this->pdo = $pdo;
        $this->database = $database;
        $this->sql = $this->normalize($sql);
    }

    public function execute(array $params = []): bool
    {
        $this->cursor = 0;
        $this->results = $this->dispatch($params);
        return true;
    }

    public function fetch()
    {
        if ($this->cursor >= count($this->results)) {
            return false;
        }

        return $this->results[$this->cursor++];
    }

    public function fetchAll(): array
    {
        return $this->results;
    }

    private function dispatch(array $params): array
    {
        if (str_starts_with($this->sql, 'SELECT id FROM users WHERE email =')) {
            $user = $this->database->findUserByEmail($params[0] ?? '');
            return $user ? [['id' => $user['id']]] : [];
        }

        if (str_starts_with($this->sql, 'INSERT INTO users')) {
            $id = $this->database->insertUser($params[0], $params[1], $params[2]);
            $this->pdo->setLastInsertId($id);
            return [];
        }

        if (str_starts_with($this->sql, 'SELECT id, email, password, role FROM users WHERE email =')) {
            $user = $this->database->findUserByEmail($params[0] ?? '');
            return $user ? [$user] : [];
        }

        if (str_contains($this->sql, 'FROM products p')) {
            return $this->database->selectProducts($params);
        }

        if (str_starts_with($this->sql, 'SELECT id, name, description, materials, sex, type, created_at, updated_at FROM products WHERE id =')) {
            $product = $this->database->getProductById((int) ($params[0] ?? 0));
            return $product ? [$product] : [];
        }

        if (str_contains($this->sql, 'FROM product_colors pc WHERE pc.product_id IN')) {
            return $this->database->selectColorsByProductIds(array_map('intval', $params));
        }

        if (str_starts_with($this->sql, 'SELECT id, color, image_url, image_url_2, created_at, updated_at FROM product_colors WHERE product_id =')) {
            return $this->database->selectColorsByProduct((int) ($params[0] ?? 0));
        }

        if (str_contains($this->sql, 'FROM product_options po WHERE po.product_color_id IN')) {
            return $this->database->selectOptionsByColorIds(array_map('intval', $params));
        }

        if (str_contains($this->sql, 'FROM product_options WHERE product_color_id IN')) {
            $orderBySize = str_contains($this->sql, 'ORDER BY size');
            return $this->database->selectOptionsByColorIds(array_map('intval', $params), $orderBySize);
        }

        throw new RuntimeException('Unhandled query: ' . $this->sql);
    }

    private function normalize(string $sql): string
    {
        $sql = trim($sql);
        $sql = preg_replace('/\s+/', ' ', $sql);

        return $sql ?? '';
    }
}
