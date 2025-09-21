/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getAllOrders, updateOrderStatus } from "../../api/order-api";

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
  });

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const ORDERS_PER_PAGE = 20;
  const token = localStorage.getItem("token");
  const printRef = useRef();

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getAllOrders();
        console.log(data);
        if (data.success) setOrders(data.data || []);
        else setOrders([]);
      } catch (err) {
        console.error(err);
        setOrders([]);
        toast.error("Failed to fetch orders");
      }
      setLoading(false);
    };
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
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setEditCustomer({
      fullName: order.shipping_address?.fullName || "",
      email: order.shipping_address?.email || "",
      address: order.shipping_address?.address || "",
    });
    setViewOrderVisible(true);
    setEditMode(false);
  };

  // Save customer edits
  const handleSaveCustomer = () => {
    const updatedOrders = orders.map((order) =>
      order._id === selectedOrder._id
        ? { ...order, shipping_address: { ...editCustomer } }
        : order
    );
    setOrders(updatedOrders);
    setSelectedOrder({
      ...selectedOrder,
      shipping_address: { ...editCustomer },
    });
    setEditMode(false);
    toast.success("Customer info updated!");
  };

  // Delete order
  const handleDeleteCustomer = () => {
    const updatedOrders = orders.filter(
      (order) => order._id !== selectedOrder._id
    );
    setOrders(updatedOrders);
    setViewOrderVisible(false);
    toast.success("Order deleted!");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  // Filtered & paginated orders
  const filteredOrders = orders
    .filter((order) =>
      filter === "all" ? true : order.order_status === filter
    )
    .filter((order) => {
      const customerName =
        order.shipping_address?.fullName?.toLowerCase() || "";
      return (
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerName.includes(searchQuery.toLowerCase())
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

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400 text-white";
      case "shipped":
        return "bg-blue-500 text-white";
      case "delivered":
        return "bg-green-500 text-white";
      case "cancel":
        return "bg-red-500 text-white";  
      default:
        return "bg-gray-300 text-black";
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
        <head><title>Order Details</title></head>
        <body>${printContent}</body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm rounded-[2px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Customer</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Action</th>
              <th className="p-3 border">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4 text-center">
                  No orders found
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order._id} className="text-center hover:bg-gray-50">
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
                      {order.order_status?.charAt(0).toUpperCase() +
                        order.order_status?.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 border">
                    {formatDate(order.created_at || order.createdAt)}
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="px-3 py-1 bg-black text-white rounded"
                    >
                      View
                    </button>
                  </td>
                  <td className="p-2 border">
                    <select
                      value={order.order_status}
                      onChange={(e) =>
                        handleUpdateStatus(order._id, e.target.value)
                      }
                      className="px-2 py-1 border rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancel">Cancel</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center gap-2 mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={currentPage <= 1}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <p
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={` ${
              currentPage === i + 1 ? " text-black" : "bg-white text-gray-700"
            }`}
          >
            page {i + 1} of {i + 1}
          </p>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>

      {/* View/Edit/Delete Modal */}
      {viewOrderVisible && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center  p-4">
          <div className="bg-white w-full max-w-xl md:max-w-2xl rounded-lg p-6 overflow-y-auto max-h-[90vh] relative">
            <button
              className="absolute top-2 right-2 text-lg font-bold text-gray-600 hover:text-black"
              onClick={() => setViewOrderVisible(false)}
            >
              &times;
            </button>

            <div ref={printRef}>
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-center md:text-left">
                Order Details
              </h2>

              {/* Customer Info */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Customer Info:</h3>
                {editMode ? (
                  <div className="flex flex-col gap-2">
                    <input
                      value={editCustomer.fullName}
                      onChange={(e) =>
                        setEditCustomer({
                          ...editCustomer,
                          fullName: e.target.value,
                        })
                      }
                      className="border px-2 py-1 rounded w-full"
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
                      className="border px-2 py-1 rounded w-full"
                      placeholder="Email"
                    />
                    <input
                      value={editCustomer.address}
                      onChange={(e) =>
                        setEditCustomer({
                          ...editCustomer,
                          address: e.target.value,
                        })
                      }
                      className="border px-2 py-1 rounded w-full"
                      placeholder="Address"
                    />
                    <input
                      value={editCustomer.phone || ""}
                      onChange={(e) =>
                        setEditCustomer({
                          ...editCustomer,
                          phone: e.target.value,
                        })
                      }
                      className="border px-2 py-1 rounded w-full"
                      placeholder="Phone"
                    />
                  </div>
                ) : (
                  <div className="text-sm md:text-base space-y-1">
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {selectedOrder.shipping_address?.fullName}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {selectedOrder.shipping_address?.email}
                    </p>
                    <p>
                      <span className="font-semibold">Address:</span>{" "}
                      {selectedOrder.shipping_address?.address}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span>{" "}
                      {selectedOrder.shipping_address?.phone || "-"}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">Order Summary:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border text-sm md:text-base">
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
                          <td className="border p-2">{item.title}</td>
                          <td className="border p-2 text-center">
                            {item.quantity}
                          </td>
                          <td className="border p-2 text-right">
                            ${item.price?.toFixed(2)}
                          </td>
                          <td className="border p-2 text-right">
                            ${(item.quantity * item.price)?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 font-semibold text-right">
                  Grand Total: ${selectedOrder.total_amount?.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col md:flex-row justify-end gap-2 mt-4">
              {editMode ? (
                <button
                  onClick={handleSaveCustomer}
                  className="px-4 py-2 bg-green-500 text-white rounded w-full md:w-auto"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded w-full md:w-auto"
                >
                  Edit
                </button>
              )}
              <button
                onClick={handleDeleteCustomer}
                className="px-4 py-2 bg-red-500 text-white rounded w-full md:w-auto"
              >
                Delete
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-800 text-white rounded w-full md:w-auto"
              >
                Print
              </button>
              <button
                onClick={() => setViewOrderVisible(false)}
                className="px-4 py-2 bg-gray-300 rounded w-full md:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
