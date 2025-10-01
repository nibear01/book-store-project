import React from "react";

const FilterSection = ({ title, children, sectionId, isOpen, onToggle }) => (
  <div className="mb-6 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
    <button
      type="button"
      onClick={() => onToggle(sectionId)}
      className="w-full flex justify-between rounded-md items-center text-left"
      aria-expanded={isOpen}
      aria-controls={`filter-section-${sectionId}`}
    >
      <h4 className="text-md font-medium text-gray-800">{title}</h4>
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
      id={`filter-section-${sectionId}`}
      className={`mt-3 overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      {children}
    </div>
  </div>
);

export default FilterSection;
