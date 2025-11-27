# Project Documentation
<div align="center">

# Bookstore App — Full-Stack Documentation

An end-to-end bookstore application with a Node.js/Express API, MongoDB database, and a React + Vite frontend.

</div>

## At a glance

- Backend: Node.js, Express 5, Mongoose 8, Multer uploads, JWT auth, Nodemailer
- Frontend: React 19, Vite 7, TailwindCSS, MUI, React Router 7
- Database: MongoDB (local or managed)
- Static assets served from backend at `/uploads/...`

---

## 1) Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ (comes with Node)
- MongoDB 6+ (local or a cloud connection string)
- Git (optional)

Windows PowerShell is supported; commands below are copy-paste ready for PowerShell.

---

## 2) Quick start (local)

1. Clone or download this repository
2. Create environment files
	 - Copy `backend/.env.example` to `backend/.env` and adjust values
	 - Copy `frontend/.env.example` to `frontend/.env` (optional; defaults work locally)
3. Install dependencies

```powershell
# Backend
cd backend
npm install

# Frontend (in a second terminal or after installing backend)
cd ../frontend
npm install
```

4. Start the API (backend)

```powershell
cd backend
# First run: optionally seed default categories
# setx SEED_CATEGORIES "true"  # One-time on Windows; or set in backend/.env

npm run dev     # starts http://localhost:5000
# or: npm start # production (no nodemon)
```

5. Start the frontend

```powershell
cd frontend
npm run dev     # starts http://localhost:5173
```

6. Open the app at http://localhost:5173 (Frontend calls API at http://localhost:5000/api by default).

---

## 3) Environment configuration

Create `backend/.env` using this template (see `backend/.env`):

- MONGO_URI=Your Mongo connection string (required)
- PORT=5000 (optional)
- JWT_SECRET=Any long random string (required)
- JWT_EXPIRE=30d (optional)
- CLIENT_URL=http://localhost:5173 (for password reset links)
- SMTP_HOST=Your SMTP host (for password reset email)
- SMTP_PORT=587
- SMTP_USER=SMTP username
- SMTP_PASS=SMTP password
- SMTP_FROM=BookStore <no-reply@bookstore.local>
- SEED_CATEGORIES=true (only for first run; will not override existing data)

Optional alias for scripts: DATABASE_URL (used by migration script if MONGO_URI not set).

Frontend (optional) `frontend/.env`:

- VITE_API_URL=http://localhost:5000/api (if you want to configure via env; some modules use hardcoded base)

---

## 4) Running scripts and utilities

- Migrate legacy book genres (string → array):

```powershell
cd backend
node scripts/migrate-genres-to-array.js
```

This script reads books and ensures `genre` is an array of strings, deduped and trimmed. Requires a valid `MONGO_URI` or `DATABASE_URL`.

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

## 6) API overview

Base URL: `http://localhost:5000/api`

Auth
- POST `/users/register` { name, email, password, phone, address }
- POST `/users/login` { email, password }
- POST `/users/login-phone` { phone, password }
- GET `/users/me` (Bearer token)
- POST `/users/forgot-password` { email }
- POST `/users/reset-password` { email, token, password }

Users (admin)
- GET `/users` — query: page, limit, status, roles|role
- GET `/users/:id`
- PUT `/users/:id` — can update name, email, address, status, password, and profile_image (FormData field `profile_image`)
- DELETE `/users/:id`
- PUT `/users/:id/role` — { role | roles[] }
- PUT `/users/:id/status` — { status: active|inactive|suspended }
- PUT `/users/:id/password` — { password }

Books
- GET `/books` — query: page, limit, search, genre, author, language, minPrice, maxPrice, sort, minRating, inStock, onSale, deals, minViews, status
- GET `/books/featured|latest|trending|on-sale|most-viewed|deals`
- GET `/books/:slug`
- POST `/books` (admin) — FormData: fields + `cover_image[]`, `file_url`
- POST `/books/bulk-upload` (admin) — FormData: `bulk_images[]`, `bulk_files[]`, optional `renameMap` (JSON), `imagesNames` (JSON), `filesNames` (JSON)
- PUT `/books/:id` (admin) — FormData for updates
- DELETE `/books/:id?hard=true|false` (admin)

Categories
- GET `/categories?includeEmpty=false&status=active|inactive|all`
- GET `/categories/:slug`
- POST `/categories` (admin)
- PUT `/categories/:id` (admin)
- DELETE `/categories/:id?hard=true|false` (admin) — hard delete blocked if books reference the category

