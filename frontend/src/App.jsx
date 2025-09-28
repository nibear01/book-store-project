import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
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
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { BooksContextProvider } from "./context/BooksContext";
import { WishlistProvider } from "./context/WishlistContext";
import AdminPage from "./pages/AdminPage";
import Footer from "./pages/Footer";
import BookViewPage from "./pages/BookViewPage";
// import { HelmetProvider } from 'react-helmet-async';

// Admin components
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
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Navbar from "./components/NavbarComponents/Nabvar";
import TopNavbar from "./components/NavbarComponents/Subnav/TopNavbar";
import AuthorPage from "./pages/AuthorPage";
import WishlistPage from "./pages/WishlistPage";

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

  // Route guards
  const RequireAuth = ({ children }) => {
    if (isLoading) return null;
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  };

  const RequireRole = ({ roles, children }) => {
    if (isLoading) return null;
    if (!isAuthenticated)
      return <Navigate to="/login" state={{ from: location }} replace />;
    const effectiveRoles = activeRole
      ? [activeRole]
      : user?.roles || (user?.role ? [user.role] : []);
    if (!roles.some((r) => effectiveRoles.includes(r))) {
      const dest = roleHome(
        activeRole || user?.roles?.[0] || user?.role || "user"
      );
      // Prevent redirect loops by not navigating to the current path
      if (dest === location.pathname) return null;
      return <Navigate to={dest} replace />;
    }
    return children;
  };

  const RequireGuest = ({ children }) => {
    if (isLoading) return null;
    if (isAuthenticated) {
      const roles = user?.roles || (user?.role ? [user.role] : []);
      const dest = roles.includes("admin")
        ? "/admin/dashboard"
        : roles.includes("book_manager")
        ? "/admin/books"
        : roles.includes("order_manager")
        ? "/admin/orders"
        : "/";
      return <Navigate to={dest} replace />;
    }
    return children;
  };

  // Hide Navbar and Footer for /admin and all nested routes
  const hideNavbarFooter = location.pathname.startsWith("/admin");

  // If the user is an authenticated admin and tries to access any non-admin route,
  // redirect them to the admin dashboard (covers refreshes and direct navigation)
  // Do not auto-redirect based on roles; respect active role and user navigation

  return (
    <>
      {!hideNavbarFooter && <TopNavbar />}
      {!hideNavbarFooter && <Navbar />}

      <Routes>
        {/* Frontend */}
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/author" element={<AuthorPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
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

        {/* Admin Route */}
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
        <Route path="/bookview/:slug" element={<BookViewPage />} />
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
      </Routes>

      {!hideNavbarFooter && <Footer />}

      {/* Toast Container */}
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

function App() {
  return (
    <Router>
      {/* <HelmetProvider> */}
      <AuthProvider>
        <BooksContextProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="min-h-screen bg-gray-50">
                <AppContent />
              </div>
            </CartProvider>
          </WishlistProvider>
        </BooksContextProvider>
      </AuthProvider>
      {/* </HelmetProvider> */}
    </Router>
  );
}

export default App;
