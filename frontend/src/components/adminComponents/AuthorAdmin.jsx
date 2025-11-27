import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import BookCard from "../categories/BookCard";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

const deriveAuthorName = (user) => {
  return (
    user?.author?.name ||
    user?.name ||
    user?.fullName ||
    (user?.email ? user.email.split("@")[0] : "") ||
    ""
  );
};

const AuthorAdmin = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const authorName = useMemo(() => deriveAuthorName(user), [user]);

  const fetchBooks = useCallback(
    async (name) => {
      if (!name) {
        setBooks([]);
        return;
      }
      setLoading(true);
      setErr("");
      try {
        const url = new URL(`${BASE_URL.replace(/\/+$/, "")}/api/books`);
        url.searchParams.set("limit", "200");
        url.searchParams.set("author", name);
        const res = await fetch(url.toString(), { method: "GET" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to load books");
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setBooks(list);
      } catch (e) {
        setErr(e?.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!authorName) return;
    fetchBooks(authorName);
  }, [authorName, fetchBooks]);

  const title = useMemo(
    () => (authorName ? `Books by ${authorName}` : "My Books"),
    [authorName]
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold m-0">{title}</h2>
          <p className="text-sm text-slate-600 mt-1"></p>
        </div>
      </div>

      {err ? <div className="mb-3 text-rose-600">{err}</div> : null}

      {loading ? (
        <div className="text-slate-600">Loading books…</div>
      ) : !authorName ? (
        <div className="text-slate-600">Your profile does not have an author name configured.</div>
      ) : books.length === 0 ? (
        <div className="text-slate-600">No books found for this author.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {books.map((b) => (
            <BookCard key={b._id || b.id || b.slug} book={b} baseUrl={BASE_URL} viewMode="grid" />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthorAdmin;
