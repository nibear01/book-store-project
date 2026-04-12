import { useContext, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BooksContext } from "@/context/BooksContext";
import { useCategories } from "../hooks/useCategories";
import FiltersSidebar from "../components/categories/FiltersSidebar";
import BooksContent from "../components/categories/BooksContent";
import ButtonFill from "@/Button/ButtonFill";
import { useTranslation } from "react-i18next";

const CategoriesPage = () => {
  const { t } = useTranslation("common");
  const { url, books, loading, error, fetchBooks } = useContext(BooksContext);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const categorySlug = params.get("category");
  const book = books.data || [];

  const {
    // States
    selectedCategory,
    sortOption,
    priceRange,
    priceLimits,
    ratingFilter,
    languageFilter,
    availabilityFilter,
    searchQuery,
    viewMode,
    mobileViewStrategy,
    activeGroupIndex,
    isMobile,
    filteredBooks,
    cursor,
    limit,
    nextCursor,
    previousCursor,
    hasNextPage,
    hasPreviousPage,
    filterSections,
    categories,
    groupCount,

    setCursor,
    setPriceRange,
    setRatingFilter,
    setLanguageFilter,
    setAvailabilityFilter,
    setSearchQuery,
    setViewMode,
    setMobileViewStrategy,
    setActiveGroupIndex,
    handleCategorySelect,
    resetFilters,
    toggleFilterSection,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useCategories(book, categorySlug);

  // Ensure clearing category also clears the URL ?category param
  const handleResetFiltersAndUrl = useCallback(() => {
    resetFilters();
    navigate({ pathname: "/categories" }, { replace: false });
  }, [resetFilters, navigate]);

  // When category is deselected (cross) or set to All, also clear URL
  const handleCategorySelectWithUrl = useCallback(
    (category) => {
      const next = category || "All";
      handleCategorySelect(next);
      if (next === "All") {
        navigate({ pathname: "/categories" }, { replace: false });
      }
    },
    [handleCategorySelect, navigate],
  );

  // Server-side filtering with useEffect using cursor-based pagination
  useEffect(() => {
    const params = {
      limit,
      ...(cursor && { cursor }),
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
    // reset to first group when filters (except cursor) change
    setActiveGroupIndex(0);
    fetchBooks(params);
  }, [
    cursor,
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

  const priceLimitsError = priceRange[0] < 0 || priceRange[1] < 0; // basic check; could be expanded

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Button */}
      <div className="flex justify-center md:justify-end">
        <Link to="/bookrequest">
          <ButtonFill>{t("shop.requestBook")}</ButtonFill>
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
            onCategorySelect={handleCategorySelectWithUrl}
            onPriceRangeChange={setPriceRange}
            onRatingFilterChange={setRatingFilter}
            onLanguageFilterChange={setLanguageFilter}
            onAvailabilityFilterChange={setAvailabilityFilter}
            onSearchQueryChange={setSearchQuery}
            onToggleFilterSection={toggleFilterSection}
            onResetFilters={handleResetFiltersAndUrl}
            priceMinLimit={priceLimits.min}
            priceMaxLimit={priceLimits.max}
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
            sortOption={sortOption}
            onViewModeChange={setViewMode}
            onSortOptionChange={(newSort) => {
              const sortMap = {
                featured: "featured",
                newest: "newest",
                oldest: "oldest",
                priceLowHigh: "priceLowHigh",
                priceHighLow: "priceHighLow",
                rating: "rating",
                bestselling: "bestselling",
              };
              const mappedSort = sortMap[newSort] || newSort;
              // Update local state in useCategories hook
              if (typeof window !== "undefined") {
                // Trigger the setSortOption from useCategories
                const event = new CustomEvent("sortOptionChange", {
                  detail: mappedSort,
                });
                window.dispatchEvent(event);
              }
            }}
            onMobileStrategyChange={setMobileViewStrategy}
            onGroupChange={setActiveGroupIndex}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onResetFilters={resetFilters}
          />
        </div>

        {/* Pagination controls - Cursor Based */}
        {(hasNextPage || hasPreviousPage) && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:border-gray-400"
              onClick={() => setCursor(previousCursor)}
              disabled={!hasPreviousPage}
              title={
                hasPreviousPage ? "Load previous page" : "No previous page"
              }
            >
              {t("pagination.prev")}
            </button>
            <span className="px-3 py-2 text-sm text-gray-600">
              {books?.data?.length > 0
                ? `${books.data.length} results`
                : "No results"}
            </span>
            <button
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:border-gray-400"
              onClick={() => setCursor(nextCursor)}
              disabled={!hasNextPage}
              title={hasNextPage ? "Load next page" : "No more results"}
            >
              {t("pagination.next")}
            </button>
          </div>
        )}
        {/* Settings/Error notice */}
        {priceLimitsError && (
          <div className="mt-6 text-center text-sm text-red-600" role="alert">
            {t("shop.priceRangeError")}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
