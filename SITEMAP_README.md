# Sitemap Documentation

This document explains all the sitemap files that have been created for your IE4727 Web Application.

## 📋 Files Created

### 1. **SITEMAP.md** (Main Documentation)
**Location:** `/SITEMAP.md`
- Comprehensive documentation of all routes and pages
- Organized by access level and functionality
- Includes backend API endpoints
- Perfect for team reference and onboarding

### 2. **SITEMAP_VISUAL.md** (Visual Structure)
**Location:** `/SITEMAP_VISUAL.md`
- Visual tree diagrams of site structure
- User flow diagrams
- Component hierarchy
- API integration maps
- Access control matrix

### 3. **sitemap.xml** (SEO Sitemap)
**Location:** `/frontend/public/sitemap.xml`
- Standard XML sitemap for search engines
- Includes all public-facing pages
- Excludes admin pages (for security)
- Update `yourdomain.com` with your actual domain

### 4. **sitemap.ts** (Dynamic Next.js Sitemap)
**Location:** `/frontend/app/sitemap.ts`
- Next.js dynamic sitemap generator
- Automatically served at `/miona/sitemap.xml`
- Update `yourdomain.com` with your actual domain
- Will be generated during build

### 5. **robots.ts** (Search Engine Rules)
**Location:** `/frontend/app/robots.ts`
- Tells search engines which pages to crawl
- Blocks admin and protected pages
- Points to sitemap location
- Update `yourdomain.com` with your actual domain

---

## 🚀 Quick Start

### Step 1: Update Domain Names
Before deployment, replace `yourdomain.com` in these files:
1. `/frontend/public/sitemap.xml` (Line 6 onwards)
2. `/frontend/app/sitemap.ts` (Line 3)
3. `/frontend/app/robots.ts` (Line 3)

**Example:**
```typescript
// Change this:
const baseUrl = 'https://yourdomain.com'

// To your actual domain:
const baseUrl = 'https://www.miona-shoes.com'
```

### Step 2: Build Your Project
```bash
cd frontend
npm run build
```

The sitemap will be automatically generated at:
- `/miona/sitemap.xml`
- `/miona/robots.txt`

### Step 3: Verify Sitemap
After building, check these URLs:
1. `https://yourdomain.com/miona/sitemap.xml`
2. `https://yourdomain.com/miona/robots.txt`

---

## 📊 Route Summary

Your application has **20 total pages**:

### Public Pages (12)
- Home page
- Login, Signup, Forgot Password
- Products (main, men, women, unisex, details)
- Admin client access

### Protected Pages (8)
**User Area (3):**
- User profile/dashboard
- Checkout page
- Checkout result

**Admin Area (5):**
- Admin dashboard
- Customers management
- Products management
- Sales analytics
- Transactions

---

## 🔍 SEO Considerations

### Pages INCLUDED in sitemap (for SEO):
✅ Home page (Priority: 1.0)
✅ Product pages (Priority: 0.8-0.9)
✅ Authentication pages (Priority: 0.5-0.7)
✅ Checkout pages (Priority: 0.6-0.8)

### Pages EXCLUDED from sitemap (for security):
❌ Admin dashboard and all admin pages
❌ These are blocked in robots.txt

### Priority Levels Explained:
- **1.0** - Home page (highest priority)
- **0.9** - Main products page
- **0.8** - Category pages, checkout
- **0.7** - Login, signup, product details
- **0.6** - User dashboard, order confirmation
- **0.5** - Password recovery
- **0.3** - Admin access (low priority)

### Change Frequency:
- **Daily** - Home, product listings
- **Weekly** - Product details, user dashboard
- **Monthly** - Auth pages, checkout, admin

---

## 🛠️ Maintenance

### Adding New Pages
When you add new pages, update these files:

1. **sitemap.ts** - Add new route:
```typescript
{
  url: createUrl('/new-page/'),
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.7,
}
```

2. **SITEMAP.md** - Add to appropriate section

3. **SITEMAP_VISUAL.md** - Add to tree structure

### Removing Pages
1. Remove from `sitemap.ts`
2. Update documentation files
3. Rebuild project

### Updating Priorities
Adjust priority values in `sitemap.ts` based on:
- Page importance to business
- Expected traffic
- Update frequency
- User intent

---

## 📈 Analytics Integration

### Google Search Console
1. Go to Google Search Console
2. Add property for your domain
3. Submit sitemap URL: `https://yourdomain.com/miona/sitemap.xml`

### Bing Webmaster Tools
1. Go to Bing Webmaster Tools
2. Add your site
3. Submit sitemap URL

---

## 🔐 Security Notes

### Admin Pages
- All `/admin/*` routes are excluded from sitemap
- Blocked in `robots.txt`
- Should have authentication checks in code

### Protected Routes
- User and checkout pages are in sitemap (low priority)
- Require authentication in application code
- Not accessible without login

### Best Practices
✅ Never expose admin URLs in public sitemap
✅ Use meta robots tag for extra protection on sensitive pages
✅ Implement proper authentication middleware
✅ Regular security audits

---

## 🧪 Testing

### Test Sitemap Accessibility
```bash
# After deployment, test:
curl https://yourdomain.com/miona/sitemap.xml
curl https://yourdomain.com/miona/robots.txt
```

### Validate XML Sitemap
Use online validators:
- https://www.xml-sitemaps.com/validate-xml-sitemap.html
- https://search.google.com/test/rich-results

### Check Robots.txt
- https://www.google.com/webmasters/tools/robots-testing-tool

---

## 📝 File Structure

```
ie4727-webapp/
├── SITEMAP.md                          # Main documentation
├── SITEMAP_VISUAL.md                   # Visual diagrams
├── SITEMAP_README.md                   # This file
│
└── frontend/
    ├── app/
    │   ├── sitemap.ts                  # Dynamic sitemap generator
    │   └── robots.ts                   # Robots.txt generator
    │
    └── public/
        └── sitemap.xml                 # Static XML sitemap
```

---

## 🎯 Next Steps

1. **Review the sitemaps:**
   - Read `SITEMAP.md` for complete route documentation
   - Check `SITEMAP_VISUAL.md` for structure overview

2. **Update domain names:**
   - Replace `yourdomain.com` in all sitemap files

3. **Build and test:**
   - Run `npm run build` in frontend directory
   - Verify sitemap accessibility

4. **Submit to search engines:**
   - Google Search Console
   - Bing Webmaster Tools

5. **Monitor and maintain:**
   - Update when adding new pages
   - Review analytics regularly
   - Adjust priorities based on performance

---

## 🤝 Support

For questions about:
- **Sitemap structure:** See `SITEMAP.md`
- **Visual layouts:** See `SITEMAP_VISUAL.md`
- **Implementation:** See inline comments in `.ts` files
- **SEO optimization:** Review priority and changefreq settings

---

## 📚 Resources

- [Next.js Sitemap Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Google Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Robots.txt Specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)

---

*Generated: November 14, 2025*
*Project: IE4727 Web Application (MIONA)*

