/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import { createContext, useEffect, useState, useCallback } from "react";
import { mockBookService } from "../services/mockBookService";
import { mockApiService } from "../services/mockApiService";


export const BooksContext = createContext();

const BooksContextProvider = ({ children }) => {
  const url = import.meta.env.VITE_BACKEND_URL;
  
  // Setup axios interceptors for API fallbacks
  const axiosInstance = mockApiService.setupInterceptors(axios);

  const [books, setBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [onSaleBooks, setOnSaleBooks] = useState([]);
  const [mostViewedBooks, setMostViewedBooks] = useState([]);
  const [dealsOfWeek, setDealsOfWeek] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic fetch helper
  const fetchData = useCallback(
    async (endpoint = "/", params = {}, setter, mockFunction) => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch from API with interceptors for fallback
        const { data } = await axiosInstance.get(`${url}/api/books${endpoint}`, { params });
        if (setter) setter(data);
        return data;
      } catch (err) {
        console.log("Backend API error, using mock data instead:", err.message);
        // If API fails and interceptor didn't catch it, use mock data directly
        if (mockFunction) {
          const mockData = await mockFunction(params.limit);
          if (setter) setter(mockData);
          return mockData;
        }
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [url, axiosInstance]
  );

  // Fetch all books
  const fetchBooks = useCallback(
    (params = {}) => fetchData("/", params, setBooks, mockBookService.getBooks),
    [fetchData]
  );

  // Fetch featured books
  const fetchFeaturedBooks = useCallback(
    (limit = 10) => fetchData("/featured", { limit }, setFeaturedBooks, mockBookService.getFeaturedBooks),
    [fetchData]
  );

  // Fetch trending books
  const fetchTrendingBooks = useCallback(
    ({ limit = 10, days } = {}) => fetchData("/trending", { limit, days }, setTrendingBooks, mockBookService.getTrendingBooks),
    [fetchData]
  );

  // Fetch latest books
  const fetchLatestBooks = useCallback(
    (limit = 10) => fetchData("/latest", { limit }, setLatestBooks, mockBookService.getLatestBooks),
    [fetchData]
  );

  // Fetch on-sale books
  const fetchOnSaleBooks = useCallback(
    (limit = 10) => fetchData("/on-sale", { limit }, setOnSaleBooks, mockBookService.getOnSaleBooks),
    [fetchData]
  );

  // Fetch most-viewed books
  const fetchMostViewedBooks = useCallback(
    (limit = 10) => fetchData("/most-viewed", { limit }, setMostViewedBooks, mockBookService.getBooks),
    [fetchData]
  );

  // Fetch deals of the week
  const fetchDealsOfWeek = useCallback(
    (limit = 10) => fetchData("/deals", { limit }, setDealsOfWeek, mockBookService.getDealsOfWeek),
    [fetchData]
  );

  // Get book by slug
  const getBookBySlug = useCallback(
    async (slug) => {
      if (!slug) throw new Error("Slug is required");
      try {
        const { data } = await axiosInstance.get(`${url}/api/books/${slug}`);
        return data.data;
      } catch (err) {
        console.log("Backend API error, using mock data instead:", err.message);
        // If API fails and interceptor didn't catch it, use mock data directly
        const mockData = await mockBookService.getBookBySlug(slug);
        return mockData;
      }
    },
    [url, axiosInstance]
  );

  // Admin: Add book
  const addBook = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post(`${url}/api/books`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // Admin: Update book
  const updateBook = async (id, formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.put(`${url}/api/books/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // Admin: Delete book (hard delete by default)
  const deleteBook = async (id, hard = true) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.delete(`${url}/api/books/${id}`, {
        params: { hard },
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

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
    getBookBySlug,
    addBook,
    updateBook,
    deleteBook,
  };

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
};

export { BooksContextProvider };
