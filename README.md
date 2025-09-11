<<<<<<< HEAD
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

-> Install React + Vite

-> Install Tailwind

-> Setup Router (React Router DOM)

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
