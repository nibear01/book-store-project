import { useState, useEffect, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { BooksContext } from "@/context/BooksContext";
import { usePrintSettings } from "@/context/PrintSettingsContext";
import { FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  getBookPrice,
} from "./BookPrintPricing";

const RelatedBooksPanel = ({ book }) => {
  const { t } = useTranslation(['bookView', 'common']);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const context = useContext(BooksContext);

  // Check if context functions exist
  const { getBooksByGenre, getBooksByAuthor, url } = context || {};
  const { printSettings } = usePrintSettings();

  useEffect(() => {
    const fetchRelatedBooks = async () => {
      if (!book) return;

      // Check if required functions are available
      if (
        typeof getBooksByGenre !== "function" ||
        typeof getBooksByAuthor !== "function"
      ) {
        console.error("Required context functions are not available");
        setError("Related books feature is currently unavailable");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const promises = [];

        // Fetch books by primary genre (exclude current book)
        if (
          book.genre &&
          book.genre.length > 0 &&
          typeof getBooksByGenre === "function"
        ) {
          // Try with up to first two genres to improve relevance
          const uniqueGenres = Array.from(new Set(book.genre.slice(0, 2)));
          uniqueGenres.forEach((g) => promises.push(getBooksByGenre(g, 6)));
        }

        // Optional: include same author
        if (book.author && typeof getBooksByAuthor === "function") {
          promises.push(getBooksByAuthor(book.author, 6));
        }

        // If no promises were created, skip fetching
        if (promises.length === 0) {
          setRelatedBooks([]);
          setLoading(false);
          return;
        }

        const results = promises.length
          ? await Promise.allSettled(promises)
          : [];

        let combinedBooks = [];
        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value) {
            const filteredBooks = result.value.filter(
              (relatedBook) => relatedBook._id !== book._id
            );
            combinedBooks = [...combinedBooks, ...filteredBooks];
          }
        });

        // Remove duplicates by book ID
        const uniqueBooks = combinedBooks.reduce((acc, current) => {
          if (!acc.find((book) => book._id === current._id)) {
            acc.push(current);
          }
          return acc;
        }, []);

        setRelatedBooks(uniqueBooks.slice(0, 12));
      } catch (error) {
        console.error("Error fetching related books:", error);
        setError("Failed to load related books");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedBooks();
  }, [book, getBooksByGenre, getBooksByAuthor]);

  // Show error state
  if (error) {
    return (
      <div className="mt-12 border-t pt-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">
          {t('bookView.related.title')}
        </h3>
        <div className="text-center py-8 text-gray-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-12 border-t pt-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">
          {t('bookView.related.title')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-40 rounded-[2px] mb-2"></div>
              <div className="bg-gray-200 h-4 rounded mb-1"></div>
              <div className="bg-gray-200 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!relatedBooks || relatedBooks.length === 0) {
    return (
      <div className="mt-12 border-t pt-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">
          {t('bookView.related.title')}
        </h3>
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-[2px] border border-dashed border-gray-200">
          <p className="font-medium">{t('bookView.related.noBooks')}</p>
          <p className="text-sm mt-1">
            {t('bookView.related.tryExploring')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">
        {t('bookView.related.title')}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {relatedBooks.map((relatedBook) => (
          <RelatedBookCard
            key={relatedBook._id}
            book={relatedBook}
            baseUrl={url}
            printSettings={printSettings}
          />
        ))}
      </div>
    </div>
  );
};

// RelatedBookCard with pricing and improved UI
const RelatedBookCard = ({ book, baseUrl, printSettings }) => {
  const { t } = useTranslation(['bookView', 'common']);
  const [imageError, setImageError] = useState(false);
  const coverRaw = Array.isArray(book?.cover_image)
    ? book.cover_image[0]
    : book?.cover_image;
  const cover = coverRaw
    ? /^https?:/i.test(coverRaw)
      ? coverRaw
      : `${baseUrl || ""}${coverRaw}`
    : null;

  // Price for the default print options (same rule the cart charges)
  const price = useMemo(() => {
    const p = getBookPrice(book, printSettings);
    return { now: p.price, ref: p.compareAt ?? p.price, sale: p.onSale };
  }, [book, printSettings]);

  const displayImage =
    cover && !imageError
      ? cover
      : "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='420'>
           <rect width='100%' height='100%' fill='#f3f4f6'/>
           <g fill='#e5e7eb'>
             <rect x='60' y='60' width='180' height='280' rx='6'/>
           </g>
           <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-size='14' font-family='Arial'>No Book Cover</text>
         </svg>`
        );

  return (
    <Link
      to={`/bookview/${book.slug || book._id}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
    >
      <div className="relative overflow-hidden">
        <img
          src={displayImage}
          alt={book.title}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />

        {book?.is_deal_of_the_week && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 rounded-full shadow">
            {t('bookView.related.dealOfWeek')}
          </span>
        )}
        {book?.is_on_sale && !book?.is_deal_of_the_week && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded-full shadow">
            {t('bookView.related.onSale')}
          </span>
        )}
      </div>

      <div className="p-3">
        <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-gray-800 transition-colors">
          {book.title}
        </h4>
        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
          {t('bookView.by')} {book.author}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-xs font-medium">{book.rating || 0}</span>
            <span className="text-xs text-gray-500">
              ({book.num_reviews || 0})
            </span>
          </div>
          <div className="text-right">
            {price.sale ? (
              <>
                <span className="text-sm font-bold text-red-600">
                  {t('common:currency')}{Number(price.now).toFixed(0)}
                </span>
                <span className="text-xs text-gray-500 line-through ml-1">
                  {t('common:currency')}{Number(price.ref).toFixed(0)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-gray-900">
                {t('common:currency')}{Number(price.now).toFixed(0)}
              </span>
            )}
          </div>
        </div>
        {Array.isArray(book.genre) && book.genre.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {book.genre.slice(0, 2).map((g, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default RelatedBooksPanel;
