const API_BASE_URL = 'http://localhost:5000/api';

const request = async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Books API error');
    return data;
};

export const booksAPI = {
    list: (paramsObj = {}) => {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(paramsObj)) if (v !== undefined) params.set(k, String(v));
        return request(`/books?${params.toString()}`);
    },
    featured: (limit) => request(`/books/featured${limit ? `?limit=${limit}` : ''}`),
    latest: (limit) => request(`/books/latest${limit ? `?limit=${limit}` : ''}`),
    trending: (paramsObj = {}) => {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(paramsObj)) if (v !== undefined) params.set(k, String(v));
        return request(`/books/trending?${params.toString()}`);
    },
    getBySlug: (slug) => request(`/books/${encodeURIComponent(slug)}`),
};

export default booksAPI;
