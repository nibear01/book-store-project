const API_BASE_URL = 'http://localhost:5000/api';

const baseHeaders = () => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...baseHeaders(),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Categories API error');
  return data;
};

export const categoryAPI = {
  list: (paramsObj = {}) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(paramsObj)) if (v !== undefined) params.set(k, String(v));
    const qs = params.toString();
    return request(`/categories${qs ? `?${qs}` : ''}`);
  },
  getBySlug: (slug) => request(`/categories/${encodeURIComponent(slug)}`),
  create: (payload) =>
    request(`/categories`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    request(`/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  remove: (id, hard = true) =>
    request(`/categories/${encodeURIComponent(id)}?hard=${hard}`, {
      method: 'DELETE',
    }),
};

export default categoryAPI;
