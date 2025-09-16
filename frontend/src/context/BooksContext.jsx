/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import { createContext, useEffect, useState, useCallback } from "react";

export const BooksContext = createContext();

const BooksContextProvider = ({ children }) => {
  const url = import.meta.env.VITE_BACKEND_URL;

  const [books, setBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic fetch helper
  const fetchData = useCallback(
    async (endpoint = "/", params = {}, setter) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${url}/api/books${endpoint}`, { params });
        if (setter) setter(data);
        return data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  // Fetch all books
  const fetchBooks = useCallback(
    (params = {}) => fetchData("/", params, setBooks),
    [fetchData]
  );

  // Fetch featured books
  const fetchFeaturedBooks = useCallback(
    (limit = 10) => fetchData("/featured", { limit }, setFeaturedBooks),
    [fetchData]
  );

  // Fetch trending books
  const fetchTrendingBooks = useCallback(
    ({ limit = 10, days } = {}) => fetchData("/trending", { limit, days }, setTrendingBooks),
    [fetchData]
  );

  // Fetch latest books
  const fetchLatestBooks = useCallback(
    (limit = 10) => fetchData("/latest", { limit }, setLatestBooks),
    [fetchData]
  );

  // Get book by slug
  const getBookBySlug = useCallback(
    async (slug) => {
      if (!slug) throw new Error("Slug is required");
      const { data } = await axios.get(`${url}/api/books/${slug}`);
      return data.data;
    },
    [url]
  );

  // Admin: Add book
  const addBook = useCallback(
    async (formData) => {
      const { data } = await axios.post(`${url}/api/books`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    [url]
  );

  // Admin: Update book
  const updateBook = useCallback(
    async (id, formData) => {
      const { data } = await axios.put(`${url}/api/books/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    [url]
  );

  // Admin: Delete book
  const deleteBook = useCallback(
    async (id, hard = false) => {
      const { data } = await axios.delete(`${url}/api/books/${id}`, {
        params: { hard },
      });
      return data;
    },
    [url]
  );

  // Initial load
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const value = {
    url,
    books,
    featuredBooks,
    trendingBooks,
    latestBooks,
    loading,
    error,
    fetchBooks,
    fetchFeaturedBooks,
    fetchTrendingBooks,
    fetchLatestBooks,
    getBookBySlug,
    addBook,
    updateBook,
    deleteBook,
  };

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
};

export { BooksContextProvider };
