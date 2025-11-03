<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    error_log("Database connection error: " . $e->getMessage());
    exit();
}

$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 12;
$offset = ($page - 1) * $limit;

$search = isset($_GET['search']) ? trim($_GET['search']) : '';

$sex = isset($_GET['sex']) ? trim($_GET['sex']) : '';
$type = isset($_GET['type']) ? trim($_GET['type']) : '';
$material = isset($_GET['material']) ? trim($_GET['material']) : '';
$sizes = isset($_GET['sizes']) ? trim($_GET['sizes']) : '';
$price_low = isset($_GET['price_low']) ? trim($_GET['price_low']) : '';
$price_high = isset($_GET['price_high']) ? trim($_GET['price_high']) : '';
$on_sale = isset($_GET['on_sale']) ? trim($_GET['on_sale']) : '';

$allowedSex = ['male', 'female', 'unisex'];
$allowedTypes = ['casual', 'arch', 'track_field', 'accessories'];

if (!empty($sex) && !in_array($sex, $allowedSex)) {
    $sex = '';
}

// Parse and validate types (comma-separated values)
$validTypes = [];
if (!empty($type)) {
    $typeArray = explode(',', $type);
    foreach ($typeArray as $t) {
        $t = trim($t);
        // Validate that type is in allowedTypes
        if (in_array($t, $allowedTypes)) {
            $validTypes[] = $t;
        }
    }
}

// Parse and validate sizes (comma-separated numeric values)
$validSizes = [];
if (!empty($sizes)) {
    $sizeArray = explode(',', $sizes);
    foreach ($sizeArray as $size) {
        $size = trim($size);
        // Validate that size is numeric and positive
        if (is_numeric($size) && floatval($size) > 0) {
            $validSizes[] = $size;
        }
    }
}

// Validate price range parameters
if (!empty($price_low) && (!is_numeric($price_low) || floatval($price_low) < 0)) {
    $price_low = '';
}

if (!empty($price_high) && (!is_numeric($price_high) || floatval($price_high) < 0)) {
    $price_high = '';
}

// Ensure price_low is not greater than price_high
if (!empty($price_low) && !empty($price_high) && floatval($price_low) > floatval($price_high)) {
    $temp = $price_low;
    $price_low = $price_high;
    $price_high = $temp;
}

$filterOnSale = false;
if (!empty($on_sale)) {
    $normalizedOnSale = strtolower($on_sale);
    if (in_array($normalizedOnSale, ['1', 'true', 'yes', 'on'], true)) {
        $filterOnSale = true;
    }
}

$sort = isset($_GET['sort']) ? trim($_GET['sort']) : '';
$allowedSorts = ['price_asc', 'price_desc', 'release_asc', 'release_desc'];

// Default order - safe hardcoded string
$orderByClause = 'ORDER BY p.created_at DESC';

if (in_array($sort, $allowedSorts)) {
    if ($sort === 'price_asc') {
        $orderByClause = 'ORDER BY min_price ASC';
    } elseif ($sort === 'price_desc') {
        $orderByClause = 'ORDER BY min_price DESC';
    } elseif ($sort === 'release_asc') {
        $orderByClause = 'ORDER BY p.created_at ASC';
    } elseif ($sort === 'release_desc') {
        $orderByClause = 'ORDER BY p.created_at DESC';
    }
}

