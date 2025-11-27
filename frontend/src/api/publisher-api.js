import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all publishers
export const getPublishers = async (params = {}) => {
  const { data } = await axios.get(`${API_BASE}/api/publishers`, { params });
  return data;
};

// Get publisher by ID
export const getPublisherById = async (id) => {
  const { data } = await axios.get(`${API_BASE}/api/publishers/${id}`);
  return data;
};

// Get publisher by slug
export const getPublisherBySlug = async (slug) => {
  const { data } = await axios.get(`${API_BASE}/api/publishers/slug/${slug}`);
  return data;
};

// Get publisher by ID or slug (tries both)
export const getPublisher = async (identifier) => {
  try {
    // First try as direct ID
    const { data } = await axios.get(`${API_BASE}/api/publishers/${identifier}`);
    return data;
  } catch (error) {
    // If that fails, try as slug
    if (error.response?.status === 404 || error.response?.status === 400) {
      const { data } = await axios.get(`${API_BASE}/api/publishers/slug/${identifier}`);
      return data;
    }
    throw error;
  }
};

// Get books by publisher
export const getBooksByPublisher = async (identifier, params = {}) => {
  const { data } = await axios.get(
    `${API_BASE}/api/publishers/${identifier}/books`,
    { params }
  );
  return data;
};

// Create publisher
export const createPublisher = async (formData) => {
  const { data } = await axios.post(`${API_BASE}/api/publishers`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// Update publisher
export const updatePublisher = async (id, formData) => {
  const { data } = await axios.put(
    `${API_BASE}/api/publishers/${id}`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};

// Delete publisher
export const deletePublisher = async (id, hard = false) => {
  const { data } = await axios.delete(`${API_BASE}/api/publishers/${id}`, {
    headers: getAuthHeaders(),
    params: { hard },
  });
  return data;
};

// Add book to publisher
export const addBookToPublisher = async (publisherId, bookId) => {
  const { data } = await axios.post(
    `${API_BASE}/api/publishers/${publisherId}/books`,
    { bookId },
    { headers: getAuthHeaders() }
  );
  return data;
};

// Remove book from publisher
export const removeBookFromPublisher = async (publisherId, bookId) => {
  const { data } = await axios.delete(
    `${API_BASE}/api/publishers/${publisherId}/books/${bookId}`,
    { headers: getAuthHeaders() }
  );
  return data;
};
