<?php
// Get product ID from URL or use default
$productId = isset($_GET['id']) ? intval($_GET['id']) : 1;

// Base path for assets
$basePath = isset($_ENV['BASE_PATH']) ? $_ENV['BASE_PATH'] : '';

// Mock product data - In production, this would come from a database
$mockProduct = [
    'id' => 1,
    'name' => 'BRIDGE AUBERGINE',
    'description' => 'The Bridge is a classic sneaker with a modern twist. Featuring premium suede and a comfortable fit, it\'s perfect for everyday wear.',
    'materials' => "Upper: Premium suede leather\nLining: Textile\nSole: Natural rubber\nInsole: EVA foam",
    'sex' => 'unisex',
    'type' => 'casual',
    'colors' => [
        [
            'id' => 1,
            'color' => 'Aubergine',
            'image_url' => $basePath . '/product/mock-image-1.webp',
            'image_url_2' => $basePath . '/product/mock-image-2.webp',
            'options' => [
                ['id' => 1, 'size' => '35', 'price' => 160, 'discount_percentage' => 0, 'stock' => 3],
                ['id' => 2, 'size' => '36', 'price' => 160, 'discount_percentage' => 0, 'stock' => 5],
                ['id' => 3, 'size' => '37', 'price' => 160, 'discount_percentage' => 0, 'stock' => 2],
                ['id' => 4, 'size' => '38', 'price' => 160, 'discount_percentage' => 0, 'stock' => 4],
                ['id' => 5, 'size' => '39', 'price' => 160, 'discount_percentage' => 0, 'stock' => 6],
                ['id' => 6, 'size' => '40', 'price' => 160, 'discount_percentage' => 0, 'stock' => 1],
                ['id' => 7, 'size' => '41', 'price' => 160, 'discount_percentage' => 0, 'stock' => 3],
                ['id' => 8, 'size' => '42', 'price' => 160, 'discount_percentage' => 0, 'stock' => 0],
            ],
        ],
        [
            'id' => 2,
            'color' => 'Red',
            'image_url' => $basePath . '/product/mock-image-1.webp',
            'image_url_2' => $basePath . '/product/mock-image-2.webp',
            'options' => [
                ['id' => 9, 'size' => '35', 'price' => 160, 'discount_percentage' => 0, 'stock' => 5],
                ['id' => 10, 'size' => '36', 'price' => 160, 'discount_percentage' => 0, 'stock' => 4],
                ['id' => 11, 'size' => '37', 'price' => 160, 'discount_percentage' => 0, 'stock' => 3],
                ['id' => 12, 'size' => '38', 'price' => 160, 'discount_percentage' => 0, 'stock' => 2],
            ],
        ],
        [
            'id' => 3,
            'color' => 'Brown',
            'image_url' => $basePath . '/product/mock-image-1.webp',
            'image_url_2' => $basePath . '/product/mock-image-2.webp',
            'options' => [
                ['id' => 13, 'size' => '35', 'price' => 160, 'discount_percentage' => 0, 'stock' => 4],
                ['id' => 14, 'size' => '36', 'price' => 160, 'discount_percentage' => 0, 'stock' => 3],
            ],
        ],
        [
            'id' => 4,
            'color' => 'Cream',
            'image_url' => $basePath . '/product/mock-image-1.webp',
            'image_url_2' => $basePath . '/product/mock-image-2.webp',
            'options' => [
                ['id' => 15, 'size' => '35', 'price' => 160, 'discount_percentage' => 0, 'stock' => 6],
                ['id' => 16, 'size' => '36', 'price' => 160, 'discount_percentage' => 0, 'stock' => 5],
            ],
        ],
    ],
];

