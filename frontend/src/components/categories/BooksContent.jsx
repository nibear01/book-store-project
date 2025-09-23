import React, { useState } from "react";
import BookCard from "./BookCard";
import ViewToggle from "./ViewToggle";
import MobileCardPager from "./MobileCardPager";
import AdaptiveCardGrid from "./AdaptiveCardGrid";

const BooksContent = ({
  // Data
  filteredBooks,
  loading,
  error,
  selectedCategory,
  baseUrl,

  // Mobile states
  isMobile,
  mobileViewStrategy,
  activeGroupIndex,
  groupCount,

  // View states
  viewMode,

  // Handlers
  onViewModeChange,
  onGroupChange,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onResetFilters,
}) => {
  const [displayLimit, setDisplayLimit] = useState(12);

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow-sm p-6 sm:p-8 text-center mt-6 sm:mt-8 text-sm sm:text-base">
        Loading books...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-md shadow-sm p-6 sm:p-8 text-center mt-6 sm:mt-8 text-red-600 text-sm sm:text-base">
        {typeof error === "string" ? error : error?.message || "Failed to load"}
      </div>
    );
  }

  if (filteredBooks.length === 0) {
    return (
      <div className="bg-white rounded-md shadow-sm p-6 sm:p-8 text-center mt-6 sm:mt-8">
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
        >
          Reset Filters
        </button>
      </div>
    );
  }

  // Determine which books to display based on limit
  const displayedBooks = filteredBooks.slice(0, displayLimit);
  const hasMoreBooks = filteredBooks.length > displayLimit;

  // Handle view more click
  const handleViewMore = () => {
    setDisplayLimit(prevLimit => prevLimit + 12);
  };

  // Handle view mode change
  const handleViewModeChange = (newViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(newViewMode);
    }
  };

  // Render book cards based on view mode
  const renderBookCards = (books) => {
    return books.map((book) => (
      <BookCard
        key={book._id || book.id}
        book={book}
        baseUrl={baseUrl}
        viewMode={viewMode}
      />
    ));
  };

  // Render book grid based on device and view mode
  const renderBookGrid = (books) => {
    if (isMobile) {
      if (mobileViewStrategy === "carousel") {
        return (
          <div className="h-auto min-h-[400px] flex">
            <MobileCardPager
              activeGroupIndex={activeGroupIndex}
              groupCount={groupCount}
              onGroupChange={onGroupChange}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {Array.from({ length: groupCount }).map((_, groupIndex) => {
                const groupBooks = books.slice(
                  groupIndex * 4,
                  groupIndex * 4 + 4
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
                        groupIndex === groupCount - 1
                          ? "env(safe-area-inset-right, 0.75rem)"
                          : "0.75rem",
                    }}
                  >
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
                      {renderBookCards(groupBooks)}
                    </div>
                  </div>
                );
              })}
            </MobileCardPager>
          </div>
        );
      } else {
        return (
          <div className="h-auto min-h-[400px]">
            <AdaptiveCardGrid viewMode={viewMode}>
              {renderBookCards(books)}
            </AdaptiveCardGrid>
          </div>
        );
      }
    } else {
      // Desktop/Tablet Implementation
      const gridClass = viewMode === "grid" 
        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        : "grid grid-cols-1 gap-4 sm:gap-6";
      
      return (
        <div className={gridClass}>
          {renderBookCards(books)}
        </div>
      );
    }
  };

  return (
    <main className="w-full lg:w-3/4 px-3 sm:px-0">
      {/* Book results section */}
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

          {/* View toggle */}
          <div className="flex justify-center sm:justify-end">
            <ViewToggle 
              currentView={viewMode} 
              onViewChange={handleViewModeChange} 
            />
          </div>
        </div>

        {/* Book grid/list display */}
        <div className="mt-3 sm:mt-4">
          {renderBookGrid(displayedBooks)}
        </div>

        {/* View More button */}
        {hasMoreBooks && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleViewMore}
              className="px-6 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors font-medium"
              aria-label={`Load more books (showing ${displayedBooks.length} of ${filteredBooks.length})`}
            >
              View More ({displayedBooks.length} of {filteredBooks.length})
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default BooksContent;