Cart (auth required; per-user)
- GET `/cart` — returns populated items with stock checks and total
- GET `/cart/count`
- POST `/cart/items` — { bookId, quantity }
- PUT `/cart/items/:bookId` — { quantity } (quantity 0 removes item)
- DELETE `/cart/items/:bookId`
- DELETE `/cart`

Wishlist (auth required; per-user)
- GET `/wishlist`
- GET `/wishlist/count`
- POST `/wishlist/items` — { bookId }
- DELETE `/wishlist/items/:bookId`
- DELETE `/wishlist`

Orders
- POST `/orders/create` (auth) — items[], shipping_address, payment_info, shipping_amount
- GET `/orders/my-orders` (auth)
- GET `/orders/details/:id` (auth)
- GET `/orders/admin/all` (admin)
- GET `/orders/admin/stats` (admin)
- PUT `/orders/admin/:id/status` (admin) — { status }
- DELETE `/orders/admin/:id` (admin)
- POST `/orders/admin/import` (admin, CSV upload field `file`)

Reviews
- GET `/reviews?book=<bookId>&page=<n>&limit=<n>` — public; returns `{ data, pagination: { total, page, pages, limit }, meta: { avgRating } }`
- POST `/reviews` — auth; body `{ book, rating, comment }`; creates or upserts the user's review for that book
- PUT `/reviews/:id` — auth; owner or admin; body `{ rating?, comment? }`
- DELETE `/reviews/:id` — auth; owner or admin

Auth header (where required): `Authorization: Bearer <token>`

---

## 7) Data model highlights

- Book
	- Fields: title, author, description, genre[], language, slug, SEO fields, price, stock, rating, is_featured, is_on_sale, sale_price, views, is_deal_of_the_week, deal_start/end, cover_image[], file_url, timestamps
- Category
	- Fields: name, slug, description, image, synonyms[], is_active, order, timestamps
- User
	- Fields: name, email, password, roles[], status, phone, address, profile_image, reset tokens, timestamps
- Cart
	- Fields: user, items[{ book, title, price, quantity }], total_price
- Wishlist
	- Fields: user, items[{ book, title, price, added_at }]
- Order
	- Fields: order_number, user, items[{ book, book_title, book_cover, price, quantity }], subtotal, discount_amount/label, shipping_amount, grand_total, order_status, shipping_address, payment_info, timestamps

- Review
	- Fields: book (ref Book), user (ref User), name, rating (1–5), comment, timestamps
	- Unique index on (book, user) to enforce one review per user per book

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

## 10) Production build and deploy

- Frontend
	- Build: `cd frontend && npm run build` → outputs `dist/`
	- Serve with any static host (or proxy via backend if you wire it)
- Backend
	- Ensure `.env` is configured for production (strong JWT secret, real SMTP, cloud Mongo)
	- Start: `cd backend && npm ci && npm start`
	- Behind a reverse proxy (Nginx/Apache) with HTTPS recommended

---

## 11) Troubleshooting

- Mongo connection fails
	- Verify `MONGO_URI` is set and reachable
	- Check firewall/VPN and MongoDB authentication
- 401 unauthorized
	- Ensure requests include `Authorization: Bearer <token>`
	- Token may be expired; login again
- Upload errors
	- Check file type and size limits (images + PDF/EPUB, 25MB/file)
	- Ensure `backend/uploads` is writable (folders are auto-created)
- Category counts show 0
	- Ensure book `genre` values exactly match category names (case-insensitive) and books are `is_active: true`
- Password reset email not received
	- Verify SMTP settings and sender address; check spam folder

- Reviews not updating book rating/count
	- Ensure the backend reviews routes are mounted at `/api/reviews`
	- Verify the user is authenticated for POST/PUT/DELETE
	- Book stats are recomputed from the Review collection after each change

---

## 12) Folder structure (high-level)

```
backend/
	server.js, routes/, controllers/, models/, middlewares/, utils/, uploads/, scripts/, seed/
frontend/
	src/ (api, components, pages, context, hooks, assets), public/, vite.config.js
```

---

## 13) Security notes (important)

- Passwords are currently stored as plain text for simplicity. Before any real deployment:
	- Hash passwords with bcrypt
	- Enforce HTTPS, secure cookies, CORS hardening, and input validation
	- Consider rate-limiting and audit logging on auth endpoints

---

## 15) Notes on user deletion (cascade)

- When a user is deleted by an admin:
	- Their cart and wishlist are removed
	- All their reviews are deleted
	- Affected books have `rating` and `num_reviews` recalculated from remaining reviews


