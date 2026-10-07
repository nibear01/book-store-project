import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authorAPI } from "../api/author-api";
import { BACKEND_URL } from "../api/apiBase";

const AuthorContext = createContext(null);

export const AuthorProvider = ({ children }) => {
  const [authors, setAuthors] = useState([]);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const url = BACKEND_URL;

  const list = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await authorAPI.list(params);
      setAuthors(Array.isArray(data) ? data : data?.items || []);
      return data;
    } catch (e) {
      setError(e.message || "Failed to load authors");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(async (idOrSlug) => {
    setLoading(true);
    setError("");
    try {
      const data = await authorAPI.get(idOrSlug);
      setAuthor(data);
      return data;
    } catch (e) {
      setError(e.message || "Failed to load author");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload) => {
    setLoading(true);
    setError("");
    try {
      const data = await authorAPI.create(payload);
      setAuthors((prev) => [data, ...prev]);
      return data;
    } catch (e) {
      setError(e.message || "Failed to create author");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (idOrSlug, payload) => {
    setLoading(true);
    setError("");
    try {
      const data = await authorAPI.update(idOrSlug, payload);
      setAuthors((prev) => prev.map((a) => (a._id === data._id ? data : a)));
      setAuthor((prev) => (prev && prev._id === data._id ? data : prev));
      return data;
    } catch (e) {
      setError(e.message || "Failed to update author");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (idOrSlug) => {
    setLoading(true);
    setError("");
    try {
      await authorAPI.remove(idOrSlug);
      setAuthors((prev) => prev.filter((a) => a._id !== idOrSlug && a.slug !== idOrSlug));
      if (author && (author._id === idOrSlug || author.slug === idOrSlug)) setAuthor(null);
    } catch (e) {
      setError(e.message || "Failed to delete author");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [author]);

  const uploadPhoto = useCallback(async (idOrSlug, file) => {
    setLoading(true);
    setError("");
    try {
      const data = await authorAPI.uploadPhoto(idOrSlug, file);
      setAuthors((prev) => prev.map((a) => (a._id === data._id ? data : a)));
      setAuthor((prev) => (prev && prev._id === data._id ? data : prev));
      return data;
    } catch (e) {
      setError(e.message || "Failed to upload photo");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const setStatus = useCallback(async (id, status) => {
    const data = await authorAPI.setStatus(id, status);
    setAuthors((prev) => prev.map((a) => (a._id === data._id ? data : a)));
    setAuthor((prev) => (prev && prev._id === data._id ? data : prev));
    return data;
  }, []);

  const verifyEmail = useCallback(async (id, emailVerified = true) => {
    const data = await authorAPI.verifyEmail(id, emailVerified);
    setAuthors((prev) => prev.map((a) => (a._id === data._id ? data : a)));
    setAuthor((prev) => (prev && prev._id === data._id ? data : prev));
    return data;
  }, []);

  const review = useCallback(async (id, { reviewNote, reviewedAt } = {}) => {
    const data = await authorAPI.review(id, { reviewNote, reviewedAt });
    setAuthors((prev) => prev.map((a) => (a._id === data._id ? data : a)));
    setAuthor((prev) => (prev && prev._id === data._id ? data : prev));
    return data;
  }, []);

  const addBook = useCallback(async (id, bookId) => {
    const data = await authorAPI.addBook(id, bookId);
    setAuthors((prev) => prev.map((a) => (a._id === data._id ? data : a)));
    setAuthor((prev) => (prev && prev._id === data._id ? data : prev));
    return data;
  }, []);

  const removeBook = useCallback(async (id, bookId) => {
    const data = await authorAPI.removeBook(id, bookId);
    setAuthors((prev) => prev.map((a) => (a._id === data._id ? data : a)));
    setAuthor((prev) => (prev && prev._id === data._id ? data : prev));
    return data;
  }, []);

  // NEW: search books helper for AdminAuthorPage modal
  const searchBooks = useCallback(async (q, opts = {}) => {
    return authorAPI.searchBooks(q, opts);
  }, []);

  // NEW: find a single book by ISBN
  const findBookByISBN = useCallback(async (isbn) => {
    return authorAPI.searchBookByISBN(isbn);
  }, []);

  const value = useMemo(
    () => ({
      url,
      authors,
      author,
      loading,
      error,
      list,
      get,
      create,
      update,
      remove,
      uploadPhoto,
      setStatus,
      verifyEmail,
      review,
      addBook,
      removeBook,
      // NEW
      searchBooks,
      findBookByISBN,
    }),
    [authors, author, loading, error, list, get, create, update, remove, uploadPhoto, setStatus, verifyEmail, review, addBook, removeBook, searchBooks, findBookByISBN]
  );

  return <AuthorContext.Provider value={value}>{children}</AuthorContext.Provider>;
};

export const useAuthors = () => {
  const ctx = useContext(AuthorContext);
  if (ctx) return ctx;

  // Fallback to prevent crashes if used outside of AuthorProvider
  if (typeof window !== "undefined" && window?.console) {
    // eslint-disable-next-line no-console
    console.warn("useAuthors used without an AuthorProvider. Returning a safe fallback.");
  }
  const err = async () => {
    throw new Error("AuthorProvider is missing. Wrap your component tree with <AuthorProvider>.");
  };
  return {
    authors: [],
    author: null,
    loading: false,
    error: "AuthorProvider is missing",
    list: err,
    get: err,
    create: err,
    update: err,
    remove: err,
    uploadPhoto: err,
    setStatus: err,
    verifyEmail: err,
    review: err,
    addBook: err,
    removeBook: err,
    searchBooks: async () => [],
    // NEW fallback
    findBookByISBN: async () => null,
  };
};
