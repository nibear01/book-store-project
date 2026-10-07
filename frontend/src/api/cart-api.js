// Simple Cart API client for backend integration
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

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

const variantQuery = (variant) => (variant ? `?variant=${encodeURIComponent(variant)}` : '');

export const cartAPI = {
    getCart: () => request('/cart', { method: 'GET' }),
    getCount: () => request('/cart/count', { method: 'GET' }),
    addItem: ({ bookId, quantity = 1, variant }) =>
        request('/cart/items', { method: 'POST', body: JSON.stringify({ bookId, quantity, variant }) }),
    // `variant` ("quality|side|size|color") picks one line when a book is in the cart with several print options
    updateItem: ({ bookId, variant, quantity }) =>
        request(`/cart/items/${bookId}${variantQuery(variant)}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    removeItem: ({ bookId, variant }) =>
        request(`/cart/items/${bookId}${variantQuery(variant)}`, { method: 'DELETE' }),
    clear: () => request('/cart', { method: 'DELETE' }),
};

export default cartAPI;
