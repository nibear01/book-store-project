import React, {
  useState,
  useEffect,
  useContext,
  Suspense,
  useMemo,
} from "react";
import { toast } from "react-toastify";
import { BooksContext } from "../../context/BooksContext";
import { useAuth } from "../../context/AuthContext";
import {
  // utilities
  // formatBangladeshDate, // removed: now using local formatter with AM/PM
  formatCurrency,
  getStatusClass,
  handleUpdateStatus,
  handleDeleteOrder,
  // hooks
  useOrderAccess,
  useOrdersFetcher,
  useWorkflowSelection,
  useWorkflowActions,
  useOrderDerivations,
} from "./order/hooks.js";
import { useDebounce } from "./common/useDebounce.js";
// Lazy loaded workflow & order modals
const WorkflowHistoryModal = React.lazy(() =>
  import("./order/WorkflowHistoryModal")
);
const WorkflowActionsModal = React.lazy(() =>
  import("./order/WorkflowActionsModal")
);
const OrderDetailModal = React.lazy(() => import("./order/OrderDetailModal"));

export default function Order() {
  // auth & role access
  const { activeRole, roles } = useAuth();
  const { rolesLoaded, canAccess: canAccessOrders } = useOrderAccess(
    activeRole,
    roles
  );
  const isWorkflowRole = canAccessOrders;

  // view & workflow filters
  const [internalView, setInternalView] = useState(canAccessOrders);
  const [workflowFilterStage, setWorkflowFilterStage] = useState("");

  // books context — fetch if not already loaded
  const booksContext = useContext(BooksContext);
  const books = booksContext?.books || [];
  const fetchBooks = booksContext?.fetchBooks;

  useEffect(() => {
    if (books.length === 0 && fetchBooks) {
      fetchBooks({ status: "all" });
    }
  }, [books.length, fetchBooks]);

  // orders fetching & book names
  const { orders, setOrders, loading, bookNames, refetch } = useOrdersFetcher({
    canAccess: canAccessOrders,
    internalView,
    workflowFilterStage,
    books,
  });

  // selection & workflow action hooks
  const workflowSelection = useWorkflowSelection();
  const {
    selectedOrder,
    setSelectedOrder,
    nextStages,
    advancing,
    advanceRemarks,
    setAdvanceRemarks,
  } = workflowSelection;
  const {
    openOrder: innerOpenOrder,
    advanceStage,
    TERMINAL_REQUIRE_REMARKS,
  } = useWorkflowActions(workflowSelection);

  // Separate workflow modal state (independent from order detail modal)
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false);
  const [workflowSelectedOrder, setWorkflowSelectedOrder] = useState(null);
  const [workflowActionsVisible, setWorkflowActionsVisible] = useState(false);
  const [workflowActionsOrderId, setWorkflowActionsOrderId] = useState(null);

  // local UI state
  const [viewOrderVisible, setViewOrderVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editCustomer, setEditCustomer] = useState({
    fullName: "",
    email: "",
    address: "",
    phone: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });

  // filters / pagination state (restored)
  // Attempt to hydrate from localStorage
  const cached = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("orders_filters_v1")) || {};
    } catch {
      return {};
    }
  }, []);
  const [filter, setFilter] = useState(cached.filter || "all");
  const [searchQuery, setSearchQuery] = useState(cached.searchQuery || "");
  const [dateFilter, setDateFilter] = useState(cached.dateFilter || "all");
  const [startDate, setStartDate] = useState(cached.startDate || "");
  const [endDate, setEndDate] = useState(cached.endDate || "");
  const [sortBy, setSortBy] = useState(cached.sortBy || "date");
  const [sortDirection, setSortDirection] = useState(
    cached.sortDirection || "desc"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 10;

  // Debounced search (value used in derivations)
  const debouncedSearch = useDebounce(searchQuery, 250);

  const {
    paginated: paginatedOrders,
    filtered: filteredAndSortedOrders,
    totalPages,
  } = useOrderDerivations({
    orders,
    filter,
    searchQuery: debouncedSearch,
    dateFilter,
    startDate,
    endDate,
    sortBy,
    sortDirection,
    page: currentPage,
    pageSize: ORDERS_PER_PAGE,
  });

  // If access is lost (roles change), fall back to public view
  useEffect(() => {
    if (!canAccessOrders && internalView) setInternalView(false);
  }, [canAccessOrders, internalView]);

  // Initial & reactive fetch (restored) so user doesn't need manual Refresh
  useEffect(() => {
    if (rolesLoaded && canAccessOrders) {
      refetch();
    }
  }, [
    rolesLoaded,
    internalView,
    workflowFilterStage,
    activeRole,
    canAccessOrders,
    refetch,
  ]);
  // Save customer edits
  const handleSaveCustomer = () => {
    const updatedOrders = orders.map((order) =>
      order._id === selectedOrder._id
        ? {
            ...order,
            shipping_address: { ...order.shipping_address, ...editCustomer },
            user: { ...order.user, phone: editCustomer.phone },
          }
        : order
    );
    setOrders(updatedOrders);
    setSelectedOrder({
      ...selectedOrder,
      shipping_address: { ...selectedOrder.shipping_address, ...editCustomer },
      user: { ...selectedOrder.user, phone: editCustomer.phone },
    });
    setEditMode(false);
    toast.success("Customer info updated!");
  };

  // stage advancement via hook
  const handleAdvanceStage = (stage, remarks = "") =>
    advanceStage(stage, remarks);

  // open order (re-added) for view
  const handleViewOrder = async (order) => {
    setEditCustomer({
      fullName: order.shipping_address?.fullName || "",
      email: order.shipping_address?.email || "",
      address: order.shipping_address?.street || "",
      phone: order.shipping_address?.phone || order.user?.phone || "",
      city: order.shipping_address?.city || "",
      state: order.shipping_address?.state || "",
      country: order.shipping_address?.country || "",
      zipCode: order.shipping_address?.zipCode || "",
    });
    if (internalView && isWorkflowRole) await innerOpenOrder(order._id);
    else setSelectedOrder(order);
    setViewOrderVisible(true);
    setEditMode(false);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearch, dateFilter, sortBy, sortDirection]);

  // Persist filters to localStorage
  useEffect(() => {
    const payload = {
      filter,
      searchQuery,
      dateFilter,
      startDate,
      endDate,
      sortBy,
      sortDirection,
      internalView,
      workflowFilterStage,
    };
    try {
      localStorage.setItem("orders_filters_v1", JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, [
    filter,
    searchQuery,
    dateFilter,
    startDate,
    endDate,
    sortBy,
    sortDirection,
    internalView,
    workflowFilterStage,
  ]);

  // Open workflow modal for a specific order
  const openWorkflowModal = async (order) => {
    if (!internalView || !isWorkflowRole) return;
    setWorkflowSelectedOrder({
      _id: order._id,
      order_number: order.order_number,
    });
    setWorkflowModalVisible(true);
  };

  const closeWorkflowModal = () => {
    setWorkflowModalVisible(false);
    setWorkflowSelectedOrder(null);
  };

  const openWorkflowActions = (order) => {
    if (!internalView || !isWorkflowRole) return;
    setWorkflowActionsOrderId(order._id);
    setWorkflowActionsVisible(true);
  };
  const closeWorkflowActions = () => {
    setWorkflowActionsVisible(false);
    setWorkflowActionsOrderId(null);
  };

  // 12-hour BD time with AM/PM
  const formatBDDateTime12h = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return "";
    return d.toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!rolesLoaded) {
    return <div className="p-6 text-sm text-gray-600">Loading roles...</div>;
  }
  if (!isWorkflowRole && !canAccessOrders) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Access restricted. Only Order Managers or Admins can view Orders
        Management.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-col sm:items-center sm:justify-between gap-3 mb-2 sm:mb-3">
          <h1 className="text-xl sm:text-xl font-bold" name="orders-page-title">Orders Management</h1>
          <p className="text-gray-600 text-sm">Manage Customer Orders</p>
        </div>
        {/* Refresh Button */}
        <div className="flex justify-end ">
          <button
            onClick={refetch}
            className="px-3 py-2 bg-black text-white text-xs sm:text-base rounded-lg hover:bg-gray-800 transition-colors md:ml-4"
            name="orders-refresh-btn"
          >
            Refresh Orders
          </button>
        </div>
      </div>

      {/* Controls: Search, Filter, Sort, Refresh */}
      <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-md border-zinc-200 border flex flex-col gap-3">
        {/* Search Bar */}
        <div className="w-full ">
            <div className="">
              <input
                type="text"
                placeholder="Search by name, email, phone, or order ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 sm:pr-10 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
                name="orders-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-2 flex items-center px-1 text-gray-400 hover:text-gray-600"
                  name="orders-search-clear-btn"
                >
                  ×
                </button>
              )}
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status / Stage Filter */}
          {internalView ? (
            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-1">
                Stage
              </label>
              <select
                value={workflowFilterStage}
                onChange={(e) => setWorkflowFilterStage(e.target.value)}
                className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-500"
                name="orders-stage-filter"
              >
                <option value="">All Stages</option>
                <option value="OM_INTAKE">OM_INTAKE</option>
                <option value="CSM_ADDRESS_CHECK">CSM_ADDRESS_CHECK</option>
                <option value="CSM_CLARIFIED">CSM_CLARIFIED</option>
                <option value="FM_REVIEW">FM_REVIEW</option>
                <option value="FM_APPROVED">FM_APPROVED</option>
                <option value="FM_REJECTED">FM_REJECTED</option>
                <option value="PM_QUEUE">PM_QUEUE</option>
                <option value="PM_PREP">PM_PREP</option>
                <option value="PM_RUN">PM_RUN</option>
                <option value="PM_FINISH">PM_FINISH</option>
                <option value="DM_QUEUE">DM_QUEUE</option>
                <option value="DM_PACKING">DM_PACKING</option>
                <option value="DM_IN_TRANSIT">DM_IN_TRANSIT</option>
                <option value="DM_OUT_FOR_DELIVERY">DM_OUT_FOR_DELIVERY</option>
                <option value="DM_DELIVERED">DM_DELIVERED</option>
                <option value="CSM_FEEDBACK">CSM_FEEDBACK</option>
                <option value="OM_COMPLETED">OM_COMPLETED</option>
                <option value="TERMINATED_OM">TERMINATED_OM</option>
                <option value="CANCELLED_CSM">CANCELLED_CSM</option>
                <option value="CANCELLED_FM">CANCELLED_FM</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-500"
                name="orders-status-filter"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* Date Filter */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-500"
              name="orders-date-filter"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="1day">Last 1 Day</option>
              <option value="7days">Last 7 Days</option>
              <option value="15days">Last 15 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-500"
              name="orders-sort-filter"
            >
              <option value="date">Order Date</option>
              <option value="total">Total Amount</option>
              <option value="name">Customer Name</option>
            </select>
          </div>

          {/* Sort Direction */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1">
              Order
            </label>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
              className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-500"
              name="orders-sort-direction"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {dateFilter === "custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="mb-3 text-sm text-gray-600" name="orders-showing-counts">
          Showing {paginatedOrders.length} of {filteredAndSortedOrders.length}{" "}
          orders
        </div>
        <div>
          {isWorkflowRole && (
            <div className="flex items-center gap-2 text-sm">
              <label className="font-medium">View:</label>
              <button
                onClick={() => setInternalView(true)}
                className={`px-3 text-xs py-1 rounded border ${
                  internalView
                    ? "bg-black text-white border-black"
                    : "hover:bg-gray-100"
                }`}
                name="orders-view-workflow-btn"
              >
                Workflow
              </button>
              <button
                onClick={() => setInternalView(false)}
                className={`px-3 text-xs py-1 rounded border ${
                  !internalView
                    ? "bg-black text-white border-black"
                    : "hover:bg-gray-100"
                }`}
                name="orders-view-public-btn"
              >
                Public Status
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white border-zinc-200 border rounded-md">
        <table className="w-full" name="orders-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 sm:p-3 text-left border-b">
                Order Info
              </th>
              <th className="p-2 sm:p-3 text-left border-b hidden sm:table-cell">
                Customer
              </th>
              <th className="p-2 sm:p-3 text-center border-b hidden md:table-cell">
                Total
              </th>
              <th className="p-2 sm:p-3 text-left border-b hidden lg:table-cell">
                Date (BD Time)
              </th>
              <th className="p-2 sm:p-3 text-center border-b">
                Status
              </th>
              <th className="p-2 sm:p-3 text-center border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i} className="border-b animate-pulse">
                  <td className="p-2 sm:p-3">
                    <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-16 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                  </td>
                  <td className="p-2 sm:p-3 hidden sm:table-cell">
                    <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="p-2 sm:p-3 hidden md:table-cell">
                    <div className="h-3 w-14 bg-gray-200 rounded ml-auto" />
                  </td>
                  <td className="p-2 sm:p-3 hidden lg:table-cell">
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="p-2 sm:p-3">
                    <div className="h-5 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="p-2 sm:p-3">
                    <div className="flex gap-2 justify-center">
                      <div className="h-6 w-12 bg-gray-200 rounded" />
                      <div className="h-6 w-12 bg-gray-200 rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-4 text-center text-sm text-gray-500"
                >
                  No orders found matching your criteria
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50" name="orders-row">
                  <td className="p-2 sm:p-3">
                    <div className="sm:hidden">
                      <div className="text-xs text-black">
                        {order.order_number}
                      </div>
                      <div className="text-xs text-gray-600">
                        {order.shipping_address?.fullName}
                      </div>
                      <div className="text-xs font-semibold">
                        {formatCurrency(order.total_amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatBDDateTime12h(order.created_at || order.createdAt)}
                      </div>
                    </div>
                    <div className="hidden sm:block text-sm font-medium">
                      {order.order_number}
                    </div>
                  </td>

                  <td className="p-2 sm:p-3 hidden sm:table-cell">
                    <div>
                      <div className="font-medium">
                        {order.shipping_address?.fullName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.shipping_address?.email}
                      </div>
                    </div>
                  </td>

                  <td className="p-2 sm:p-3 text-right hidden md:table-cell font-semibold">
                    {formatCurrency(order.grand_total ?? order.total_amount)}
                    {order.discount_amount > 0 && (
                      <div className="text-[11px] text-green-600 font-normal mt-0.5">
                        -{formatCurrency(order.discount_amount)}
                      </div>
                    )}
                  </td>

                  <td className="p-2 sm:p-3 hidden lg:table-cell">
                    <div className="text-sm text-gray-600">
                      {formatBDDateTime12h(order.created_at || order.createdAt)}
                    </div>
                  </td>

                  <td className="p-2 sm:p-3">
                    {internalView ? (
                      <span className="inline-block text-xs sm:text-sm px-2 py-1 rounded border bg-gray-100 font-medium">
                        {order.internal_stage || order.order_status}
                      </span>
                    ) : (
                      <select
                        value={order.order_status}
                        onChange={(e) =>
                          handleUpdateStatus(
                            order._id,
                            e.target.value,
                            setOrders
                          )
                        }
                        className={`w-full text-xs sm:text-sm px-2 py-1 border rounded ${getStatusClass(
                          order.order_status
                        )} cursor-pointer`}
                        name="order-status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </td>
                  <td className="p-2 sm:p-3">
                    <div className="flex sm:flex-row gap-1 sm:gap-2 justify-center">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="px-2 py-1 bg-black text-white text-xs rounded hover:bg-gray-700 transition-colors"
                        name="orders-view-btn"
                      >
                        View
                      </button>
                      {internalView && isWorkflowRole && (
                        <>
                          <button
                            onClick={() => openWorkflowModal(order)}
                            className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                            name="orders-history-btn"
                          >
                            History
                          </button>
                          <button
                            onClick={() => openWorkflowActions(order)}
                            className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
                            name="orders-actions-btn"
                          >
                            Actions
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2)
                  pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm ${
                      currentPage === pageNum
                        ? "bg-black text-white"
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {viewOrderVisible && selectedOrder && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center text-white text-sm">
              Loading order...
            </div>
          }
        >
          <OrderDetailModal
            visible={viewOrderVisible}
            order={selectedOrder}
            editMode={editMode}
            setEditMode={setEditMode}
            editCustomer={editCustomer}
            setEditCustomer={setEditCustomer}
            onSaveCustomer={handleSaveCustomer}
            onDelete={() =>
              handleDeleteOrder(
                selectedOrder,
                orders,
                setOrders,
                setViewOrderVisible
              )
            }
            onClose={() => setViewOrderVisible(false)}
            nextStages={nextStages}
            advanceRemarks={advanceRemarks}
            setAdvanceRemarks={setAdvanceRemarks}
            advanceStage={handleAdvanceStage}
            advancing={advancing}
            TERMINAL_REQUIRE_REMARKS={TERMINAL_REQUIRE_REMARKS}
            internalView={internalView}
            isWorkflowRole={isWorkflowRole}
            bookNames={bookNames}
          />
        </Suspense>
      )}
      {/* Workflow History Modal (Lazy Loaded) */}
      {workflowModalVisible && workflowSelectedOrder && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center text-white text-sm">
              Loading workflow...
            </div>
          }
        >
          <WorkflowHistoryModal
            visible={workflowModalVisible}
            orderId={workflowSelectedOrder._id}
            orderNumber={workflowSelectedOrder.order_number}
            onClose={closeWorkflowModal}
            enabled={internalView && isWorkflowRole}
          />
        </Suspense>
      )}
      {workflowActionsVisible && workflowActionsOrderId && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center text-white text-sm">
              Loading actions...
            </div>
          }
        >
          <WorkflowActionsModal
            visible={workflowActionsVisible}
            orderId={workflowActionsOrderId}
            onClose={closeWorkflowActions}
            enabled={internalView && isWorkflowRole}
          />
        </Suspense>
      )}
    </div>
  );
}
