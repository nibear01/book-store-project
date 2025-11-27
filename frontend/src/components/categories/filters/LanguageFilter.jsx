import React from "react";
import { useTranslation } from "react-i18next";
import FilterSection from "../FilterSection";

const LanguageFilter = ({
  languageFilter,
  onLanguageFilterChange,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation('common');
  const languages = [
    { value: "All", label: t('filters.all') },
    { value: "English", label: t('filters.languageEnglish') },
    { value: "Bangla", label: t('filters.languageBangla') }
  ];
  return (
  <FilterSection
    title={t('filters.language')}
    sectionId="language"
    isOpen={isOpen}
    onToggle={onToggle}
  >
    <div className="space-y-2">
      {languages.map((lang) => (
        <div
          key={lang.value}
          className="flex items-center"
          onClick={() => onLanguageFilterChange(lang.value)}
        >
          <input
            type="radio"
            id={`language-${lang.value}`}
            name="language"
            checked={languageFilter === lang.value}
            onChange={() => onLanguageFilterChange(lang.value)}
            className="h-4 w-4 text-black focus:ring-black border-gray-300"
          />
          <label
            htmlFor={`language-${lang.value}`}
            className="ml-3 text-sm text-gray-700 cursor-pointer"
          >
            {lang.label}
          </label>
        </div>
      ))}
    </div>
  </FilterSection>
  );
};

export default LanguageFilter;
