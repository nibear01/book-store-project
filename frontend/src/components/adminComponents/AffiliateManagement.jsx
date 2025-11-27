import React, { useState, useEffect } from "react";
import { useAffiliateAdmin } from "../../context/AffiliateAdminContext";
import StatsCards from "./affiliate/StatsCards";
import { formatCurrency, formatDate, getStatusBadge } from "./affiliate/utils.jsx";
import ApproveModal from "./affiliate/modals/ApproveModal";
import RejectModal from "./affiliate/modals/RejectModal";
import {
  SuspendModal,
  CommissionModal,
  WithdrawalModal,
  DetailsModal,
} from "./affiliate/modals";
import {
  Users as UsersIcon,
  CheckCircle2,
  XCircle,
  Ban,
  DollarSign,
  TrendingUp,
  Search,
  RefreshCw,
  Eye,
} from "lucide-react";

const AffiliateManagement = () => {
  const {
    loading,
    getStats,
    getAffiliates,
    // eslint-disable-next-line no-unused-vars
    getAffiliateById,
    approveAffiliate,
    rejectAffiliate,
    suspendAffiliate,
    updateCommissionRate,
    getWithdrawals,
    processWithdrawal,
    getCommissions,
  } = useAffiliateAdmin();

  const [activeTab, setActiveTab] = useState("affiliates");
  const [affiliates, setAffiliates] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filters
  const [affiliateStatusFilter, setAffiliateStatusFilter] = useState("");
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("");
  const [commissionStatusFilter, setCommissionStatusFilter] = useState("");

  // Pagination
  const [affiliatePage, setAffiliatePage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [commissionPage, setCommissionPage] = useState(1);
  const [totalPages, setTotalPages] = useState({
    affiliates: 1,
    withdrawals: 1,
    commissions: 1,
  });

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "affiliates") fetchAffiliates();
    else if (activeTab === "withdrawals") fetchWithdrawals();
    else if (activeTab === "commissions") fetchCommissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    affiliatePage,
    withdrawalPage,
    commissionPage,
    affiliateStatusFilter,
    withdrawalStatusFilter,
    commissionStatusFilter,
    affiliateSearch,
  ]);

  const fetchStats = async () => {
    const data = await getStats();
    if (data) {
      setStats(data);
    }
  };

  const fetchAffiliates = async () => {
    const result = await getAffiliates(
      affiliatePage,
      10,
      affiliateStatusFilter,
      affiliateSearch
    );
    if (result) {
      setAffiliates(result.data);
      setTotalPages((prev) => ({ ...prev, affiliates: result.totalPages }));
    }
  };

  const fetchWithdrawals = async () => {
    const result = await getWithdrawals(
      withdrawalPage,
      10,
      withdrawalStatusFilter
    );
    if (result) {
      setWithdrawals(result.data);
      setTotalPages((prev) => ({ ...prev, withdrawals: result.totalPages }));
    }
  };

  const fetchCommissions = async () => {
    const result = await getCommissions(
      commissionPage,
      10,
      commissionStatusFilter
    );
    if (result) {
      setCommissions(result.data);
      setTotalPages((prev) => ({ ...prev, commissions: result.totalPages }));
    }
  };

  const handleApproveAffiliate = async (commissionRate, notes) => {
    const result = await approveAffiliate(
      selectedAffiliate._id,
      commissionRate,
      notes
    );
    if (result) {
      setShowApproveModal(false);
      setSelectedAffiliate(null);
      fetchAffiliates();
      fetchStats();
    }
  };

  const handleRejectAffiliate = async (reason) => {
    const result = await rejectAffiliate(selectedAffiliate._id, reason);
    if (result) {
      setShowRejectModal(false);
      setSelectedAffiliate(null);
      fetchAffiliates();
      fetchStats();
    }
  };

  const handleSuspendAffiliate = async (notes) => {
    const result = await suspendAffiliate(selectedAffiliate._id, notes);
    if (result) {
      setShowSuspendModal(false);
      setSelectedAffiliate(null);
      fetchAffiliates();
      fetchStats();
    }
  };

  const handleUpdateCommissionRate = async (newRate) => {
    const result = await updateCommissionRate(selectedAffiliate._id, newRate);
    if (result) {
      setShowCommissionModal(false);
      setSelectedAffiliate(null);
      fetchAffiliates();
    }
  };

  const handleProcessWithdrawal = async (withdrawalId, action, note) => {
    const result = await processWithdrawal(withdrawalId, action, note);
    if (result) {
      setShowWithdrawalModal(false);
      setSelectedAffiliate(null);
      fetchWithdrawals();
      fetchStats();
    }
  };



  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-xl font-bold">Affiliate Management</h1>
          <p className="text-gray-600 text-sm">
            Manage affiliates, commissions, and withdrawals
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={loading} formatCurrency={formatCurrency} />

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("affiliates")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "affiliates"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Affiliates
              </button>
              <button
                onClick={() => setActiveTab("withdrawals")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "withdrawals"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Withdrawals
              </button>
              <button
                onClick={() => setActiveTab("commissions")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "commissions"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Commissions
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Affiliates Tab */}
            {activeTab === "affiliates" && (
              <>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, email, or promo code..."
                        value={affiliateSearch}
                        onChange={(e) => setAffiliateSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md focus:border-gray-500"
                      />
                    </div>
                  </div>
                  <select
                    value={affiliateStatusFilter}
                    onChange={(e) => setAffiliateStatusFilter(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:border-gray-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={fetchAffiliates}
                    className="px-4 py-1.5 bg-black text-white rounded-md hover:bg-gray-900 flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                </div>

                {/* Affiliates Table */}
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                      {[...Array(5)].map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 py-4"
                        >
                          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-8 bg-gray-200 rounded w-24"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : affiliates.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Affiliate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Promo Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Earnings
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {affiliates.map((affiliate) => (
                            <tr
                              key={affiliate._id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {affiliate.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {affiliate.email}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-mono text-sm">
                                  {affiliate.promo_code}
                                </code>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {formatCurrency(affiliate.total_earnings)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Available:{" "}
                                    {formatCurrency(
                                      affiliate.available_balance
                                    )}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-green-600 font-semibold">
                                {affiliate.commission_rate}%
                              </td>
                              <td className="px-6 py-4">
                                {getStatusBadge(affiliate.status)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatDate(affiliate.created_at)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedAffiliate(affiliate);
                                      setShowDetailsModal(true);
                                    }}
                                    className="text-gray-600 hover:text-gray-800"
                                    title="View Details"
                                  >
                                    <Eye className="h-5 w-5" />
                                  </button>
                                  {affiliate.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setSelectedAffiliate(affiliate);
                                          setShowApproveModal(true);
                                        }}
                                        className="text-green-600 hover:text-green-800"
                                        title="Approve"
                                      >
                                        <CheckCircle2 className="h-5 w-5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedAffiliate(affiliate);
                                          setShowRejectModal(true);
                                        }}
                                        className="text-red-600 hover:text-red-800"
                                        title="Reject"
                                      >
                                        <XCircle className="h-5 w-5" />
                                      </button>
                                    </>
                                  )}
                                  {affiliate.status === "active" && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setSelectedAffiliate(affiliate);
                                          setShowCommissionModal(true);
                                        }}
                                        className="text-gray-600 hover:text-gray-800"
                                        title="Update Commission"
                                      >
                                        <DollarSign className="h-5 w-5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedAffiliate(affiliate);
                                          setShowSuspendModal(true);
                                        }}
                                        className="text-orange-600 hover:text-orange-800"
                                        title="Suspend"
                                      >
                                        <Ban className="h-5 w-5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center gap-2 mt-6">
                      <button
                        onClick={() =>
                          setAffiliatePage((p) => Math.max(1, p - 1))
                        }
                        disabled={affiliatePage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-gray-600">
                        Page {affiliatePage} of {totalPages.affiliates}
                      </span>
                      <button
                        onClick={() =>
                          setAffiliatePage((p) =>
                            Math.min(totalPages.affiliates, p + 1)
                          )
                        }
                        disabled={affiliatePage === totalPages.affiliates}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">No affiliates found</p>
                  </div>
                )}
              </>
            )}

            {/* Withdrawals Tab */}
            {activeTab === "withdrawals" && (
              <>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <select
                    value={withdrawalStatusFilter}
                    onChange={(e) => setWithdrawalStatusFilter(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={fetchWithdrawals}
                    className="px-4 py-1.5 bg-black text-white rounded-md hover:bg-gray-900 flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                </div>

                {/* Withdrawals Table */}
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                      {[...Array(5)].map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 py-4"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : withdrawals.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Affiliate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Method
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Requested
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {withdrawals.map((withdrawal) => (
                            <tr
                              key={withdrawal._id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {withdrawal.affiliate?.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {withdrawal.affiliate?.email}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(withdrawal.amount)}
                                </p>
                              </td>
                              <td className="px-6 py-4 capitalize text-sm text-gray-600">
                                {withdrawal.payment_method?.replace("_", " ")}
                              </td>
                              <td className="px-6 py-4">
                                {getStatusBadge(withdrawal.status)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatDate(withdrawal.created_at)}
                              </td>
                              <td className="px-6 py-4">
                                {(withdrawal.status === "pending" ||
                                  withdrawal.status === "processing") && (
                                  <button
                                    onClick={() => {
                                      setSelectedAffiliate(withdrawal);
                                      setShowWithdrawalModal(true);
                                    }}
                                    className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-900"
                                  >
                                    Process
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center gap-2 mt-6">
                      <button
                        onClick={() =>
                          setWithdrawalPage((p) => Math.max(1, p - 1))
                        }
                        disabled={withdrawalPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-gray-600">
                        Page {withdrawalPage} of {totalPages.withdrawals}
                      </span>
                      <button
                        onClick={() =>
                          setWithdrawalPage((p) =>
                            Math.min(totalPages.withdrawals, p + 1)
                          )
                        }
                        disabled={withdrawalPage === totalPages.withdrawals}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">No withdrawal requests found</p>
                  </div>
                )}
              </>
            )}

            {/* Commissions Tab */}
            {activeTab === "commissions" && (
              <>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <select
                    value={commissionStatusFilter}
                    onChange={(e) => setCommissionStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={fetchCommissions}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                </div>

                {/* Commissions Table */}
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                      {[...Array(5)].map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 py-4"
                        >
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : commissions.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Affiliate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rate
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
                          {commissions.map((commission) => (
                            <tr
                              key={commission._id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 font-medium text-gray-900">
                                {commission.order?.order_number || "N/A"}
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {commission.affiliate?.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {commission.affiliate?.promo_code}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {commission.user?.name || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {formatCurrency(commission.order?.grand_total)}
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {commission.commission_rate}%
                              </td>
                              <td className="px-6 py-4 font-semibold text-green-600">
                                {formatCurrency(commission.commission_amount)}
                              </td>
                              <td className="px-6 py-4">
                                {getStatusBadge(commission.status)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatDate(commission.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center gap-2 mt-6">
                      <button
                        onClick={() =>
                          setCommissionPage((p) => Math.max(1, p - 1))
                        }
                        disabled={commissionPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-gray-600">
                        Page {commissionPage} of {totalPages.commissions}
                      </span>
                      <button
                        onClick={() =>
                          setCommissionPage((p) =>
                            Math.min(totalPages.commissions, p + 1)
                          )
                        }
                        disabled={commissionPage === totalPages.commissions}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">No commissions found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showApproveModal && (
        <ApproveModal
          affiliate={selectedAffiliate}
          onClose={() => setShowApproveModal(false)}
          onApprove={handleApproveAffiliate}
        />
      )}
      {showRejectModal && (
        <RejectModal
          affiliate={selectedAffiliate}
          onClose={() => setShowRejectModal(false)}
          onReject={handleRejectAffiliate}
        />
      )}
      {showSuspendModal && (
        <SuspendModal
          affiliate={selectedAffiliate}
          onClose={() => setShowSuspendModal(false)}
          onSuspend={handleSuspendAffiliate}
        />
      )}
      {showCommissionModal && (
        <CommissionModal
          affiliate={selectedAffiliate}
          onClose={() => setShowCommissionModal(false)}
          onUpdate={handleUpdateCommissionRate}
        />
      )}
      {showWithdrawalModal && (
        <WithdrawalModal
          withdrawal={selectedAffiliate}
          onClose={() => setShowWithdrawalModal(false)}
          onProcess={handleProcessWithdrawal}
        />
      )}
      {showDetailsModal && (
        <DetailsModal
          affiliate={selectedAffiliate}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

export default AffiliateManagement;
