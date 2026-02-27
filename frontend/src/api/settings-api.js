const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

const withAuth = (options = {}) => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return { ...options, headers };
};

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, withAuth(options));
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Settings API error');
  return data;
};

export const settingsAPI = {
  getPriceRange: () => request('/settings/price-range', { method: 'GET' }),
  updatePriceRange: (min, max) => request('/settings/price-range', { method: 'PUT', body: JSON.stringify({ min, max }) }),
  getDeliveryCost: () => request('/settings/delivery-cost', { method: 'GET' }),
  updateDeliveryCost: (insideDhaka, outsideDhaka) => request('/settings/delivery-cost', { method: 'PUT', body: JSON.stringify({ insideDhaka, outsideDhaka }) }),
};

export default settingsAPI;
