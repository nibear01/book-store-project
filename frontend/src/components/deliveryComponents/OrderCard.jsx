import React, { useState } from "react";
import StatusTimeline from "./statusTimeline";
import { FaCheckCircle, FaUserCheck, FaInfoCircle, FaMoneyCheckAlt, FaBoxOpen } from "react-icons/fa";
import { updateOrderStatus } from "@/api/order-api";

const allowedNextStatuses = {
  ORDER_CONFIRMED: ["CS_REVIEW"],
  CS_REVIEW: ["CS_HOLD_ADDRESS_INFO", "FINANCE_REVIEW"],
  CS_HOLD_ADDRESS_INFO: ["FINANCE_REVIEW"],
  FINANCE_REVIEW: ["DELIVERED"],
  DELIVERED: [],
};

const steps = [
  "ORDER_CONFIRMED",
  "CS_REVIEW",
  "CS_HOLD_ADDRESS_INFO",
  "FINANCE_REVIEW",
  "DELIVERED",
];

const statusStyles = {
  ORDER_CONFIRMED: { icon: <FaCheckCircle className="w-5 h-5 text-yellow-600" /> },
  CS_REVIEW: { icon: <FaUserCheck className="w-5 h-5 text-blue-600" /> },
  CS_HOLD_ADDRESS_INFO: { icon: <FaInfoCircle className="w-5 h-5 text-orange-600" /> },
  FINANCE_REVIEW: { icon: <FaMoneyCheckAlt className="w-5 h-5 text-purple-600" /> },
  DELIVERED: { icon: <FaBoxOpen className="w-5 h-5 text-green-600" /> },
};

const OrderCard = ({ order, refreshOrders }) => {
  const [status, setStatus] = useState(order.order_status);

  const handleUpdate = async () => {
    try {
      await updateOrderStatus(order._id, { status });
      refreshOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="border p-4 rounded shadow mb-4 bg-white">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          {statusStyles[order.order_status]?.icon} Order ID: {order.order_number}
        </h3>
        {status === "DELIVERED" && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
            <FaBoxOpen /> Delivered
          </span>
        )}
      </div>

      <p className="mt-2">Customer: {order.user.name}</p>
      <p className="mt-1 flex items-center gap-1">
        {statusStyles[status]?.icon} Status: <span className="font-semibold">{status.replaceAll("_", " ")}</span>
      </p>

      {/* Timeline */}
      <StatusTimeline steps={steps} currentStatus={status} statusStyles={statusStyles} />

      {/* Only allow update if current status is ORDER_CONFIRMED */}
      {status === "ORDER_CONFIRMED" && allowedNextStatuses[status]?.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded"
          >
            {allowedNextStatuses[status].map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center gap-1"
            onClick={handleUpdate}
          >
            <FaCheckCircle /> Update
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
