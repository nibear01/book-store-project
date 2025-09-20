import React from "react";
import ActiveFilters from "./filters/ActiveFilters";
import CategoriesFilter from "./filters/CategoriesFilter";
import PriceFilter from "./filters/PriceFilter";
import LanguageFilter from "./filters/LanguageFilter";
import AvailabilityFilter from "./filters/AvailabilityFilter";

const FiltersSidebar = ({
  // Filter states
  selectedCategory,
  priceRange,
  ratingFilter,
  languageFilter,
  availabilityFilter,
  searchQuery,
  categories,
  filterSections,

  // Filter handlers
  onCategorySelect,
  onPriceRangeChange,
  onRatingFilterChange,
  onLanguageFilterChange,
  onAvailabilityFilterChange,
  onSearchQueryChange,
  onToggleFilterSection,
  onResetFilters,
}) => {
  return (
    <aside className="lg:w-1/4 lg:top-24 lg:self-start">
      <div className="bg-white rounded-[2px] shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Filters</h3>
          <button
            onClick={onResetFilters}
            className="text-sm text-gray-600 hover:text-black font-medium"
            aria-label="Reset all filters"
          >
            Reset All
          </button>
        </div>

        {/* Active Filters */}
        <ActiveFilters
          selectedCategory={selectedCategory}
          ratingFilter={ratingFilter}
          languageFilter={languageFilter}
          availabilityFilter={availabilityFilter}
          priceRange={priceRange}
          searchQuery={searchQuery}
          onCategorySelect={onCategorySelect}
          onRatingFilterChange={onRatingFilterChange}
          onLanguageFilterChange={onLanguageFilterChange}
          onAvailabilityFilterChange={onAvailabilityFilterChange}
          onPriceRangeChange={onPriceRangeChange}
          onSearchQueryChange={onSearchQueryChange}
        />

        {/* Search Filter */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search books..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              aria-label="Search books"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Categories Filter */}
        <CategoriesFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
          isOpen={filterSections.categories}
          onToggle={onToggleFilterSection}
        />

        {/* Price Filter */}
        <PriceFilter
          priceRange={priceRange}
          onPriceRangeChange={onPriceRangeChange}
          isOpen={filterSections.price}
          onToggle={onToggleFilterSection}
        />

        {/* Language Filter */}
        <LanguageFilter
          languageFilter={languageFilter}
          onLanguageFilterChange={onLanguageFilterChange}
          isOpen={filterSections.language}
          onToggle={onToggleFilterSection}
        />

        {/* Availability Filter */}
        <AvailabilityFilter
          availabilityFilter={availabilityFilter}
          onAvailabilityFilterChange={onAvailabilityFilterChange}
          isOpen={filterSections.availability}
          onToggle={onToggleFilterSection}
        />
      </div>
    </aside>
  );
};

export default FiltersSidebar;