// Mock recommended products
$recommendedProducts = [
    [
        'id' => 2,
        'name' => 'RUNNER BLUE',
        'price' => 150,
        'discount' => 10,
        'image' => [$basePath . '/product/mock-image-1.webp', $basePath . '/product/mock-image-2.webp'],
        'sizes' => ['35', '36', '37', '38', '39', '40'],
    ],
    [
        'id' => 3,
        'name' => 'CLASSIC WHITE',
        'price' => 140,
        'discount' => 0,
        'image' => [$basePath . '/product/mock-image-2.webp', $basePath . '/product/mock-image-1.webp'],
        'sizes' => ['36', '37', '38', '39', '40', '41'],
    ],
    [
        'id' => 4,
        'name' => 'URBAN BLACK',
        'price' => 170,
        'discount' => 15,
        'image' => [$basePath . '/product/mock-image-1.webp', $basePath . '/product/mock-image-2.webp'],
        'sizes' => ['35', '36', '37', '38', '39'],
    ],
    [
        'id' => 5,
        'name' => 'SPORT GREY',
        'price' => 155,
        'discount' => 0,
        'image' => [$basePath . '/product/mock-image-2.webp', $basePath . '/product/mock-image-1.webp'],
        'sizes' => ['37', '38', '39', '40', '41', '42'],
    ],
];

// Default selected color (first color)
$defaultColorId = $mockProduct['colors'][0]['id'];
$selectedColorId = isset($_GET['color']) ? intval($_GET['color']) : $defaultColorId;
$selectedColor = null;
foreach ($mockProduct['colors'] as $color) {
    if ($color['id'] == $selectedColorId) {
        $selectedColor = $color;
        break;
    }
}
if (!$selectedColor) {
    $selectedColor = $mockProduct['colors'][0];
    $selectedColorId = $selectedColor['id'];
}

// Get selected option based on size from GET parameter
$selectedSize = isset($_GET['size']) ? $_GET['size'] : '';
$selectedOption = null;
if ($selectedSize) {
    foreach ($selectedColor['options'] as $option) {
        if ($option['size'] === $selectedSize) {
            $selectedOption = $option;
            break;
        }
    }
}

// Get price - use selected option price or default to first option
$displayPrice = $selectedOption ? $selectedOption['price'] : $selectedColor['options'][0]['price'];

// Handle add to cart POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_to_cart') {
    $cartColorId = isset($_POST['color_id']) ? intval($_POST['color_id']) : 0;
    $cartSize = isset($_POST['size']) ? $_POST['size'] : '';
    $cartQuantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 1;
    
    // Find the option
    $cartColor = null;
    foreach ($mockProduct['colors'] as $color) {
        if ($color['id'] == $cartColorId) {
            $cartColor = $color;
            break;
        }
    }
    
    if (!$cartColor) {
        echo json_encode(['success' => false, 'error' => 'Invalid color']);
        exit;
    }
    
    $cartOption = null;
    foreach ($cartColor['options'] as $option) {
        if ($option['size'] === $cartSize) {
            $cartOption = $option;
            break;
        }
    }
    
    if (!$cartOption) {
        echo json_encode(['success' => false, 'error' => 'Invalid size']);
        exit;
    }
    
    if ($cartOption['stock'] === 0) {
        echo json_encode(['success' => false, 'error' => 'This size is out of stock']);
        exit;
    }
    
    if ($cartQuantity > $cartOption['stock']) {
        echo json_encode(['success' => false, 'error' => 'Only ' . $cartOption['stock'] . ' items available']);
        exit;
    }
    
    // In production, add to cart session or database here
    // For now, just return success
    echo json_encode([
        'success' => true,
        'message' => 'Added ' . $cartQuantity . ' item(s) to cart',
        'product' => [
            'name' => $mockProduct['name'],
            'color' => $cartColor['color'],
            'size' => $cartSize,
            'quantity' => $cartQuantity,
            'price' => $cartOption['price'],
        ],
    ]);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($mockProduct['name']); ?> - Product Details</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .aspect-4\/5 {
            aspect-ratio: 4 / 5;
        }
        .aspect-10\/12 {
            aspect-ratio: 10 / 12;
        }
    </style>
