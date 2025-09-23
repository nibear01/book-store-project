/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../api/order-api";
import { BooksContext } from "../../context/BooksContext";

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
  const [bookNames, setBookNames] = useState({});

  // Get BooksContext
  const booksContext = useContext(BooksContext);
  const books = booksContext?.books || [];

  // State for search, filter, and sort
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  const ORDERS_PER_PAGE = 10;
  const printRef = useRef();

  // Convert UTC to Bangladesh Time (UTC+6)
  const convertToBangladeshTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date)) return null;

    const bangladeshOffset = 6 * 60 * 60 * 1000;
    return new Date(date.getTime() + bangladeshOffset);
  };

  // Format date in Bangladesh time
  const formatBangladeshDate = (dateString) => {
    const date = convertToBangladeshTime(dateString);
    if (!date) return "-";

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      return `${mm}/${dd} ${hh}:${min}`;
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  // Format currency with Taka sign
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "৳ 0.00";
    return `৳ ${amount.toFixed(2)}`;
  };

  // Get date range for filters
  const getDateRange = (range) => {
    const now = new Date();
    const bangladeshNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    bangladeshNow.setHours(0, 0, 0, 0);

    switch (range) {
      case "1day": {
        const yesterday = new Date(bangladeshNow);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: bangladeshNow };
      }

      case "7days": {
        const sevenDaysAgo = new Date(bangladeshNow);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return { start: sevenDaysAgo, end: bangladeshNow };
      }

      case "15days": {
        const fifteenDaysAgo = new Date(bangladeshNow);
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        return { start: fifteenDaysAgo, end: bangladeshNow };
      }

      case "30days": {
        const thirtyDaysAgo = new Date(bangladeshNow);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return { start: thirtyDaysAgo, end: bangladeshNow };
      }

      default:
        return null;
    }
  };

  // NEW: Improved book name fetching function
  const fetchBookNames = async (orderItems) => {
    const bookNameMap = {};
    const booksArray = Array.isArray(books) ? books : [];

    for (const item of orderItems) {
      if (item.book && !bookNameMap[item.book]) {
        try {
          // Handle different book ID formats
          let bookId = item.book;

          // If book ID is an object with $oid (MongoDB format)
          if (typeof bookId === "object" && bookId.$oid) {
            bookId = bookId.$oid;
          }

          // If book ID is an object with _id
          if (typeof bookId === "object" && bookId._id) {
            bookId = bookId._id;
          }

          // Convert to string for comparison
          const bookIdStr = String(bookId);

          // Find book in context by comparing string representations
          const existingBook = booksArray.find((b) => {
            // Handle different book ID formats in the books array
            let existingBookId = b._id;
            if (
              existingBookId &&
              typeof existingBookId === "object" &&
              existingBookId.$oid
            ) {
              existingBookId = existingBookId.$oid;
            }
            return String(existingBookId) === bookIdStr;
          });

          if (existingBook) {
            bookNameMap[item.book] = existingBook.title || "Unknown Book";
          } else {
            bookNameMap[item.book] = "Book Not Found";
          }
        } catch (error) {
          console.error(`Error processing book for ID ${item.book}:`, error);
          bookNameMap[item.book] = "Error Loading Book";
        }
      }
    }

    return bookNameMap;
  };

  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      console.log("Fetched orders:", data);
      if (data.success) {
        const ordersData = data.data || [];
        setOrders(ordersData);

        // Fetch book names for all orders
        const allOrderItems = [];
        ordersData.forEach((order) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item) => {
              if (item.book) {
                allOrderItems.push(item);
              }
            });
          }
        });

        // Only fetch if we have order items
        if (allOrderItems.length > 0) {
          try {
            const bookNameMap = await fetchBookNames(allOrderItems);
            setBookNames(bookNameMap);
          } catch (error) {
            console.error("Error fetching book names:", error);
          }
        }
      } else {
        setOrders([]);
        toast.error("Failed to fetch orders");
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
      toast.error("Failed to fetch orders");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await updateOrderStatus(id, { status: newStatus });
      if (response.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id ? { ...order, order_status: newStatus } : order
          )
        );
        toast.success("Order status updated!");
      } else {
        toast.error(response.message || "Failed to update order status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status");
    }
  };

  // Open order modal
  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
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

    // Fetch book names for this specific order
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      try {
        const bookNameMap = await fetchBookNames(order.items);
        setBookNames((prev) => ({ ...prev, ...bookNameMap }));
      } catch (error) {
        console.error("Error fetching book names for order:", error);
      }
    }

    setViewOrderVisible(true);
    setEditMode(false);
  };

  // Get book name by ID with safe fallback
  const getBookName = (item) => {
    // Use the book_title stored in the order item
    if (item.book_title) {
      return item.book_title;
    }

    // Fallback: try to get from bookNames map (for backward compatibility)
    let bookId = item.book;
    if (typeof bookId === "object" && bookId.$oid) {
      bookId = bookId.$oid;
    }
    if (typeof bookId === "object" && bookId._id) {
      bookId = bookId._id;
    }

    return bookNames[bookId] || bookNames[item.book] || "Loading...";
  };

  // Save customer edits
  const handleSaveCustomer = () => {
    const updatedOrders = orders.map((order) =>
      order._id === selectedOrder._id
        ? {
            ...order,
            shipping_address: { ...order.shipping_address, ...editCustomer },
            user: {
              ...order.user,
              phone: editCustomer.phone,
            },
          }
        : order
    );
    setOrders(updatedOrders);
    setSelectedOrder({
      ...selectedOrder,
      shipping_address: { ...selectedOrder.shipping_address, ...editCustomer },
      user: {
        ...selectedOrder.user,
        phone: editCustomer.phone,
      },
    });
    setEditMode(false);
    toast.success("Customer info updated!");
  };

  // Update the handleDeleteOrder function:
  const handleDeleteOrder = async () => {
    // Confirmation dialog
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await deleteOrder(selectedOrder._id);

      if (response.success) {
        // Remove from local state
        const updatedOrders = orders.filter(
          (order) => order._id !== selectedOrder._id
        );
        setOrders(updatedOrders);
        setViewOrderVisible(false);
        toast.success("Order deleted successfully!");
      } else {
        toast.error(response.message || "Failed to delete order");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      toast.error("Failed to delete order from database");
    }
  };

  // Filtered & sorted orders
  const filteredAndSortedOrders = orders
    .filter((order) =>
      filter === "all" ? true : order.order_status === filter
    )
    .filter((order) => {
      if (!searchQuery) return true;

      const searchLower = searchQuery.toLowerCase();
      const customerName =
        order.shipping_address?.fullName?.toLowerCase() || "";
      const customerEmail = order.shipping_address?.email?.toLowerCase() || "";
      const orderNumber = order.order_number?.toLowerCase() || "";
      const phone =
        order.shipping_address?.phone?.toLowerCase() ||
        order.user?.phone?.toLowerCase() ||
        "";

      return (
        orderNumber.includes(searchLower) ||
        customerName.includes(searchLower) ||
        customerEmail.includes(searchLower) ||
        phone.includes(searchLower)
      );
    })
    .filter((order) => {
      const rawDate = order.created_at || order.createdAt;
      if (!rawDate) return false;

      const orderDate = convertToBangladeshTime(rawDate);
      if (!orderDate) return false;

      const bangladeshNow = new Date(new Date().getTime() + 6 * 60 * 60 * 1000);
      bangladeshNow.setHours(0, 0, 0, 0);

      if (dateFilter === "today") {
        const orderDay = new Date(orderDate);
        orderDay.setHours(0, 0, 0, 0);
        return orderDay.getTime() === bangladeshNow.getTime();
      }

      if (
        dateFilter === "1day" ||
        dateFilter === "7days" ||
        dateFilter === "15days" ||
        dateFilter === "30days"
      ) {
        const range = getDateRange(dateFilter);
        if (!range) return true;
        return orderDate >= range.start && orderDate <= range.end;
      }

      if (dateFilter === "custom") {
        const start = startDate
          ? new Date(startDate + "T00:00:00+06:00")
          : null;
        const end = endDate ? new Date(endDate + "T23:59:59+06:00") : null;

        if (start && orderDate < start) return false;
        if (end && orderDate > end) return false;
        return true;
      }

      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "total":
          aValue = a.total_amount || 0;
          bValue = b.total_amount || 0;
          break;
        case "name":
          aValue = a.shipping_address?.fullName?.toLowerCase() || "";
          bValue = b.shipping_address?.fullName?.toLowerCase() || "";
          break;
        case "date":
        default:
          aValue = new Date(a.created_at || a.createdAt);
          bValue = new Date(b.created_at || b.createdAt);
          break;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const totalPages = Math.ceil(
    filteredAndSortedOrders.length / ORDERS_PER_PAGE
  );
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancel":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
        <head>
          <title>Order Details - ${selectedOrder?.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .print-header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Order Details</h1>
            <p>Order #: ${selectedOrder?.order_number}</p>
          </div>
          ${printContent}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, dateFilter, sortBy, sortDirection]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Orders Management
      </h1>
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Controls: Search, Filter, Sort, Refresh */}
      <div className="mb-4 sm:mb-6 bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm flex flex-col gap-3">
        {/* Search Bar */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Search by name, email, phone, or order ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancel">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-end">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-black text-white text-sm sm:text-base rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh Orders
          </button>
        </div>
      </div>

      {/* Orders Count */}
      <div className="mb-3 text-sm text-gray-600">
        Showing {paginatedOrders.length} of {filteredAndSortedOrders.length}{" "}
        orders
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="w-full text-sm sm:text-base">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 sm:p-3 text-left border-b">Order Info</th>
              <th className="p-2 sm:p-3 text-left border-b hidden sm:table-cell">
                Customer
              </th>
              <th className="p-2 sm:p-3 text-right border-b hidden md:table-cell">
                Total
              </th>
              <th className="p-2 sm:p-3 text-left border-b hidden lg:table-cell">
                Date (BD Time)
              </th>
              <th className="p-2 sm:p-3 text-center border-b">Status</th>
              <th className="p-2 sm:p-3 text-center border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No orders found matching your criteria
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-2 sm:p-3">
                    <div className="sm:hidden">
                      <div className="font-semibold text-blue-600">
                        {order.order_number}
                      </div>
                      <div className="text-xs text-gray-600">
                        {order.shipping_address?.fullName}
                      </div>
                      <div className="text-xs font-semibold">
                        {formatCurrency(order.total_amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatBangladeshDate(
                          order.created_at || order.createdAt
                        )}
                      </div>
                    </div>
                    <div className="hidden sm:block">{order.order_number}</div>
                  </td>

                  <td className="p-2 sm:p-3 hidden sm:table-cell">
                    <div>
                      <div className="font-medium">
                        {order.shipping_address?.fullName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {order.shipping_address?.email}
                      </div>
                    </div>
                  </td>

                  <td className="p-2 sm:p-3 text-right hidden md:table-cell font-semibold">
                    {formatCurrency(order.total_amount)}
                  </td>

                  <td className="p-2 sm:p-3 hidden lg:table-cell">
                    <div className="text-sm text-gray-600">
                      {formatBangladeshDate(
                        order.created_at || order.createdAt
                      )}
                    </div>
                  </td>

                  <td className="p-2 sm:p-3">
                    <select
                      value={order.order_status}
                      onChange={(e) =>
                        handleUpdateStatus(order._id, e.target.value)
                      }
                      className={`w-full text-xs sm:text-sm px-2 py-1 border rounded ${getStatusClass(
                        order.order_status
                      )} cursor-pointer`}
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancel">Cancel</option>
                    </select>
                  </td>

                  <td className="p-2 sm:p-3">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="px-2 py-1 bg-black text-white text-xs rounded hover:bg-gray-700 transition-colors"
                      >
                        View
                      </button>
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
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

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

      {/* View/Edit/Delete Modal */}
      {viewOrderVisible && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="text-lg sm:text-xl font-bold">
                Order Details - {selectedOrder.order_number}
              </h2>
              <button
                className="text-2xl font-bold text-gray-600 hover:text-black"
                onClick={() => setViewOrderVisible(false)}
              >
                &times;
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <div ref={printRef}>
                {/* Customer Info */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3 border-b pb-2">
                    Customer Information
                  </h3>
                  {editMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        value={editCustomer.fullName}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            fullName: e.target.value,
                          })
                        }
                        className="border px-3 py-2 rounded w-full"
                        placeholder="Full Name"
                      />
                      <input
                        value={editCustomer.email}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            email: e.target.value,
                          })
                        }
                        className="border px-3 py-2 rounded w-full"
                        placeholder="Email"
                      />
                      <input
                        value={editCustomer.phone}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            phone: e.target.value,
                          })
                        }
                        className="border px-3 py-2 rounded w-full"
                        placeholder="Phone"
                      />
                      <input
                        value={editCustomer.address}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            address: e.target.value,
                          })
                        }
                        className="border px-3 py-2 rounded w-full"
                        placeholder="Street Address"
                      />
                      <input
                        value={editCustomer.city}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            city: e.target.value,
                          })
                        }
                        className="border px-3 py-2 rounded w-full"
                        placeholder="City"
                      />
                      <input
                        value={editCustomer.state}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            state: e.target.value,
                          })
                        }
                        className="border px-3 py-2 rounded w-full"
                        placeholder="State"
                      />
                      <input
                        value={editCustomer.country}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            country: e.target.value,
                          })
                        }
                        className="border px-3 py-2 rounded w-full"
                        placeholder="Country"
                      />
                      <input
                        value={editCustomer.zipCode}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            zipCode: e.target.value,
                          })
                        }
                        className="border px-3 py-2 rounded w-full"
                        placeholder="ZIP Code"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Name:</strong>{" "}
                        {selectedOrder.shipping_address?.fullName}
                      </div>
                      <div>
                        <strong>Email:</strong>{" "}
                        {selectedOrder.shipping_address?.email}
                      </div>
                      <div>
                        <strong>Phone:</strong>{" "}
                        {selectedOrder.shipping_address?.phone ||
                          selectedOrder.user?.phone}
                      </div>
                      <div>
                        <strong>Address:</strong>{" "}
                        {selectedOrder.shipping_address?.street}
                      </div>
                      <div>
                        <strong>City:</strong>{" "}
                        {selectedOrder.shipping_address?.city}
                      </div>
                      <div>
                        <strong>State:</strong>{" "}
                        {selectedOrder.shipping_address?.state}
                      </div>
                      <div>
                        <strong>Country:</strong>{" "}
                        {selectedOrder.shipping_address?.country}
                      </div>
                      <div>
                        <strong>ZIP Code:</strong>{" "}
                        {selectedOrder.shipping_address?.zipCode}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3 border-b pb-2">
                    Order Summary
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border p-2 text-left">Book Name</th>
                          <th className="border p-2 text-center">Quantity</th>
                          <th className="border p-2 text-right">Price</th>
                          <th className="border p-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="border p-2">{getBookName(item)}</td>
                            <td className="border p-2 text-center">
                              {item.quantity}
                            </td>
                            <td className="border p-2 text-right">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="border p-2 text-right">
                              {formatCurrency(item.quantity * item.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 flex justify-between items-center border-t pt-3">
                    <div>
                      <strong>Payment Method:</strong>{" "}
                      {selectedOrder.payment_info?.method}
                      <br />
                      <strong>Order Date:</strong>{" "}
                      {formatBangladeshDate(
                        selectedOrder.created_at || selectedOrder.createdAt
                      )}
                    </div>
                    <div className="text-lg font-bold">
                      Grand Total: {formatCurrency(selectedOrder.total_amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                {editMode ? (
                  <button
                    onClick={handleSaveCustomer}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Edit Customer Info
                  </button>
                )}
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Print Order
                </button>
                <button
                  onClick={handleDeleteOrder}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete Order
                </button>
                <button
                  onClick={() => setViewOrderVisible(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
