# Project Documentation

## Getting Started

to run:

cd frontend ->

```
npm install
```

run frontend ->

```
npm run dev
```

### Frontend Folder Structure

```
frontend/
│── public/                # Static assets (favicon, logo, etc.)
│── src/
│   │── api/               # Axios/Fetch wrappers for API calls
│   │── assets/            # Images, icons, fonts
│   │── components/        # Reusable components (Navbar, Footer, etc.)
│   │── pages/             # Full-page components (Home, Cart, Orders, etc.)
│   │── hooks/             # Custom React hooks (useAuth, useCart, etc.)
│   │── context/           # React Context API (AuthContext, CartContext)
│   │── utils/             # Helper functions (formatCurrency, validation)
│   │── styles/            # Global styles (Tailwind config / SCSS)
│   │── App.jsx            # Main App entry
│   │── main.jsx           # ReactDOM entry
│── package.json
```

### Roles of Frontend Developers

## Frontend Dev 1 – User-facing pages & UI

### Focus: Design, navigation, book browsing, shopping flow

### Tasks

Setup project




### Core Pages

#### HomePage.jsx → Featured books, categories, trending

#### BrowsePage.jsx → Search + filters + categories

#### BookDetailsPage.jsx → Single book details, reviews, add to cart

#### CartPage.jsx → View cart, update quantities, checkout button

#### WishlistPage.jsx → Saved books

### Reusable Components

#### Navbar.jsx → Links, login/signup, cart icon

#### Footer.jsx → Info, copyright, socials

#### BookCard.jsx → Thumbnail + title + price + rating

#### SearchBar.jsx

### Frontend Dev 2 – Auth, Profile, Orders, Admin UI

#### Focus: Authentication, user accounts, order management

### Tasks

#### Auth & Profile

##### LoginPage.jsx → Email/password + Firebase auth

##### SignupPage.jsx → Email verification, OTP

##### ProfilePage.jsx → Edit profile, addresses, saved payment methods

#### Order Management

##### CheckoutPage.jsx → Delivery info, payment selection

##### OrderHistoryPage.jsx → List past orders with statuses

##### OrderTrackingPage.jsx → Real-time tracking (Processing → Delivered)

### Admin Pages (Phase 2)

#### AdminDashboard.jsx → Overview of orders & users

#### ManageBooksPage.jsx → Add/Edit/Delete books

#### ManageOrdersPage.jsx → Verify → Print → Ship flow

### Context & Hooks

#### AuthContext.jsx → Provide user data globally

#### CartContext.jsx → Cart state & functions

#### useAuth.js, useCart.js

### Categories Feature

The project now supports dynamic categories stored in MongoDB.

Endpoints:
- `GET /api/categories` – list categories with `book_count` (uses book `genre` array values).
	- Query params:
		- `includeEmpty=true|false` (default false) – include categories with zero books.
		- `status=all|active|inactive` (default active).
- `GET /api/categories/:slug` – fetch a single category.
- `POST /api/categories` (admin) – create a category `{ name, description?, image?, synonyms? }`.
- `PUT /api/categories/:id` (admin) – update category.
- `DELETE /api/categories/:id?hard=false` (admin) – hard delete by default, soft delete with `hard=false`.

Seeding:
Set environment variable `SEED_CATEGORIES=true` on first run to seed default categories. This will not overwrite existing data.

Frontend Hook (`useCategories`):
The hook now fetches categories from the API instead of computing from the books array. It returns:
```
categories: [ { id, title, slug, count, item } ]
categoriesLoading: boolean
categoriesError: string | null
```

Ensure your book documents' `genre` values exactly match category names for counts to appear.

### Admin: Managing Categories

In the Admin panel under the Books section, a Category Management interface has been added (scroll below the books table). From there you can:
- Create a new category (Name required; optional description & order).
- Edit existing categories.
- Delete categories (hard delete).

Notes:
- Category `name` should align with book `genre` entries for counts to update.
- `order` can be used to control display sequence in future UI components.
- Deletion currently performs a permanent removal; switch to soft delete by adjusting the API call (`?hard=false`).

### Multi-Genre Support

Books now support multiple genres stored as an array. When importing or editing:
- CSV or manual inputs like `Fantasy, Adventure, Epic` are split on commas.
- Frontend category filtering matches a book if ANY of its genres equals the selected category (case-insensitive).
- Category counts aggregate across all books where the category name appears in the `genre` array.

Migration for legacy data:
Run the script below to normalize old string-based `genre` fields into arrays.

```bash
node backend/scripts/migrate-genres-to-array.js
```

Ensure your environment variable `MONGO_URI` (or `DATABASE_URL`) is set before running. The script safely skips already-normalized documents.

### Category Case-Insensitivity & Pagination

- Category to book matching is now case-insensitive (e.g. `science` matches category `Science`).
- Admin Category Manager paginates when more than 10 categories exist; navigation appears at the bottom of the table.

### Category Manager Enhancements

Added features:
- Search box (client-side, case-insensitive) filters categories by name.
- Sorting options: Name A→Z, Name Z→A, Books High→Low, Books Low→High, Newest First, Oldest First.
- Created date column shows when a category was added (uses `created_at`).
- Sorting & searching reset pagination to the first page.
