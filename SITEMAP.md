# Website Sitemap

This document provides a comprehensive overview of all routes and pages in the IE4727 Web Application.

**Base Path:** `/miona`  
**Domain:** Replace `yourdomain.com` with your actual domain

---

## 📱 Client Pages (Public Access)

### Home & Authentication
| Route | Description | Access Level |
|-------|-------------|--------------|
| `/miona/` | Home page / Landing page | Public |
| `/miona/login/` | User login page | Public |
| `/miona/signup/` | User registration page | Public |
| `/miona/forgot-password/` | Password recovery page | Public |

### Products
| Route | Description | Access Level |
|-------|-------------|--------------|
| `/miona/products/` | All products catalog | Public |
| `/miona/products/men/` | Men's products category | Public |
| `/miona/products/women/` | Women's products category | Public |
| `/miona/products/unisex/` | Unisex products category | Public |
| `/miona/products/details/` | Product details page (dynamic) | Public |

### User Dashboard
| Route | Description | Access Level |
|-------|-------------|--------------|
| `/miona/user/` | User profile and account management | Protected (Requires Login) |

---

## 🛒 Checkout Flow (Protected)

| Route | Description | Access Level |
|-------|-------------|--------------|
| `/miona/checkout/` | Shopping cart and checkout page | Protected (Requires Login) |
| `/miona/checkout/result/` | Order confirmation/result page | Protected (Requires Login) |

---

## 🔐 Admin Pages (Protected - Admin Only)

### Admin Access
| Route | Description | Access Level |
|-------|-------------|--------------|
| `/miona/admin-client/` | Admin login portal | Public (Gateway) |

### Admin Dashboard
| Route | Description | Access Level |
|-------|-------------|--------------|
| `/miona/admin/` | Admin dashboard homepage | Protected (Admin Only) |
| `/miona/admin/customers/` | Customer management | Protected (Admin Only) |
| `/miona/admin/products/` | Product management (CRUD) | Protected (Admin Only) |
| `/miona/admin/sales/` | Sales analytics and reports | Protected (Admin Only) |
| `/miona/admin/transactions/` | Transaction history and management | Protected (Admin Only) |

---

## 🔌 Backend API Endpoints

### Authentication
- `POST /backend/api/login.php` - User login
- `POST /backend/api/signup.php` - User registration
- `POST /backend/api/logout.php` - User logout
- `GET /backend/api/check_auth.php` - Check authentication status

### Products
- `GET /backend/api/products/get_products.php` - Get all products
- `GET /backend/api/products/get_product_colors.php` - Get product color options
- `GET /backend/api/products/get_discounted.php` - Get discounted products
- `GET /backend/api/get_product.php` - Get single product details
- `POST /backend/api/products/create_product.php` - Create new product (Admin)
- `PUT /backend/api/products/update_product.php` - Update product (Admin)
- `DELETE /backend/api/products/delete_product.php` - Delete product (Admin)
- `GET /backend/api/buy_product_options.php` - Get product purchase options

### Transactions
- `GET /backend/api/transactions/get_transactions.php` - Get all transactions (Admin)
- `GET /backend/api/transactions/get_user_transactions.php` - Get user's transactions
- `GET /backend/api/transactions/sales_report.php` - Generate sales report (Admin)

### Admin
- `GET /backend/api/admin/stats.php` - Get dashboard statistics (Admin)
- `GET /backend/api/admin/users.php` - Get users list (Admin)

---

## 📁 Project Structure

```
ie4727-webapp/
├── frontend/                    # Next.js Frontend
│   ├── app/
│   │   ├── (client)/           # Client-facing pages (route group)
│   │   ├── (admin)/            # Admin pages (route group)
│   │   └── (checkout)/         # Checkout pages (route group)
│   ├── components/             # Reusable React components
│   ├── public/                 # Static assets
│   └── out/                    # Static export output
│
└── backend/                    # PHP Backend
    ├── api/                    # API endpoints
    │   ├── admin/             # Admin-specific APIs
    │   ├── products/          # Product-related APIs
    │   └── transactions/      # Transaction APIs
    ├── migrations/            # Database migrations
    └── uploads/               # File uploads directory
```

---

## 🎯 Route Categories

### By Access Level
- **Public Routes (11):** Home, Login, Signup, Forgot Password, Products (All, Men, Women, Unisex, Details), Admin Client
- **User Protected Routes (2):** User Dashboard, Checkout Flow
- **Admin Protected Routes (5):** Admin Dashboard, Customers, Products Management, Sales, Transactions

### By Functionality
- **E-commerce:** Product browsing, Cart, Checkout
- **User Management:** Authentication, Profile, Account
- **Admin Management:** Products, Customers, Sales, Transactions
- **Content:** Home, Static pages

---

## 📝 Notes

1. **Route Groups:** The app uses Next.js route groups `(client)`, `(admin)`, and `(checkout)` for organization without affecting the URL structure.

2. **Base Path:** All routes are prefixed with `/miona` as configured in `next.config.ts`.

3. **Trailing Slashes:** The application uses trailing slashes for all routes.

4. **Static Export:** The frontend is configured for static export (`output: "export"`).

5. **Protected Routes:** User and admin routes require authentication checks before access.

6. **SEO:** An XML sitemap is available at `/miona/sitemap.xml` (excludes admin routes from search engines).

---

## 📊 Related Documentation

- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Complete database structure with ERD diagrams
- **[DATABASE_VISUAL.md](DATABASE_VISUAL.md)** - Quick visual reference for database tables
- **[SITEMAP_VISUAL.md](SITEMAP_VISUAL.md)** - Visual site structure and user flows

---

## 🔄 Last Updated
November 14, 2025

