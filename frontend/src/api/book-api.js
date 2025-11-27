// Use VITE_BACKEND_URL if available; fallback to localhost
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL)
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
    const { method = 'GET', body, headers } = options;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: body instanceof FormData
          ? (headers || undefined) // let browser set multipart boundary
          : { 'Content-Type': 'application/json', ...(headers || {}) },
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
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
    // Total books count (and active count)
    count: () => request('/books/count').then((res) => {
        // backend returns { success, data: { total, active } }
        if (res?.data && typeof res.data.total === 'number') return res.data;
        // fallback if structure differs
        if (typeof res.total === 'number') return { total: res.total, active: res.active ?? res.total };
        return { total: 0, active: 0 };
    }),
    featured: (limit) => request(`/books/featured${limit ? `?limit=${limit}` : ''}`),
    latest: (limit) => request(`/books/latest${limit ? `?limit=${limit}` : ''}`),
    trending: (paramsObj = {}) => {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(paramsObj)) if (v !== undefined) params.set(k, String(v));
        return request(`/books/trending?${params.toString()}`);
    },
    getBySlug: (slug) => request(`/books/${encodeURIComponent(slug)}`),

    // New: one-zip bulk import (books.csv + images/pdfs in folders)
    bulkImportZip: (archiveOrFormData, { keyField = 'external_id', dryRun = false, updateIfExists = true, token } = {}) => {
        const form = archiveOrFormData instanceof FormData ? archiveOrFormData : new FormData();
        if (!(archiveOrFormData instanceof FormData)) form.append('archive', archiveOrFormData);
        form.set('keyField', keyField);
        form.set('dryRun', String(dryRun));
        form.set('updateIfExists', String(updateIfExists));
        return request(`/books/bulk-import`, {
            method: 'POST',
            body: form,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
    },

    // New: assets-only bulk upload (orderless; attach by filename key)
    bulkUploadAssets: (filesOrFormData, { keyField = 'external_id', dryRun = false, token } = {}) => {
        const form = filesOrFormData instanceof FormData ? filesOrFormData : new FormData();
        if (!(filesOrFormData instanceof FormData)) {
            // Accept FileList or File[]
            const list = Array.from(filesOrFormData || []);
            for (const f of list) form.append('assets[]', f);
        }
        form.set('keyField', keyField);
        form.set('dryRun', String(dryRun));
        return request(`/books/assets/bulk`, {
            method: 'POST',
            body: form,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
    },
};

// Export helper function for easy usage
export const getBooks = (params) => booksAPI.list(params);

export default booksAPI;
