// src/context/OrderContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createOrder as apiCreateOrder, getUserOrders as apiGetUserOrders } from '../api/order-api';
import { useAuth } from './AuthContext'; // Assuming AuthContext exists

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get user from AuthContext

  // Example: Create an order
  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const newOrder = await apiCreateOrder(orderData);
      setOrders(prevOrders => [newOrder, ...prevOrders]); // Add to top of list
      return newOrder; // Return the created order
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
      throw err; // Re-throw for component handling
    } finally {
      setLoading(false);
    }
  };

  // Example: Fetch user's orders
  const getUserOrders = async () => {
    if (!user) return; // Don't fetch if not logged in
    setLoading(true);
    setError(null);
    try {
      const userOrders = await apiGetUserOrders();
      setOrders(userOrders);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Add other context functions like addToCart, removeFromCart if needed for checkout

  useEffect(() => {
    // Optionally auto-fetch user orders on login/context mount
    // getUserOrders();
  }, [user]); // Re-fetch if user changes

  return (
    <OrderContext.Provider value={{ orders, loading, error, createOrder, getUserOrders, setOrders }}>
      {children}
    </OrderContext.Provider>
  );
};
