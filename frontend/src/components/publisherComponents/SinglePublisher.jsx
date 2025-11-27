import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Building2, Globe, MapPin, Calendar, ArrowLeft, BookOpen } from "lucide-react";
import * as publisherApi from "@/api/publisher-api";
import BookCard from "@/components/categories/BookCard";
import { useTranslation } from "react-i18next";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://192.168.0.104:5000";

const SinglePublisher = () => {
  const { t } = useTranslation('common');
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  
  const [publisher, setPublisher] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        
        // Fetch publisher details
        const pubResponse = await publisherApi.getPublisher(slugOrId);
        setPublisher(pubResponse.data);

        // Fetch publisher's books
        setLoadingBooks(true);
        const booksResponse = await publisherApi.getBooksByPublisher(slugOrId);
        setBooks(booksResponse.data || []);
      } catch (e) {
        console.error("Failed to load publisher:", e);
        setErr(e?.message || "Failed to load publisher");
      } finally {
        setLoading(false);
        setLoadingBooks(false);
      }
    };
    load();
  }, [slugOrId]);

  const getLogoUrl = (logo) => {
    if (!logo) return "";
    if (/^https?:\/\//i.test(logo)) return logo;
    const base = BASE_URL.replace(/\/+$/, "");
    const rel = String(logo).replace(/^\/+/, "");
    return base ? `${base}/${rel}` : `/${rel}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="flex gap-6">
            <div className="w-48 h-48 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-64 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (err || !publisher) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {t('publishers.publisherNotFound')}
          </h2>
          <p className="text-gray-600 mb-6">{err || t('publishers.publisherNotFoundDesc')}</p>
          <button
            onClick={() => navigate("/publishers")}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            {t('publishers.browsePublishers')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-600 space-x-2 mb-8">
        <Link to="/" className="hover:text-gray-800 transition-colors">
          {t('navbar.home')}
        </Link>
        <span>/</span>
        <Link to="/publishers" className="hover:text-gray-800 transition-colors">
          {t('publishers.title')}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{publisher.name}</span>
      </nav>

      {/* Back button */}
      <button
        onClick={() => navigate("/publishers")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        {t('publishers.backToPublishers')}
      </button>

      {/* Publisher Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            {publisher.logo ? (
              <div className="w-48 h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={getLogoUrl(publisher.logo)}
                  alt={publisher.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                <Building2 className="w-24 h-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {publisher.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {t('publishers.publisherId')} {publisher.publisher_id}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  publisher.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {publisher.is_active ? t('publishers.active') : t('publishers.inactive')}
              </span>
            </div>

            {publisher.description && (
              <p className="text-gray-700 mb-6 leading-relaxed">
                {publisher.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {publisher.country && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{publisher.country}</span>
                </div>
              )}
              {publisher.founded_year && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{t('publishers.founded')} {publisher.founded_year}</span>
                </div>
              )}
              {publisher.website && (
                <div className="flex items-center gap-2 text-gray-600 col-span-2">
                  <Globe className="w-4 h-4" />
                  <a
                    href={publisher.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {publisher.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Books Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          {t('publishers.booksBy')} {publisher.name}
          <span className="text-gray-500 font-normal text-lg">
            ({books.length})
          </span>
        </h2>

        {loadingBooks ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
                <div className="mt-2 h-4 bg-gray-200 rounded" />
                <div className="mt-2 h-3 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">
              {t('publishers.noBooksFromPublisher')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                baseUrl={BASE_URL}
                viewMode="grid"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SinglePublisher;
