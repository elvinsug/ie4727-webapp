# Database Schema Documentation

Database: **miona_app**  
Engine: **InnoDB**  
Charset: **utf8mb4_unicode_ci**

---

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE: miona_app                              │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │     USERS       │
                              ├─────────────────┤
                              │ 🔑 id (PK)      │
                              │ 📧 email        │
                              │ 🔒 password     │
                              │ 👤 role         │
                              │ 📅 created_at   │
                              │ 📅 updated_at   │
                              └────────┬────────┘
                                       │
                                       │ 1
                                       │
                                       │
                              ┌────────┴────────┐
                              │                 │
                              │ transactions    │
                              │   .user_id      │
                              │                 │
                              └────────┬────────┘
                                       │
                                       │ N
                                       │
                                       ↓
                              ┌─────────────────────────┐
                              │    TRANSACTIONS         │
                              ├─────────────────────────┤
                              │ 🔑 id (PK)              │
                              │ 🔗 user_id (FK)         │
                              │ 🔗 product_option_id    │
                              │ 🔢 quantity             │
                              │ 💰 price_paid           │
                              │ 💵 total_amount         │
                              │ 📅 transaction_date     │
                              │ 📊 status               │
                              │ 💳 payment_method       │
                              │ 📍 shipping_address     │
                              │ 📝 notes                │
                              │ 📅 created_at           │
                              │ 📅 updated_at           │
                              └────────┬────────────────┘
                                       ↑
                                       │ N
                                       │
                              ┌────────┴────────┐
                              │                 │
                              │  product_options│
                              │      .id        │
                              │                 │
                              └────────┬────────┘
                                       │
                                       │ 1
                                       │
                                       ↓
                              ┌─────────────────────────┐
                              │   PRODUCT_OPTIONS       │
                              ├─────────────────────────┤
                              │ 🔑 id (PK)              │
                              │ 🔗 product_color_id(FK) │
                              │ 📏 size                 │
                              │ 💰 price                │
                              │ 🏷️  discount_percentage │
                              │ 📦 stock                │
                              │ 📅 created_at           │
                              │ 📅 updated_at           │
                              └────────┬────────────────┘
                                       ↑
                                       │ N
                                       │
                              ┌────────┴────────┐
                              │                 │
                              │ product_colors  │
                              │      .id        │
                              │                 │
                              └────────┬────────┘
                                       │
                                       │ 1
                                       │
                                       ↓
                              ┌─────────────────────────┐
                              │   PRODUCT_COLORS        │
                              ├─────────────────────────┤
                              │ 🔑 id (PK)              │
                              │ 🔗 product_id (FK)      │
                              │ 🎨 color                │
                              │ 🖼️  image_url           │
                              │ 🖼️  image_url_2         │
                              │ 📅 created_at           │
                              │ 📅 updated_at           │
                              └────────┬────────────────┘
                                       ↑
                                       │ N
                                       │
                              ┌────────┴────────┐
                              │                 │
                              │    products     │
                              │       .id       │
                              │                 │
                              └────────┬────────┘
                                       │
                                       │ 1
                                       │
                                       ↓
                              ┌─────────────────────────┐
                              │      PRODUCTS           │
                              ├─────────────────────────┤
                              │ 🔑 id (PK)              │
                              │ 📝 name                 │
                              │ 📄 description          │
                              │ 🧵 materials            │
                              │ ⚧️  sex                  │
                              │ 🏷️  type                │
                              │ 📅 created_at           │
                              │ 📅 updated_at           │
                              └─────────────────────────┘
```

---

## 🔄 Simplified Relationship Flow

```
┌─────────┐       ┌─────────────────┐       ┌──────────────────┐       ┌────────────────┐       ┌──────────────┐
│ USERS   │       │   PRODUCTS      │       │ PRODUCT_COLORS   │       │PRODUCT_OPTIONS │       │TRANSACTIONS  │
├─────────┤       ├─────────────────┤       ├──────────────────┤       ├────────────────┤       ├──────────────┤
│ id      │───┐   │ id              │──┬───▶│ product_id (FK)  │──┬───▶│product_color_id│──┬───▶│product_option│
│ email   │   │   │ name            │  │    │ color            │  │    │ size           │  │    │  _id (FK)    │
│ role    │   │   │ description     │  │    │ image_url        │  │    │ price          │  │    │ quantity     │
└─────────┘   │   │ materials       │  │    │ image_url_2      │  │    │ discount_%     │  │    │ total_amount │
              │   │ sex             │  │    └──────────────────┘  │    │ stock          │  │    │ user_id (FK) │◀─┘
              │   │ type            │  │                           │    └────────────────┘  │    └──────────────┘
              │   └─────────────────┘  │                           │                        │
              │                        │                           │                        │
              │   1 Product has        │   1 Color has            │   1 Option used in     │
              │   N Colors             │   N Options              │   N Transactions       │
              │                        │                           │                        │
              │                        └───── CASCADE DELETE ─────┴───── CASCADE DELETE ────┘
              │
              └────────────────────────────────── 1 User has N Transactions ──────────────────┘
