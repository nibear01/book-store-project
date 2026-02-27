import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { BooksContext } from "@/context/BooksContext";
import BookCard from "../categories/BookCard";
import { Link } from "react-router-dom";
import ButtonFill from "@/Button/ButtonFill";
import BookLoadingSkeleton from "@/components/ui/BookLoadingSkeleton";
import { useTranslation } from "react-i18next";

const categories = ["All", "History", "Science & Math", "Romance", "Travel"];

const NewReleases = () => {
  const { t } = useTranslation('common');
  const url = import.meta.env.VITE_BACKEND_URL;
  const [activeCategory, setActiveCategory] = useState("All");
  const { books, loading, error, fetchBooks } = useContext(BooksContext);
  // Normalize books shape
  const list = useMemo(
    () => (Array.isArray(books) ? books : books?.data || []),
    [books]
  );

  // Fetch books on mount if not already loaded
  useEffect(() => {
    if (list.length === 0 && !loading) fetchBooks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce switching categories to avoid repeated fetches
  const debounceRef = useRef(null);
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const filterBooks = useCallback(
    (category) => {
      setActiveCategory(category);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (category === "All") fetchBooks();
        else fetchBooks({ genre: category });
      }, 200);
    },
    [fetchBooks]
  );

  if (loading) {
    return (
      <div className="py-8 px-4 my-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <BookLoadingSkeleton
            count={10}
            gridClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"
          />
        </div>
      </div>
    );
  }

// Loading skeleton is handled above with BookLoadingSkeleton count=10


  if (error) {
    const errorMsg =
      typeof error === "string"
        ? error
        : error?.message || "Failed to load books.";
    return (
      <div className="flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <div className="text-lg font-semibold text-red-600 mb-4">
            {errorMsg}
          </div>
          <button
            onClick={() => fetchBooks()}
            className="px-6 py-2 bg-black text-white rounded-[2px] hover:bg-gray-800 transition-colors"
          >
            {t('shop.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div name="new-releases-section" className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
          <h1 name="new-releases-heading" className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center lg:text-left">
            {t('home.newReleases.title')}
          </h1>

          {/* Category Filter - Horizontal Scroll for Mobile */}
          <div className="w-full lg:w-auto overflow-x-auto pb-2">
            <div name="new-releases-filters" className="flex space-x-2 min-w-max">
              {categories.map((category) => (
                <button
                  name={`new-releases-filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  key={category}
                  onClick={() => filterBooks(category)}
                  className={`px-4 py-2 rounded-md transition-all duration-200 text-sm md:text-base whitespace-nowrap min-w-[100px] text-center
                    ${
                      activeCategory === category
                        ? "bg-black text-white border border-black"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div name="new-releases-books-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {list
            .filter((b) => !!b?.slug)
            .slice(0, 10) // Limit to 10 books
            .map((b, index) => (
              <BookCard
                key={b?._id || b?.id || b?.slug || index}
                book={b}
                baseUrl={url}
                viewMode="grid"
              />
            ))}
          {list.length > 10 ? (
            <div className="col-span-2 md:col-span-3 lg:col-span-5">
              <Link
                to={`/shop`}
                className="block text-center text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                <ButtonFill>{t('shop.seeAllBooks')}</ButtonFill>
              </Link>
            </div>
          ) : null}
        </div>

        {/* Empty State */}
        {list.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {t('shop.noBooksFound')}
            </h3>
            <p className="text-gray-500">{t('shop.tryDifferentCategory')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(NewReleases);
