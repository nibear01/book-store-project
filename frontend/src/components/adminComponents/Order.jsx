import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../Store/Auth';

// Status constants for maintainability
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Custom hook for order data management
const useOrders = (url, filter) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      let apiUrl = `${url}/api/orders/admin/allorders`;
      if (filter !== "all") {
        apiUrl += `?status=${filter}`;
      }

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        if (response.status === 403) {
          throw new Error("Admin access required.");
        }
        if (response.status === 404) {
          throw new Error("Orders endpoint not found.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      const ordersData = data.orders || data.data || [];
      setOrders(ordersData);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.message);
      toast.error(err.message || "Failed to fetch orders", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  }, [url, filter]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${url}/api/orders/test`);
        if (!response.ok) {
          throw new Error(`Test failed: ${response.status}`);
        }
        fetchOrders();
      } catch (err) {
        console.error("Connection test failed:", err);
        setError("Cannot connect to server. Make sure backend is running.");
        toast.error("Cannot connect to server. Make sure backend is running.", {
          position: "top-right",
        });
        setLoading(false);
      }
    };

    testConnection();
  }, [url, fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
};

// Status badge component
const StatusBadge = ({ status, type = 'order' }) => {
  const statusConfig = {
    order: {
      pending: { class: "bg-yellow-100 text-yellow-800", text: "Pending" },
      confirmed: { class: "bg-emerald-100 text-emerald-800", text: "Confirmed" },
      processing: { class: "bg-indigo-100 text-indigo-800", text: "Processing" },
      shipped: { class: "bg-purple-100 text-purple-800", text: "Shipped" },
      delivered: { class: "bg-green-100 text-green-800", text: "Delivered" },
      cancelled: { class: "bg-red-100 text-red-800", text: "Cancelled" }
    },
    payment: {
      pending: { class: "bg-yellow-100 text-yellow-800", text: "Pending" },
      processing: { class: "bg-emerald-100 text-emerald-800", text: "Processing" },
      completed: { class: "bg-green-100 text-green-800", text: "Completed" },
      failed: { class: "bg-red-100 text-red-800", text: "Failed" },
      refunded: { class: "bg-purple-100 text-purple-800", text: "Refunded" }
    }
  };

  const config = statusConfig[type][status] || { class: "bg-gray-100 text-gray-800", text: status };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
      {config.text}
    </span>
  );
};

// Modal component
const StatusModal = ({ 
  isOpen, 
  onClose, 
  order, 
  onUpdate, 
  isLoading 
}) => {
  const [statusUpdate, setStatusUpdate] = useState({
    orderStatus: "",
    paymentStatus: "",
    trackingNumber: "",
  });

  useEffect(() => {
    if (order) {
      setStatusUpdate({
        orderStatus: order.orderStatus || "",
        paymentStatus: order.paymentStatus || "",
        trackingNumber: order.trackingNumber || "",
      });
    }
  }, [order]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(statusUpdate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>
        <p className="text-gray-600 mb-4">
          Order ID: #{order?.orderId || "N/A"}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Order Status
            </label>
            <select
              value={statusUpdate.orderStatus}
              onChange={(e) =>
                setStatusUpdate(prev => ({
                  ...prev,
                  orderStatus: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Select Status</option>
              {Object.entries(ORDER_STATUS).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Payment Status
            </label>
            <select
              value={statusUpdate.paymentStatus}
              onChange={(e) =>
                setStatusUpdate(prev => ({
                  ...prev,
                  paymentStatus: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Select Status</option>
              {Object.entries(PAYMENT_STATUS).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Tracking Number
            </label>
            <input
              type="text"
              value={statusUpdate.trackingNumber}
              onChange={(e) =>
                setStatusUpdate(prev => ({
                  ...prev,
                  trackingNumber: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter tracking number"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition-all"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-500 transition-all flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Filter buttons component
const FilterButtons = ({ filter, setFilter }) => {
  const filters = [
    { key: "all", label: "All" },
    { key: ORDER_STATUS.PENDING, label: "Pending" },
    { key: ORDER_STATUS.CONFIRMED, label: "Confirmed" },
    { key: ORDER_STATUS.PROCESSING, label: "Processing" },
    { key: ORDER_STATUS.SHIPPED, label: "Shipped" },
    { key: ORDER_STATUS.DELIVERED, label: "Delivered" },
    { key: ORDER_STATUS.CANCELLED, label: "Cancelled" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setFilter(key)}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === key
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

// Order table component
const OrderTable = ({ orders, onSelectOrder }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
        <p className="mt-1 text-sm text-gray-500">Try changing your filter criteria</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Order ID",
                "Customer",
                "Date",
                "Items",
                "Total",
                "Order Status",
                "Payment Status",
                "Actions",
              ].map((head) => (
                <th
                  key={head}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  #{order.orderId || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>
                    <div className="font-medium">
                      {order.shippingAddress?.firstName || "N/A"}{" "}
                      {order.shippingAddress?.lastName || ""}
                    </div>
                    <div>{order.shippingAddress?.email || "N/A"}</div>
                    <div className="text-xs text-gray-400">
                      {order.shippingAddress?.phone || "No phone"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {order.items?.reduce(
                    (total, item) => total + (item.quantity || 0),
                    0
                  ) || 0}{" "}
                  items
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Tk {order.totalAmount?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.orderStatus} type="order" />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => onSelectOrder(order)}
                    className="text-emerald-500 hover:text-emerald-600 transition-colors"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
  </div>
);

// Main component
const OrderManagement = () => {
  const { url } = useAuth();
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { orders, loading, error, refetch } = useOrders(url, filter);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (statusUpdate) => {
    if (!selectedOrder) return;
    
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${url}/api/orders/admin/${selectedOrder._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(statusUpdate),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update order");
      }

      await refetch();
      toast.success("Order updated successfully!", { position: "top-right" });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Update order error:", err);
      toast.error(err.message || "Failed to update order", {
        position: "top-right",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        <button
          onClick={refetch}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
          disabled={loading}
        >
          <svg className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <FilterButtons filter={filter} setFilter={setFilter} />

      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <OrderTable orders={orders} onSelectOrder={handleSelectOrder} />
      )}

      <StatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onUpdate={handleUpdateStatus}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default OrderManagement;
