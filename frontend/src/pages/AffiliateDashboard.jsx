import { useState, useEffect } from "react";
import { useAffiliate } from "../context/AffiliateContext";
import { toast } from "react-toastify";
import { Link, useNavigate, Routes, Route } from "react-router-dom";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import GroupIcon from "@mui/icons-material/Group";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

// Import sub-components (we'll create these next)
import AffiliateOverview from "../components/affiliateComponents/AffiliateOverview";
import AffiliateCommissions from "../components/affiliateComponents/AffiliateCommissions";
import AffiliateWithdrawals from "../components/affiliateComponents/AffiliateWithdrawals";
import AffiliateProfile from "../components/affiliateComponents/AffiliateProfile";

const AffiliateDashboard = () => {
  const { affiliate, logout, isAffiliateAuthenticated, isLoading } = useAffiliate();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAffiliateAuthenticated) {
      navigate("/affiliate/login");
    }
  }, [isAffiliateAuthenticated, isLoading, navigate]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/affiliate");
  };

  const copyPromoCode = () => {
    if (affiliate?.promo_code) {
      navigator.clipboard.writeText(affiliate.promo_code);
      toast.success("Promo code copied to clipboard!");
    }
  };

  const menuItems = [
    { path: "", label: "Overview", icon: <DashboardIcon /> },
    { path: "commissions", label: "Commissions", icon: <ListAltIcon /> },
    { path: "withdrawals", label: "Withdrawals", icon: <AccountBalanceWalletIcon /> },
    { path: "profile", label: "Profile", icon: <PersonIcon /> },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Affiliate Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {affiliate.name}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Promo Code Display */}
              <div className="hidden md:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <LocalOfferIcon className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Your Promo Code</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-blue-600">
                      {affiliate.promo_code}
                    </p>
                    <button
                      onClick={copyPromoCode}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ContentCopyIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                affiliate.status === "active"
                  ? "bg-green-100 text-green-800"
                  : affiliate.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : affiliate.status === "suspended"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-600 hover:text-gray-900"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              {/* Quick Stats */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
                <p className="text-sm opacity-90 mb-1">Available Balance</p>
                <p className="text-3xl font-bold">
                  ${affiliate.available_balance?.toFixed(2) || "0.00"}
                </p>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={`/affiliate/dashboard/${item.path}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      window.location.pathname.endsWith(item.path)
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogoutIcon />
                  <span>Logout</span>
                </button>
              </nav>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Earnings</span>
                    <span className="font-semibold text-gray-900">
                      ${affiliate.total_earnings?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Withdrawn</span>
                    <span className="font-semibold text-gray-900">
                      ${affiliate.withdrawn_amount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-semibold text-gray-900">
                      {affiliate.total_orders || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Commission Rate</span>
                    <span className="font-semibold text-green-600">
                      {affiliate.commission_rate || 10}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Routes>
              <Route index element={<AffiliateOverview />} />
              <Route path="commissions" element={<AffiliateCommissions />} />
              <Route path="withdrawals" element={<AffiliateWithdrawals />} />
              <Route path="profile" element={<AffiliateProfile />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
