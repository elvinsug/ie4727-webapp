# Database Visual Reference

Quick visual reference for the MIONA database structure.

---

## 🎯 Quick Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     5 TABLES • 4 RELATIONSHIPS                    │
└──────────────────────────────────────────────────────────────────┘

                    AUTHENTICATION          PRODUCT HIERARCHY
                    
                    ┌─────────┐            ┌──────────┐
                    │  USERS  │            │ PRODUCTS │
                    └────┬────┘            └─────┬────┘
                         │                       │
                         │                       │ 1:N
                         │                       │ CASCADE
                         │                       ↓
                         │              ┌─────────────────┐
                         │              │ PRODUCT_COLORS  │
                         │              └────────┬────────┘
                         │                       │
                         │                       │ 1:N
                         │                       │ CASCADE
                         │                       ↓
                         │              ┌─────────────────┐
                         │              │ PRODUCT_OPTIONS │
                         │              └────────┬────────┘
                         │                       │
                         │ 1:N                   │ 1:N
                         │ CASCADE               │ RESTRICT
                         │                       │
                         └───────┬───────────────┘
                                 ↓
                         ┌───────────────┐
                         │ TRANSACTIONS  │
                         └───────────────┘
```

---

## 📊 Table Relationships Matrix

|  | users | products | product_colors | product_options | transactions |
|---|:---:|:---:|:---:|:---:|:---:|
| **users** | - | - | - | - | ✓ Has many transactions |
| **products** | - | - | ✓ Has many colors | - | - |
| **product_colors** | - | ⬆ Belongs to product | - | ✓ Has many options | - |
| **product_options** | - | - | ⬆ Belongs to color | - | ✓ Has many transactions |
| **transactions** | ⬆ Belongs to user | - | - | ⬆ Belongs to option | - |

---

## 🗂️ Table Structure Quick Reference

### 👤 USERS
```
┌──────────────────────────────────┐
│           USERS TABLE            │
├────────────┬─────────────────────┤
│ id         │ [PK] Auto increment │
│ email      │ [UQ] Login ID       │
│ password   │ Bcrypt hashed       │
│ role       │ 'user' / 'admin'    │
│ created_at │ Timestamp           │
│ updated_at │ Timestamp           │
└────────────┴─────────────────────┘
        │
        │ Has Many (1:N)
        ↓
   TRANSACTIONS
```

### 📦 PRODUCTS
```
┌──────────────────────────────────────┐
│         PRODUCTS TABLE               │
├─────────────┬────────────────────────┤
│ id          │ [PK] Auto increment    │
│ name        │ Product name           │
│ description │ Full description       │
│ materials   │ Materials list         │
│ sex         │ male/female/unisex     │
│ type        │ casual/arch/track/acc  │
│ created_at  │ Timestamp              │
│ updated_at  │ Timestamp              │
└─────────────┴────────────────────────┘
        │
        │ Has Many (1:N)
        ↓
  PRODUCT_COLORS
```

### 🎨 PRODUCT_COLORS
```
┌──────────────────────────────────────┐
│      PRODUCT_COLORS TABLE            │
├─────────────┬────────────────────────┤
│ id          │ [PK] Auto increment    │
│ product_id  │ [FK] → products.id     │
│ color       │ Color name             │
│ image_url   │ Main image             │
│ image_url_2 │ Alt image              │
│ created_at  │ Timestamp              │
│ updated_at  │ Timestamp              │
└─────────────┴────────────────────────┘
   ↑                    │
   │                    │ Has Many (1:N)
   │                    ↓
PRODUCTS          PRODUCT_OPTIONS
```

### 📏 PRODUCT_OPTIONS
```
┌──────────────────────────────────────────┐
│       PRODUCT_OPTIONS TABLE              │
├──────────────────┬───────────────────────┤
│ id               │ [PK] Auto increment   │
│ product_color_id │ [FK] → p_colors.id    │
│ size             │ Shoe size             │
│ price            │ Base price            │
│ discount_%       │ Discount 0-100        │
│ stock            │ Available quantity    │
│ created_at       │ Timestamp             │
│ updated_at       │ Timestamp             │
└──────────────────┴───────────────────────┘
   ↑                          │
   │                          │ Has Many (1:N)
   │                          ↓
PRODUCT_COLORS           TRANSACTIONS
```

### 💳 TRANSACTIONS
```
┌──────────────────────────────────────────────┐
│         TRANSACTIONS TABLE                   │
├───────────────────┬──────────────────────────┤
│ id                │ [PK] Auto increment      │
│ user_id           │ [FK] → users.id          │
│ product_option_id │ [FK] → p_options.id      │
│ quantity          │ Items purchased          │
│ price_paid        │ Price per item           │
│ total_amount      │ Total = price × quantity │
│ transaction_date  │ Purchase timestamp       │
│ status            │ pending/completed/etc    │
│ payment_method    │ Payment type             │
│ shipping_address  │ Delivery address         │
│ notes             │ Additional info          │
│ created_at        │ Timestamp                │
│ updated_at        │ Timestamp                │
└───────────────────┴──────────────────────────┘
        ↑                    ↑
        │                    │
     USERS            PRODUCT_OPTIONS
