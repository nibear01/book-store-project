import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import BookCard from "./BookCard";
import ViewToggle from "./ViewToggle";
import MobileCardPager from "./MobileCardPager";
import AdaptiveCardGrid from "./AdaptiveCardGrid";

const PAGE_SIZE = 12;
const MOBILE_GROUP_SIZE = 4;

const BooksContent = ({
  // Data
  filteredBooks = [],
  loading = false,
  error = null,
  selectedCategory = "All",
  baseUrl,

  // Mobile states
  isMobile = false,
  mobileViewStrategy = "grid", // "grid" | "carousel"
  activeGroupIndex = 0,
  groupCount, // optional; computed if not provided

  // View states
  viewMode = "grid", // "grid" | "list"

  // Handlers
  onViewModeChange,
  onGroupChange,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onResetFilters,
}) => {
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  // Reset list length when results/filter change
  useEffect(() => {
    setDisplayLimit(PAGE_SIZE);
  }, [selectedCategory, filteredBooks]);

  // Memoize the slice to avoid re-slicing each render
  const displayedBooks = useMemo(
    () => filteredBooks.slice(0, displayLimit),
    [filteredBooks, displayLimit]
  );

  const hasMoreBooks = filteredBooks.length > displayLimit;

  // Infinite scroll (with graceful fallback to button)
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!hasMoreBooks) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setDisplayLimit((prev) => prev + PAGE_SIZE);
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMoreBooks]);

  const handleViewMore = useCallback(() => {
    setDisplayLimit((prev) => prev + PAGE_SIZE);
  }, []);

  const handleViewModeChange = useCallback(
    (newViewMode) => {
      onViewModeChange?.(newViewMode);
    },
    [onViewModeChange]
  );

  const renderBookCards = useCallback(
    (books) =>
      books.map((book) => (
        <BookCard
          key={book._id || book.id}
          book={book}
          baseUrl={baseUrl}
          viewMode={viewMode}
        />
      )),
    [baseUrl, viewMode]
  );

  const gridClass = useMemo(() => {
    if (viewMode === "grid") {
      return "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6";
    }
    return "grid grid-cols-1 gap-4 sm:gap-6";
  }, [viewMode]);

  if (loading) {
    // simple skeletons
    return (
      <main className="w-full lg:w-3/4 px-3 sm:px-0">
        <div className="bg-white rounded-md shadow-sm p-6 sm:p-8 mt-6 sm:mt-8">
          <div className="animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-40 sm:h-48 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full lg:w-3/4 px-3 sm:px-0">
        <div className="bg-white rounded-md shadow-sm p-6 sm:p-8 text-center mt-6 sm:mt-8 text-red-600 text-sm sm:text-base">
          {typeof error === "string"
            ? error
            : error?.message || "Failed to load"}
        </div>
      </main>
    );
  }

  if (!filteredBooks || filteredBooks.length === 0) {
    return (
      <main className="w-full lg:w-3/4 px-3 sm:px-0">
        <div className="bg-white rounded-md w-full shadow-sm p-6 sm:p-8 text-center mt-6 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            No books found
          </h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Try adjusting your filters to find what you're looking for.
          </p>
          <button
            onClick={onResetFilters}
            className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm sm:text-base"
            aria-label="Reset all filters"
            type="button"
          >
            Reset Filters
          </button>
        </div>
      </main>
    );
  }

  // ------- Rendering helpers -------
  const renderBookGrid = (books) => {
    if (isMobile) {
      if (mobileViewStrategy === "carousel") {
        const computedGroupCount =
          groupCount ??
          Math.max(1, Math.ceil(books.length / MOBILE_GROUP_SIZE));

        return (
          <div className="h-auto min-h-[400px] flex">
            <MobileCardPager
              activeGroupIndex={activeGroupIndex}
              groupCount={computedGroupCount}
              onGroupChange={onGroupChange}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {Array.from({ length: computedGroupCount }).map(
                (_, groupIndex) => {
                  const start = groupIndex * MOBILE_GROUP_SIZE;
                  const groupBooks = books.slice(
                    start,
                    start + MOBILE_GROUP_SIZE
                  );

                  return (
                    <div
                      key={groupIndex}
                      className="h-full w-full flex-shrink-0 px-2"
                      style={{
                        paddingLeft:
                          groupIndex === 0
                            ? "env(safe-area-inset-left, 0.75rem)"
                            : "0.75rem",
                        paddingRight:
                          groupIndex === computedGroupCount - 1
                            ? "env(safe-area-inset-right, 0.75rem)"
                            : "0.75rem",
                      }}
                    >
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
                        {renderBookCards(groupBooks)}
                      </div>
                    </div>
                  );
                }
              )}
            </MobileCardPager>
          </div>
        );
      }

      // mobile grid (non-carousel)
      return (
        <div className="h-auto min-h-[400px]">
          <AdaptiveCardGrid viewMode={viewMode}>
            {renderBookCards(books)}
          </AdaptiveCardGrid>
        </div>
      );
    }

    // Desktop / tablet grid
    return <div className={gridClass}>{renderBookCards(books)}</div>;
  };

  return (
    <main className="w-full lg:w-3/4 px-3 sm:px-0">
      {/* Header: title + view toggle */}
      <div className="mt-6 sm:mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-0 text-center sm:text-left">
            {selectedCategory === "All"
              ? "All Books"
              : `${selectedCategory} Books`}
            <span className="text-gray-500 text-sm sm:text-base ml-1 sm:ml-2">
              ({filteredBooks.length}{" "}
              {filteredBooks.length === 1 ? "book" : "books"})
            </span>
          </h2>

          <div className="flex justify-center sm:justify-end">
            <ViewToggle
              currentView={viewMode}
              onViewChange={handleViewModeChange}
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-3 sm:mt-4">{renderBookGrid(displayedBooks)}</div>

        {/* Infinite scroll sentinel + fallback button */}
        {hasMoreBooks && (
          <>
            <div ref={sentinelRef} aria-hidden="true" className="h-1" />
            <div className="flex justify-center mt-8">
              <button
                onClick={handleViewMore}
                className="px-6 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors font-medium"
                aria-label={`Load more books (showing ${displayedBooks.length} of ${filteredBooks.length})`}
                type="button"
              >
                View More ({displayedBooks.length} of {filteredBooks.length})
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default BooksContent;
