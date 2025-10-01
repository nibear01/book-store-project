// Simple Author API client for backend integration
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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Author API error");
  return data;
};

export const authorAPI = {
  /** List authors (supports optional pagination / search) */
  list: ({ page = 1, limit = 20, sort = "+name", q, letter } = {}) =>
    request(
      `/authors?page=${page}&limit=${limit}&sort=${sort}${
        q ? `&q=${encodeURIComponent(q)}` : ""
      }${letter ? `&letter=${letter}` : ""}`,
      {
        method: "GET",
      }
    ),

  /** Get single author by id or slug */
  get: (idOrSlug) => request(`/authors/${idOrSlug}`, { method: "GET" }),

  /** Create new author */
  create: (payload) =>
    request("/authors", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** Update author by id/slug */
  update: (idOrSlug, payload) =>
    request(`/authors/${idOrSlug}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  /** Delete author */
  remove: (idOrSlug) =>
    request(`/authors/${idOrSlug}`, {
      method: "DELETE",
    }),

  /** Upload or replace photo */
  uploadPhoto: (idOrSlug, file) => {
    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("photo", file);
    return fetch(`${API_BASE_URL}/authors/${idOrSlug}/photo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Author API error");
      return data;
    });
  },
};

export default authorAPI;
