import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authorRequestAPI } from "../api/author-request-api";

const AuthorRequestContext = createContext(null);

export const AuthorRequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const list = useCallback(async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await authorRequestAPI.list(filters);
      setRequests(Array.isArray(data) ? data : []);
      return data;
    } catch (e) {
      const msg = e?.message || "Failed to load requests";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    try {
      const updated = await authorRequestAPI.updateStatus(id, status);
      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
      return updated;
    } catch (e) {
      const msg = e?.message || "Failed to update status";
      setError(msg);
      throw e;
    }
  }, []);

  const value = useMemo(
    () => ({
      requests,
      loading,
      error,
      list,
      updateStatus,
    }),
    [requests, loading, error, list, updateStatus]
  );

  return <AuthorRequestContext.Provider value={value}>{children}</AuthorRequestContext.Provider>;
};

export const useAuthorRequests = () => {
  const ctx = useContext(AuthorRequestContext);
  if (ctx) return ctx;
  // Soft fallback
  console.warn("useAuthorRequests used without an AuthorRequestProvider. Returning a safe fallback.");
  const err = async () => {
    throw new Error("AuthorRequestProvider is missing. Wrap your component tree with <AuthorRequestProvider>.");
  };
  return {
    requests: [],
    loading: false,
    error: "AuthorRequestProvider is missing",
    list: err,
    updateStatus: err,
  };
};
