import React from "react";
import { useTranslation } from "react-i18next";

const ActiveFilters = ({
  selectedCategory,
  ratingFilter,
  languageFilter,
  availabilityFilter,
  priceRange,
  searchQuery,
  onCategorySelect,
  onRatingFilterChange,
  onLanguageFilterChange,
  onAvailabilityFilterChange,
  onPriceRangeChange,
  onSearchQueryChange,
}) => {
  const { t } = useTranslation('common');
  const hasActiveFilters =
    selectedCategory !== "All" ||
    ratingFilter > 0 ||
    languageFilter !== "All" ||
    availabilityFilter !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 1500 ||
    searchQuery;

  if (!hasActiveFilters) return null;

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-800 mb-2">{t('filters.activeFilters')}</h4>
      <div className="flex flex-wrap gap-2">
        {selectedCategory !== "All" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
            {selectedCategory}
            <button
              onClick={() => onCategorySelect("All")}
              className="ml-1.5 rounded-md p-0.5 hover:bg-gray-200"
              aria-label={`Remove ${selectedCategory} filter`}
            >
              ×
            </button>
          </span>
        )}
        {ratingFilter > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
            {ratingFilter}+ {t('filters.stars')}
            <button
              onClick={() => onRatingFilterChange(0)}
              className="ml-1.5 rounded-md p-0.5 hover:bg-gray-200"
              aria-label={`Remove ${ratingFilter}+ stars filter`}
            >
              ×
            </button>
          </span>
        )}
        {languageFilter !== "All" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
            {languageFilter}
            <button
              onClick={() => onLanguageFilterChange("All")}
              className="ml-1.5 rounded-md p-0.5 hover:bg-gray-200"
              aria-label={`Remove ${languageFilter} language filter`}
            >
              ×
            </button>
          </span>
        )}
        {availabilityFilter !== "all" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
            {availabilityFilter === "inStock" ? t('filters.inStock') : t('filters.outOfStock')}
            <button
              onClick={() => onAvailabilityFilterChange("all")}
              className="ml-1.5 rounded-md p-0.5 hover:bg-gray-200"
              aria-label={`Remove ${
                availabilityFilter === "inStock" ? "In Stock" : "Out of Stock"
              } filter`}
            >
              ×
            </button>
          </span>
        )}
        {priceRange[0] > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
            {t('currency')}{priceRange[0]}+
            <button
              onClick={() => onPriceRangeChange([0, priceRange[1]])}
              className="ml-1.5 rounded-md p-0.5 hover:bg-gray-200"
              aria-label={`Remove minimum price filter`}
            >
              ×
            </button>
          </span>
        )}
        {priceRange[1] < 50 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
            {t('filters.under')} {t('currency')}{priceRange[1]}
            <button
              onClick={() => onPriceRangeChange([priceRange[0], 50])}
              className="ml-1.5 rounded-md p-0.5 hover:bg-gray-200"
              aria-label={`Remove maximum price filter`}
            >
              ×
            </button>
          </span>
        )}
        {searchQuery && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
            "{searchQuery}"
            <button
              onClick={() => onSearchQueryChange("")}
              className="ml-1.5 rounded-md p-0.5 hover:bg-gray-200"
              aria-label={`Remove search query "${searchQuery}"`}
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default ActiveFilters;
