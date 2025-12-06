import React, { useCallback, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthors } from "../../context/AuthorContext.jsx";
import BookCard from "../categories/BookCard";

const SingleAuthor = () => {
  const { slug } = useParams();
  const { author, get, loading, error, url } = useAuthors();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

  useEffect(() => {
    if (slug) get(slug).catch(() => {});
  }, [slug, get]);

  const makeImgUrl = useCallback(
    (p) => {
      if (!p) return "";
      const src = Array.isArray(p) ? p[0] : p;
      if (!src) return "";
      if (/^https?:\/\//i.test(src)) return src;
      const base = (BASE_URL || url || "").replace(/\/+$/, "");
      const rel = String(src).replace(/^\/+/, "");
      return base ? `${base}/${rel}` : `/${rel}`;
    },
    [BASE_URL, url]
  );

  const books = useMemo(() => (Array.isArray(author?.books) ? author.books : []), [author]);
  const dobText = useMemo(() => {
    if (!author?.dob) return null;
    const d = new Date(author.dob);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString();
  }, [author?.dob]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
      <nav className="flex items-center text-sm text-gray-600 space-x-2 mb-6">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span>/</span>
        <Link to="/authors" className="hover:text-gray-800">Authors</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{author?.name || "Author"}</span>
      </nav>

      {loading ? (
        <div className="text-gray-600 min-h-[70vh]">Loading author…</div>
      ) : error ? (
        <div className="text-rose-600 min-h-[70vh]">{error}</div>
      ) : !author ? (
        <div className="text-gray-600 min-h-[70vh]">Author not found.</div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between bg-white rounded-md p-4 border">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded overflow-hidden border border-gray-200 bg-gray-50">
                {author.photo ? (
                  <img src={makeImgUrl(author.photo)} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-semibold text-gray-500">
                    {(author.name || "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{author.name}</h1>
                <div className="text-gray-600">{author.title || ""}</div>
                {dobText ? <div className="text-sm text-gray-600 mt-1">DOB: {dobText}</div> : null}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <div>
                Status:{" "}
                <span className={`font-medium capitalize ${author.status === "verified" ? "text-emerald-600" : "text-gray-800"}`}>
                  {author.status}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {author.bio ? (
            <div className="mt-6 bg-white rounded-md p-4 border">
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-gray-800 whitespace-pre-wrap">{author.bio}</p>
            </div>
          ) : null}

          {/* Books */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Books</h2>
              <div className="text-sm text-gray-600">
                {books.length} item{books.length !== 1 ? "s" : ""}
              </div>
            </div>

            {books.length === 0 ? (
              <div className="text-gray-600">No books found for this author.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {books.map((b) => (
                  <BookCard key={b._id || b.id || b.slug} book={b} baseUrl={BASE_URL} viewMode="grid" />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SingleAuthor;