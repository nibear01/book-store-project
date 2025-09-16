import axios from 'axios';
import { createContext, useEffect, useState } from 'react'

export const BooksContext = createContext();

const BooksContextProvider = (props) => {

    const url = import.meta.env.VITE_BACKEND_URL;

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [featuredLoading, setFeaturedLoading] = useState(false);
    const [featuredError, setFeaturedError] = useState(null);

    const [trendingBooks, setTrendingBooks] = useState([]);
    const [trendingLoading, setTrendingLoading] = useState(false);
    const [trendingError, setTrendingError] = useState(null);

    const [latestBooks, setLatestBooks] = useState([]);
    const [latestLoading, setLatestLoading] = useState(false);
    const [latestError, setLatestError] = useState(null);

    // Fetch books with query parameters
    const fetchBooks = async ({
        page = 1,
        limit = 10,
        search,
        genre,
        author,
        language,
        minPrice,
        maxPrice,
        sort,
    } = {}) => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (page) params.page = page;
            if (limit) params.limit = limit;
            if (search) params.search = search;
            if (genre) params.genre = genre;
            if (author) params.author = author;
            if (language) params.language = language;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (sort) params.sort = sort;

            const response = await axios.get(`${url}/api/books`, { params });
            setBooks(response.data);
            // console.log(response.data);
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fetch featured books
    const fetchFeaturedBooks = async (limit = 10) => {
        setFeaturedLoading(true);
        setFeaturedError(null);
        try {
            const response = await axios.get(`${url}/api/books/featured`, { params: { limit } });
            setFeaturedBooks(response.data);
            console.log(response.data);
            return response.data;
        } catch (err) {
            setFeaturedError(err);
            throw err;
        } finally {
            setFeaturedLoading(false);
        }
    };

    // Fetch trending books
    const fetchTrendingBooks = async ({ limit = 10, days } = {}) => {
        setTrendingLoading(true);
        setTrendingError(null);
        try {
            const params = { limit };
            if (days) params.days = days;
            const response = await axios.get(`${url}/api/books/trending`, { params });
            setTrendingBooks(response.data);
            return response.data;
        } catch (err) {
            setTrendingError(err);
            throw err;
        } finally {
            setTrendingLoading(false);
        }
    };

    // Fetch latest books
    const fetchLatestBooks = async (limit = 10) => {
        setLatestLoading(true);
        setLatestError(null);
        try {
            const response = await axios.get(`${url}/api/books/latest`, { params: { limit } });
            setLatestBooks(response.data);
            return response.data;
        } catch (err) {
            setLatestError(err);
            throw err;
        } finally {
            setLatestLoading(false);
        }
    };

    // Fetch book by slug
    const getBookBySlug = async (slug) => {
        if (!slug) throw new Error("Slug is required");
        try {
            const response = await axios.get(`${url}/api/books/${slug}`);
            return response.data.data;
        } catch (err) {
            throw err;
        }
    };

    // Admin: Add book
    const addBook = async (formData) => {
        try {
            const response = await axios.post(`${url}/api/books`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    // Admin: Update book
    const updateBook = async (id, formData) => {
        try {
            const response = await axios.put(`${url}/api/books/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    // Admin: Delete book
    const deleteBook = async (id, hard = false) => {
        try {
            const response = await axios.delete(`${url}/api/books/${id}`, {
                params: { hard }
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [url]);

    const value = {
        url,
        books,
        loading,
        error,
        featuredBooks,
        featuredLoading,
        featuredError,
        trendingBooks,
        trendingLoading,
        trendingError,
        latestBooks,
        latestLoading,
        latestError,
        fetchBooks,
        fetchFeaturedBooks,
        fetchTrendingBooks,
        fetchLatestBooks,
        getBookBySlug,
        addBook,
        updateBook,
        deleteBook,
    }

    return (
        <BooksContext.Provider value={value}>
            {props.children}
        </BooksContext.Provider>
    )
}

export { BooksContextProvider };