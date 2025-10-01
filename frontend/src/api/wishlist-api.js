const API_BASE_URL = "http://localhost:5000/api";

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
  const res = await fetch(
    `${API_BASE_URL}${endpoint}`,
    withAuthHeaders(options)
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Wishlist API error");
  return data;
};

export const wishlistAPI = {
  getWishlist: () => request("/wishlist", { method: "GET" }),
  getCount: () => request("/wishlist/count", { method: "GET" }),
  addItem: ({ bookId }) =>
    request("/wishlist/items", {
      method: "POST",
      body: JSON.stringify({ bookId }),
    }),
  removeItem: ({ bookId }) =>
    request(`/wishlist/items/${bookId}`, { method: "DELETE" }),
  clear: () => request("/wishlist", { method: "DELETE" }),
};

export default wishlistAPI;
