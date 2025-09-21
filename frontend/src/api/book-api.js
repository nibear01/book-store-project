const API_BASE_URL = 'http://localhost:5000/api';
import { mockBookService } from '../services/mockBookService';

const request = async (endpoint) => {
    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Books API error');
        return data;
    } catch (error) {
        console.log('Backend API error, using mock data instead:', error.message);
        // Extract endpoint type and parameters
        if (endpoint.includes('/books')) {
            const path = endpoint.split('/books')[1] || '/';
            let limit = 10;
            
            // Extract limit parameter if present
            if (endpoint.includes('limit=')) {
                const limitMatch = endpoint.match(/limit=(\d+)/);
                if (limitMatch && limitMatch[1]) {
                    limit = parseInt(limitMatch[1], 10);
                }
            }
            
            // Handle different book endpoints
            if (path === '/' || path === '') {
                return { data: await mockBookService.getBooks(limit) };
            } else if (path.includes('/featured')) {
                return { data: await mockBookService.getFeaturedBooks(limit) };
            } else if (path.includes('/latest')) {
                return { data: await mockBookService.getLatestBooks(limit) };
            } else if (path.includes('/trending')) {
                return { data: await mockBookService.getTrendingBooks(limit) };
            } else if (path.includes('/deals')) {
                return { data: await mockBookService.getDealsOfWeek(limit) };
            } else {
                // Handle individual book by slug
                const slug = path.substring(1); // Remove leading slash
                return { data: await mockBookService.getBookBySlug(slug) };
            }
        }
        
        throw error; // Re-throw if we can't handle this endpoint
    }
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