```

---

## 🔄 Complete Product Hierarchy

```
📦 PRODUCT
│   id: 1
│   name: "Nike Air Max"
│   description: "Classic running shoe..."
│   materials: "Leather, Rubber, Mesh"
│   sex: "unisex"
│   type: "casual"
│
├── 🎨 COLOR: Black (id: 1)
│   │   product_id: 1
│   │   image_url: "/products/nike-black-1.jpg"
│   │   image_url_2: "/products/nike-black-2.jpg"
│   │
│   ├── 📏 OPTION: Size US 9 (id: 1)
│   │       product_color_id: 1
│   │       price: $120.00
│   │       discount: 10%
│   │       stock: 50 units
│   │       ▶ Final Price: $108.00
│   │
│   ├── 📏 OPTION: Size US 10 (id: 2)
│   │       product_color_id: 1
│   │       price: $120.00
│   │       discount: 10%
│   │       stock: 30 units
│   │       ▶ Final Price: $108.00
│   │
│   └── 📏 OPTION: Size US 11 (id: 3)
│           product_color_id: 1
│           price: $120.00
│           discount: 10%
│           stock: 20 units
│           ▶ Final Price: $108.00
│
└── 🎨 COLOR: White (id: 2)
    │   product_id: 1
    │   image_url: "/products/nike-white-1.jpg"
    │   image_url_2: "/products/nike-white-2.jpg"
    │
    ├── 📏 OPTION: Size US 9 (id: 4)
    │       product_color_id: 2
    │       price: $120.00
    │       discount: 15%
    │       stock: 40 units
    │       ▶ Final Price: $102.00
    │
    └── 📏 OPTION: Size US 10 (id: 5)
            product_color_id: 2
            price: $120.00
            discount: 15%
            stock: 25 units
            ▶ Final Price: $102.00
```

---

## 🛒 Purchase Flow Example

```
┌─────────────────────────────────────────────────────────────────┐
│                      CUSTOMER PURCHASE                           │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Customer Browses
┌────────────┐
│   PRODUCT  │ User sees: Nike Air Max - $120 (10% off)
│   id: 1    │ Available colors: Black, White
└────────────┘ Available sizes: 9, 10, 11

STEP 2: Customer Selects
┌──────────────────┐
│ PRODUCT_COLOR    │ User selects: Black
│ id: 1            │ Views images
└──────────────────┘

STEP 3: Customer Chooses Size
┌──────────────────┐
│ PRODUCT_OPTION   │ User selects: Size 9
│ id: 1            │ Price: $108.00 (after discount)
│ Stock: 50 units  │ Adds to cart: 2 pairs
└──────────────────┘

STEP 4: Customer Checks Out
┌────────────┐
│   USER     │ Logged in: john@example.com
│   id: 5    │ Enters shipping address
└────────────┘ Chooses payment method

STEP 5: Transaction Created
┌──────────────────────────────────────┐
│        TRANSACTION                   │
│   id: 101                            │
│   user_id: 5                         │
│   product_option_id: 1               │
│   quantity: 2                        │
│   price_paid: $108.00                │
│   total_amount: $216.00              │
│   status: completed                  │
│   payment_method: credit_card        │
│   shipping_address: "123 Main St..." │
└──────────────────────────────────────┘

STEP 6: Stock Updated
┌──────────────────┐
│ PRODUCT_OPTION   │ Stock: 50 → 48 units
│ id: 1            │ (Decremented by 2)
└──────────────────┘
```

---

## 🔒 Foreign Key Constraints

### CASCADE DELETE
```
❌ DELETE products WHERE id = 1

    ↓ CASCADE
    
    ❌ DELETE product_colors WHERE product_id = 1
    
        ↓ CASCADE
        
        ❌ DELETE product_options WHERE product_color_id IN (1,2)
        
            ↓ RESTRICT (FAILS if transactions exist)
            
            🛑 ERROR: Cannot delete - transactions reference these options

Result: Cannot delete product if any purchases have been made.
```

### User Deletion
```
❌ DELETE users WHERE id = 5

    ↓ CASCADE
    
    ❌ DELETE transactions WHERE user_id = 5

Result: User and all their purchase history are deleted.
```

---

## 📈 Data Growth Pattern

```
Year 1:
┌─────────┐     ┌──────────┐     ┌────────────────┐
│ 100     │────▶│ 400      │────▶│ 2,000          │
│ Products│     │ Colors   │     │ Options        │
└─────────┘     └──────────┘     └────────────────┘
                                         ↓
                                         │ Referenced by
                                         ↓
                    ┌────────┐     ┌──────────────┐
                    │ 1,000  │────▶│ 10,000       │
                    │ Users  │     │ Transactions │
                    └────────┘     └──────────────┘

