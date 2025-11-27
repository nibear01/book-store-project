import { Users as UsersIcon, DollarSign, TrendingUp, Clock } from "lucide-react";

const StatsCards = ({ stats, loading, formatCurrency }) => {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Affiliates</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.affiliates.total}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {stats.affiliates.active} active
            </p>
          </div>
          <UsersIcon className="h-12 w-12 text-gray-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pending Approvals</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.affiliates.pending}
            </p>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </div>
          <Clock className="h-12 w-12 text-gray-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.financials.total_earnings)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Available: {formatCurrency(stats.financials.total_available)}
            </p>
          </div>
          <DollarSign className="h-12 w-12 text-gray-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pending Withdrawals</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.withdrawals.pending}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.withdrawals.completed} completed
            </p>
          </div>
          <TrendingUp className="h-12 w-12 text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
