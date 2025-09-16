// Simple Cart API client for backend integration
const API_BASE_URL = 'http://localhost:5000/api';

const withAuthHeaders = (options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return { ...options, headers };
};

const request = async (endpoint, options = {}) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, withAuthHeaders(options));
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Cart API error');
    return data;
};

export const cartAPI = {
    getCart: () => request('/cart', { method: 'GET' }),
    getCount: () => request('/cart/count', { method: 'GET' }),
    addItem: ({ bookId, quantity = 1 }) =>
        request('/cart/items', { method: 'POST', body: JSON.stringify({ bookId, quantity }) }),
    updateItem: ({ bookId, quantity }) =>
        request(`/cart/items/${bookId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    removeItem: ({ bookId }) => request(`/cart/items/${bookId}`, { method: 'DELETE' }),
    clear: () => request('/cart', { method: 'DELETE' }),
};

export default cartAPI;
