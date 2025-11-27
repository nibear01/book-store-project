import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FilterSection from "../FilterSection";

// Dynamic price filter: accepts minLimit/maxLimit from admin settings.
// Falls back to 0/1500 if not provided.
const PriceFilter = ({
  priceRange,
  onPriceRangeChange,
  isOpen,
  onToggle,
  minLimit = 0,
  maxLimit = 1500,
}) => {
  const { t } = useTranslation('common');
  const clampedMin = Math.max(minLimit, 0);
  const clampedMax = Math.max(maxLimit, clampedMin + 1); // ensure > min

  // Local state for slider UI; commit on release
  const [localMin, setLocalMin] = useState(priceRange[0]);
  const [localMax, setLocalMax] = useState(priceRange[1]);
  // No continuous debounce for drag; only commit on release.

  // Keep local state in sync when props change (e.g., admin updates limits or external resets)
  // Memoize tuple to satisfy lint rules
  const priceRangeTuple = priceRange;
  useEffect(() => {
    setLocalMin(Math.min(Math.max(clampedMin, priceRangeTuple[0]), clampedMax));
    setLocalMax(Math.min(Math.max(clampedMin, priceRangeTuple[1]), clampedMax));
  }, [priceRangeTuple, clampedMin, clampedMax]);

  const commit = (minV, maxV) => {
    const minC = Math.max(clampedMin, Math.min(minV, maxV));
    const maxC = Math.min(clampedMax, Math.max(maxV, minV));
    if (minC !== priceRange[0] || maxC !== priceRange[1]) {
      onPriceRangeChange([minC, maxC]);
    }
  };

  const handleMinChange = (val) => {
    const nextMin = Math.min(Math.max(clampedMin, Number(val)), localMax);
    setLocalMin(nextMin);
  };
  const handleMaxChange = (val) => {
    const nextMax = Math.max(Math.min(clampedMax, Number(val)), localMin);
    setLocalMax(nextMax);
  };

  // Commit on release: mouse/touch/key (for accessibility)
  const handleRelease = () => commit(localMin, localMax);

  return (
    <FilterSection
      title={t('filters.priceRange')}
      sectionId="price"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="px-2">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{priceRange[0]} {t('filters.bdt')}</span>
          <span>{priceRange[1]} {t('filters.bdt')}</span>
        </div>
        <input
          type="range"
          min={clampedMin}
          max={clampedMax}
          value={localMin}
          onChange={(e) => handleMinChange(e.target.value)}
          onMouseUp={handleRelease}
          onTouchEnd={handleRelease}
          onKeyUp={(e) => (e.key === 'ArrowLeft' || e.key === 'ArrowRight' ? handleRelease() : null)}
          className="w-full h-1.5 bg-gray-200 rounded-[2px] appearance-none cursor-pointer accent-black"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={clampedMin}
          max={clampedMax}
          value={localMax}
          onChange={(e) => handleMaxChange(e.target.value)}
          onMouseUp={handleRelease}
          onTouchEnd={handleRelease}
          onKeyUp={(e) => (e.key === 'ArrowLeft' || e.key === 'ArrowRight' ? handleRelease() : null)}
          className="w-full h-1.5 bg-gray-200 rounded-[2px] appearance-none cursor-pointer accent-black mt-4"
          aria-label="Maximum price"
        />
        <div className="text-center text-sm text-gray-500 mt-2">
          {t('filters.range')}: {localMin} {t('filters.bdt')} - {localMax} {t('filters.bdt')}
          <div className="mt-1 text-xs text-gray-400">
          </div>
        </div>
      </div>
    </FilterSection>
  );
};

export default PriceFilter;
