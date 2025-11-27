/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import { createContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
// Simple slug normalizer (mirrors backend rules loosely)
const slugify = (s = "") =>
  String(s)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
import { useAuth } from "./AuthContext";

export const BooksContext = createContext();

const BooksContextProvider = ({ children }) => {
  // Backend base URL fallback: prefer env, then current origin
  const url = import.meta.env.VITE_BACKEND_URL || window.location.origin;

  const [books, setBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [onSaleBooks, setOnSaleBooks] = useState([]);
  const [mostViewedBooks, setMostViewedBooks] = useState([]);
  const [dealsOfWeek, setDealsOfWeek] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setIsLoading } = useAuth();
  // Track whether we've performed the initial load; only during the very first
  // fetch do we toggle the global loader. Subsequent fetches use local loading.
  const isInitialLoadRef = useRef(true);

  // Optional: keep the latest bulk import report for UI
  const [importReport, setImportReport] = useState(null);

  // Generic fetch helper
  const fetchData = useCallback(
    async (endpoint = "/", params = {}, setter) => {
    if (setIsLoading && isInitialLoadRef.current) setIsLoading(true);
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
        if (setIsLoading && isInitialLoadRef.current) setIsLoading(false);
        // mark that initial load has completed after first fetch attempt
        isInitialLoadRef.current = false;
      }
    },
    [url, setIsLoading]
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

  // Fetch on-sale books
  const fetchOnSaleBooks = useCallback(
    (limit = 10) => fetchData("/on-sale", { limit }, setOnSaleBooks),
    [fetchData]
  );

  // Fetch most-viewed books
  const fetchMostViewedBooks = useCallback(
    (limit = 10) => fetchData("/most-viewed", { limit }, setMostViewedBooks),
    [fetchData]
  );

  // Fetch deals of the week
  const fetchDealsOfWeek = useCallback(
    (limit = 10) => fetchData("/deals", { limit }, setDealsOfWeek),
    [fetchData]
  );

  // Get books by genre
  const getBooksByGenre = useCallback(
    async (genre, limit = 10) => {
      try {
        const { data } = await axios.get(`${url}/api/books`, {
          params: { genre, limit }
        });
        return data.data || data.books || [];
      } catch (err) {
        console.error("Error fetching books by genre:", err);
        return [];
      }
    },
    [url]
  );

  // Get books by author
  const getBooksByAuthor = useCallback(
    async (author, limit = 10) => {
      try {
        const { data } = await axios.get(`${url}/api/books`, {
          params: { author, limit }
        });
        return data.data || data.books || [];
      } catch (err) {
        console.error("Error fetching books by author:", err);
        return [];
      }
    },
    [url]
  );

  // Get book by slug with defensive fallbacks & clearer error reporting
  const getBookBySlug = useCallback(
    async (rawSlug) => {
      if (!rawSlug) throw new Error("Slug is required");
      // Normalize placeholder/encoded versions
      const cleaned = slugify(decodeURIComponent(String(rawSlug)).trim());
      const candidates = Array.from(new Set([rawSlug, cleaned])).filter(Boolean);
      let lastError = null;
      for (const candidate of candidates) {
        try {
          const { data } = await axios.get(`${url}/api/books/${candidate}`);
          if (data?.data) return data.data;
        } catch (err) {
          lastError = err;
          // Retry next candidate if available
        }
      }
      // If backend returns 404 we surface a more specific message, else generic
      const status = lastError?.response?.status;
      if (status === 404) {
        throw new Error(`Book not found for slug: ${cleaned}`);
      }
      // Provide server-side message when available
      const serverMsg = lastError?.response?.data?.message || lastError?.message;
      throw new Error(`Failed to load book: ${serverMsg || 'Unknown error'}`);
    },
    [url]
  );

  // Add to cart functionality
  const addToCart = useCallback((item) => {
    // Get existing cart from localStorage or initialize empty array
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(cartItem => 
      cartItem.item.id === item.item.id
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      existingCart[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item to cart
      existingCart.push(item);
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // You can also add state management for cart here if needed
    console.log('Item added to cart:', item);
  }, []);

  // Admin: Add book
  const addBook = useCallback(async (formData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${url}/api/books`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    return response.data;
  }, [url]);

  // Admin: Update book
  const updateBook = useCallback(async (id, formData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${url}/api/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    return response.data;
  }, [url]);

  // Admin: Delete book (hard delete by default)
  const deleteBook = useCallback(async (id, hard = true) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${url}/api/books/${id}`, {
      params: { hard },
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    return response.data;
  }, [url]);

  // New: One-zip bulk import (books.csv + /images + /pdfs)
  const bulkImportZip = useCallback(
    async (archiveFile, { keyField = "external_id", dryRun = false, updateIfExists = true } = {}) => {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('archive', archiveFile);
      form.append('keyField', keyField);
      form.append('dryRun', String(dryRun));
      form.append('updateIfExists', String(updateIfExists));
      try {
        setIsLoading?.(true);
        const { data } = await axios.post(`${url}/api/books/bulk-import`, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        // server should return a report; keep if present
        if (data?.report) setImportReport(data.report);
        // Optionally refresh books after non-dry run
        if (!dryRun) fetchBooks();
        return data;
      } finally {
        setIsLoading?.(false);
      }
    },
    [url, fetchBooks, setIsLoading]
  );

  // New: Assets-only bulk upload; attaches by filename key
  const bulkUploadAssets = useCallback(
    async (files, { keyField = "external_id", dryRun = false } = {}) => {
      const token = localStorage.getItem('token');
      const form = new FormData();
      Array.from(files || []).forEach((f) => form.append('assets[]', f));
      form.append('keyField', keyField);
      form.append('dryRun', String(dryRun));
      try {
        setIsLoading?.(true);
        const { data } = await axios.post(`${url}/api/books/assets/bulk`, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (data?.report) setImportReport(data.report);
        // No need to refetch books unless assets change computed lists
        return data;
      } finally {
        setIsLoading?.(false);
      }
    },
    [url, setIsLoading]
  );

  // Initial load
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const value = useMemo(() => ({
    url,
    books,
    featuredBooks,
    trendingBooks,
    latestBooks,
    onSaleBooks,
    mostViewedBooks,
    dealsOfWeek,
    loading,
    error,
    fetchBooks,
    fetchFeaturedBooks,
    fetchTrendingBooks,
    fetchLatestBooks,
    fetchOnSaleBooks,
    fetchMostViewedBooks,
    fetchDealsOfWeek,
    getBooksByGenre, // Added this function
    getBooksByAuthor, // Added this function
    getBookBySlug,
    addToCart, // Added this function
    addBook,
    updateBook,
    deleteBook,
    // New exports for bulk flows
    bulkImportZip,
    bulkUploadAssets,
    importReport,
    setImportReport,
  }), [
    url,
    books,
    featuredBooks,
    trendingBooks,
    latestBooks,
    onSaleBooks,
    mostViewedBooks,
    dealsOfWeek,
    loading,
    error,
    fetchBooks,
    fetchFeaturedBooks,
    fetchTrendingBooks,
    fetchLatestBooks,
    fetchOnSaleBooks,
    fetchMostViewedBooks,
    fetchDealsOfWeek,
    getBooksByGenre,
    getBooksByAuthor,
    getBookBySlug,
    addToCart,
    addBook,
    updateBook,
    deleteBook,
    bulkImportZip,
    bulkUploadAssets,
    importReport,
    setImportReport,
  ]);

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
};

export { BooksContextProvider };