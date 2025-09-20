import React from "react";
import FilterSection from "../FilterSection";

const LanguageFilter = ({
  languageFilter,
  onLanguageFilterChange,
  isOpen,
  onToggle,
}) => (
  <FilterSection
    title="Language"
    sectionId="language"
    isOpen={isOpen}
    onToggle={onToggle}
  >
    <div className="space-y-2">
      {["All", "English", "Bangla"].map((lang) => (
        <div
          key={lang}
          className="flex items-center"
          onClick={() => onLanguageFilterChange(lang)}
        >
          <input
            type="radio"
            id={`language-${lang}`}
            name="language"
            checked={languageFilter === lang}
            onChange={() => onLanguageFilterChange(lang)}
            className="h-4 w-4 text-black focus:ring-black border-gray-300"
          />
          <label
            htmlFor={`language-${lang}`}
            className="ml-3 text-sm text-gray-700 cursor-pointer"
          >
            {lang}
          </label>
        </div>
      ))}
    </div>
  </FilterSection>
);

export default LanguageFilter;
