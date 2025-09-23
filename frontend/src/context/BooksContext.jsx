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
  const [onSaleBooks, setOnSaleBooks] = useState([]);
  const [mostViewedBooks, setMostViewedBooks] = useState([]);
  const [dealsOfWeek, setDealsOfWeek] = useState([]);

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
        console.warn(`API Error for ${endpoint}:`, err.message);
        setError(err);
        // Return empty data structure to prevent crashes
        const emptyData = { data: [], success: false };
        if (setter) setter(emptyData);
        return emptyData;
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

  // Get book by slug
  const getBookBySlug = useCallback(
    async (slug) => {
      if (!slug) throw new Error("Slug is required");
      const { data } = await axios.get(`${url}/api/books/${slug}`);
      return data.data;
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
  const addBook = async (formData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${url}/api/books`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    return response.data;
  };

  // Admin: Update book
  const updateBook = async (id, formData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${url}/api/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    return response.data;
  };

  // Admin: Delete book (hard delete by default)
  const deleteBook = async (id, hard = true) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${url}/api/books/${id}`, {
      params: { hard },
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    return response.data;
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
    getBooksByGenre, // Added this function
    getBooksByAuthor, // Added this function
    getBookBySlug,
    addToCart, // Added this function
    addBook,
    updateBook,
    deleteBook,
  };

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
};

export { BooksContextProvider };