```

---

## 📋 Tables Overview

| Table Name | Records Type | Primary Key | Foreign Keys | Purpose |
|------------|-------------|-------------|--------------|---------|
| **users** | Authentication | id | - | Store user accounts and roles |
| **products** | Catalog | id | - | Base product information |
| **product_colors** | Variants | id | product_id | Color variants of products |
| **product_options** | Inventory | id | product_color_id | Size/price/stock for each color |
| **transactions** | Orders | id | user_id, product_option_id | Purchase records |

**Total Tables:** 5  
**Total Relationships:** 4

---

## 📑 Detailed Table Structures

### 1️⃣ USERS Table

Stores user authentication and role information.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | INT | NO | AUTO | Primary key |
| **email** | VARCHAR(255) | NO | - | Unique user email (login identifier) |
| **password** | VARCHAR(255) | NO | - | Bcrypt hashed password |
| **role** | ENUM | NO | 'user' | User role: 'user' or 'admin' |
| **created_at** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Account creation time |
| **updated_at** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE KEY: `email`
- INDEX: `idx_email` (email)
- INDEX: `idx_role` (role)

**Relationships:**
- Has many: `transactions` (1:N)

---

### 2️⃣ PRODUCTS Table

Base product information (shoes catalog).

```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    materials TEXT,
    sex ENUM('male', 'female', 'unisex') NOT NULL DEFAULT 'male',
    type ENUM('casual', 'arch', 'track_field', 'accessories') NOT NULL DEFAULT 'casual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | INT | NO | AUTO | Primary key |
| **name** | VARCHAR(255) | NO | - | Product name |
| **description** | TEXT | NO | - | Product description |
| **materials** | TEXT | YES | NULL | Materials used |
| **sex** | ENUM | NO | 'male' | Target gender: male/female/unisex |
| **type** | ENUM | NO | 'casual' | Product category |
| **created_at** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |
| **updated_at** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY: `id`

**Relationships:**
- Has many: `product_colors` (1:N)

**Business Logic:**
- Each product can have multiple color variations
- Product types: casual shoes, arch support, track & field, accessories

---

### 3️⃣ PRODUCT_COLORS Table

Color variants for each product with images.

```sql
CREATE TABLE product_colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    color VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    image_url_2 VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | INT | NO | AUTO | Primary key |
| **product_id** | INT | NO | - | Foreign key to products |
| **color** | VARCHAR(50) | NO | - | Color name (e.g., "Black", "White") |
| **image_url** | VARCHAR(255) | YES | NULL | Primary product image |
| **image_url_2** | VARCHAR(255) | YES | NULL | Secondary product image |
| **created_at** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |
| **updated_at** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE KEY: `unique_product_color` (product_id, color)
- INDEX: `idx_product_id` (product_id)

**Constraints:**
- FOREIGN KEY: `product_id` → `products(id)` ON DELETE CASCADE
- UNIQUE: Each product can only have one entry per color

**Relationships:**
- Belongs to: `products` (N:1)
- Has many: `product_options` (1:N)

**Cascade Behavior:**
- When a product is deleted, all its color variants are deleted

---

### 4️⃣ PRODUCT_OPTIONS Table

Size, price, discount, and stock for each color variant.

```sql
CREATE TABLE product_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_color_id INT NOT NULL,
    size VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_percentage INT NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_color_id) REFERENCES product_colors(id) ON DELETE CASCADE
)
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | INT | NO | AUTO | Primary key |
| **product_color_id** | INT | NO | - | Foreign key to product_colors |
| **size** | VARCHAR(50) | NO | - | Shoe size (e.g., "US 9", "EU 42") |
| **price** | DECIMAL(10,2) | NO | 0.00 | Base price in dollars |
| **discount_percentage** | INT | NO | 0 | Discount percentage (0-100) |
| **stock** | INT | NO | 0 | Available quantity |
| **created_at** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |
| **updated_at** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `idx_product_color_id` (product_color_id)

