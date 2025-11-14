# 👟 MIONA - E-Commerce Web Application

**IE4727 Web Development Project**

A modern, full-featured e-commerce platform for shoe retail built with Next.js and PHP.

---

## 🚀 Quick Start

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
# Configure PHP server to serve backend/api/
# Import database migrations from backend/migrations/
```

---

## 📚 Documentation

### 🗺️ Complete Documentation Index
**[📖 DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Master guide to all documentation

### Quick Links

| Document | Description |
|----------|-------------|
| [**SITEMAP.md**](SITEMAP.md) | Complete route and API documentation |
| [**SITEMAP_VISUAL.md**](SITEMAP_VISUAL.md) | Visual site architecture and user flows |
| [**DATABASE_SCHEMA.md**](DATABASE_SCHEMA.md) | Complete database structure with ERD |
| [**DATABASE_VISUAL.md**](DATABASE_VISUAL.md) | Quick database reference |

---

## 🎯 Features

### 🛍️ E-Commerce
- Product catalog with filtering
- Multi-category support (Men, Women, Unisex)
- Color and size variants
- Dynamic pricing and discounts
- Stock management
- Shopping cart
- Secure checkout

### 👤 User Management
- Email/password authentication
- User registration and profiles
- Order history
- Transaction tracking

### 🔧 Admin Panel
- Dashboard analytics
- Product management (CRUD)
- User management
- Sales reporting
- Transaction monitoring

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Components:** Radix UI
- **Charts:** Recharts
- **Build:** Static Export (SSG)

### Backend
- **Language:** PHP
- **Database:** MySQL (InnoDB)
- **API:** RESTful
- **Auth:** Session-based

---

## 📁 Project Structure

```
ie4727-webapp/
├── frontend/           # Next.js application
│   ├── app/           # App router pages
│   │   ├── (client)/  # Public pages
│   │   ├── (admin)/   # Admin dashboard
│   │   └── (checkout)/ # Checkout flow
│   ├── components/    # React components
│   └── public/        # Static assets
│
├── backend/           # PHP backend
│   ├── api/          # REST API endpoints
│   │   ├── admin/    # Admin APIs
│   │   ├── products/ # Product APIs
│   │   └── transactions/ # Transaction APIs
│   └── migrations/   # Database schema
│
└── docs/             # Documentation (see above)
```

For complete structure, see [SITEMAP_VISUAL.md](SITEMAP_VISUAL.md).

---

## 🗄️ Database

The application uses 5 main tables:
- **users** - Authentication and roles
- **products** - Product catalog
- **product_colors** - Color variants
- **product_options** - Size/price/stock
- **transactions** - Purchase records

### Setup
```bash
cd backend
./migrate.sh
```

For detailed schema, see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

---

## 🌐 Routes

### Public Pages (12)
- Home, Products, Login, Signup, etc.

### User Pages (3)
- Profile, Checkout, Orders

### Admin Pages (5)
- Dashboard, Customers, Products, Sales, Transactions

**Base Path:** `/miona`

For complete route documentation, see [SITEMAP.md](SITEMAP.md).

---

## 🔐 Default Credentials

```
Admin:
Email: admin@example.com
Password: admin123

User:
Email: user@example.com
Password: user123
```

⚠️ **Change these in production!**

---

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Run linter
```

### Deploy to htdocs (Local)
```bash
npm run deploy:htdocs:local
```

### Database Migrations
```bash
cd backend
./migrate.sh
```

---

## 📦 Deployment

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure Backend**
   - Set up PHP server
   - Configure database connection
   - Set environment variables

3. **Deploy Static Files**
   ```bash
   ./deploy.sh
   ```

4. **Update Sitemaps**
   - Edit `frontend/app/sitemap.ts`
   - Replace `yourdomain.com` with actual domain

For detailed deployment guide, see [SITEMAP_README.md](SITEMAP_README.md).

---

## 📊 API Endpoints

### Authentication
- `POST /api/login.php`
- `POST /api/signup.php`
- `POST /api/logout.php`
- `GET /api/check_auth.php`

### Products
- `GET /api/products/get_products.php`
- `GET /api/products/get_product_colors.php`
- `POST /api/products/create_product.php` (Admin)
- `PUT /api/products/update_product.php` (Admin)
- `DELETE /api/products/delete_product.php` (Admin)

### Transactions
- `GET /api/transactions/get_transactions.php` (Admin)
- `GET /api/transactions/get_user_transactions.php`
- `GET /api/transactions/sales_report.php` (Admin)

For complete API documentation, see [SITEMAP.md](SITEMAP.md#-backend-api-endpoints).

---

## 🎨 UI Components

Built with Radix UI and Tailwind CSS:
- Button, Input, Card, Dialog
- Sheet (Cart/Filters)
- Table, Select, Badge
- Alert Dialog, Tooltip
- Chart (Sales analytics)

---

## 📈 Application Stats

- **Total Pages:** 20
- **API Endpoints:** 16+
- **Database Tables:** 5
- **Components:** 15+
- **Lines of Code:** 10,000+
- **Documentation:** 1,800+ lines

---

## 🧪 Testing

```bash
# Frontend
cd frontend
npm run lint

# Check sitemap
curl http://localhost:3000/miona/sitemap.xml
```

---

## 📝 Contributing

When making changes:

1. **New Routes:** Update SITEMAP.md and sitemap.ts
2. **Database Changes:** Update DATABASE_SCHEMA.md
3. **Features:** Update relevant documentation

See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for contribution guide.

---

## 🐛 Known Issues

None currently. Please report issues with detailed information.

---

## 📄 License

IE4727 Course Project - Educational Use

---

## 👥 Team

IE4727 Web Application Development Project

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [PHP Manual](https://www.php.net/manual/en/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## 🗺️ Sitemap

Quick site overview:

```
/ (Home)
├── /products
│   ├── /products/men
│   ├── /products/women
│   └── /products/unisex
├── /login
├── /signup
├── /user (Protected)
├── /checkout (Protected)
│   └── /checkout/result
└── /admin (Admin Only)
    ├── /admin/customers
    ├── /admin/products
    ├── /admin/sales
    └── /admin/transactions
```

For complete visual sitemap, see [SITEMAP_VISUAL.md](SITEMAP_VISUAL.md).

---

## 🔗 Quick Navigation

- 📖 [Full Documentation](DOCUMENTATION_INDEX.md)
- 🗺️ [Site Routes](SITEMAP.md)
- 🎨 [Visual Architecture](SITEMAP_VISUAL.md)
- 🗄️ [Database Schema](DATABASE_SCHEMA.md)
- 🚀 [Deployment Guide](SITEMAP_README.md)

---

<div align="center">

**Built with ❤️ for IE4727**

[Documentation](DOCUMENTATION_INDEX.md) • [Sitemap](SITEMAP.md) • [Database](DATABASE_SCHEMA.md)

</div>
