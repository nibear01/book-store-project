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
  if (!res.ok) throw new Error(data.message || 'Review API error');
  return data;
};

export const reviewAPI = {
  listByBook: ({ bookId, page, limit }) => {
    const qp = new URLSearchParams();
    qp.set('book', bookId);
    if (page) qp.set('page', String(page));
    if (limit) qp.set('limit', String(limit));
    return request(`/reviews?${qp.toString()}`);
  },
  create: ({ bookId, rating, comment }) =>
    request('/reviews', { method: 'POST', body: JSON.stringify({ book: bookId, rating, comment }) }),
  update: ({ id, rating, comment }) =>
    request(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify({ rating, comment }) }),
  remove: ({ id }) => request(`/reviews/${id}`, { method: 'DELETE' }),
};

export default reviewAPI;
