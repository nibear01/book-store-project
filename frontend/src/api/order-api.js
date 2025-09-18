// src/api/order-api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'; // Use .env for base URL

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Order API functions
export const createOrder = (orderData) => api.post('/orders', orderData).then(res => res.data);
export const getUserOrders = () => api.get('/orders/my-orders').then(res => res.data);
export const getAllOrders = (params) => api.get('/orders', { params }).then(res => res.data); // For admin
export const getOrderById = (id) => api.get(`/orders/${id}`).then(res => res.data);
export const updateOrderStatus = (id, statusData) => api.put(`/orders/${id}/status`, statusData).then(res => res.data);
export const importOrdersFromCSV = (formData) => api.post('/orders/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);
