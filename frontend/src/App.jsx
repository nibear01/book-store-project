import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
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
import AdminPage from "./pages/AdminPage";
import Footer from "./pages/Footer";
import BookViewPage from "./pages/BookViewPage";
import dummyBooks from "./data/dummyBooks.json";

// Admin components
import Dashboard from "./components/adminComponents/Dashboard";
import Users from "./components/adminComponents/Users";
import Books from "./components/adminComponents/Books";
import Order from "./components/adminComponents/Order";
import CouponsPromotions from "./components/adminComponents/CouponsPromotions";
import Settings from "./components/adminComponents/Settings";

function AppContent() {
  const location = useLocation();

  // Hide Navbar and Footer for /admin and all nested routes
  const hideNavbarFooter = location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbarFooter && <Navbar />}

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/categories"
          element={<CategoriesPage book={dummyBooks} />}
        />
        <Route path="/shop" element={<ShopPage />} />

        <Route path="/admin" element={<AdminPage />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="books" element={<Books />} />
          <Route path="orders" element={<Order />} />
          <Route path="coupons" element={<CouponsPromotions />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/bookview" element={<BookViewPage />} />
      </Routes>

      {!hideNavbarFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
