// src/api/affiliate-api.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://192.168.0.104:5000'}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token (if needed)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Validate promo code (public endpoint)
export const validatePromoCode = (promoCode) =>
  api
    .post("/affiliates/validate-promo", { promo_code: promoCode })
    .then((res) => res.data)
    .catch((error) => {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    });