</head>
<body class="min-h-screen bg-white">
    <!-- Main Product Section -->
    <div class="max-w-[1920px] mx-auto">
        <div class="grid lg:grid-cols-2 gap-0">
            <!-- Left Side - Images -->
            <div class="flex flex-col">
                <div class="relative w-full aspect-4/5">
                    <img
                        src="<?php echo htmlspecialchars($selectedColor['image_url']); ?>"
                        alt="<?php echo htmlspecialchars($mockProduct['name']); ?>"
                        id="main-image"
                        class="w-full h-full object-cover"
                    />
                </div>
                <div class="relative w-full aspect-4/5">
                    <img
                        src="<?php echo htmlspecialchars($selectedColor['image_url_2']); ?>"
                        alt="<?php echo htmlspecialchars($mockProduct['name']); ?> detail"
                        id="detail-image"
                        class="w-full h-full object-cover"
                    />
                </div>
            </div>

            <!-- Right Side - Sticky Product Info -->
            <div class="lg:sticky lg:top-0 lg:self-start">
                <div class="pt-[88px] p-12 max-h-screen overflow-y-auto">
                    <!-- Breadcrumbs -->
                    <div class="flex items-center gap-2 text-sm mb-8 text-gray-600">
                        <a href="/" class="hover:text-black transition-colors">Home</a>
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                        <a href="/products" class="hover:text-black transition-colors">Products</a>
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                        <span class="text-black font-medium"><?php echo htmlspecialchars($mockProduct['name']); ?></span>
                    </div>

                    <!-- Product Title & Price -->
                    <h1 class="text-3xl font-bold mb-2"><?php echo htmlspecialchars($mockProduct['name']); ?></h1>
                    <p class="text-2xl font-bold mb-8" id="product-price">
                        S$<?php echo number_format($displayPrice, 0); ?>
                    </p>

                    <!-- Color Selector -->
                    <div class="mb-6">
                        <div class="flex gap-3">
                            <?php foreach ($mockProduct['colors'] as $color): ?>
                                <button
                                    type="button"
                                    onclick="selectColor(<?php echo $color['id']; ?>)"
                                    class="color-btn relative w-16 h-16 rounded border-2 overflow-hidden transition-colors <?php echo $selectedColorId === $color['id'] ? 'border-black' : 'border-gray-300'; ?>"
                                    data-color-id="<?php echo $color['id']; ?>"
                                    data-image-url="<?php echo htmlspecialchars($color['image_url']); ?>"
                                    data-image-url-2="<?php echo htmlspecialchars($color['image_url_2']); ?>"
                                >
                                    <img
                                        src="<?php echo htmlspecialchars($color['image_url']); ?>"
                                        alt="<?php echo htmlspecialchars($color['color']); ?>"
                                        class="w-full h-full object-cover"
                                    />
                                </button>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <!-- Size Selector -->
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-3">
                            <label class="text-sm font-medium">Talla</label>
                            <div class="text-xs text-gray-600">EU</div>
                        </div>
                        <div class="flex flex-wrap gap-2" id="size-selector">
                            <?php foreach ($selectedColor['options'] as $option): ?>
                                <button
                                    type="button"
                                    onclick="selectSize('<?php echo htmlspecialchars($option['size']); ?>', <?php echo $option['stock']; ?>, <?php echo $option['price']; ?>)"
                                    <?php echo $option['stock'] === 0 ? 'disabled' : ''; ?>
                                    class="size-btn px-4 py-2 border rounded transition-colors <?php
                                        echo $selectedSize === $option['size']
                                            ? 'bg-black text-white border-black'
                                            : ($option['stock'] === 0
                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                                : 'border-gray-300 hover:border-black');
                                    ?>"
                                    data-size="<?php echo htmlspecialchars($option['size']); ?>"
                                    data-stock="<?php echo $option['stock']; ?>"
                                    data-price="<?php echo $option['price']; ?>"
                                >
                                    <?php echo htmlspecialchars($option['size']); ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <!-- Stock Warning -->
                    <div id="stock-warning" class="<?php echo ($selectedOption && $selectedOption['stock'] > 0 && $selectedOption['stock'] <= 5) ? '' : 'hidden'; ?>">
                        <p class="text-sm font-medium mb-6">Few units available</p>
                    </div>

                    <!-- Quantity Selector -->
                    <div id="quantity-selector" class="mb-6 <?php echo ($selectedSize && $selectedOption && $selectedOption['stock'] > 0) ? '' : 'hidden'; ?>">
                        <label class="text-sm font-medium mb-3 block">Quantity</label>
                        <div class="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2 w-fit">
                            <button
                                type="button"
                                onclick="decreaseQuantity()"
                                id="decrease-btn"
                                class="text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                                </svg>
                            </button>
                            <span class="font-medium min-w-[30px] text-center" id="quantity-display">1</span>
                            <button
                                type="button"
                                onclick="increaseQuantity()"
                                id="increase-btn"
                                class="text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="space-y-3 mb-6">
                        <button
                            type="button"
                            onclick="handleAddToCart()"
                            id="add-to-cart-btn"
                            <?php echo (!$selectedSize || !$selectedOption || $selectedOption['stock'] === 0) ? 'disabled' : ''; ?>
                            class="w-full px-6 py-3 bg-black text-white font-medium rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            ADD TO CART
                        </button>
                    </div>

                    <!-- Promo Banner -->
                    <div class="bg-yellow-200 p-4 rounded-lg mb-6 text-center">
                        <p class="text-sm font-medium">
                            10% off your first order. <a href="/signup" class="underline">Sign up here</a>.
                        </p>
                    </div>

                    <!-- Product Info -->
                    <div class="space-y-3 mb-8">
                        <div class="flex items-center gap-3 text-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            <span>Free shipping</span>
                        </div>
                        <div class="flex items-center gap-3 text-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                            <span>Returns within 30 calendar days</span>
                        </div>
                        <div class="flex items-center gap-3 text-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                            <span>Secure payment</span>
                        </div>
                    </div>

                    <!-- Accordion Sections -->
                    <div class="border-t">
                        <!-- Description -->
                        <button
                            type="button"
                            onclick="toggleSection('description')"
                            class="flex items-center justify-between w-full py-4 border-b"
                        >
                            <span class="font-medium">Description</span>
                            <svg
                                id="description-chevron"
                                class="w-5 h-5 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div id="description-content" class="hidden py-4 text-sm text-gray-700 border-b">
                            <?php echo nl2br(htmlspecialchars($mockProduct['description'])); ?>
                        </div>

                        <!-- Materials -->
                        <button
                            type="button"
                            onclick="toggleSection('materials')"
                            class="flex items-center justify-between w-full py-4 border-b"
                        >
                            <span class="font-medium">Materials</span>
                            <svg
                                id="materials-chevron"
                                class="w-5 h-5 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div id="materials-content" class="hidden py-4 text-sm text-gray-700 border-b whitespace-pre-line">
                            <?php echo htmlspecialchars($mockProduct['materials']); ?>
                        </div>

                        <!-- Size Guide -->
                        <button
                            type="button"
                            onclick="toggleSection('size-guide')"
                            class="flex items-center justify-between w-full py-4"
                        >
                            <span class="font-medium">Size guide</span>
                            <svg
                                id="size-guide-chevron"
                                class="w-5 h-5 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div id="size-guide-content" class="hidden py-4 text-sm text-gray-700">
                            <p class="mb-2">EU sizing guide:</p>
                            <ul class="space-y-1">
                                <li>35 = 22.5 cm</li>
                                <li>36 = 23 cm</li>
                                <li>37 = 23.5 cm</li>
                                <li>38 = 24 cm</li>
                                <li>39 = 24.5 cm</li>
                                <li>40 = 25 cm</li>
                                <li>41 = 25.5 cm</li>
                                <li>42 = 26 cm</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recommended Products Section -->
    <div class="max-w-7xl mx-auto px-6 py-16 lg:px-12">
        <h2 class="text-2xl font-bold mb-8">Other Shoes You May Like</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <?php foreach ($recommendedProducts as $product): ?>
                <div class="flex flex-col gap-3 cursor-pointer">
                    <div class="relative w-full aspect-10\/12">
                        <a href="/product-details.php?id=<?php echo $product['id']; ?>" class="w-full h-full block">
                            <img
                                src="<?php echo htmlspecialchars($product['image'][0]); ?>"
                                alt="<?php echo htmlspecialchars($product['name']); ?>"
                                class="w-full h-full object-cover"
                            />
                        </a>
                    </div>
                    <a href="/product-details.php?id=<?php echo $product['id']; ?>" class="flex flex-col font-medium">
                        <h6 class="font-medium text-lg uppercase"><?php echo htmlspecialchars($product['name']); ?></h6>
                        <div class="flex gap-2 items-center">
                            <h6 class="<?php echo $product['discount'] > 0 ? 'line-through' : ''; ?>">
                                S$<?php echo number_format($product['price'], 0); ?>
                            </h6>
                            <?php if ($product['discount'] > 0): ?>
                                <div class="flex items-center gap-1 h-[24px] px-2 bg-blue-100 text-blue-700 text-sm">
                                    <span><?php echo $product['discount']; ?>% off –</span>
                                    <span class="font-bold">
                                        S$<?php echo number_format($product['price'] * (1 - $product['discount'] / 100), 2); ?>
                                    </span>
                                </div>
                            <?php endif; ?>
                        </div>
                    </a>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <script>
        // Product data from PHP (converted to JavaScript)
        const productData = <?php echo json_encode($mockProduct); ?>;
        let selectedColorId = <?php echo $selectedColorId; ?>;
        
        let currentQuantity = 1;
        let currentSize = '<?php echo $selectedSize; ?>';
        let currentStock = <?php echo $selectedOption ? $selectedOption['stock'] : 0; ?>;
        let expandedSection = null;

        // Color selection
        function selectColor(colorId) {
            const color = productData.colors.find(c => c.id === colorId);
            if (!color) return;

            // Update selected color ID
            selectedColorId = colorId;

            // Update images
            document.getElementById('main-image').src = color.image_url;
            document.getElementById('detail-image').src = color.image_url_2;

            // Update color button states
            document.querySelectorAll('.color-btn').forEach(btn => {
                const btnColorId = parseInt(btn.dataset.colorId);
                if (btnColorId === colorId) {
                    btn.classList.remove('border-gray-300');
                    btn.classList.add('border-black');
                } else {
                    btn.classList.remove('border-black');
                    btn.classList.add('border-gray-300');
                }
            });

            // Update size selector (this also resets selection)
            updateSizeSelector(color);

            // Update price to first option's price
            document.getElementById('product-price').textContent = 'S$' + color.options[0].price.toFixed(0);
        }

        // Update size selector based on selected color
        function updateSizeSelector(color) {
            const sizeContainer = document.getElementById('size-selector');
            sizeContainer.innerHTML = '';

            color.options.forEach(option => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'size-btn px-4 py-2 border rounded transition-colors ' +
                    (option.stock === 0
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-gray-300 hover:border-black');
                button.textContent = option.size;
                button.dataset.size = option.size;
                button.dataset.stock = option.stock;
                button.dataset.price = option.price;
                
                if (option.stock === 0) {
                    button.disabled = true;
                } else {
                    button.addEventListener('click', () => {
                        selectSize(option.size, option.stock, option.price);
                    });
                }
                
                sizeContainer.appendChild(button);
            });
            
            // Reset size selection when color changes
            currentSize = '';
            currentStock = 0;
            currentQuantity = 1;
            document.getElementById('quantity-display').textContent = '1';
            updateQuantitySelector();
            updateAddToCartButton();
            document.getElementById('stock-warning').classList.add('hidden');
        }

        // Size selection
        function selectSize(size, stock, price) {
            currentSize = size;
            currentStock = stock;

            // Update size button states
            document.querySelectorAll('.size-btn').forEach(btn => {
                if (btn.dataset.size === size) {
                    btn.classList.remove('border-gray-300');
                    btn.classList.add('bg-black', 'text-white', 'border-black');
                } else {
                    btn.classList.remove('bg-black', 'text-white', 'border-black');
                    if (!btn.disabled) {
                        btn.classList.add('border-gray-300');
                    }
                }
            });

            // Update price
            document.getElementById('product-price').textContent = 'S$' + price.toFixed(0);

            // Update stock warning
            if (stock > 0 && stock <= 5) {
                document.getElementById('stock-warning').classList.remove('hidden');
            } else {
                document.getElementById('stock-warning').classList.add('hidden');
            }

            // Update quantity selector
            currentQuantity = 1;
            document.getElementById('quantity-display').textContent = '1';
            updateQuantitySelector();
            updateAddToCartButton();
        }

        // Quantity management
        function increaseQuantity() {
            if (currentQuantity < currentStock) {
                currentQuantity++;
                document.getElementById('quantity-display').textContent = currentQuantity;
                updateQuantityButtons();
            }
        }

        function decreaseQuantity() {
            if (currentQuantity > 1) {
                currentQuantity--;
                document.getElementById('quantity-display').textContent = currentQuantity;
                updateQuantityButtons();
            }
        }

        function updateQuantityButtons() {
            const decreaseBtn = document.getElementById('decrease-btn');
            const increaseBtn = document.getElementById('increase-btn');
            
            decreaseBtn.disabled = currentQuantity <= 1;
            increaseBtn.disabled = currentQuantity >= currentStock;
        }

        function updateQuantitySelector() {
            const quantitySelector = document.getElementById('quantity-selector');
            if (currentSize && currentStock > 0) {
                quantitySelector.classList.remove('hidden');
                updateQuantityButtons();
            } else {
                quantitySelector.classList.add('hidden');
            }
        }

        function updateAddToCartButton() {
            const addToCartBtn = document.getElementById('add-to-cart-btn');
            if (currentSize && currentStock > 0) {
                addToCartBtn.disabled = false;
            } else {
                addToCartBtn.disabled = true;
            }
        }

        // Accordion toggle
        function toggleSection(section) {
            const content = document.getElementById(section + '-content');
            const chevron = document.getElementById(section + '-chevron');

            if (expandedSection === section) {
                content.classList.add('hidden');
                chevron.classList.remove('rotate-180');
                expandedSection = null;
            } else {
                // Close previously opened section
                if (expandedSection) {
                    const prevContent = document.getElementById(expandedSection + '-content');
                    const prevChevron = document.getElementById(expandedSection + '-chevron');
                    if (prevContent) prevContent.classList.add('hidden');
                    if (prevChevron) prevChevron.classList.remove('rotate-180');
                }

                content.classList.remove('hidden');
                chevron.classList.add('rotate-180');
                expandedSection = section;
            }
        }

        // Add to cart
        async function handleAddToCart() {
            if (!currentSize) {
                alert('Please select a size');
                return;
            }

            if (currentStock === 0) {
                alert('This size is out of stock');
                return;
            }

            if (currentQuantity > currentStock) {
                alert('Only ' + currentStock + ' items available');
                return;
            }

            const formData = new FormData();
            formData.append('action', 'add_to_cart');
            formData.append('color_id', selectedColorId);
            formData.append('size', currentSize);
            formData.append('quantity', currentQuantity);

            try {
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (data.success) {
                    alert(data.message);
                } else {
                    alert(data.error || 'Failed to add to cart');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            if (currentSize) {
                updateQuantitySelector();
                updateAddToCartButton();
            }
        });
    </script>
</body>
</html>

