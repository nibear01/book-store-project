import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "../../api/order-api";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ORDERS_PER_PAGE = 20;
  const token = localStorage.getItem("token"); // admin token

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getAllOrders();
        if (data.success) setOrders(data.data || []);
        else {
          alert(data.message || "Failed to fetch orders");
          setOrders([]);
        }
      } catch (err) {
        console.error(err);
        alert("Server error. Please try again later.");
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // Update order status via API
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await updateOrderStatus(id, { status: newStatus });
      if (response.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id ? { ...order, order_status: newStatus } : order
          )
        );
        alert("Order status updated successfully!");
      } else {
        alert(response.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  // Filtering orders
  const filteredOrders = orders
    .filter((order) =>
      filter === "all" ? true : order.order_status === filter
    )
    .filter((order) => {
      const customerName =
        order.shipping_address?.fullName?.toLowerCase() || "";
      return (
        order.order_number
          ?.toLowerCase()
          .includes(searchQuery?.toLowerCase()) ||
        customerName.includes(searchQuery?.toLowerCase())
      );
    })
    .filter((order) => {
      const orderDate = new Date(order.created_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateFilter === "today")
        return orderDate.setHours(0, 0, 0, 0) === today.getTime();
      if (dateFilter === "before") return orderDate < today;
      if (dateFilter === "custom") {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && orderDate < start) return false;
        if (end && orderDate > end) return false;
        return true;
      }
      return true;
    });

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  useEffect(
    () => setCurrentPage(1),
    [filter, searchQuery, dateFilter, startDate, endDate]
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400 text-white";
      case "shipped":
        return "bg-blue-500 text-white";
      case "delivered":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <button
          onClick={() => window.location.reload()}
          className="text-black px-4 py-2 rounded-lg shadow transition"
        >
          Refresh Orders
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-300 transition"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>

        <input
          type="text"
          placeholder="Search by Order ID / Customer"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm flex-1 min-w-[200px] focus:ring-2 focus:ring-indigo-300 transition"
        />

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-300 transition"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="before">Before Today</option>
          <option value="custom">Custom Range</option>
        </select>

        {dateFilter === "custom" && (
          <div className="flex gap-2 w-full md:w-auto flex-wrap">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded-lg shadow-sm w-full md:w-auto focus:ring-2 focus:ring-indigo-300 transition"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded-lg shadow-sm w-full md:w-auto focus:ring-2 focus:ring-indigo-300 transition"
            />
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full border text-sm rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Customer</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Update</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr
                  key={order._id}
                  className="text-center hover:bg-gray-50 transition"
                >
                  <td className="p-2 border">{order.order_number}</td>
                  <td className="p-2 border">
                    {order.shipping_address?.fullName}
                  </td>
                  <td className="p-2 border">
                    {order.shipping_address?.email}
                  </td>
                  <td className="p-2 border">
                    ${order.total_amount?.toFixed(2)}
                  </td>
                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 rounded-full ${getStatusClass(
                        order.order_status
                      )}`}
                    >
                      {order.order_status?.charAt(0)?.toUpperCase() +
                        order.order_status?.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 border">
                    {new Date(order.created_at)?.toLocaleString()}
                  </td>
                  <td className="p-2 border">
                    <select
                      value={order.order_status}
                      onChange={(e) =>
                        handleUpdateStatus(order?._id, e.target.value)
                      }
                      className="px-2 py-1 border rounded-lg focus:ring-2 focus:ring-indigo-300 transition"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading orders...</div>
        ) : paginatedOrders.length === 0 ? (
          <div className="text-center text-gray-500">No orders found.</div>
        ) : (
          paginatedOrders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition flex flex-col gap-2"
            >
              <div>
                <strong>Order ID:</strong> {order?.order_number}
              </div>
              <div>
                <strong>Customer:</strong> {order?.shipping_address?.fullName}
              </div>
              <div>
                <strong>Email:</strong> {order?.shipping_address?.email}
              </div>
              <div>
                <strong>Total:</strong> ${order?.total_amount?.toFixed(2)}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span
                  className={`ml-2 px-2 py-1 rounded-full ${getStatusClass(
                    order?.order_status
                  )}`}
                >
                  {order.order_status?.charAt(0)?.toUpperCase() +
                    order?.order_status?.slice(1)}
                </span>
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {new Date(order?.created_at)?.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6 flex-wrap">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded-lg border transition ${
              currentPage === i + 1
                ? "bg-blue-500 text-white shadow"
                : "bg-white text-gray-700 hover:bg-blue-100"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
