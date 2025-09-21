import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getOrderById } from "../api/order-api";
import { toast } from "react-toastify";

const OrderSummaryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get order ID from location state or URL params
  const orderId = location.state?.orderId || location.pathname.split("/").pop();

  useEffect(() => {
    if (!orderId) {
      toast.error("No order found");
      navigate("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        setOrder(orderData.data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError("Failed to load order details");
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The order you are looking for could not be found."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-6 py-3 rounded-[2px] hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Order Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Order #{order.order_number}
              </h2>
              <p className="text-sm text-gray-600">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="mt-2 sm:mt-0">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.order_status
                )}`}
              >
                {order.order_status.charAt(0).toUpperCase() +
                  order.order_status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Order Items
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {item.book?.image ? (
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL || ""}${
                          item.book.image
                        }`}
                        alt={item.book.title}
                        className="h-16 w-12 object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center"
                      style={{
                        display: item.book?.image ? "none" : "flex",
                      }}
                    >
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {item.book?.title || "Book Title"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Shipping Address
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-800">
                {order.shipping_address.fullName}
              </p>
              <p className="text-gray-600">{order.shipping_address.street}</p>
              <p className="text-gray-600">
                {order.shipping_address.city}, {order.shipping_address.state}{" "}
                {order.shipping_address.zipCode}
              </p>
              <p className="text-gray-600">{order.shipping_address.country}</p>
              <p className="text-gray-600">{order.shipping_address.email}</p>
              {order.shipping_address.phone && (
                <p className="text-gray-600">{order.shipping_address.phone}</p>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">
                <span className="font-medium">Method:</span>{" "}
                {order.payment_info.method}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Status:</span>{" "}
                {order.payment_info.status}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>$5.00</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-800 border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>${(order.total_amount + 5).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate("/")}
          className="bg-black text-white px-8 py-3 rounded-[2px] hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => navigate("/orders")}
          className="border border-gray-300 text-gray-700 px-8 py-3 rounded-[2px] hover:bg-gray-50 transition-colors"
        >
          View All Orders
        </button>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
