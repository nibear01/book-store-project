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
    onSale: (limit) => request(`/books/on-sale${limit ? `?limit=${limit}` : ''}`),
    mostViewed: (limit) => request(`/books/most-viewed${limit ? `?limit=${limit}` : ''}`),
    deals: (limit) => request(`/books/deals${limit ? `?limit=${limit}` : ''}`),
    getBySlug: (slug) => request(`/books/${encodeURIComponent(slug)}`),
    // Get books by category/genre
    getByCategory: (genre, limit = 6) => {
        const params = new URLSearchParams({ genre, limit: String(limit) });
        return request(`/books?${params.toString()}`);
    },
    // Get all available genres/categories
    getCategories: async () => {
        try {
            // Try API first
            const response = await request('/categories');
            return response.data || response.featured_categories || [];
        } catch (error) {
            console.warn('API categories failed, using fallback:', error.message);
            // Fallback to local JSON
            try {
                const response = await fetch('/category.json');
                const data = await response.json();
                return data.featured_categories || [];
            } catch (jsonError) {
                console.error('Both API and JSON fallback failed for categories:', jsonError);
                return [];
            }
        }
    },};

export default booksAPI;
