import React, { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Homepage from "./pages/homepage";
import AboutPage from "./pages/AboutPage";
import CategoriesPage from "./pages/CategoriesPage";
import ShopPage from "./pages/ShopPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";
import Footer from "./pages/Footer";
import BookViewPage from "./pages/BookViewPage";

import Dashboard from "./components/adminComponents/Dashboard";
import Users from "./components/adminComponents/Users";
import Books from "./components/adminComponents/Books";
import Order from "./components/adminComponents/Order";
import Settings from "./components/adminComponents/Settings";
import Printing from "./components/adminComponents/Printing";
import Delivery from "./components/deliveryComponents/Delivery";
import Finance from "./components/adminComponents/Finance";
import Support from "./components/adminComponents/Support";
import Marketing from "./components/adminComponents/Marketing";

import UserDashboard from "./pages/UserDashboard";
import OrderSummaryPage from "./pages/OrderSummaryPage";
import UserOrdersPage from "./pages/UserOrdersPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// If your file is actually Navbar.jsx, use this:
// If your folder/file is literally named "Nabvar", swap the line above:
// import Navbar from "./components/NavbarComponents/Nabvar";

import TopNavbar from "./components/NavbarComponents/Subnav/TopNavbar";
import AuthorPage from "./pages/AuthorPage";
import WishlistPage from "./pages/WishlistPage";

import { useAuth } from "./context/AuthContext";
import Navbar from "./components/NavbarComponents/Navbar";
import AuthorDetails from "./components/authorComponents/AuthorDetails";
import AuthorRequestForm from "./Form/AuthorRequestForm";
import BookRequestForm from "./Form/BookRequestForm";

// 404 Page
function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center p-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">404 — Page not found</h1>
        <p className="text-gray-600">
          The page you’re looking for doesn’t exist.
        </p>
      </div>
    </div>
  );
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, user, isLoading, activeRole } = useAuth();

  const roleHome = (role) => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "book_manager") return "/admin/books";
    if (role === "order_manager") return "/admin/orders";
    if (role === "printing_manager") return "/admin/printing";
    if (role === "delivery_manager") return "/admin/delivery";
    if (role === "finance_manager") return "/admin/finance";
    if (role === "customer_support") return "/admin/support";
    if (role === "marketing_manager") return "/admin/marketing";
    return "/account";
  };

  // Guards
  const RequireAuth = ({ children }) => {
    if (isLoading) return null;
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  };

  const RequireRole = ({ roles, children }) => {
    if (isLoading) return null;
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    const effectiveRoles = activeRole
      ? [activeRole]
      : user?.roles || (user?.role ? [user.role] : []);
    if (!roles.some((r) => effectiveRoles?.includes(r))) {
      const dest = roleHome(
        activeRole || user?.roles?.[0] || user?.role || "user"
      );
      if (dest === location.pathname) return null; // avoid loop
      return <Navigate to={dest} replace />;
    }
    return children;
  };

  const RequireGuest = ({ children }) => {
    if (isLoading) return null;
    if (isAuthenticated) {
      const dest = roleHome(
        activeRole || user?.roles?.[0] || user?.role || "user"
      );
      return <Navigate to={dest} replace />;
    }
    return children;
  };

  // Hide chrome on admin
  const hideNavbarFooter = location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbarFooter && <TopNavbar />}
      {!hideNavbarFooter && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/author" element={<AuthorPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/authordetails" element={<AuthorDetails />} />
        <Route path="/authorrequest" element={<AuthorRequestForm />} />
        <Route path="/bookrequest" element={<BookRequestForm />} />
        <Route path="/bookview/:slug" element={<BookViewPage />} />

        {/* Guest-only */}
        <Route
          path="/login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />
        <Route
          path="/signup"
          element={
            <RequireGuest>
              <SignupPage />
            </RequireGuest>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <RequireGuest>
              <ForgotPassword />
            </RequireGuest>
          }
        />
        <Route
          path="/reset-password"
          element={
            <RequireGuest>
              <ResetPassword />
            </RequireGuest>
          }
        />

        {/* Auth-only */}
        <Route
          path="/wishlist"
          element={
            <RequireAuth>
              <WishlistPage />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <UserDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/order-summary/:orderId"
          element={
            <RequireAuth>
              <OrderSummaryPage />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <UserOrdersPage />
            </RequireAuth>
          }
        />

        {/* Admin (ensure <AdminPage /> renders an <Outlet />) */}
        <Route
          path="/admin"
          element={
            <RequireRole
              roles={[
                "admin",
                "book_manager",
                "order_manager",
                "printing_manager",
                "delivery_manager",
                "finance_manager",
                "customer_support",
                "marketing_manager",
              ]}
            >
              <AdminPage />
            </RequireRole>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="users"
            element={
              <RequireRole roles={["admin"]}>
                <Users />
              </RequireRole>
            }
          />
          <Route
            path="books"
            element={
              <RequireRole roles={["admin", "book_manager"]}>
                <Books />
              </RequireRole>
            }
          />
          <Route
            path="orders"
            element={
              <RequireRole roles={["admin", "order_manager"]}>
                <Order />
              </RequireRole>
            }
          />
          <Route
            path="printing"
            element={
              <RequireRole roles={["admin", "printing_manager"]}>
                <Printing />
              </RequireRole>
            }
          />
          <Route
            path="delivery"
            element={
              <RequireRole roles={["admin", "delivery_manager"]}>
                <Delivery />
              </RequireRole>
            }
          />
          <Route
            path="finance"
            element={
              <RequireRole roles={["admin", "finance_manager"]}>
                <Finance />
              </RequireRole>
            }
          />
          <Route
            path="support"
            element={
              <RequireRole roles={["admin", "customer_support"]}>
                <Support />
              </RequireRole>
            }
          />
          <Route
            path="marketing"
            element={
              <RequireRole roles={["admin", "marketing_manager"]}>
                <Marketing />
              </RequireRole>
            }
          />
          <Route
            path="settings"
            element={
              <RequireRole roles={["admin"]}>
                <Settings />
              </RequireRole>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!hideNavbarFooter && <Footer />}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <AppContent />
      </div>
    </>
  );
}
