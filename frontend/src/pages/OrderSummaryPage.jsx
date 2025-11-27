import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getOrderById } from "../api/order-api";
import { toast } from "react-toastify";
import OrderSummarySkeleton from "../components/skeletons/OrderSummarySkeleton";
import { useTranslation } from "react-i18next";

const OrderSummaryPage = () => {
  const { t } = useTranslation('common');
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <OrderSummarySkeleton items={3} />;
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('orderSummary.orderNotFound')}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || t('orderSummary.orderNotFoundDesc')}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            {t('shop.continueShopping')}
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
    <>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 100%;
              padding: 20px;
              box-shadow: none;
              border: none;
            }
            .no-print {
              display: none !important;
            }
            .print-break {
              page-break-before: always;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .print-summary {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
          }
        `}
      </style>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Success Header */}
        <div className="text-center mb-8 no-print">
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
            {t('orderSummary.orderPlaced')}
          </h1>
          <p className="text-gray-600">
            {t('orderSummary.thankYou')}
          </p>
        </div>

        {/* Print Header - Only visible when printing */}
        <div className="print-header hidden print:block">
          <h1 className="text-2xl font-bold mb-2">{t('orderSummary.orderConfirmation')}</h1>
          <p className="text-lg">Order #{order.order_number}</p>
          <p className="text-gray-600">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden print-area">
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
              <div className="mt-2 sm:mt-0 flex items-center gap-3">
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
                {t('orderSummary.orderItems')}
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
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
                        style={{ display: item.book_cover ? "none" : "flex" }}
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
                        {item.book_title || "Book Title"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t('orders.quantity')}: {item.quantity}
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
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ৳{item.price.toFixed(2)} {t('orderSummary.each')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t('orderSummary.shippingAddress')}
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
                <p className="text-gray-600">
                  {order.shipping_address.country}
                </p>
                <p className="text-gray-600">{order.shipping_address.email}</p>
                {order.shipping_address.phone && (
                  <p className="text-gray-600">
                    {order.shipping_address.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t('orderSummary.paymentInformation')}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">
                  <span className="font-medium">{t('orderSummary.method')}:</span>{" "}
                  {order.payment_info.method}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">{t('orders.status')}:</span>{" "}
                  {order.payment_info.status}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-6 print-summary">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t('orderSummary.orderSummary')}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>
                    ৳{(order.subtotal_amount ?? order.total_amount).toFixed(2)}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount
                      {order.discount_label ? ` (${order.discount_label})` : ""}
                    </span>
                    <span>- ৳{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>৳{(order.shipping_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-800 border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>
                    ৳{(order.grand_total ?? order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center no-print">
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            {t('shop.continueShopping')}
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            {t('orderSummary.viewAllOrders')}
          </button>
          <button
            onClick={handlePrint}
            className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            {t('orderSummary.printOrder')}
          </button>
        </div>
      </div>
    </>
  );
};

export default OrderSummaryPage;
