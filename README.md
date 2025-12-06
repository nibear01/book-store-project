<div align="center">

# 📚 Bookstore App — Complete Full-Stack Documentation

A comprehensive e-commerce bookstore platform with advanced features including affiliate marketing, author/publisher management, print-on-demand, and multi-role administration.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Core Features](#core-features)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Frontend Architecture](#frontend-architecture)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Bookstore App is a production-ready, full-stack e-commerce platform built for managing an online bookstore with advanced business features:

- **Multi-role Administration**: Granular role-based access control for team management
- **Affiliate Marketing System**: Complete commission tracking and withdrawal management
- **Author & Publisher Management**: Dedicated portals for content creators
- **Print-on-Demand Support**: Integrated POD workflow
- **Advanced Shopping Experience**: Cart, wishlist, reviews, and dynamic pricing
- **E2E Testing Suite**: Selenium-based UI testing with pytest
- **CI/CD Ready**: Jenkins pipeline configuration included

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 5.1.0
- **Database**: MongoDB 6+ with Mongoose 8.18.3
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Security**: bcrypt 6.0.0
- **File Uploads**: Multer 2.0.2
- **Email**: Nodemailer 7.0.6
- **Validation**: express-validator 7.2.1
- **Rate Limiting**: express-rate-limit 8.1.0
- **CSV Processing**: csv-parser 3.2.0

### Frontend
- **Library**: React 19.1.1
- **Build Tool**: Vite 7
- **Routing**: React Router 7.8.2
- **Styling**: TailwindCSS 4.1.13
- **UI Components**: Material-UI 7.3.2, Radix UI
- **Animations**: Framer Motion 12.23.12
- **State Management**: React Context API
- **HTTP Client**: Axios 1.12.2
- **Notifications**: React Toastify 11.0.5, Sonner 2.0.7
- **Charts**: Recharts 3.2.0
- **Internationalization**: i18next 25.6.3
- **Phone Handling**: libphonenumber-js 1.12.18
- **Icons**: React Icons, Heroicons, Lucide React, MUI Icons

### DevOps & Testing
- **Testing**: Pytest, Selenium WebDriver
- **CI/CD**: Jenkins
- **Containerization**: Docker (setup included)
- **Dev Tools**: Nodemon 3.1.10, ESLint 9.33.0

---

## 📦 Prerequisites

### Required Software
- **Node.js** 18+ (LTS recommended) — [Download](https://nodejs.org/)
- **npm** 9+ (comes with Node.js)
- **MongoDB** 6+ (local or cloud instance)
- **Git** (optional, for version control)

### For UI Testing
- **Python** 3.8+ with pip
- **Firefox** browser (for Selenium tests)
- **geckodriver** (auto-configured by test setup)

### Platform Support
- ✅ Windows (PowerShell/CMD)
- ✅ macOS (Terminal/Bash)
- ✅ Linux (Bash/Zsh)

All commands in this guide are PowerShell-ready for Windows users.

---

## 🚀 Quick Start

### 1. Clone the Repository
```powershell
git clone https://github.com/imranslab-inc/bookstore-app.git
cd bookstore-app
```

### 2. Environment Configuration
Create `.env` files for backend and frontend:

**Backend** (`backend/.env`):
```env
MONGO_URI=mongodb://localhost:27017/bookstore
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=BookStore <no-reply@bookstore.local>
SEED_CATEGORIES=true
```

**Frontend** (`frontend/.env`):
```env
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Install Dependencies
```powershell
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd ../frontend
npm install
```

### 4. Start the Application

**Backend** (Terminal 1):
```powershell
cd backend
npm run dev     # Development with nodemon on http://localhost:5000
# or
npm start       # Production mode
```

**Frontend** (Terminal 2):
```powershell
cd frontend
npm run dev     # Development on http://localhost:5173
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Static Files**: http://localhost:5000/uploads/

---

## ⚙️ Environment Configuration

### Backend Environment Variables (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | ✅ Yes | - | MongoDB connection string |
| `PORT` | No | 5000 | Server port |
| `JWT_SECRET` | ✅ Yes | - | Secret key for JWT tokens (use long random string) |
| `JWT_EXPIRE` | No | 30d | JWT token expiration time |
| `CLIENT_URL` | ✅ Yes | - | Frontend URL for password reset links |
| `SMTP_HOST` | ✅ Yes | - | SMTP server host for emails |
| `SMTP_PORT` | ✅ Yes | 587 | SMTP server port |
| `SMTP_USER` | ✅ Yes | - | SMTP authentication username |
| `SMTP_PASS` | ✅ Yes | - | SMTP authentication password |
| `SMTP_FROM` | No | BookStore | Email sender name and address |
| `SEED_CATEGORIES` | No | false | Seed default categories on first run |

**Note**: `DATABASE_URL` can be used as an alias for `MONGO_URI` in migration scripts.

### Frontend Environment Variables (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_BACKEND_URL` | No | http://localhost:5000 | Backend API base URL |

**Note**: Some frontend modules use hardcoded API base URLs. To use environment variables consistently, update the API modules to read `import.meta.env.VITE_BACKEND_URL`.

---

## 🔧 Scripts and Utilities

### Migrate Book Genres
Convert legacy book genres from string to array format:

```powershell
cd backend
node scripts/migrate-genres-to-array.js
```

This script ensures `genre` is an array of strings, deduplicated and trimmed. Requires valid `MONGO_URI` or `DATABASE_URL`.

---

## 5) Features (product-level)

- Public catalog
	- Browse books with pagination and rich filters (search, genre, author, language, price, rating, stock)
	- Featured, Latest, Trending, On Sale, Most Viewed, and Deals of the Week collections
	- SEO metadata fields per book
	- Multi-genre support per book
	- Book detail page increments view count
- Authentication & profiles
	- Register/login via email or phone + password (JWT-based)
	- Password reset via email (Nodemailer)
	- Profile editing with optional profile image upload
- Shopping features
	- Cart: add/update/remove items, automatic total calculation, stock checks
	- Wishlist: add/remove/clear, quick counts
	- Checkout flow (backend order creation with pricing breakdown)
- Categories
	- Dynamic categories in MongoDB with book counts (based on case-insensitive match to book genres)
	- Admin can create, update, soft/hard delete
	- Optional seeding of defaults on first run
- Admin & roles
	- Roles: admin, book_manager, order_manager, printing_manager, delivery_manager, finance_manager, customer_support, marketing_manager
	- Policy-based access control; admin-only endpoints protected server-side
	- Admin order dashboard stats (totals, by status, sales over time, recent orders, top books)
- Assets & uploads
	- Upload multiple cover images and a book file (PDF/EPUB) per book
	- Bulk upload for images/files with optional renaming maps
	- Static files served from `/uploads/...`

- Reviews
	- Users can write one review per book (1–5 stars, comment required)
	- Edit and delete own review; admin can manage reviews via API
	- Book rating and review count (`rating`, `num_reviews`) are kept in sync from actual reviews
	- Frontend Reviews tab supports infinite scroll and pins “my review” at the top
	- Global toast notifications (top-right) surface success and server validation errors

Note: In this starter implementation, passwords are stored as plain text to keep the focus on features. For production, integrate a password hashing library such as bcrypt and enforce HTTPS and secure cookie/token handling.

---

## 📡 API Documentation

**Base URL**: `http://localhost:5000/api`

**Authentication**: Include `Authorization: Bearer <token>` header for protected routes

### 🔐 Authentication & Users

#### Public Auth Routes
```
POST   /users/register              Register new user
POST   /users/login                 Login with email + password
POST   /users/login-phone           Login with phone + password
POST   /users/forgot-password       Request password reset email
POST   /users/reset-password        Reset password with token
```

#### Protected User Routes
```
GET    /users/me                    Get current user profile
GET    /users/roles                 Get allowed roles (admin only)
```

#### Admin User Management
```
GET    /users                       List all users (query: page, limit, status, roles)
GET    /users/:id                   Get user by ID
PUT    /users/:id                   Update user (FormData with profile_image)
DELETE /users/:id                   Delete user (cascades to cart, wishlist, reviews)
PUT    /users/:id/role              Change user roles { role | roles[] }
PUT    /users/:id/status            Change user status { status }
PUT    /users/:id/password          Change user password { password }
```

### 📚 Books

#### Public Book Routes
```
GET    /books                       List books with filters
       Query: page, limit, search, genre, author, language, minPrice, maxPrice,
              sort, minRating, inStock, onSale, deals, minViews, status
       
GET    /books/featured              Get featured books
GET    /books/latest                Get latest books
GET    /books/trending              Get trending books
GET    /books/on-sale               Get books on sale
GET    /books/most-viewed           Get most viewed books
GET    /books/deals                 Get deals of the week
GET    /books/count                 Get total and active book counts
GET    /books/:slug                 Get book by slug (increments view count)
```

#### Admin Book Management
```
POST   /books                       Create book (FormData: cover_image[], file_url)
POST   /books/bulk-upload           Bulk upload images/files
                                    (FormData: bulk_images[], bulk_files[],
                                     renameMap JSON, imagesNames JSON, filesNames JSON)
PUT    /books/:id                   Update book (FormData)
DELETE /books/:id?hard=true         Delete book (soft delete default)
```

### 🏷️ Categories
```
GET    /categories                  List categories
       Query: includeEmpty=false, status=active|inactive|all
GET    /categories/:slug            Get category by slug
POST   /categories                  Create category (admin)
PUT    /categories/:id              Update category (admin)
DELETE /categories/:id?hard=true    Delete category (admin, blocked if books exist)
```

### 🛒 Shopping Cart (Auth Required)
```
GET    /cart                        Get user's cart with populated items
GET    /cart/count                  Get cart item count
POST   /cart/items                  Add item { bookId, quantity }
PUT    /cart/items/:bookId          Update quantity { quantity } (0 removes)
DELETE /cart/items/:bookId          Remove item from cart
DELETE /cart                        Clear entire cart
```

### ❤️ Wishlist (Auth Required)
```
GET    /wishlist                    Get user's wishlist
GET    /wishlist/count              Get wishlist item count
POST   /wishlist/items              Add item { bookId }
DELETE /wishlist/items/:bookId      Remove item from wishlist
DELETE /wishlist                    Clear entire wishlist
```

### 📦 Orders

#### Customer Order Routes
```
POST   /orders/create               Create order { items[], shipping_address, payment_info, shipping_amount }
GET    /orders/my-orders            Get user's orders
GET    /orders/details/:id          Get order details by ID
```

#### Admin Order Management
```
GET    /orders/admin/all            List all orders
GET    /orders/admin/stats          Get order statistics and analytics
PUT    /orders/admin/:id/status     Update order status { status }
DELETE /orders/admin/:id            Delete order
POST   /orders/admin/import         Import orders from CSV (FormData: file)
```

### ⭐ Reviews
```
GET    /reviews                     Get reviews for book
       Query: book=<bookId>, page=<n>, limit=<n>
       Returns: { data, pagination, meta: { avgRating } }
       
POST   /reviews                     Create/update review { book, rating, comment }
                                    (One review per user per book)
PUT    /reviews/:id                 Update review { rating?, comment? } (owner/admin)
DELETE /reviews/:id                 Delete review (owner/admin)
```

### 👨‍💼 Authors
```
GET    /authors                     List all authors
       Query: status=verified|pending|unverified|cancelled|all, page, limit
GET    /authors/:slug               Get author by slug with books
POST   /authors                     Create author (admin)
PUT    /authors/:id                 Update author (admin, FormData with photo)
DELETE /authors/:id                 Delete author (admin)
PUT    /authors/:id/status          Change author status (admin)
```

### 📝 Author Requests
```
POST   /author-requests             Submit author application
GET    /author-requests/check-email Check if email exists
POST   /author-requests/otp/send    Send OTP for verification
POST   /author-requests/otp/verify  Verify OTP code
GET    /author-requests             List all requests (admin)
GET    /author-requests/:id         Get request by ID (admin)
PUT    /author-requests/:id         Update request status (admin)
DELETE /author-requests/:id         Delete request (admin)
```

### 📖 Book Requests
```
POST   /book-requests               Submit book request
       { name, email, title, author?, isbn?, publisher?, notes? }
GET    /book-requests/check-email   Check if email exists
GET    /book-requests               List all requests (admin)
GET    /book-requests/:id           Get request by ID (admin)
PUT    /book-requests/:id           Update request (admin)
DELETE /book-requests/:id           Delete request (admin)
```

### 🏢 Publishers
```
GET    /publishers                  List publishers
       Query: status=active|inactive|all, q=<search>, country, page, limit
GET    /publishers/:slug            Get publisher by slug with books
POST   /publishers                  Create publisher (admin, FormData with logo)
PUT    /publishers/:id              Update publisher (admin, FormData)
DELETE /publishers/:id              Delete publisher (admin)
```

### 💰 Affiliates (See `AFFILIATE_API_DOCS.md` for details)

#### Public Affiliate Routes
```
POST   /affiliates/register         Register as affiliate
POST   /affiliates/login            Affiliate login
GET    /affiliates/me               Get affiliate profile
PUT    /affiliates/me               Update affiliate profile
GET    /affiliates/dashboard        Get affiliate dashboard stats
GET    /affiliates/commissions      Get commission history
GET    /affiliates/withdrawals      Get withdrawal history
POST   /affiliates/withdrawals      Request withdrawal
```

#### Admin Affiliate Management
```
GET    /admin/affiliates            List all affiliates
GET    /admin/affiliates/:id        Get affiliate by ID
PUT    /admin/affiliates/:id/approve      Approve affiliate
PUT    /admin/affiliates/:id/status       Change affiliate status
PUT    /admin/affiliates/:id/commission   Update commission rate
GET    /admin/affiliates/withdrawals      List all withdrawals
PUT    /admin/affiliates/withdrawals/:id  Process withdrawal (approve/reject)
```

### 📧 Subscribers
```
POST   /subscribers                 Subscribe to newsletter { name, email }
DELETE /subscribers/unsubscribe     Unsubscribe { email }
GET    /subscribers                 List all subscribers (admin)
DELETE /subscribers/:id             Delete subscriber (admin)
```

### 📞 Contact
```
POST   /contact                     Submit contact form
       { name, email, subject?, message }
```

### ⚙️ Settings (Admin Only)
```
GET    /settings                    List all settings
GET    /settings/:key               Get setting by key
POST   /settings                    Create setting { key, value, description? }
PUT    /settings/:key               Update setting { value, description? }
DELETE /settings/:key               Delete setting
GET    /settings/delivery-cost      Get delivery cost
PUT    /settings/delivery-cost      Update delivery cost { cost }
GET    /settings/price-range        Get price range
PUT    /settings/price-range        Update price range { min, max }
```

### 📱 OTP (Email Verification)
```
POST   /otp/send                    Send OTP code { email }
POST   /otp/verify                  Verify OTP code { email, code }
```

### 📄 Static Files
```
GET    /uploads/*                   Serve uploaded files (images, PDFs, EPUBs)
```

---

## 💾 Database Models

### Core Models

#### Book Model
```javascript
{
  title: String (required),
  author: String (required),
  description: String,
  genre: [String] (array, trimmed),
  language: String,
  slug: String (unique, lowercase),
  meta_title: String (required),
  meta_description: String,
  meta_keywords: [String],
  isbn: String (unique, sparse),
  cover_image: [String] (array, max 5),
  file_url: String (PDF/EPUB),
  price: Number (required),
  stock: Number (default: 0),
  published_date: Date,
  rating: Number (default: 0),
  num_reviews: Number (default: 0),
  is_active: Boolean (default: true),
  is_featured: Boolean (default: false),
  publisher: String,
  publisher_id: ObjectId (ref: Publisher),
  pages: Number (default: 0),
  isPrintOnDemand: Boolean (default: false),
  is_on_sale: Boolean (default: false),
  sale_price: Number,
  views: Number (default: 0),
  is_deal_of_the_week: Boolean (default: false),
  deal_start: Date,
  deal_end: Date,
  created_at: Date,
  updated_at: Date
}
```

#### User Model
```javascript
{
  name: String (required, max 100 chars),
  email: String (required, unique, lowercase),
  password: String (required, min 8 chars),
  roles: [String] (enum: user, admin, author, book_manager, order_manager,
                   printing_manager, delivery_manager, finance_manager,
                   customer_support, marketing_manager),
  status: String (enum: active, inactive, suspended),
  phone: String (required, unique),
  address: String (max 500 chars),
  profile_image: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isVerified: Boolean (default: false),
  verifiedCode: String,
  verifiedCodeSentAt: Date,
  verifiedCodeExpires: Date,
  created_at: Date,
  updated_at: Date
}
```

#### Category Model
```javascript
{
  name: String (required),
  slug: String (unique),
  description: String,
  image: String,
  synonyms: [String],
  is_active: Boolean (default: true),
  order: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Shopping Models

#### Cart Model
```javascript
{
  user: ObjectId (ref: User, required, unique),
  items: [{
    book: ObjectId (ref: Book),
    title: String,
    price: Number,
    quantity: Number
  }],
  total_price: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

#### Wishlist Model
```javascript
{
  user: ObjectId (ref: User, required, unique),
  items: [{
    book: ObjectId (ref: Book),
    title: String,
    price: Number,
    added_at: Date (default: Date.now)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Order Model
```javascript
{
  order_number: String (required, unique),
  user: ObjectId (ref: User, required),
  items: [{
    book: ObjectId (ref: Book),
    book_title: String,
    book_cover: String,
    price: Number,
    quantity: Number
  }],
  subtotal: Number,
  discount_amount: Number,
  discount_label: String,
  shipping_amount: Number,
  grand_total: Number,
  order_status: String,
  shipping_address: Object,
  payment_info: Object,
  createdAt: Date,
  updatedAt: Date
}
```

#### Review Model
```javascript
{
  book: ObjectId (ref: Book, required),
  user: ObjectId (ref: User, required),
  name: String,
  rating: Number (required, 1-5),
  comment: String (required),
  createdAt: Date,
  updatedAt: Date
}
// Unique compound index on (book, user)
```

### Affiliate Models

#### Affiliate Model
```javascript
{
  name: String (required, max 100 chars),
  email: String (required, unique, lowercase),
  password: String (required, min 8 chars),
  phone: String (required, unique),
  address: String (max 500 chars),
  promo_code: String (required, unique, uppercase),
  commission_rate: Number (default: 5),
  total_sales: Number (default: 0),
  total_commission: Number (default: 0),
  available_balance: Number (default: 0),
  total_withdrawn: Number (default: 0),
  status: String (enum: pending, active, inactive, suspended, blocked),
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Affiliate Commission Model
```javascript
{
  affiliate: ObjectId (ref: Affiliate, required),
  order: ObjectId (ref: Order, required),
  commission_amount: Number (required),
  commission_rate: Number (required),
  order_total: Number (required),
  status: String (enum: pending, approved, paid),
  createdAt: Date,
  updatedAt: Date
}
```

#### Affiliate Withdrawal Model
```javascript
{
  affiliate: ObjectId (ref: Affiliate, required),
  amount: Number (required),
  status: String (enum: pending, approved, rejected, paid),
  withdrawal_method: String,
  account_details: Object,
  admin_note: String,
  processed_by: ObjectId (ref: User),
  processed_at: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Content Management Models

#### Author Model
```javascript
{
  name: String (required),
  title: String (required),
  bio: String,
  photo: String,
  slug: String (unique),
  books: [ObjectId] (ref: Book),
  status: String (enum: unverified, pending, verified, cancelled),
  dob: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Publisher Model
```javascript
{
  publisher_id: String (unique, 6-digit),
  name: String (required),
  description: String,
  logo: String,
  slug: String (unique),
  books: [ObjectId] (ref: Book),
  country: String,
  website: String,
  founded_year: Number,
  is_active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### Author Request Model
```javascript
{
  fullName: String (required),
  email: String (required),
  phone: String,
  address: Object { street, city, state, zip, country },
  affiliation: String,
  title: String (required),
  typeOfWork: String (default: "Book"),
  abstract: String (required),
  categoryType: String (enum: English, Bangla, Bilingual),
  rightsOriginal: Boolean (required),
  rightsPublish: Boolean (required),
  agreeEditorial: Boolean (required),
  additionalRequests: String,
  signature: String,
  date: String,
  status: String (enum: unverified, pending, verified, cancelled),
  emailVerified: Boolean (default: false),
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  reviewNote: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Book Request Model
```javascript
{
  user: ObjectId (ref: User, optional),
  name: String (required),
  email: String (required, lowercase),
  title: String (required),
  author: String,
  isbn: String,
  publisher: String,
  notes: String,
  status: String (enum: pending, approved, rejected, fulfilled),
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### System Models

#### Subscriber Model
```javascript
{
  name: String (required, max 120 chars),
  email: String (required, unique, lowercase),
  active: Boolean (default: true),
  unsubscribedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Setting Model
```javascript
{
  key: String (required, unique),
  value: Mixed (required),
  description: String,
  created_at: Date,
  updated_at: Date
}
```

#### Email OTP Model
```javascript
{
  email: String (required, unique, lowercase),
  code: String (required),
  expiresAt: Date (required),
  createdAt: Date,
  updatedAt: Date
}
```

#### Upload History Model
```javascript
{
  fileName: String (required),
  originalName: String,
  filePath: String (required),
  fileSize: Number,
  mimeType: String,
  uploadedBy: ObjectId (ref: User),
  entityType: String,
  entityId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 8) File uploads and static assets

- Upload fields
	- Books: `cover_image[]` (max 5, images), `file_url` (PDF/EPUB)
	- Bulk: `bulk_images[]`, `bulk_files[]` with optional renaming via `renameMap`, `imagesNames`, `filesNames`
	- Users: `profile_image`
- Stored under `backend/uploads/` in subfolders for books and users
- Served via backend at `GET /uploads/...`

---

## 9) Frontend notes

- Dev server: http://localhost:5173
- Default API base: `http://localhost:5000/api` in the API modules
	- You can switch to `VITE_API_URL` pattern by adapting the API modules to read `import.meta.env.VITE_API_URL`
- Token is stored in `localStorage` and attached as `Bearer` on requests
- UI libraries: TailwindCSS, MUI, icons, charts, animations

- Toasts (global):
	- Implemented with `react-toastify` and `<ToastContainer position="top-right" autoClose={5000} />` in `App.jsx`.
	- The Reviews tab uses toasts for success and error feedback (submit/update/delete, duplicate review attempts, load failures).

- Reviews UX:
	- Infinite scroll: additional pages load automatically when the end of the list enters view.
	- “My review first”: the current user's review is pinned to the top of the list when present.

Key pages/components (under `src/pages` and `src/components`): Home, Browse/Shop, Book view, Cart, Wishlist, Checkout, Orders, Admin views (books, orders, dashboards), Navbar/Footer, etc.

---

## 🧪 Testing

### UI Testing (Selenium + Pytest)

The project includes comprehensive UI testing with Selenium WebDriver and pytest.

#### Test Structure
```
ui_test/
├── __init__.py              # Package marker
├── conftest.py              # Pytest configuration
├── pytest.ini               # Pytest settings
├── requirements.txt         # Python dependencies
├── run_tests.py             # Test runner script
├── run_tests.sh             # Linux/Mac test runner
├── run_tests.bat            # Windows test runner
├── pages/                   # Page Object Model
│   └── login/
│       └── set_up.py        # Browser setup
└── test.py                  # Test cases
```

#### Running Tests

**Prerequisites**:
- Python 3.8+
- Firefox browser
- pip installed

**Setup**:
```powershell
# Install dependencies
pip install -r ui_test/requirements.txt
```

**Run Tests**:
```powershell
# Using test runner (recommended)
python ui_test/run_tests.py

# Using pytest directly
pytest -q ui_test

# Run with verbose output
pytest -v ui_test

# Run specific test
pytest ui_test/test.py::test_login
```

#### Test Types
- **Sanity Tests**: Core functionality verification
- **Smoke Tests**: Critical path testing
- **Integration Tests**: Component interaction testing
- **Regression Tests**: Ensure existing features work
- **Edge Case Tests**: Boundary condition testing
- **E2E Tests**: Complete user flow testing

#### Test Features
- **Page Object Model**: Maintainable test structure
- **Cross-platform**: Works on Windows, Linux, macOS
- **Headless Mode**: Set `HEADLESS = True` in `BookStopSetUp`
- **JUnit Reports**: XML output for CI/CD integration
- **Auto Browser Setup**: Automatic Firefox and geckodriver configuration

### Backend Testing

The project includes Maven tasks for backend testing:

```powershell
# Run all tests
mvn -B test

# Run verification (includes tests)
mvn -B verify
```

### CI/CD Testing

Jenkins pipeline configuration included in `Jenkinsfile`:
- Automated builds on commit
- Docker image creation
- Test execution
- Deployment pipeline

---

## 🚀 Deployment

### Frontend Deployment

#### Build for Production
```powershell
cd frontend
npm run build
```

This creates an optimized production build in the `dist/` folder.

#### Deployment Options
1. **Static Hosting**: Deploy `dist/` to Netlify, Vercel, or AWS S3
2. **Nginx**: Serve static files with reverse proxy to backend
3. **Backend Integration**: Serve from Express (configure static middleware)

#### Nginx Configuration Example
```nginx
server {
    listen 80;
    server_name bookstore.example.com;

    # Frontend
    location / {
        root /var/www/bookstore/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static uploads
    location /uploads {
        proxy_pass http://localhost:5000/uploads;
    }
}
```

### Backend Deployment

#### Production Configuration

1. **Environment Variables**: Set production values in `.env`
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bookstore
PORT=5000
JWT_SECRET=use_a_very_long_and_random_secret_here_min_32_chars
JWT_EXPIRE=30d
CLIENT_URL=https://bookstore.example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password
SMTP_FROM=BookStore <noreply@bookstore.example.com>
SEED_CATEGORIES=false
```

2. **Install Production Dependencies**:
```powershell
cd backend
npm ci --production
```

3. **Start Server**:
```powershell
node server.js
# or
npm start
```

#### Process Management

Use PM2 for production process management:
```powershell
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name bookstore-backend

# View logs
pm2 logs bookstore-backend

# Restart
pm2 restart bookstore-backend

# Start on system boot
pm2 startup
pm2 save
```

### Docker Deployment

Dockerfiles are included for containerized deployment:

- `backend/Dockerfile.backend`: Backend container
- `frontend/Dockerfile.frontend`: Frontend container
- `Dockerfile.verification`: Verification container

**Note**: Current Dockerfiles are placeholders. Update them with proper configurations for production use.

### Database Deployment

#### MongoDB Options
1. **MongoDB Atlas**: Managed cloud database (recommended)
2. **Self-hosted**: Install MongoDB on your server
3. **Docker**: Run MongoDB in a container

#### Database Backups
```powershell
# Backup
mongodump --uri="your-mongo-uri" --out=/backup/path

# Restore
mongorestore --uri="your-mongo-uri" /backup/path
```

### Security Checklist

☑️ Use HTTPS (SSL/TLS certificates)
☑️ Set strong JWT_SECRET (min 32 characters)
☑️ Enable CORS properly (restrict origins)
☑️ Use environment variables (never commit secrets)
☑️ Enable rate limiting on authentication endpoints
☑️ Use bcrypt for password hashing
☑️ Sanitize user inputs
☑️ Set secure HTTP headers
☑️ Use MongoDB connection with authentication
☑️ Regular dependency updates (`npm audit`)
☑️ Implement logging and monitoring
☑️ Set up firewall rules
☑️ Regular database backups

---

## 🔒 Security Considerations

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds for password security
- **Password Reset**: Time-limited tokens for password recovery
- **Email Verification**: OTP system with expiring codes
- **Role-Based Access**: Granular permission checks via middleware
- **Session Management**: Token expiration and renewal

### Data Protection
- **Input Validation**: express-validator for request validation
- **SQL Injection**: MongoDB with Mongoose (parameterized queries)
- **XSS Protection**: React auto-escapes by default
- **CSRF**: Token validation for state-changing operations
- **Rate Limiting**: express-rate-limit to prevent abuse

### File Upload Security
- **File Type Validation**: Check MIME types and extensions
- **File Size Limits**: 25MB per file maximum
- **Virus Scanning**: Consider integrating antivirus scanning
- **Storage Isolation**: Files stored outside web root
- **Access Control**: Serve files through controlled endpoints

### Communication Security
- **HTTPS Only**: Enforce SSL/TLS in production
- **Secure Cookies**: httpOnly, secure, sameSite flags
- **CORS Configuration**: Restrict allowed origins
- **API Security**: Authentication required for sensitive endpoints

### Database Security
- **Connection Security**: Use connection strings with authentication
- **Principle of Least Privilege**: Database user with minimal permissions
- **Encryption at Rest**: Enable in MongoDB Atlas or self-hosted
- **Regular Backups**: Automated backup schedule
- **Audit Logging**: Track database access and changes

### Production Best Practices
1. Never commit `.env` files or secrets to Git
2. Use environment variables for all sensitive data
3. Keep dependencies updated (`npm audit`)
4. Enable security headers (Helmet.js)
5. Implement proper error handling (don't expose stack traces)
6. Use a Web Application Firewall (WAF)
7. Monitor and log security events
8. Implement intrusion detection
9. Regular security audits and penetration testing
10. Have an incident response plan

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues

**MongoDB Connection Fails**
- **Symptom**: `Error: MongoServerError: Authentication failed`
- **Solutions**:
  - Verify `MONGO_URI` is correctly set in `.env`
  - Check MongoDB is running (local) or accessible (cloud)
  - Verify username/password in connection string
  - Check firewall/VPN settings
  - For Atlas: Whitelist your IP address

**401 Unauthorized Errors**
- **Symptom**: API returns 401 status
- **Solutions**:
  - Ensure `Authorization: Bearer <token>` header is included
  - Token may be expired – login again to get new token
  - Check `JWT_SECRET` matches between token creation and verification
  - Verify token is stored correctly in localStorage

**File Upload Errors**
- **Symptom**: Upload fails or returns error
- **Solutions**:
  - Check file type is allowed (images: jpg, png, gif; books: pdf, epub)
  - Verify file size is under 25MB
  - Ensure `backend/uploads` directory exists and is writable
  - Check disk space on server
  - Verify Multer middleware is properly configured

**Email Not Sending**
- **Symptom**: Password reset or verification emails not received
- **Solutions**:
  - Verify all SMTP settings in `.env`
  - Check spam/junk folder
  - For Gmail: Use App Password, not regular password
  - Enable "Less secure app access" (if using regular SMTP)
  - Test SMTP credentials with email client
  - Check Nodemailer error logs

**Category Counts Show 0**
- **Symptom**: Categories display but show 0 books
- **Solutions**:
  - Ensure book `genre` values match category names (case-insensitive)
  - Verify books have `is_active: true`
  - Check that genres are arrays, not strings
  - Run genre migration script: `node scripts/migrate-genres-to-array.js`

**Reviews Not Updating Book Rating**
- **Symptom**: Book rating doesn't change after reviews
- **Solutions**:
  - Ensure review routes are mounted at `/api/reviews`
  - Verify user is authenticated for review operations
  - Check review controller recalculates book stats
  - Look for errors in review creation/update/delete

#### Frontend Issues

**API Calls Failing**
- **Symptom**: Network errors or CORS issues
- **Solutions**:
  - Verify backend is running on correct port
  - Check `VITE_BACKEND_URL` in frontend `.env`
  - Ensure CORS is enabled in backend
  - Check browser console for specific errors
  - Verify API base URL in API modules

**Build Errors**
- **Symptom**: `npm run build` fails
- **Solutions**:
  - Delete `node_modules` and run `npm install` again
  - Clear Vite cache: `rm -rf node_modules/.vite`
  - Check for TypeScript/ESLint errors
  - Verify all imports are correct
  - Update dependencies if outdated

**Slow Performance**
- **Symptom**: Application loads slowly
- **Solutions**:
  - Enable code-splitting and lazy loading
  - Optimize images (use WebP, lazy loading)
  - Check MongoDB indexes are created
  - Review API query efficiency
  - Use pagination for large datasets
  - Enable Vite build optimizations

#### UI Testing Issues

**Selenium Tests Failing**
- **Symptom**: Browser doesn't launch or tests timeout
- **Solutions**:
  - Ensure Firefox is installed
  - Update geckodriver to latest version
  - Check Python dependencies: `pip install -r ui_test/requirements.txt`
  - Verify application is running before tests
  - Try headless mode: `HEADLESS = True`
  - Check test selectors match current UI

### Debug Tips

**Enable Debug Logging**
```javascript
// Backend: Add to server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

**Check Token Contents**
```javascript
// Decode JWT in browser console
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

**MongoDB Query Debugging**
```javascript
// Add to controller
const query = Book.find({ is_active: true });
console.log('Query:', query.getQuery());
```

### Getting Help

- Check browser console for errors
- Review backend logs (console output or PM2 logs)
- Search GitHub issues for similar problems
- Check MongoDB logs for database errors
- Use network tab to inspect API requests/responses
- Enable verbose logging in development

---

## 📁 Project Structure

### High-Level Overview

```
bookstore-app/
├── backend/                    # Node.js/Express API
│   ├── config/                 # Database configuration
│   ├── controllers/            # Request handlers
│   ├── events/                 # Event emitters
│   ├── middlewares/            # Express middleware
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── scripts/                # Utility scripts
│   ├── seed/                   # Database seeders
│   ├── uploads/                # Uploaded files
│   ├── utils/                  # Helper functions
│   ├── server.js               # Entry point
│   ├── package.json            # Dependencies
│   └── .env                    # Environment variables
├── frontend/                   # React/Vite application
│   ├── public/                 # Static assets
│   ├── src/                    # Source code
│   │   ├── api/                # API clients
│   │   ├── assets/             # Images, fonts
│   │   ├── auth/               # Auth utilities
│   │   ├── components/         # React components
│   │   ├── context/            # Context providers
│   │   ├── data/               # Static data
│   │   ├── Form/               # Form components
│   │   ├── hooks/              # Custom hooks
│   │   ├── i18n/               # Translations
│   │   ├── lib/                # Utilities
│   │   ├── pages/              # Page components
│   │   ├── utils/              # Helper functions
│   │   ├── App.jsx             # Root component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── vite.config.js          # Vite configuration
│   ├── package.json            # Dependencies
│   ├── .env                    # Environment variables
│   └── nginx.conf              # Nginx config
├── ui_test/                    # Selenium UI tests
│   ├── pages/                  # Page objects
│   ├── conftest.py             # Pytest config
│   ├── pytest.ini              # Pytest settings
│   ├── requirements.txt        # Python deps
│   ├── run_tests.py            # Test runner
│   └── test.py                 # Test cases
├── tools/                      # Development tools
├── uploads/                    # Shared uploads folder
├── Dockerfile.verification     # Docker config
├── Jenkinsfile                 # CI/CD pipeline
├── README.md                   # This file
└── .gitignore                  # Git ignore rules
```

---

## 📝 Additional Documentation

- **Affiliate System**: See `backend/AFFILIATE_API_DOCS.md` for detailed affiliate API documentation
- **Publisher Feature**: See `backend/PUBLISHER_FEATURE.md` for publisher management details
- **Frontend Affiliate**: See `frontend/AFFILIATE_FRONTEND_IMPLEMENTATION.md` for affiliate UI docs
- **UI Testing**: See `ui_test/readme.md` for detailed testing documentation
- **E2E Testing Roadmap**: See `E2E_UI_TESTING_ROADMAP.md` for testing strategy
- **UI Components**: See `UI_TESTING_COMPONENTS_LIST.md` for component testing checklist

---

## 👥 User Deletion (Cascade Behavior)

When a user is deleted by an admin:

1. **Cart**: User's cart is automatically removed
2. **Wishlist**: User's wishlist is automatically removed
3. **Reviews**: All user's reviews are deleted
4. **Book Ratings**: Affected books have `rating` and `num_reviews` recalculated from remaining reviews
5. **Orders**: Orders remain in the system but user reference may be null (depending on implementation)
6. **Author Requests**: Remain in system with user reference
7. **Book Requests**: Can remain if not linked to user

---

## 🚀 Roadmap

### Completed Features
- ✅ Multi-role user management
- ✅ E-commerce functionality (cart, wishlist, orders)
- ✅ Book catalog with advanced filters
- ✅ Review system with ratings
- ✅ Affiliate marketing system
- ✅ Author and publisher management
- ✅ File upload system
- ✅ Email notifications
- ✅ Admin dashboard
- ✅ Responsive UI with TailwindCSS
- ✅ Internationalization support

### Planned Features
- ⬜ Payment gateway integration (Stripe/PayPal)
- ⬜ Order tracking with shipment updates
- ⬜ Advanced analytics and reporting
- ⬜ Inventory management
- ⬜ Book recommendations engine
- ⬜ Social sharing features
- ⬜ Customer support chat
- ⬜ Mobile app (React Native)
- ⬜ Advanced SEO optimizations
- ⬜ Multi-currency support

---

## 📜 License

ISC

---

## 👏 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## ❓ Support

For questions, issues, or feature requests:

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this README and additional docs in the project
- **Email**: Contact project maintainers

---

## 🚀 Quick Reference

### Common Commands

```powershell
# Backend
cd backend
npm install                 # Install dependencies
npm run dev                 # Development mode
npm start                   # Production mode
node scripts/migrate-genres-to-array.js  # Run migration

# Frontend
cd frontend
npm install                 # Install dependencies
npm run dev                 # Development mode
npm run build               # Production build
npm run preview             # Preview build

# UI Tests
pip install -r ui_test/requirements.txt  # Install deps
python ui_test/run_tests.py              # Run tests
pytest -v ui_test                        # Verbose tests

# Database
mongodump --uri="..."       # Backup database
mongorestore --uri="..."    # Restore database
```

### Key URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Static Files: http://localhost:5000/uploads/

### Default Ports

- Frontend Dev Server: 5173
- Backend API: 5000
- MongoDB: 27017 (default)

---

<div align="center">

**Built with ❤️ using Node.js, React, and MongoDB**

© 2025 Bookstore App. All rights reserved.

</div>


