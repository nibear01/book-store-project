// Simple Author API client for backend integration
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://192.168.0.104:5000'}/api`;

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
  list: ({ page = 1, limit = 20, sort = "+name", q, letter, status, categoryType, emailVerified } = {}) =>
    request(
      `/authors?page=${page}&limit=${limit}&sort=${sort}${
        q ? `&q=${encodeURIComponent(q)}` : ""
      }${letter ? `&letter=${letter}` : ""}${
        status ? `&status=${encodeURIComponent(status)}` : ""
      }${
        categoryType ? `&categoryType=${encodeURIComponent(categoryType)}` : ""
      }${
        emailVerified !== undefined ? `&emailVerified=${emailVerified}` : ""
      }`,
      {
        method: "GET",
      }
    ),

  /** Get single author by id or slug */
  get: (idOrSlug) => {
    const isObjectId = typeof idOrSlug === "string" && /^[a-f\d]{24}$/i.test(idOrSlug);
    return request(
      isObjectId ? `/authors/${idOrSlug}` : `/authors/slug/${encodeURIComponent(idOrSlug)}`,
      { method: "GET" }
    );
  },

  /** Explicitly get by slug */
  getBySlug: (slug) => request(`/authors/slug/${encodeURIComponent(slug)}`, { method: "GET" }),

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

  /** Upload or replace photo via PUT /authors/:id with FormData */
  uploadPhoto: (idOrSlug, file) => {
    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("photo", file);
    return fetch(`${API_BASE_URL}/authors/${idOrSlug}`, {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Author API error");
      return data;
    });
  },

  // Optional helpers for workflow
  setStatus: (id, status) =>
    request(`/authors/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  verifyEmail: (id, emailVerified = true) =>
    request(`/authors/${id}/verify-email`, {
      method: "PATCH",
      body: JSON.stringify({ emailVerified }),
    }),
  review: (id, { reviewNote, reviewedAt }) =>
    request(`/authors/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({ reviewNote, reviewedAt }),
    }),

  // NEW: manage books for an author
  addBook: (id, bookId) =>
    request(`/authors/${id}/books`, {
      method: "POST",
      body: JSON.stringify({ bookId }),
    }),
  removeBook: (id, bookId) =>
    request(`/authors/${id}/books/${bookId}`, {
      method: "DELETE",
    }),

  // NEW: search books to add to an author (returns an array, capped to limit)
  searchBooks: async (q, { limit = 15 } = {}) => {
    const res = await request(
      `/books?limit=${limit}${q ? `&search=${encodeURIComponent(q)}` : ""}`,
      { method: "GET" }
    );
    const list = Array.isArray(res)
      ? res
      : res?.data || res?.items || res?.books || res?.results || res?.docs || [];
    return (list || []).slice(0, limit);
  },

  // NEW: search a single book by ISBN (tries ?isbn= then falls back to generic search)
  searchBookByISBN: async (isbnRaw) => {
    const normalize = (s) => String(s || "").replace(/[^0-9Xx]/g, "").toUpperCase();
    const n = normalize(isbnRaw);
    if (!n) return null;

    const pickFirst = (res) => {
      const list = Array.isArray(res)
        ? res
        : res?.data || res?.items || res?.books || res?.results || res?.docs || [];
      if (!Array.isArray(list)) return null;
      // Try to find exact ISBN match across common fields; else return first
      const match = list.find((b) => {
        const fields = [
          b?.isbn,
          b?.isbn_10,
          b?.isbn_13,
          b?.ISBN,
          b?.ISBN_10,
          b?.ISBN_13,
          ...(Array.isArray(b?.isbnList) ? b.isbnList : []),
        ]
          .flat()
          .filter(Boolean)
          .map(normalize);
        return fields.includes(n);
      });
      return match || list[0] || null;
    };

    try {
      // Prefer explicit isbn param if backend supports it
      const byIsbn = await request(`/books?isbn=${encodeURIComponent(n)}`, { method: "GET" });
      const found = pickFirst(byIsbn);
      if (found) return found;
    } catch {
      // ignore and try fallback
    }
    try {
      const bySearch = await request(`/books?search=${encodeURIComponent(n)}`, { method: "GET" });
      return pickFirst(bySearch);
    } catch {
      return null;
    }
  },
};
export default authorAPI;
