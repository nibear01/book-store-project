import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ButtonFill from "@/Button/ButtonFill";
import { authorAPI } from "@/api/author-api";

const INITIAL_LIMIT = 20;
const LOAD_MORE = 12;
const DEBOUNCE_MS = 250;

// Simple initials avatar if image missing
const InitialsAvatar = ({ name }) => {
  const letters = (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div className="w-24 h-24 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xl font-semibold border border-gray-200">
      {letters || "?"}
    </div>
  );
};

// Small skeleton card
const AuthorCardSkeleton = () => (
  <div className="flex flex-col items-center text-center bg-white p-4 rounded-md shadow-sm animate-pulse">
    <div className="w-24 h-24 rounded-full bg-gray-200" />
    <div className="h-4 w-24 mt-3 bg-gray-200 rounded" />
    <div className="h-3 w-16 mt-2 bg-gray-200 rounded" />
    <div className="h-9 w-24 mt-4 bg-gray-200 rounded" />
  </div>
);

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  const [visible, setVisible] = useState(INITIAL_LIMIT);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setQuery(searchInput.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load authors
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await authorAPI.list({ limit: 100000, sort: "+name" });
        const data = res?.results ?? res?.data ?? res ?? [];
        setAuthors(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Failed to load authors");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter by search only
  const filtered = useMemo(() => {
    if (!query) return authors;
    const q = query.toLowerCase();
    return authors.filter((a) => {
      const name = (a?.name || "").toLowerCase();
      const tags = Array.isArray(a?.tags) ? a.tags.join(" ").toLowerCase() : "";
      return name.includes(q) || tags.includes(q);
    });
  }, [authors, query]);

  // Reset pagination whenever search changes
  useEffect(() => {
    setVisible(INITIAL_LIMIT);
  }, [query]);

  const visibleAuthors = filtered.slice(0, visible);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
      {/* Breadcrumb + CTA */}
      <div className="pt-6 mb-8 sm:mb-12 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <nav className="flex items-center text-[16px] text-gray-600 space-x-2">
          <Link to="/" className="hover:text-gray-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Authors</span>
        </nav>
        <div>
          <Link to="/authorrequest">
            <ButtonFill>Author Request</ButtonFill>
          </Link>
        </div>
      </div>

      {/* Header + search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-[22px] font-semibold">
          Authors{" "}
          <span className="text-gray-500 font-normal text-[17px]">
            • {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </h1>

        <div className="w-full md:max-w-md">
          <div className="relative">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              placeholder="Search authors by name or tag…"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-24 shadow-sm focus:border-black focus:outline-none"
              aria-label="Search authors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setQuery(searchInput.trim())}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-black px-3 py-1.5 text-white text-sm hover:bg-black/90"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {err && <div className="mb-6 text-red-600">{err}</div>}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <AuthorCardSkeleton key={i} />
          ))}
        </div>
      ) : visibleAuthors.length === 0 ? (
        <p className="mt-6 text-gray-600">
          {query ? "No authors matched your search." : "No authors found."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-6">
          {visibleAuthors.map((a) => {
            const name = a?.name || "Unknown";
            const booksCount = a?.book_count ?? a?.books_count ?? 0;
            const slug = a?.slug || a?.id || "#";
            const photo = a?.photo || a?.avatar || null;

            return (
              <div
                key={a?.id || a?._id || name}
                className="flex flex-col items-center text-center bg-white p-4 rounded-md shadow-sm"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200">
                  {photo ? (
                    <img
                      src={
                        photo.startsWith?.("http")
                          ? photo
                          : `http://localhost:5000${photo}`
                      }
                      alt={name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                      }}
                    />
                  ) : (
                    <InitialsAvatar name={name} />
                  )}
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900 line-clamp-2">
                  {name}
                </h3>
                <p className="text-xs text-gray-500">
                  {booksCount} book{booksCount !== 1 ? "s" : ""}
                </p>
                <div className="mt-4">
                  <Link to={`/authors/${slug}`}>
                    <ButtonFill>Visit</ButtonFill>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > INITIAL_LIMIT && (
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-8 justify-center">
          {visible < filtered.length ? (
            <button
              onClick={() =>
                setVisible((v) => Math.min(v + LOAD_MORE, filtered.length))
              }
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-black text-white hover:bg-black/90"
            >
              Show more
            </button>
          ) : (
            <button
              onClick={() => setVisible(INITIAL_LIMIT)}
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-gray-200 text-gray-900 hover:bg-gray-300"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Authors;