Average Ratios:
• 1 Product : 4 Colors
• 1 Color : 5 Size Options
• 1 User : 10 Transactions
• 1 Option : 5 Transactions
```

---

## 🎨 Color-Coded Relationship Diagram

```
🟦 Authentication Layer
┌──────────────┐
│    USERS     │ (Admin/Regular Users)
│   [id: PK]   │
└──────┬───────┘
       │
       │ 🟦→🟨 user_id (FK)
       │
       ↓
┌──────────────┐
│ TRANSACTIONS │ 🟨 Order Records
│   [id: PK]   │
└──────┬───────┘
       ↑
       │ 🟩→🟨 product_option_id (FK)
       │
┌──────┴────────┐
│PRODUCT_OPTIONS│ 🟩 Size/Price/Stock
│   [id: PK]    │
└──────┬────────┘
       ↑
       │ 🟧→🟩 product_color_id (FK)
       │
┌──────┴────────┐
│PRODUCT_COLORS │ 🟧 Color Variants
│   [id: PK]    │
└──────┬────────┘
       ↑
       │ 🟪→🟧 product_id (FK)
       │
┌──────┴────────┐
│   PRODUCTS    │ 🟪 Base Products
│   [id: PK]    │
└───────────────┘

Legend:
🟦 Blue = Authentication
🟪 Purple = Catalog
🟧 Orange = Variants
🟩 Green = Inventory
🟨 Yellow = Transactions
```

---

## 📊 Index Coverage Map

```
USERS
├─ idx_email (email) ........... Fast login lookups
└─ idx_role (role) ............. Filter by user type

PRODUCT_COLORS
└─ idx_product_id (product_id) . Get colors for product

PRODUCT_OPTIONS
└─ idx_product_color_id ........ Get sizes for color

TRANSACTIONS
├─ idx_user_id ................. Get user's orders
├─ idx_product_option_id ....... Get option sales
├─ idx_transaction_date ........ Date range queries
└─ idx_status .................. Filter by status
```

---

## 🔍 Common Query Patterns

### 1. Browse Products
```
GET products → GET product_colors → GET product_options
(Fetch catalog with all variants and prices)
```

### 2. View Product Details
```
SELECT FROM products WHERE id = ?
├─ JOIN product_colors
└─ JOIN product_options
(Show all color/size/price combinations)
```

### 3. Add to Cart
```
SELECT FROM product_options WHERE id = ?
(Check price, discount, and stock availability)
```

### 4. Create Order
```
INSERT INTO transactions (user_id, product_option_id, ...)
UPDATE product_options SET stock = stock - quantity WHERE id = ?
(Record purchase and decrement inventory)
```

### 5. View Order History
```
SELECT FROM transactions WHERE user_id = ?
├─ JOIN product_options
├─ JOIN product_colors
└─ JOIN products
(Show customer's complete purchase history)
```

### 6. Admin: Sales Report
```
SELECT 
  p.name,
  SUM(t.total_amount) as revenue,
  SUM(t.quantity) as units_sold
FROM transactions t
JOIN product_options po ON t.product_option_id = po.id
JOIN product_colors pc ON po.product_color_id = pc.id
JOIN products p ON pc.product_id = p.id
GROUP BY p.id
ORDER BY revenue DESC
```

---

## 💡 Design Decisions

### Why 3-Level Product Hierarchy?

```
❌ FLAT STRUCTURE (Bad):
products: [id, name, size, color, price, stock]
Problem: Each product variant = new row with duplicate info

✅ NORMALIZED STRUCTURE (Good):
products → product_colors → product_options
Benefit: One product record, multiple variants
```

### Why CASCADE vs RESTRICT?

```
CASCADE on Product Hierarchy:
└─ Delete product → auto-delete variants
   Reason: Variants are meaningless without product

RESTRICT on Product Options → Transactions:
└─ Prevent deletion if orders exist
   Reason: Preserve order history and integrity
```

### Why Store price_paid in Transactions?

```
Historical Accuracy:
transactions.price_paid = snapshot of price at purchase time
Even if product price changes later, transaction remains accurate
```

---

## 🛠️ Maintenance Commands

### Check Referential Integrity
```sql
-- Find orphaned colors (shouldn't exist)
SELECT * FROM product_colors pc
LEFT JOIN products p ON pc.product_id = p.id
WHERE p.id IS NULL;

-- Find orphaned options (shouldn't exist)
SELECT * FROM product_options po
LEFT JOIN product_colors pc ON po.product_color_id = pc.id
WHERE pc.id IS NULL;
```

### Rebuild Indexes
```sql
ANALYZE TABLE users, products, product_colors, product_options, transactions;
```

### Check Stock Consistency
```sql
SELECT po.id, po.stock,
       SUM(CASE WHEN t.status = 'pending' THEN t.quantity ELSE 0 END) as reserved
FROM product_options po
LEFT JOIN transactions t ON po.id = t.product_option_id
GROUP BY po.id
HAVING po.stock < reserved;
```

---

*Quick Reference Guide • Last Updated: November 14, 2025*

