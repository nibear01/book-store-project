import { useEffect, useState } from "react";
import { booksAPI } from "../api/book-api.js";
import { Link } from "react-router-dom";
import ButtonFill from "@/Button/ButtonFill";
import BookCard from "@/components/categories/BookCard";
import { useWishlist } from "@/context/WishlistContext.jsx";
import { useTranslation } from "react-i18next";

const DEBOUNCE_MS = 250;

// Base URL for images served by backend
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Loading skeleton component
const BookCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col relative overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="relative pt-[140%] w-full bg-gray-200"></div>

      {/* Content skeleton */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Genre badge skeleton */}
        <div className="h-6 w-20 bg-gray-200 rounded-full mb-3"></div>

        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>

        {/* Author skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>

        {/* Rating and pages skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-8 w-32 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        </div>

        {/* Price skeleton */}
        <div className="mt-auto">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>

          {/* Button skeleton */}
          <div className="h-11 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

const ShopPage = () => {
  const { t } = useTranslation(["shop", "common"]);
  useWishlist(); // ensure provider is initialized; not directly needed here

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalBooks, setTotalBooks] = useState(0); // Total books in store
  const [cursor, setCursor] = useState(null); // Cursor-based pagination
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [previousCursor, setPreviousCursor] = useState(null);
  const PAGE_SIZE = 20;

  // 🔎 Search state
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState(""); // debounced value

  // Fetch total books on mount
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await booksAPI.count();
        setTotalBooks(res?.total || 0);
      } catch (e) {
        console.warn("Failed to fetch total books count:", e.message);
      }
    };
    fetchTotal();
  }, []);

  // Wishlist UI is handled inside BookCard; page no longer needs local wish state

  const viewMode = "grid";

  // Load books from server (with search and cursor-based pagination)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = {
          limit: PAGE_SIZE,
          sort: "-created_at",
        };
        if (cursor) params.cursor = cursor;
        if (query) params.search = query;
        const res = await booksAPI.list(params);
        const data = res?.data || [];
        setBooks(data);
        setHasNextPage(res?.pagination?.hasNextPage || false);
        setHasPreviousPage(res?.pagination?.hasPreviousPage || false);
        setNextCursor(res?.pagination?.nextCursor || null);
        setPreviousCursor(res?.pagination?.previousCursor || null);
      } catch (e) {
        setError(e?.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query, cursor]);

  // ⏱️ Debounce the search input
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(searchInput.trim());
      setCursor(null); // Reset to first page on new search
      setPreviousCursor(null);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex-1">
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-full sm:max-w-md">
            <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="sm:shrink-0">
            <div className="h-10 w-36 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <BookCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    );
  if (error)
    return (
      <div className="max-w-6xl h-[80vh] mx-auto px-4 sm:px-6 py-10 text-red-600">
        {error}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* title */}
        <div>
          <h1 className="text-3xl font-bold">{t("common:navbar.shop")}</h1>
          <p className="text-gray-600 mt-2">
            {t("common:shop.discoverCollection")}
            {query ? (
              <span className="ml-2 text-gray-500">
                • {books.length}{" "}
                {books.length === 1
                  ? t("common:shop.results")
                  : t("common:shop.resultsPlural")}{" "}
                {t("common:shop.for")}
                <span className="ml-1 font-medium text-gray-700">
                  "{query}"
                </span>
              </span>
            ) : (
              <span className="ml-2 text-gray-500">
                • {totalBooks} {totalBooks === 1 ? "book" : "books"} in store
              </span>
            )}
          </p>
        </div>

        {/* 🔍 search box */}
        <div className="w-full sm:max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("common:shop.searchPlaceholder")}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-24 shadow-sm focus:border-gray-400 focus:outline-none"
              aria-label="Search books"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                aria-label="Clear search"
                title={t("common:shop.clear")}
              >
                {t("common:shop.clear")}
              </button>
            )}
            <button
              type="button"
              onClick={() => setQuery(searchInput.trim())}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-black px-3 py-1.5 text-white text-sm hover:bg-black/90"
              aria-label="Apply search"
              title={t("common:buttons.search")}
            >
              {t("common:buttons.search")}
            </button>
          </div>
        </div>

        {/* request button */}
        <div className="sm:shrink-0">
          <Link to="/bookrequest">
            <ButtonFill>{t("common:shop.requestBook")}</ButtonFill>
          </Link>
        </div>
      </div>

      {books.length === 0 ? (
        <p className="mt-8 min-h-70 text-red-500">
          {query
            ? t("common:shop.noSearchResults")
            : t("common:shop.noBooksFound")}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-8">
          {books.map((book) => {
            const id = book?._id || book?.id;
            // Normalize numeric fields to ensure BookCard formatting works
            const normalized = {
              ...book,
              price: Number(book?.price || 0),
              sale_price: Number(book?.sale_price || 0),
              rating: Number(book?.rating || 0),
              num_reviews: Number(book?.num_reviews || 0),
              stock: Number(book?.stock ?? 0),
            };

            return (
              <BookCard
                key={id}
                book={normalized}
                baseUrl={BASE_URL}
                viewMode={viewMode}
              />
            );
          })}
        </div>
      )}

      {/* Pagination - Cursor Based */}
      {(hasNextPage || hasPreviousPage) && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCursor(previousCursor)}
            disabled={!hasPreviousPage}
            title={hasPreviousPage ? "Load previous page" : "No previous page"}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-100"
          >
            ← Prev
          </button>

          <span className="px-3 py-2 text-sm text-gray-600">
            {books.length > 0 ? `${books.length} results` : "No results"}
          </span>

          <button
            onClick={() => setCursor(nextCursor)}
            disabled={!hasNextPage}
            title={hasNextPage ? "Load next page" : "No more results"}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-100"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
