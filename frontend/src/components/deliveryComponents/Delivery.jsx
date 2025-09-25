import React, { useEffect, useState } from "react";
import { getAllOrders} from "@/api/order-api";
import OrderCard from "./OrderCard";

const Delivery = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">All Orders</h1>
      {orders.length > 0 ? (
        orders.map((order) => (
          <OrderCard key={order._id} order={order} refreshOrders={loadOrders} />
        ))
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
};

export default Delivery;
