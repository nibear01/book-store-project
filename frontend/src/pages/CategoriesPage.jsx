import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { BooksContext } from "@/context/BooksContext";
import { useCategories } from "../hooks/useCategories";
import FiltersSidebar from "../components/categories/FiltersSidebar";
import BooksContent from "../components/categories/BooksContent";
import ButtonFill from "@/Button/ButtonFill";

const CategoriesPage = () => {
  const { url, books, loading, error, fetchBooks } = useContext(BooksContext);
  const book = books.data || [];

  const {
    // States
    selectedCategory,
    sortOption,
    priceRange,
    ratingFilter,
    languageFilter,
    availabilityFilter,
    searchQuery,
    viewMode,
    mobileViewStrategy,
    activeGroupIndex,
    isMobile,
    filteredBooks,
    page,
    limit,
    filterSections,
    categories,
    groupCount,

    setPriceRange,
    setRatingFilter,
    setLanguageFilter,
    setAvailabilityFilter,
    setSearchQuery,
    setViewMode,
    setMobileViewStrategy,
    setActiveGroupIndex,
    setPage,
    handleCategorySelect,
    resetFilters,
    toggleFilterSection,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useCategories(book);

  // Server-side filtering with useEffect
  useEffect(() => {
    const params = {
      page,
      limit,
      // map filters supported by backend
      ...(searchQuery.trim() && { search: searchQuery.trim() }),
      ...(selectedCategory !== "All" && { genre: selectedCategory }),
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      ...(languageFilter !== "All" && { language: languageFilter }),
      ...(ratingFilter > 0 && { minRating: ratingFilter }),
      ...(availabilityFilter === "inStock" && { inStock: true }),
      ...(availabilityFilter === "outOfStock" && { inStock: false }),
      // map sort option to API sort format
      sort:
        sortOption === "priceLowHigh"
          ? "price"
          : sortOption === "priceHighLow"
          ? "-price"
          : sortOption === "rating"
          ? "-rating"
          : sortOption === "newest"
          ? "-published_date"
          : sortOption === "bestselling"
          ? "-num_reviews"
          : "-is_featured",
    };
    // reset to first page when filters (except page/limit) change
    setActiveGroupIndex(0);
    fetchBooks(params);
  }, [
    page,
    limit,
    selectedCategory,
    sortOption,
    priceRange,
    ratingFilter,
    languageFilter,
    availabilityFilter,
    searchQuery,
    setActiveGroupIndex,
    fetchBooks,
  ]);

  const totalPages = books?.pagination?.pages || 1;
  const currentPage = books?.pagination?.page || page;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Button */}
      <div className="flex justify-center md:justify-end">
        <Link to="/bookrequest">
          <ButtonFill>Request Book</ButtonFill>
        </Link>
      </div>

      <div>
        {/* Main layout with sidebar and content */}
        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {/* Left sidebar - filters */}
          <FiltersSidebar
            selectedCategory={selectedCategory}
            priceRange={priceRange}
            ratingFilter={ratingFilter}
            languageFilter={languageFilter}
            availabilityFilter={availabilityFilter}
            searchQuery={searchQuery}
            categories={categories}
            filterSections={filterSections}
            onCategorySelect={handleCategorySelect}
            onPriceRangeChange={setPriceRange}
            onRatingFilterChange={setRatingFilter}
            onLanguageFilterChange={setLanguageFilter}
            onAvailabilityFilterChange={setAvailabilityFilter}
            onSearchQueryChange={setSearchQuery}
            onToggleFilterSection={toggleFilterSection}
            onResetFilters={resetFilters}
          />

          {/* Right content - books */}
          <BooksContent
            filteredBooks={filteredBooks}
            loading={loading}
            error={error}
            selectedCategory={selectedCategory}
            baseUrl={url}
            isMobile={isMobile}
            mobileViewStrategy={mobileViewStrategy}
            activeGroupIndex={activeGroupIndex}
            groupCount={groupCount}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onMobileStrategyChange={setMobileViewStrategy}
            onGroupChange={setActiveGroupIndex}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onResetFilters={resetFilters}
          />
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages })
              .slice(0, 10)
              .map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 border rounded-md text-sm ${
                      currentPage === pageNum
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            <button
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
