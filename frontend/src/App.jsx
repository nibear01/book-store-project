import React, { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Only Homepage is eagerly loaded — all other pages are lazy
import Homepage from "./pages/homepage";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const BookViewPage = lazy(() => import("./pages/BookViewPage"));
const Footer = lazy(() => import("./pages/Footer"));

const Dashboard = lazy(() => import("./components/adminComponents/Dashboard"));
const Users = lazy(() => import("./components/adminComponents/Users"));
const Books = lazy(() => import("./components/adminComponents/Books"));
const Publishers = lazy(() => import("./components/adminComponents/Publishers"));
const Order = lazy(() => import("./components/adminComponents/Order"));
const Printing = lazy(() => import("./components/adminComponents/Printing"));
const Delivery = lazy(() => import("./components/adminComponents/Delivery"));
const Finance = lazy(() => import("./components/adminComponents/Finance"));
const Support = lazy(() => import("./components/adminComponents/Support"));
const Marketing = lazy(() => import("./components/adminComponents/Marketing"));
const AffiliateManagement = lazy(() => import("./components/adminComponents/AffiliateManagement"));

// Settings Components
const ProfileSettings = lazy(() => import("./components/adminComponents/settings/ProfileSettings"));
const PrintOnDemandSettings = lazy(() => import("./components/adminComponents/settings/PrintOnDemandSettings"));
const DeliveryCostSettings = lazy(() => import("./components/adminComponents/settings/DeliveryCostSettings"));
const PriceRangeSettings = lazy(() => import("./components/adminComponents/settings/PriceRangeSettings"));

import UserDashboard from "./pages/UserDashboard";
const OrderSummaryPage = lazy(() => import("./pages/OrderSummaryPage"));
const UserOrdersPage = lazy(() => import("./pages/UserOrdersPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

import TopNavbar from "./components/NavbarComponents/Subnav/TopNavbar";
const AuthorPage = lazy(() => import("./pages/AuthorPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const SingleAuthor = lazy(() => import("./components/authorComponents/SingleAuthor"));
const PublishersPage = lazy(() => import("./pages/PublishersPage"));
const SinglePublisherPage = lazy(() => import("./pages/SinglePublisherPage"));

import { useAuth } from "./context/AuthContext";
import { PrintSettingsProvider } from "./context/PrintSettingsContext";
import Navbar from "./components/NavbarComponents/Navbar";
const AuthorDetails = lazy(() => import("./components/authorComponents/AuthorDetails"));
const AuthorRequestForm = lazy(() => import("./Form/AuthorRequestForm"));
const BookRequestForm = lazy(() => import("./Form/BookRequestForm"));
const Subscriber = lazy(() => import("./components/adminComponents/Subscriber"));
const AuthorAdmin = lazy(() => import("./components/adminComponents/AuthorAdmin"));
const AuthorRequest = lazy(() => import("./components/adminComponents/AuthorRequest"));
const BookRequest = lazy(() => import("./components/adminComponents/BookRequest"));
const AdminAuthorPage = lazy(() => import("./components/adminComponents/AdminAuthorPage"));

// Affiliate Pages
const AffiliateLandingPage = lazy(() => import("./pages/AffiliateLandingPage"));
const AffiliateLoginPage = lazy(() => import("./pages/AffiliateLoginPage"));
const AffiliateRegisterPage = lazy(() => import("./pages/AffiliateRegisterPage"));
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));

// 404 Page
function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center p-8">
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

// Role helper (do NOT default to 'user' until we actually have a user object).
// Returning an empty array while auth/roles are still hydrating prevents premature redirects
// that would otherwise push an admin user back to '/'.
const getAllRoles = (user) => {
  if (!user) return [];
  if (Array.isArray(user.roles) && user.roles.length) return user.roles;
  if (user.role) return [user.role];
  return [];
};

const ROLE_HOME = {
  admin: "/admin/dashboard",
  author: "/admin/author",
  user: "/",
  user_manager: "/admin/users",
  book_manager: "/admin/books",
  order_manager: "/admin/orders",
  printing_manager: "/admin/printing",
  delivery_manager: "/admin/delivery",
  finance_manager: "/admin/finance",
  customer_support: "/admin/support",
  marketing_manager: "/admin/marketing",
};

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, user, isLoading, activeRole, setIsLoading } = useAuth();
  const roles = getAllRoles(user);
  const primaryRole = activeRole || roles[0];
  const roleHome = (role) => ROLE_HOME[role] || "/account";
  const hasAdminScope = roles.some(r => r && r !== 'user');
  const hideChrome = location.pathname.startsWith('/admin') || location.pathname.startsWith('/affiliate');

  // We consider roles "resolved" when either:
  //  - user is not authenticated (no roles needed), or
  //  - we have at least one derived role, or
  //  - auth loading finished & user object explicitly null (no roles expected).
  const rolesResolved = !isAuthenticated || roles.length > 0 || (!isLoading && user === null);

  // When roles are resolved, hide the global loader (if shown by login/signup)
  React.useEffect(() => {
    if (rolesResolved && setIsLoading) {
      // Immediate update when roles are resolved to prevent skeleton flashing
      setIsLoading(false);
    }
  }, [rolesResolved, setIsLoading]);

  // Skeleton for guard waiting states (lighter than global overlay)
  const GuardSkeleton = () => (
    <div className="min-h-[100vh] p-4 sm:p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        <div className="h-25 bg-gray-200 dark:bg-gray-800 rounded w-full" />
        <div className="h-25 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-30 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-30 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-30 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );

  const RequireAuth = ({ children }) => {
    // Only show skeleton during initial load, not after login
    if (isLoading && !isAuthenticated && !user) return <GuardSkeleton />;
    return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
  };

  const RequireGuest = ({ children }) => {
    // Don't show skeleton if user is already authenticated
    if (isLoading && !isAuthenticated) return <GuardSkeleton />;
    return isAuthenticated ? <Navigate to={roleHome(primaryRole)} replace /> : children;
  };

  const RequireRole = ({ roles: need, children }) => {
    // Only show skeleton if roles aren't resolved AND we're in initial load
    if ((isLoading || !rolesResolved) && !user) return <GuardSkeleton />;
    if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
    // If authenticated but roles not resolved yet, wait briefly
    if (!rolesResolved) return <GuardSkeleton />;
    return need.some(r => roles.includes(r)) ? children : <Navigate to={roleHome(primaryRole)} replace />;
  };

  const RequireAnyAdminRole = ({ children }) => {
    // Only show skeleton if roles aren't resolved AND we're in initial load
    if ((isLoading || !rolesResolved) && !user) return <GuardSkeleton />;
    if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
    // If authenticated but roles not resolved yet, wait briefly
    if (!rolesResolved) return <GuardSkeleton />;
    return hasAdminScope ? children : <Navigate to={roleHome(primaryRole)} replace />;
  };

  const AdminIndex = () => {
    // Only show skeleton if roles aren't resolved AND we're in initial load
    if ((isLoading || !rolesResolved) && !user) return <GuardSkeleton />;
    if (!rolesResolved) return <GuardSkeleton />;
    return hasAdminScope ? <Dashboard /> : <Navigate to={roleHome(primaryRole)} replace />;
  };

  // GlobalLoadingGate shows overlay; avoid local overlay here

  return (
    <PrintSettingsProvider>
      {!hideChrome && <TopNavbar />}
      {!hideChrome && <Navbar />}
      <Suspense fallback={<div className="min-h-[40vh]" />}> 
      <Routes>
        {/* Public */}
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/author" element={<AuthorPage />} />
        {/* NEW: canonical authors list and details */}
        <Route path="/authors" element={<AuthorPage />} />
        <Route path="/authors/:slug" element={<SingleAuthor />} />
        {/* Publishers */}
        <Route path="/publishers" element={<PublishersPage />} />
        <Route path="/publishers/:slugOrId" element={<SinglePublisherPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/authordetails" element={<AuthorDetails />} />
        <Route path="/authorrequest" element={<AuthorRequestForm />} />
        <Route path="/bookrequest" element={<BookRequestForm />} />
        <Route path="/bookview/:slug" element={<BookViewPage />} />

        {/* Guest-only */}
        <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
        <Route path="/signup" element={<RequireGuest><SignupPage /></RequireGuest>} />
        <Route path="/forgot-password" element={<RequireGuest><ForgotPassword /></RequireGuest>} />
        <Route path="/reset-password" element={<RequireGuest><ResetPassword /></RequireGuest>} />

        {/* Auth-only */}
        <Route path="/wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path="/account" element={<RequireAuth><UserDashboard /></RequireAuth>} />
        <Route path="/order-summary/:orderId" element={<RequireAuth><OrderSummaryPage /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><UserOrdersPage /></RequireAuth>} />

        {/* Admin (ensure <AdminPage /> renders an <Outlet />) */}
        <Route path="/admin" element={<RequireAnyAdminRole><AdminPage /></RequireAnyAdminRole>}>
          {/* Default admin landing: admin sees Dashboard, others are redirected to their panel */}
          <Route index element={<AdminIndex />} />
          {/* Dashboard: accessible to any non-"user" role */}
          <Route
            path="dashboard"
            element={
              <RequireRole roles={["admin"]}>
                <Dashboard />
              </RequireRole>
            }
          />
          <Route
            path="authors"
            element={
              <RequireRole roles={["admin"]}>
                <AdminAuthorPage />
              </RequireRole>
            }
          />
          <Route
            path="author-requests"
            element={
              <RequireRole roles={["admin"]}>
                <AuthorRequest />
              </RequireRole>
            }
          />
          <Route
            path="book-requests"
            element={
              <RequireRole roles={["admin"]}>
                <BookRequest />
              </RequireRole>
            }
          />
          <Route
            path="author"
            element={
              <RequireRole roles={["author"]}>
                <AuthorAdmin />
              </RequireRole>
            }
          />
          <Route
            path="users"
            element={
              <RequireRole roles={["admin", "user_manager"]}>
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
            path="publishers"
            element={
              <RequireRole roles={["admin", "book_manager"]}>
                <Publishers />
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
            path="subscribers"
            element={
              <RequireRole roles={["admin"]}>
                <Subscriber />
              </RequireRole>
            }
          />
          <Route
            path="affiliates"
            element={
              <RequireRole roles={["admin"]}>
                <AffiliateManagement />
              </RequireRole>
            }
          />
          
          {/* Settings Routes */}
          <Route
            path="settings/profile"
            element={
              <RequireAnyAdminRole>
                <ProfileSettings />
              </RequireAnyAdminRole>
            }
          />
          <Route
            path="settings/print-on-demand"
            element={
              <RequireRole roles={["admin", "book_manager"]}>
                <PrintOnDemandSettings />
              </RequireRole>
            }
          />
          <Route
            path="settings/delivery-cost"
            element={
              <RequireRole roles={["admin", "book_manager"]}>
                <DeliveryCostSettings />
              </RequireRole>
            }
          />
          <Route
            path="settings/price-range"
            element={
              <RequireRole roles={["admin", "book_manager"]}>
                <PriceRangeSettings />
              </RequireRole>
            }
          />
        </Route>

        {/* Affiliate Routes */}
        <Route path="/affiliate" element={<AffiliateLandingPage />} />
        <Route path="/affiliate/login" element={<AffiliateLoginPage />} />
        <Route path="/affiliate/register" element={<AffiliateRegisterPage />} />
        <Route path="/affiliate/dashboard/*" element={<AffiliateDashboard />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      {!hideChrome && <Footer />}
      <ToastContainer 
        position="bottom-right" 
        autoClose={3500} 
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </PrintSettingsProvider>
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
