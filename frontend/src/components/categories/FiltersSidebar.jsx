import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ActiveFilters from "./filters/ActiveFilters";
import CategoriesFilter from "./filters/CategoriesFilter";
import PriceFilter from "./filters/PriceFilter";
import LanguageFilter from "./filters/LanguageFilter";
import AvailabilityFilter from "./filters/AvailabilityFilter";

const DEBOUNCE_MS = 350;

const FiltersSidebar = ({
  // Filter states
  selectedCategory,
  priceRange,
  ratingFilter,
  languageFilter,
  availabilityFilter,
  searchQuery,
  categories = [],
  filterSections = {
    categories: true,
    price: true,
    language: true,
    availability: true,
  },

  // Filter handlers
  onCategorySelect,
  onPriceRangeChange,
  onRatingFilterChange,
  onLanguageFilterChange,
  onAvailabilityFilterChange,
  onSearchQueryChange,
  onToggleFilterSection,
  onResetFilters,
  // dynamic limits from admin settings (optional)
  priceMinLimit = 0,
  priceMaxLimit = 1500,
}) => {
  // Local state for debounced search
  const [searchValue, setSearchValue] = useState(searchQuery ?? "");

  // Keep internal state in sync if parent changes searchQuery externally
  useEffect(() => {
    setSearchValue(searchQuery ?? "");
  }, [searchQuery]);

  // Debounce propagation up to parent
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof onSearchQueryChange === "function") {
        onSearchQueryChange(searchValue);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchValue, onSearchQueryChange]);

  const { t } = useTranslation('common');
  
  const hasActiveSearch = useMemo(
    () => (searchValue ?? "").length > 0,
    [searchValue]
  );

  return (
    <aside className="lg:w-1/4 lg:self-start lg:sticky lg:top-24">
      <div className="bg-white rounded-md shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">{t('filters.title')}</h3>
          <button
            onClick={onResetFilters}
            className="text-sm text-gray-600 hover:text-black font-medium rounded-md"
            aria-label={t('filters.resetAll')}
            type="button"
          >
            {t('filters.resetAll')}
          </button>
        </div>

        {/* Active Filters */}
        <ActiveFilters
          selectedCategory={selectedCategory}
          ratingFilter={ratingFilter}
          languageFilter={languageFilter}
          availabilityFilter={availabilityFilter}
          priceRange={priceRange}
          searchQuery={searchValue}
          onCategorySelect={onCategorySelect}
          onRatingFilterChange={onRatingFilterChange}
          onLanguageFilterChange={onLanguageFilterChange}
          onAvailabilityFilterChange={onAvailabilityFilterChange}
          onPriceRangeChange={onPriceRangeChange}
          onSearchQueryChange={onSearchQueryChange}
          aria-live="polite"
        />

        {/* Search Filter */}
        <div className="mb-6">
          <div className="relative">
            <label htmlFor="filters-search" className="sr-only">
              {t('filters.searchBooks')}
            </label>
            <input
              id="filters-search"
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t('filters.searchBooks')}
              className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              aria-label={t('filters.searchBooks')}
            />
            {/* Search icon */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {/* Clear button */}
            {hasActiveSearch && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 rounded-md"
                aria-label="Clear search"
                title="Clear search"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Categories Filter */}
        <CategoriesFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
          isOpen={!!filterSections.categories}
          onToggle={onToggleFilterSection}
        />

        {/* Price Filter */}
        <PriceFilter
          priceRange={priceRange}
          onPriceRangeChange={onPriceRangeChange}
          isOpen={!!filterSections.price}
          onToggle={onToggleFilterSection}
          minLimit={priceMinLimit}
          maxLimit={priceMaxLimit}
        />

        {/* Language Filter */}
        <LanguageFilter
          languageFilter={languageFilter}
          onLanguageFilterChange={onLanguageFilterChange}
          isOpen={!!filterSections.language}
          onToggle={onToggleFilterSection}
        />

        {/* Availability Filter */}
        <AvailabilityFilter
          availabilityFilter={availabilityFilter}
          onAvailabilityFilterChange={onAvailabilityFilterChange}
          isOpen={!!filterSections.availability}
          onToggle={onToggleFilterSection}
        />
      </div>
    </aside>
  );
};

export default FiltersSidebar;
