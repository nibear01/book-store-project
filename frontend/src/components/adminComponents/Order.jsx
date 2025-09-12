import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

// Mock data for demonstration (replace with real API calls)
const mockOrders = [
  {
    _id: '1',
    orderId: 'BK-2023-001',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890'
    },
    createdAt: new Date().toISOString(),
    items: [{ quantity: 2 }, { quantity: 1 }],
    totalAmount: 59.97,
    orderStatus: ORDER_STATUS.PENDING,
    paymentStatus: PAYMENT_STATUS.PENDING,
    trackingNumber: ''
  },
  {
    _id: '2',
    orderId: 'BK-2023-002',
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1987654321'
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    items: [{ quantity: 3 }],
    totalAmount: 42.50,
    orderStatus: ORDER_STATUS.CONFIRMED,
    paymentStatus: PAYMENT_STATUS.COMPLETED,
    trackingNumber: 'TRK123456789'
  },
  {
    _id: '3',
    orderId: 'BK-2023-003',
    shippingAddress: {
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.j@example.com',
      phone: '+1122334455'
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    items: [{ quantity: 1 }, { quantity: 1 }, { quantity: 2 }],
    totalAmount: 87.25,
    orderStatus: ORDER_STATUS.SHIPPED,
    paymentStatus: PAYMENT_STATUS.COMPLETED,
    trackingNumber: 'TRK987654321'
  }
];

// Status badge component
const StatusBadge = ({ status, type = 'order' }) => {
  const statusConfig = {
    order: {
      pending: { class: "bg-yellow-100 text-yellow-800", text: "Pending" },
      confirmed: { class: "bg-blue-100 text-blue-800", text: "Confirmed" },
      processing: { class: "bg-indigo-100 text-indigo-800", text: "Processing" },
      shipped: { class: "bg-purple-100 text-purple-800", text: "Shipped" },
      delivered: { class: "bg-green-100 text-green-800", text: "Delivered" },
      cancelled: { class: "bg-red-100 text-red-800", text: "Cancelled" }
    },
    payment: {
      pending: { class: "bg-yellow-100 text-yellow-800", text: "Pending" },
      processing: { class: "bg-blue-100 text-blue-800", text: "Processing" },
      completed: { class: "bg-green-100 text-green-800", text: "Completed" },
      failed: { class: "bg-red-100 text-red-800", text: "Failed" },
      refunded: { class: "bg-purple-100 text-purple-800", text: "Refunded" }
    }
  };

  const config = statusConfig[type][status] || { class: "bg-gray-100 text-gray-800", text: status };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.class}`}>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Update Order Status</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Order ID: <span className="font-medium">#{order?.orderId || "N/A"}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tracking number"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    { key: "all", label: "All Orders" },
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
          className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
            filter === key
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
                    <div className="text-xs text-gray-400 mt-1">
                      {order.shippingAddress?.email || "N/A"}
                    </div>
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
                  ${order.totalAmount?.toFixed(2) || "0.00"}
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
                    className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                  >
                    Manage
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
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Main component
const OrderManagement = () => {
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulate API call
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Filter orders based on selected filter
        if (filter === "all") {
          setOrders(mockOrders);
        } else {
          setOrders(mockOrders.filter(order => order.orderStatus === filter));
        }
      } catch (error) {
        toast.error("Failed to fetch orders");
        console.error("Fetch orders error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filter]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (statusUpdate) => {
    if (!selectedOrder) return;
    
    try {
      setIsUpdating(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would update the order via API and then refresh the list
      toast.success("Order updated successfully!");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Update order error:", err);
      toast.error("Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">Manage and track customer orders</p>
          </div>
          <button
            onClick={() => setLoading(true)}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <FilterButtons filter={filter} setFilter={setFilter} />

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
    </div>
  );
};

export default OrderManagement;
