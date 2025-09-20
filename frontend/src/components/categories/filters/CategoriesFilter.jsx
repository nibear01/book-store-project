import React from "react";
import FilterSection from "../FilterSection";

const CategoriesFilter = ({
  categories,
  selectedCategory,
  onCategorySelect,
  isOpen,
  onToggle,
}) => (
  <div className="mb-6 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
    <button
      type="button"
      onClick={() => onToggle("categories")}
      className="w-full flex justify-between items-center text-left"
      aria-expanded={isOpen}
      aria-controls="filter-section-categories"
    >
      <h4 className="text-md font-medium text-gray-800">Categories</h4>
      <svg
        className={`h-5 w-5 transform transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>

    <div
      id="filter-section-categories"
      className={`mt-3 overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`flex items-center p-2 rounded-[2px] cursor-pointer transition-colors ${
              selectedCategory === category.title
                ? "bg-gray-100 text-black font-medium"
                : "hover:bg-gray-50"
            }`}
            onClick={() => onCategorySelect(category.title)}
          >
            <span className="flex-1">{category.title}</span>
            <span className="text-xs text-gray-500">{category.item}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CategoriesFilter;
