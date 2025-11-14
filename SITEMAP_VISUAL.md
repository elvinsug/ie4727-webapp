# Visual Sitemap - Site Structure

```
🏠 MIONA E-Commerce Website
│
├─── 🌐 PUBLIC PAGES
│    │
│    ├─── Home (/)
│    │    └─── Landing page with featured products
│    │
│    ├─── 🔐 Authentication
│    │    ├─── Login (/login)
│    │    ├─── Sign Up (/signup)
│    │    └─── Forgot Password (/forgot-password)
│    │
│    └─── 👟 Products (/products)
│         ├─── All Products (/products)
│         ├─── Men's Collection (/products/men)
│         ├─── Women's Collection (/products/women)
│         ├─── Unisex Collection (/products/unisex)
│         └─── Product Details (/products/details)
│
├─── 👤 USER AREA (Protected - Requires Login)
│    │
│    ├─── User Profile (/user)
│    │    └─── Account management, order history
│    │
│    └─── 🛒 Checkout Flow (/checkout)
│         ├─── Shopping Cart & Checkout (/checkout)
│         └─── Order Confirmation (/checkout/result)
│
└─── 🔧 ADMIN AREA (Protected - Admin Only)
     │
     ├─── Admin Login Portal (/admin-client)
     │
     └─── Admin Dashboard (/admin)
          ├─── Dashboard Overview (/admin)
          ├─── 👥 Customer Management (/admin/customers)
          ├─── 📦 Product Management (/admin/products)
          ├─── 📊 Sales Analytics (/admin/sales)
          └─── 💳 Transaction History (/admin/transactions)
```

---

## 🗂️ Information Architecture

### Level 1: Main Sections
```
┌─────────────────┬──────────────────┬────────────────┐
│   PUBLIC        │   USER AREA      │   ADMIN AREA   │
│   (11 pages)    │   (3 pages)      │   (6 pages)    │
└─────────────────┴──────────────────┴────────────────┘
```

### Level 2: Category Breakdown

#### 🌐 Public Section
```
Home (1)
├── Featured Products
├── Hero Banner
└── Call-to-Action

Authentication (3)
├── Login
├── Signup
└── Forgot Password

Products (7)
├── Product Catalog (Main)
│   ├── Search & Filter
│   └── Product Grid
│
├── Category Pages (3)
│   ├── Men's
│   ├── Women's
│   └── Unisex
│
└── Product Details
    ├── Images & Gallery
    ├── Specifications
    ├── Color Options
    └── Add to Cart
```

#### 👤 User Section
```
User Profile (1)
├── Personal Information
├── Order History
└── Account Settings

Checkout (2)
├── Shopping Cart
│   ├── Cart Items
│   ├── Quantity Adjustment
│   └── Price Calculation
│
└── Checkout Result
    ├── Order Confirmation
    └── Transaction Details
```

#### 🔧 Admin Section
```
Admin Dashboard (1)
├── Key Metrics
├── Recent Activity
└── Quick Actions

Management Pages (4)
├── Customers
│   ├── User List
│   └── User Details
│
├── Products
│   ├── Product List
│   ├── Create Product
│   ├── Edit Product
│   └── Delete Product
│
├── Sales
│   ├── Revenue Analytics
│   ├── Sales Trends
│   └── Reports
│
└── Transactions
    ├── Transaction List
    ├── Filter & Search
    └── Transaction Details
```

---

## 🔄 User Flows

### 1️⃣ Guest Shopping Flow
```
Home → Products → Product Details → Login/Signup → Checkout → Result
```

### 2️⃣ Registered User Shopping Flow
```
Home → Products → Product Details → Add to Cart → Checkout → Result → User Profile
```

### 3️⃣ Admin Management Flow
```
Admin Login → Dashboard → [Customers/Products/Sales/Transactions] → CRUD Operations
```

### 4️⃣ Authentication Flow
```
┌─── New User: Home → Signup → Login → User Area
│
└─── Returning User: Home → Login → User Area
```

---

## 📊 Page Count Summary

| Section | Public | Protected | Total |
|---------|--------|-----------|-------|
| Client Pages | 11 | 3 | 14 |
| Admin Pages | 1 | 5 | 6 |
| **Total Pages** | **12** | **8** | **20** |

---

## 🎨 Component Hierarchy

### Shared Components
```
App Layout
├── Navbar (with Cart)
├── Footer
└── Global Styles

Page Components
├── ProductCard
├── CartSheet
├── FilterSheet
└── UI Components
    ├── Button
    ├── Input
    ├── Card
    ├── Dialog
    ├── Sheet
    ├── Table
    └── Charts
```

---

## 🔌 API Integration Map

### Frontend → Backend Connections

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND PAGES                    │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌───────┐    ┌────────┐    ┌──────────┐
│ Auth  │    │Product │    │Transaction│
│ APIs  │    │  APIs  │    │   APIs   │
└───────┘    └────────┘    └──────────┘
    │             │             │
    └─────────────┴─────────────┘
                  │
                  ▼
         ┌──────────────┐
         │   Database   │
         │   (MySQL)    │
         └──────────────┘
```

### API Endpoints by Page

| Page | API Endpoints Used |
|------|-------------------|
| Home | `get_products.php`, `get_discounted.php` |
| Products | `get_products.php`, `get_product_colors.php` |
| Product Details | `get_product.php`, `buy_product_options.php` |
| Login | `login.php`, `check_auth.php` |
| Signup | `signup.php` |
| User Profile | `check_auth.php`, `get_user_transactions.php` |
| Checkout | `check_auth.php`, transaction endpoints |
| Admin Dashboard | `admin/stats.php` |
| Admin Products | `products/get_products.php`, `create_product.php`, `update_product.php`, `delete_product.php` |
| Admin Customers | `admin/users.php` |
| Admin Transactions | `transactions/get_transactions.php`, `sales_report.php` |

---

## 🎯 Navigation Structure

### Primary Navigation (Header)
- Home
- Products (with dropdown: Men, Women, Unisex)
- Login/Signup (or User Profile if logged in)
- Cart (Sheet)

### Secondary Navigation (Footer)
- About
- Contact
- Terms & Conditions
- Privacy Policy

### Admin Navigation (Sidebar)
- Dashboard
- Customers
- Products
- Sales
- Transactions
- Logout

---

## 🔐 Access Control Matrix

| Route Pattern | Guest | User | Admin |
|--------------|-------|------|-------|
| `/` | ✅ | ✅ | ✅ |
| `/products/*` | ✅ | ✅ | ✅ |
| `/login`, `/signup` | ✅ | ➡️ | ➡️ |
| `/user` | ❌ | ✅ | ✅ |
| `/checkout/*` | ❌ | ✅ | ✅ |
| `/admin-client` | ✅ | ❌ | ➡️ |
| `/admin/*` | ❌ | ❌ | ✅ |

Legend:
- ✅ Full Access
- ❌ No Access (Redirect to login)
- ➡️ Redirect (already authenticated)

---

## 📱 Responsive Design Breakpoints

All pages are designed to be responsive across:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

*Last Updated: November 14, 2025*

