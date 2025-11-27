import { useState, useEffect } from "react";
import { useAffiliate } from "../../context/AffiliateContext";
import { toast } from "react-toastify";

// Icons
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import GroupIcon from "@mui/icons-material/Group";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const AffiliateOverview = () => {
  const { affiliate, getDashboardStats, isAffiliateAuthenticated, isLoading: authLoading } = useAffiliate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAffiliateAuthenticated && !authLoading) {
      fetchStats();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [isAffiliateAuthenticated, authLoading]);

  const fetchStats = async () => {
    setIsLoading(true);
    const result = await getDashboardStats();
    if (result.success) {
      setStats(result.data);
    } else if (result.message !== "Not authenticated") {
      toast.error(result.message || "Failed to fetch dashboard stats");
    }
    setIsLoading(false);
  };

  const copyPromoCode = () => {
    if (stats?.promo_code) {
      navigator.clipboard.writeText(stats.promo_code);
      toast.success("Promo code copied!");
    }
  };

  const formatCurrency = (amount) => {
    return `$${(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600">
          Track your performance and earnings
        </p>
      </div>

      {/* Status Warning */}
      {affiliate?.status !== "active" && (
        <div className={`p-4 rounded-lg ${
          affiliate?.status === "pending"
            ? "bg-yellow-50 border border-yellow-200"
            : "bg-red-50 border border-red-200"
        }`}>
          <p className={`font-semibold ${
            affiliate?.status === "pending" ? "text-yellow-800" : "text-red-800"
          }`}>
            {affiliate?.status === "pending"
              ? "⏳ Your account is pending approval"
              : affiliate?.status === "suspended"
              ? "🚫 Your account is suspended"
              : "❌ Your account is not active"}
          </p>
          <p className={`text-sm mt-1 ${
            affiliate?.status === "pending" ? "text-yellow-700" : "text-red-700"
          }`}>
            {affiliate?.status === "pending"
              ? "Please wait for admin approval to start earning commissions."
              : "Contact support for more information."}
          </p>
        </div>
      )}

      {/* Promo Code Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 mb-2">Your Unique Promo Code</p>
            <p className="text-4xl font-bold font-mono">{stats?.promo_code}</p>
            <p className="text-blue-100 mt-2 text-sm">
              Share this code to earn {stats?.commission_rate || 10}% commission
            </p>
          </div>
          <button
            onClick={copyPromoCode}
            className="bg-white text-blue-600 p-4 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <ContentCopyIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <MonetizationOnIcon className="text-green-600 h-6 w-6" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Total Earnings</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatCurrency(stats?.total_earnings)}
          </p>
        </div>

        {/* Available Balance */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUpIcon className="text-blue-600 h-6 w-6" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Available Balance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatCurrency(stats?.available_balance)}
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <ShoppingCartIcon className="text-purple-600 h-6 w-6" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {stats?.total_orders || 0}
          </p>
        </div>

        {/* Total Referrals */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <GroupIcon className="text-orange-600 h-6 w-6" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Total Referrals</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {stats?.total_referrals || 0}
          </p>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Commission Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {stats?.pending_commissions || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {stats?.approved_commissions || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Approved</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {stats?.paid_commissions || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Paid</p>
          </div>
        </div>
      </div>

      {/* Recent Commissions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Commissions
          </h3>
        </div>
        <div className="overflow-x-auto">
          {stats?.recent_commissions && stats.recent_commissions.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recent_commissions.map((commission) => (
                  <tr key={commission._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {commission.order?.order_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {commission.user?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {formatCurrency(commission.commission_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        commission.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : commission.status === "approved"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {commission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(commission.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No commissions yet. Start promoting your promo code!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliateOverview;
