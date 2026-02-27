// Simple AuthorRequest API client
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

const withAuthHeaders = (options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return { ...options, headers };
};

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, withAuthHeaders(options));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "AuthorRequest API error");
  return data;
};

export const authorRequestAPI = {
  // List requests with optional filters
  list: async ({ status, page = 1, limit = 50, search, sort } = {}) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    const res = await request(`/author-requests?${params.toString()}`, { method: "GET" });
    // Normalize array
    return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  },

  // Update status of a request
  updateStatus: async (id, nextStatus) => {
    const res = await request(`/author-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });
    return res?.data || res;
  },

  // Convert an author request into an Author and delete the request
  convert: async (id) => {
    const res = await request(`/author-requests/${id}/convert`, {
      method: "POST",
    });
    return res?.data || res;
  },

  remove: async (id) => {
    const res = await request(`/author-requests/${id}`, { method: "DELETE" });
    return res?.data || res;
  },
};

export default authorRequestAPI;
