import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import ButtonFill from "@/Button/ButtonFill";
import * as publisherApi from "@/api/publisher-api";
import { useTranslation } from "react-i18next";

const ITEMS_PER_PAGE = 20;
const DEBOUNCE_MS = 300;
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Initials avatar for publishers without logo
const InitialsAvatar = ({ name }) => {
  const letters = (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center text-2xl font-bold border border-gray-200">
      {letters || "?"}
    </div>
  );
};

// Skeleton card
const PublisherCardSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <div className="flex flex-col items-center text-center">
      <div className="w-32 h-32 rounded-lg bg-gray-200" />
      <div className="h-5 w-40 mt-4 bg-gray-200 rounded" />
      <div className="h-4 w-24 mt-2 bg-gray-200 rounded" />
      <div className="h-3 w-full mt-3 bg-gray-200 rounded" />
      <div className="h-3 w-3/4 mt-2 bg-gray-200 rounded" />
      <div className="h-10 w-32 mt-4 bg-gray-200 rounded" />
    </div>
  </div>
);

const Publishers = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setQuery(searchInput.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load publishers
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const response = await publisherApi.getPublishers({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: query,
          status: "active",
        });
        
        setPublishers(response.data || []);
        setTotalCount(response.total || 0);
      } catch (e) {
        console.error("Failed to load publishers:", e);
        setErr(e?.message || "Failed to load publishers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, query]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // Helper: build absolute image url from relative
  const makeImgUrl = (p) => {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    const base = BASE_URL.replace(/\/+$/, "");
    const rel = String(p).replace(/^\/+/, "");
    return base ? `${base}/${rel}` : `/${rel}`;
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
      {/* Breadcrumb */}
      <div className="pt-6 mb-8 sm:mb-12">
        <nav className="flex items-center text-[16px] text-gray-600 space-x-2">
          <Link to="/" className="hover:text-gray-800 transition-colors">
            {t('navbar.home')}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('publishers.title')}</span>
        </nav>
      </div>

      {/* Header + search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-[28px] font-bold">
          {t('publishers.title')}{" "}
          <span className="text-gray-500 font-normal text-[18px]">
            • {totalCount} {totalCount !== 1 ? t('publishers.title').toLowerCase() : t('publishers.title').toLowerCase().slice(0, -1)}
          </span>
        </h1>

        <div className="w-full md:max-w-md">
          <div className="relative">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              placeholder={t('publishers.searchPlaceholder')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-24 shadow-sm focus:border-black focus:outline-none"
              aria-label={t('publishers.searchPlaceholder')}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
              >
                {t('publishers.clear')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setQuery(searchInput.trim())}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-black px-3 py-1.5 text-white text-sm hover:bg-black/90"
            >
              {t('publishers.search')}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {err}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <PublisherCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && publishers.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">
            {query ? t('publishers.noPublishersMatched') : t('publishers.noPublishersFound')}
          </p>
        </div>
      )}

      {/* Publishers Grid */}
      {!loading && publishers.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {publishers.map((publisher) => (
              <div
                key={publisher._id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/publishers/${publisher.slug || publisher._id}`)}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Logo */}
                  {publisher.logo ? (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={makeImgUrl(publisher.logo)}
                        alt={publisher.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <InitialsAvatar name={publisher.name} />
                  )}

                  {/* Name */}
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 line-clamp-1">
                    {publisher.name}
                  </h3>

                  {/* Country */}
                  {publisher.country && (
                    <p className="text-sm text-gray-500 mt-1">
                      {publisher.country}
                    </p>
                  )}

                  {/* Description */}
                  {publisher.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {publisher.description}
                    </p>
                  )}

                  {/* Books count */}
                  <div className="mt-4 text-sm text-gray-500">
                    {publisher.books?.length || 0} {t('publishers.booksPublished')}
                  </div>

                  {/* View button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/publishers/${publisher.slug || publisher._id}`);
                    }}
                    className="mt-4 px-6 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
                  >
                    {t('publishers.viewPublisher')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pagination.prev')}
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Show first, last, current, and 2 pages around current
                  return (
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 2
                  );
                })
                .map((p, i, arr) => {
                  // Add ellipsis if gap
                  const prev = arr[i - 1];
                  const showEllipsis = prev && p - prev > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`px-4 py-2 border rounded-md ${
                          currentPage === p
                            ? "bg-black text-white border-black"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pagination.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Publishers;
