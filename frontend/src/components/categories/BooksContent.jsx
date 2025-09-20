import React from "react";
import BookCard from "./BookCard";
import ViewToggle from "./ViewToggle";
import MobileStrategyToggle from "./MobileStrategyToggle";
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
  onMobileStrategyChange,
  onGroupChange,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onResetFilters,
}) => {
  const calculateGroupCount = () => {
    return Math.ceil(filteredBooks.length / 4);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2px] shadow-sm p-8 text-center mt-8">
        Loading books...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[2px] shadow-sm p-8 text-center mt-8 text-red-600">
        {typeof error === "string" ? error : error?.message || "Failed to load"}
      </div>
    );
  }

  if (filteredBooks.length === 0) {
    return (
      <div className="bg-white rounded-[2px] shadow-sm p-8 text-center mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No books found
        </h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your filters to find what you're looking for.
        </p>
        <button
          onClick={onResetFilters}
          className="px-4 py-2 bg-black text-white rounded-[2px] hover:bg-gray-800 transition-colors"
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <main className="lg:w-3/4">
      {/* Mobile View Strategy Toggle */}
      <MobileStrategyToggle
        isMobile={isMobile}
        mobileViewStrategy={mobileViewStrategy}
        onStrategyChange={onMobileStrategyChange}
      />

      {/* Book results section */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
            {selectedCategory === "All"
              ? "All Books"
              : `${selectedCategory} Books`}
            <span className="text-gray-500 text-base ml-2">
              ({filteredBooks.length}{" "}
              {filteredBooks.length === 1 ? "book" : "books"})
            </span>
          </h2>

          {/* View toggle and sorting controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <ViewToggle
              currentView={viewMode}
              onViewChange={onViewModeChange}
            />
          </div>
        </div>

        {/* Book grid/list display */}
        <div className="mt-4">
          {isMobile ? (
            mobileViewStrategy === "carousel" ? (
              // Mobile Swipe Pager
              <div
                className="h-[calc(100vh-200px)]"
                style={{ minHeight: "400px" }}
              >
                <MobileCardPager
                  activeGroupIndex={activeGroupIndex}
                  groupCount={groupCount}
                  onGroupChange={onGroupChange}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {Array.from({ length: groupCount }).map((_, groupIndex) => {
                    const groupBooks = filteredBooks.slice(
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
                              ? "env(safe-area-inset-left, 1rem)"
                              : "1rem",
                          paddingRight:
                            groupIndex === groupCount - 1
                              ? "env(safe-area-inset-right, 1rem)"
                              : "1rem",
                        }}
                      >
                        <div className="grid grid-cols-2 gap-4 h-full">
                          {groupBooks.map((book) => (
                            <BookCard
                              key={book.id}
                              book={book}
                              baseUrl={baseUrl}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </MobileCardPager>
              </div>
            ) : (
              // Mobile Adaptive Grid
              <div
                className="h-[calc(100vh-200px)]"
                style={{ minHeight: "400px" }}
              >
                <AdaptiveCardGrid>
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} book={book} baseUrl={baseUrl} />
                  ))}
                </AdaptiveCardGrid>
              </div>
            )
          ) : (
            // Desktop/Tablet Implementation
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book._id || book.id}
                  book={book}
                  baseUrl={baseUrl}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default BooksContent;
