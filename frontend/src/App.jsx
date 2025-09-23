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
import Navbar from "./components/homeComponents/Navbar";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { BooksContextProvider } from "./context/BooksContext";
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
import UserDashboard from "./pages/UserDashboard";
import OrderSummaryPage from "./pages/OrderSummaryPage";
import UserOrdersPage from "./pages/UserOrdersPage";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();

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
    if (!roles.includes(user?.role)) return <Navigate to="/" replace />;
    return children;
  };

  const RequireGuest = ({ children }) => {
    if (isLoading) return null;
    if (isAuthenticated) {
      const role = user?.role;
      const dest =
        role === "admin"
          ? "/admin/dashboard"
          : role === "book_manager"
          ? "/admin/books"
          : role === "order_manager"
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
  if (
    !isLoading &&
    isAuthenticated &&
    !location.pathname.startsWith("/admin")
  ) {
    const role = user?.role;
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "book_manager") return <Navigate to="/admin/books" replace />;
    if (role === "order_manager")
      return <Navigate to="/admin/orders" replace />;
  }

  return (
    <>
      {!hideNavbarFooter && <Navbar />}

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/shop" element={<ShopPage />} />

        <Route
          path="/admin"
          element={
            <RequireRole roles={["admin", "book_manager", "order_manager"]}>
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
            path="settings"
            element={
              <RequireRole roles={["admin"]}>
                <Settings />
              </RequireRole>
            }
          />
        </Route>

        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
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
          <CartProvider>
            <div className="min-h-screen bg-gray-50">
              <AppContent />
            </div>
          </CartProvider>
        </BooksContextProvider>
      </AuthProvider>
      {/* </HelmetProvider> */}
    </Router>
  );
}

export default App;
