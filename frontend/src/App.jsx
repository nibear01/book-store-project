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
import Navbar from "./components/Navbar";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { BooksContextProvider } from "./context/BooksContext";
import AdminPage from "./pages/AdminPage";
import Footer from "./pages/Footer";
import BookViewPage from "./pages/BookViewPage";
import ErrorBoundary from "./components/ErrorBoundary";
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

  const RequireAdmin = ({ children }) => {
    if (isLoading) return null;
    if (!isAuthenticated || !user?.isAdmin) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const RequireGuest = ({ children }) => {
    if (isLoading) return null;
    if (isAuthenticated) {
      // Admins go to dashboard, users go home/account
      return <Navigate to={user?.isAdmin ? "/admin/dashboard" : "/"} replace />;
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
    user?.isAdmin &&
    !location.pathname.startsWith("/admin")
  ) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <>
      {!hideNavbarFooter && <Navbar />}

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/category/:slug" element={<ShopPage />} />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="books" element={<Books />} />
          <Route path="orders" element={<Order />} />
          <Route path="settings" element={<Settings />} />
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