try {
    $whereConditions = [];
    $params = [];

    if (!empty($search)) {
        $whereConditions[] = '(p.name LIKE :search OR p.description LIKE :search OR p.materials LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }

    if (!empty($sex)) {
        $whereConditions[] = 'p.sex = :sex';
        $params[':sex'] = $sex;
    }

    // Filter by types
    if (!empty($validTypes)) {
        $typePlaceholders = [];
        foreach ($validTypes as $index => $t) {
            $placeholder = ':type' . $index;
            $typePlaceholders[] = $placeholder;
            $params[$placeholder] = $t;
        }
        $whereConditions[] = 'p.type IN (' . implode(',', $typePlaceholders) . ')';
    }

    if (!empty($material)) {
        $whereConditions[] = 'p.materials LIKE :material';
        $params[':material'] = '%' . $material . '%';
    }

    // Filter by sizes (product_options table)
    if (!empty($validSizes)) {
        $sizePlaceholders = [];
        foreach ($validSizes as $index => $size) {
            $placeholder = ':size' . $index;
            $sizePlaceholders[] = $placeholder;
            $params[$placeholder] = $size;
        }
        $whereConditions[] = 'po.size IN (' . implode(',', $sizePlaceholders) . ')';
    }

    // Filter by price range (product_options table)
    if (!empty($price_low)) {
        $whereConditions[] = 'po.price >= :price_low';
        $params[':price_low'] = floatval($price_low);
    }

    if (!empty($price_high)) {
        $whereConditions[] = 'po.price <= :price_high';
        $params[':price_high'] = floatval($price_high);
    }

    if ($filterOnSale) {
        $whereConditions[] = 'po.discount_percentage > 0';
    }

    $whereConditions[] = 'po.stock > 0';

    $whereClause = '';
    if (!empty($whereConditions)) {
        $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
    }

    // Count query - count product-color combinations
    $countSql = "
        SELECT COUNT(*) as total
        FROM (
            SELECT p.id, pc.id as color_id
            FROM products p
            INNER JOIN product_colors pc ON p.id = pc.product_id
            INNER JOIN product_options po ON pc.id = po.product_color_id
            $whereClause
            GROUP BY p.id, pc.id
        ) as subquery
    ";

    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $totalProducts = $countStmt->fetch()['total'];

    // Main query - group by product_id and color
    $sql = "
        SELECT
            p.id as product_id,
            p.name as product_name,
            pc.id as product_color_id,
            pc.color,
            MIN(po.price) as price,
            MIN(po.discount_percentage) as discount_percentage,
            pc.image_url,
            pc.image_url_2,
            SUM(po.stock) as total_stock,
            p.description,
            p.materials,
            p.sex,
            p.type,
            p.created_at,
            p.updated_at,
            MIN(po.price) as min_price
        FROM products p
        INNER JOIN product_colors pc ON p.id = pc.product_id
        INNER JOIN product_options po ON pc.id = po.product_color_id
        $whereClause
        GROUP BY p.id, p.name, pc.id, pc.color, pc.image_url, p.description, p.materials, p.sex, p.type, p.created_at, p.updated_at
        $orderByClause
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $pdo->prepare($sql);

    if (!empty($search)) {
        $stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
    }

    if (!empty($sex)) {
        $stmt->bindValue(':sex', $sex, PDO::PARAM_STR);
    }

    // Bind type parameters
    if (!empty($validTypes)) {
        foreach ($validTypes as $index => $t) {
            $placeholder = ':type' . $index;
            $stmt->bindValue($placeholder, $t, PDO::PARAM_STR);
        }
    }

    if (!empty($material)) {
        $stmt->bindValue(':material', '%' . $material . '%', PDO::PARAM_STR);
    }

    // Bind size parameters
    if (!empty($validSizes)) {
        foreach ($validSizes as $index => $size) {
            $placeholder = ':size' . $index;
            $stmt->bindValue($placeholder, $size, PDO::PARAM_STR);
        }
    }

    // Bind price range parameters
    if (!empty($price_low)) {
        $stmt->bindValue(':price_low', floatval($price_low), PDO::PARAM_STR);
    }

    if (!empty($price_high)) {
        $stmt->bindValue(':price_high', floatval($price_high), PDO::PARAM_STR);
    }

    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();
    $items = $stmt->fetchAll();

    // Fetch all product options grouped by product_color_id
    if (!empty($items)) {
        // Get all product_color_ids
        $productColorIds = array_unique(array_column($items, 'product_color_id'));

        if (!empty($productColorIds)) {
            $placeholders = str_repeat('?,', count($productColorIds) - 1) . '?';

            $optionsSql = "
                SELECT
                    po.product_color_id,
                    po.id,
                    po.size,
                    po.price,
                    po.discount_percentage,
                    po.stock,
                    po.created_at,
                    po.updated_at
                FROM product_options po
                WHERE po.product_color_id IN ($placeholders)
                  AND po.stock > 0
                ORDER BY po.product_color_id, po.size
            ";

            $optionsStmt = $pdo->prepare($optionsSql);
            $optionsStmt->execute(array_values($productColorIds));
            $allOptions = $optionsStmt->fetchAll();

            // Group options by product_color_id
            $optionsByProductColor = [];
            foreach ($allOptions as $option) {
                $optionsByProductColor[$option['product_color_id']][] = $option;
            }

            // Add options array to each item
            foreach ($items as &$item) {
                $item['options'] = $optionsByProductColor[$item['product_color_id']] ?? [];
            }
        }
    }

    $totalPages = ceil($totalProducts / $limit);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $items,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total' => $totalProducts,
            'total_pages' => $totalPages,
            'has_next' => $page < $totalPages,
            'has_prev' => $page > 1
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch products']);
    error_log("Fetch products error: " . $e->getMessage());
}