**Constraints:**
- FOREIGN KEY: `product_color_id` → `product_colors(id)` ON DELETE CASCADE

**Relationships:**
- Belongs to: `product_colors` (N:1)
- Has many: `transactions` (1:N)

**Cascade Behavior:**
- When a color variant is deleted, all its size/price options are deleted

**Business Logic:**
- Final price = price × (1 - discount_percentage / 100)
- Stock is decremented when purchases are made

---

### 5️⃣ TRANSACTIONS Table

Customer purchase records.

```sql
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_option_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_paid DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'completed',
    payment_method VARCHAR(50),
    shipping_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_option_id) REFERENCES product_options(id) ON DELETE RESTRICT
)
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | INT | NO | AUTO | Primary key |
| **user_id** | INT | NO | - | Foreign key to users |
| **product_option_id** | INT | NO | - | Foreign key to product_options |
| **quantity** | INT | NO | 1 | Number of items purchased |
| **price_paid** | DECIMAL(10,2) | NO | - | Price per item at purchase |
| **total_amount** | DECIMAL(10,2) | NO | - | Total amount = price_paid × quantity |
| **transaction_date** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Purchase timestamp |
| **status** | ENUM | NO | 'completed' | Order status |
| **payment_method** | VARCHAR(50) | YES | NULL | Payment method used |
| **shipping_address** | TEXT | YES | NULL | Delivery address |
| **notes** | TEXT | YES | NULL | Additional notes |
| **created_at** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Record creation time |
| **updated_at** | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `idx_user_id` (user_id)
- INDEX: `idx_product_option_id` (product_option_id)
- INDEX: `idx_transaction_date` (transaction_date)
- INDEX: `idx_status` (status)

**Constraints:**
- FOREIGN KEY: `user_id` → `users(id)` ON DELETE CASCADE
- FOREIGN KEY: `product_option_id` → `product_options(id)` ON DELETE RESTRICT

**Relationships:**
- Belongs to: `users` (N:1)
- Belongs to: `product_options` (N:1)

**Cascade Behavior:**
- When a user is deleted, their transaction history is deleted
- When a product option is deleted, deletion is RESTRICTED if transactions exist

**Status Flow:**
```
pending → completed
   ↓          ↓
cancelled  refunded
```

---

## 🔗 Relationship Details

### 1. Users → Transactions (1:N)

```
users.id (1) ─────────→ transactions.user_id (N)
```

- **Type:** One-to-Many
- **Cascade:** ON DELETE CASCADE
- **Description:** One user can have multiple transactions
- **Business Rule:** When user is deleted, all their transactions are deleted

### 2. Products → Product Colors (1:N)

```
products.id (1) ─────────→ product_colors.product_id (N)
```

- **Type:** One-to-Many
- **Cascade:** ON DELETE CASCADE
- **Unique Constraint:** (product_id, color) must be unique
- **Description:** One product can have multiple color variants
- **Business Rule:** When product is deleted, all color variants are deleted

### 3. Product Colors → Product Options (1:N)

```
product_colors.id (1) ─────────→ product_options.product_color_id (N)
```

- **Type:** One-to-Many
- **Cascade:** ON DELETE CASCADE
- **Description:** One color variant can have multiple size/price options
- **Business Rule:** When color is deleted, all size options are deleted

### 4. Product Options → Transactions (1:N)

```
product_options.id (1) ─────────→ transactions.product_option_id (N)
```

- **Type:** One-to-Many
- **Cascade:** ON DELETE RESTRICT
- **Description:** One product option can be purchased multiple times
- **Business Rule:** Cannot delete product option if transactions exist

---

## 🎯 Data Flow Examples

### Example 1: Complete Product Structure

```
Product: "Nike Air Max"
├── Color: "Black"
│   ├── Option: Size 9, $120, 10% off, Stock: 50
│   ├── Option: Size 10, $120, 10% off, Stock: 30
│   └── Option: Size 11, $120, 10% off, Stock: 20
│
└── Color: "White"
    ├── Option: Size 9, $120, 15% off, Stock: 40
    └── Option: Size 10, $120, 15% off, Stock: 25
```

**SQL Representation:**

```
products (id=1)
└─ name: "Nike Air Max"

product_colors (id=1, product_id=1)
├─ color: "Black"

