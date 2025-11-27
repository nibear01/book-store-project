import React, { useRef } from "react";
import { formatBangladeshDate, formatCurrency, getBookName } from "./hooks.js";
import { handlePrint } from "./handlePrint.js";

export default function OrderDetailModal({
  visible,
  order,
  editMode,
  setEditMode,
  editCustomer,
  setEditCustomer,
  onSaveCustomer,
  onDelete,
  onClose,
  bookNames,
}) {
  const printRef = useRef();
  if (!visible || !order) return null;

  const handleSave = () => onSaveCustomer();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg sm:text-xl font-bold" name="order-modal-title">
            Order Details - {order.order_number}
          </h2>
          <button
            className="text-2xl font-bold text-gray-600 hover:text-black"
            onClick={onClose}
            name="order-modal-close-btn"
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
                      setEditCustomer({ ...editCustomer, city: e.target.value })
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
                    <strong>Name:</strong> {order.shipping_address?.fullName}
                  </div>
                  <div>
                    <strong>Email:</strong> {order.shipping_address?.email}
                  </div>
                  <div>
                    <strong>Phone:</strong>{" "}
                    {order.shipping_address?.phone || order.user?.phone}
                  </div>
                  <div>
                    <strong>Address:</strong> {order.shipping_address?.street}
                  </div>
                  <div>
                    <strong>City:</strong> {order.shipping_address?.city}
                  </div>
                  <div>
                    <strong>State:</strong> {order.shipping_address?.state}
                  </div>
                  <div>
                    <strong>Country:</strong> {order.shipping_address?.country}
                  </div>
                  <div>
                    <strong>Postal Code:</strong>{" "}
                    {order.shipping_address?.zipCode}
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
                    {order.items?.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <tr>
                          <td className="border p-2">
                            {getBookName(item, bookNames)}
                          </td>
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
                        {item?.variant && (
                          <tr>
                            <td className="border px-2 pb-2 pt-0 text-xs text-gray-600" colSpan={4}>
                              POD: Quality {item.variant.paperQuality || "-"}, Side {item.variant.printSide || "-"}, Size {item.variant.paperSize || "-"}, Color {item.variant.colorMode || "-"}
                              {item?.pricing && (item.pricing.contentPrice != null || item.pricing.printCost != null || item.pricing.margin != null) && (
                                <span className="ml-2">
                                  | Breakdown:
                                  {item.pricing.contentPrice != null && ` Content ${formatCurrency(item.pricing.contentPrice)}`}
                                  {item.pricing.printCost != null && ` + Print ${formatCurrency(item.pricing.printCost)}`}
                                  {item.pricing.margin != null && ` + Margin ${formatCurrency(item.pricing.margin)}`}
                                  {item.pricing.finalPrice != null && ` = ${formatCurrency(item.pricing.finalPrice)}`}
                                </span>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 text-sm">
                <div className="space-y-1">
                  <div>
                    <strong>Payment Method:</strong>{" "}
                    {order.payment_info?.method}
                  </div>
                  <div>
                    <strong>Order Date:</strong>{" "}
                    {formatBangladeshDate(order.created_at || order.createdAt)}
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="text-green-600">
                      <strong>Discount Applied:</strong>{" "}
                      {formatCurrency(order.discount_amount)}{" "}
                      {order.discount_label && (
                        <span className="italic">({order.discount_label})</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-1 md:text-right">
                  <div>
                    <span className="font-medium">Subtotal:</span>{" "}
                    {formatCurrency(
                      order.subtotal_amount ?? order.total_amount
                    )}
                  </div>
                  {order.discount_amount > 0 && (
                    <div>
                      <span className="font-medium">Discount:</span> -
                      {formatCurrency(order.discount_amount)}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Shipping:</span>{" "}
                    {formatCurrency(order.shipping_amount || 0)}
                  </div>
                  <div className="text-base font-bold pt-1 border-t mt-2">
                    Grand Total:{" "}
                    {formatCurrency(order.grand_total ?? order.total_amount)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t p-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            {editMode ? (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                name="order-modal-save-btn"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                name="order-modal-edit-btn"
              >
                Edit Customer Info
              </button>
            )}
            <button
              onClick={() => handlePrint(printRef, order)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              name="order-modal-print-btn"
            >
              Print Order
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              name="order-modal-delete-btn"
            >
              Delete Order
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
              name="order-modal-close-footer-btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
