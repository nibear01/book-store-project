import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserOrders } from "../api/order-api";
import { toast } from "react-toastify";
import UserOrdersSkeleton from "../components/skeletons/UserOrdersSkeleton";
import { useTranslation } from "react-i18next";

const UserOrdersPage = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUserOrders();
      if (data.success) {
        setOrders(data.data.reverse() || []);
      } else {
        setError(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancel: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleViewOrder = (orderId) => {
    navigate(`/order-summary/${orderId}`);
  };

  if (loading) {
    return <UserOrdersSkeleton cards={3} />;
  }

  if (error) {
    return (
      <div className=" bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('common:navbar.orders')}</h1>
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={fetchUserOrders}
              className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              {t('common:orders.tryAgainButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 py-8 rounded-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {t('common:navbar.orders')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('common:orders.viewOrderHistory')}
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('common:orders.noOrders')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('common:orders.noOrdersDesc')}
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              {t('common:orders.startShopping')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('common:orders.orderNumber', { number: order.order_number })}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t('common:orders.placedOn')} {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.order_status
                        )}`}
                      >
                        {t(`common:status.${order.order_status}`)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {item.book_cover ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL || ""}${
                                item.book_cover
                              }`}
                              alt={item.book_title}
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
                              display: item.book_cover ? "none" : "flex",
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
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.book_title || "Unknown Book"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {t('common:orders.quantity')}: {item.quantity}
                          </p>
                          {(() => {
                            const v = item?.variant || {
                              paperQuality: "economy",
                              printSide: "single",
                              paperSize: "A4",
                              colorMode: "bw",
                            };
                            return (
                              <div className="text-xs text-gray-600 mt-1">
                                POD: Quality {v.paperQuality || "-"}, Side{" "}
                                {v.printSide || "-"}, Size {v.paperSize || "-"},
                                Color {v.colorMode || "-"}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {t('common:currency')}{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">{t('common:orders.subtotal')}:</span> {t('common:currency')}
                        {(order.subtotal_amount ?? order.total_amount).toFixed(
                          2
                        )}
                      </p>
                      {order.discount_amount > 0 && (
                        <p className="text-green-600">
                          <span className="font-medium">{t('common:orders.discount')}:</span> -{t('common:currency')}
                          {order.discount_amount.toFixed(2)}{" "}
                          {order.discount_label && (
                            <span className="italic">
                              ({order.discount_label})
                            </span>
                          )}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">{t('common:orders.shipping')}:</span> {t('common:currency')}
                        {(order.shipping_amount || 0).toFixed(2)}
                      </p>
                      <p className="font-semibold">
                        <span className="font-medium">{t('common:orders.total')}:</span> {t('common:currency')}
                        {(order.grand_total ?? order.total_amount).toFixed(2)}
                      </p>
                      {order.shipping_address && (
                        <p className="mt-1">
                          <span className="font-medium">{t('common:orders.shippingTo')}:</span>{" "}
                          {order.shipping_address.city},{" "}
                          {order.shipping_address.state}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleViewOrder(order._id)}
                      className="mt-3 sm:mt-0 bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      {t('common:buttons.viewDetails')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Account Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/account")}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← {t('common:orders.backToAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOrdersPage;