product_options
├─ (id=1, product_color_id=1, size="9", price=120, discount=10, stock=50)
├─ (id=2, product_color_id=1, size="10", price=120, discount=10, stock=30)
└─ (id=3, product_color_id=1, size="11", price=120, discount=10, stock=20)
```

### Example 2: Transaction Flow

```
User: john@example.com (id=5)
    ↓
Purchases: Nike Air Max, Black, Size 9
    ↓
Transaction Record:
    - user_id: 5
    - product_option_id: 1
    - quantity: 2
    - price_paid: 108.00 (120 - 10% = $108)
    - total_amount: 216.00 (108 × 2)
    - status: completed
```

---

## 📊 Database Statistics

### Cardinality

```
1 User → Many Transactions
1 Product → Many Colors → Many Options → Many Transactions

Typical ratios:
- 1 Product : 3-5 Colors
- 1 Color : 5-10 Size Options
- 1 User : 0-100+ Transactions
- 1 Product Option : 0-1000+ Transactions
```

### Storage Estimates

| Table | Avg Row Size | Expected Rows | Est. Storage |
|-------|--------------|---------------|--------------|
| users | ~500 bytes | 1,000 - 100,000 | 50 MB - 50 GB |
| products | ~1 KB | 100 - 1,000 | 100 KB - 1 MB |
| product_colors | ~600 bytes | 300 - 5,000 | 180 KB - 3 MB |
| product_options | ~300 bytes | 1,500 - 50,000 | 450 KB - 15 MB |
| transactions | ~800 bytes | 10,000 - 1M | 8 MB - 800 MB |

---

## 🔍 Query Patterns

### Common Queries

#### 1. Get Complete Product Info
```sql
SELECT 
    p.id, p.name, p.description,
    pc.color, pc.image_url,
    po.size, po.price, po.discount_percentage, po.stock
FROM products p
JOIN product_colors pc ON p.id = pc.product_id
JOIN product_options po ON pc.id = po.product_color_id
WHERE p.id = ?
```

#### 2. Get User Transaction History
```sql
SELECT 
    t.*,
    p.name as product_name,
    pc.color,
    po.size
FROM transactions t
JOIN product_options po ON t.product_option_id = po.id
JOIN product_colors pc ON po.product_color_id = pc.id
JOIN products p ON pc.product_id = p.id
WHERE t.user_id = ?
ORDER BY t.transaction_date DESC
```

#### 3. Get Products by Category
```sql
SELECT DISTINCT p.*
FROM products p
WHERE p.sex = ?  -- 'male', 'female', or 'unisex'
  AND p.type = ? -- 'casual', 'arch', etc.
```

#### 4. Check Stock Availability
```sql
SELECT po.stock
FROM product_options po
WHERE po.id = ?
FOR UPDATE  -- Lock row for update
```

---

## 🛡️ Data Integrity Rules

### Constraints Summary

| Constraint Type | Count | Details |
|----------------|-------|---------|
| Primary Keys | 5 | All tables have AUTO_INCREMENT id |
| Foreign Keys | 4 | All enforced with CASCADE or RESTRICT |
| Unique Keys | 2 | users.email, (product_id, color) |
| Indexes | 8 | Optimized for common queries |
| ENUM Types | 3 | role, sex, type, status |

### Cascade Actions

```
DELETE user
  └─▶ CASCADE DELETE all user's transactions

DELETE product
  └─▶ CASCADE DELETE all product_colors
       └─▶ CASCADE DELETE all product_options
            └─▶ RESTRICT if transactions exist (cannot delete)

This prevents orphaned data and maintains referential integrity.
```

---

## 🔄 Default Values

| Table | Column | Default | Purpose |
|-------|--------|---------|---------|
| users | role | 'user' | New accounts are regular users |
| products | sex | 'male' | Default category |
| products | type | 'casual' | Default product type |
| product_options | price | 0.00 | Must be set explicitly |
| product_options | discount_percentage | 0 | No discount by default |
| product_options | stock | 0 | Must be set explicitly |
| transactions | quantity | 1 | Single item purchase |
| transactions | status | 'completed' | Assume successful |

---

## 📅 Timestamps

All tables include:
- **created_at:** Set once on record creation
- **updated_at:** Automatically updated on any modification

These enable:
- Audit trails
- Data versioning
- Time-based analytics
- Debugging

---

*Last Updated: November 14, 2025*
*Database Version: 1.0*

