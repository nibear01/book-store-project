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
    if (!res.ok) throw new Error(data.message || 'Admin API error');
    return data;
};

export const adminUsersAPI = {
    list: ({ page = 1, limit = 10, status, isAdmin } = {}) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (status) params.set('status', status);
        if (typeof isAdmin === 'boolean') params.set('isAdmin', String(isAdmin));
        return request(`/users?${params.toString()}`, { method: 'GET' });
    },
    get: (id) => request(`/users/${id}`, { method: 'GET' }),
    update: (id, body) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
    changeRole: (id, isAdmin) => request(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ isAdmin }) }),
    changeStatus: (id, status) => request(`/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    changePassword: (id, password) => request(`/users/${id}/password`, { method: 'PUT', body: JSON.stringify({ password }) }),
};

export const adminBooksAPI = {
    list: (paramsObj = {}) => {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(paramsObj)) if (v !== undefined) params.set(k, String(v));
        return request(`/books?${params.toString()}`, { method: 'GET' });
    },
    getBySlug: (slug) => request(`/books/${encodeURIComponent(slug)}`, { method: 'GET' }),
    create: (payload) => request('/books', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    delete: (id, hard = false) => request(`/books/${id}?hard=${hard ? 'true' : 'false'}`, { method: 'DELETE' }),
    featured: (limit) => request(`/books/featured${limit ? `?limit=${limit}` : ''}`, { method: 'GET' }),
    latest: (limit) => request(`/books/latest${limit ? `?limit=${limit}` : ''}`, { method: 'GET' }),
    trending: (paramsObj = {}) => {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(paramsObj)) if (v !== undefined) params.set(k, String(v));
        return request(`/books/trending?${params.toString()}`, { method: 'GET' });
    },
};

export const adminOrdersAPI = {
    list: (paramsObj = {}) => {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(paramsObj)) if (v !== undefined) params.set(k, String(v));
        return request(`/orders/admin/all?${params.toString()}`, { method: 'GET' });
    },
    stats: (period) => request(`/orders/admin/stats${period ? `?period=${encodeURIComponent(period)}` : ''}`, { method: 'GET' }),
    updateOrderStatus: (id, body) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
    updatePaymentStatus: (id, payment_status) => request(`/orders/${id}/payment`, { method: 'PUT', body: JSON.stringify({ payment_status }) }),
};

export default { adminUsersAPI, adminBooksAPI, adminOrdersAPI };
