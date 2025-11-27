import React from "react";
import { useTranslation } from "react-i18next";
import FilterSection from "../FilterSection";

const AvailabilityFilter = ({
  availabilityFilter,
  onAvailabilityFilterChange,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation('common');
  return (
  <FilterSection
    title={t('filters.availability')}
    sectionId="availability"
    isOpen={isOpen}
    onToggle={onToggle}
  >
    <div className="space-y-2">
      <div className="flex items-center">
        <input
          type="radio"
          id="availability-all"
          name="availability"
          checked={availabilityFilter === "all"}
          onChange={() => onAvailabilityFilterChange("all")}
          className="h-4 w-4 text-black focus:ring-black border-gray-300"
        />
        <label
          htmlFor="availability-all"
          className="ml-3 text-sm text-gray-700 cursor-pointer"
        >
          {t('filters.all')}
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="radio"
          id="availability-inStock"
          name="availability"
          checked={availabilityFilter === "inStock"}
          onChange={() => onAvailabilityFilterChange("inStock")}
          className="h-4 w-4 text-black focus:ring-black border-gray-300"
        />
        <label
          htmlFor="availability-inStock"
          className="ml-3 text-sm text-gray-700 cursor-pointer"
        >
          {t('filters.inStock')}
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="radio"
          id="availability-outOfStock"
          name="availability"
          checked={availabilityFilter === "outOfStock"}
          onChange={() => onAvailabilityFilterChange("outOfStock")}
          className="h-4 w-4 text-black focus:ring-black border-gray-300"
        />
        <label
          htmlFor="availability-outOfStock"
          className="ml-3 text-sm text-gray-700 cursor-pointer"
        >
          {t('filters.outOfStock')}
        </label>
      </div>
    </div>
  </FilterSection>
  );
};

export default AvailabilityFilter;
