import React from "react";
import FilterSection from "../FilterSection";

const PriceFilter = ({ priceRange, onPriceRangeChange, isOpen, onToggle }) => (
  <FilterSection
    title="Price Range"
    sectionId="price"
    isOpen={isOpen}
    onToggle={onToggle}
  >
    <div className="px-2">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{priceRange[0]} BDT</span>
        <span>{priceRange[1]} BDT</span>
      </div>
      <input
        type="range"
        min="0"
        max="1500"
        value={priceRange[0]}
        onChange={(e) =>
          onPriceRangeChange([Number(e.target.value), priceRange[1]])
        }
        className="w-full h-1.5 bg-gray-200 rounded-[2px] appearance-none cursor-pointer accent-black"
        aria-label="Minimum price"
      />
      <input
        type="range"
        min="0"
        max="1500"
        value={priceRange[1]}
        onChange={(e) =>
          onPriceRangeChange([priceRange[0], Number(e.target.value)])
        }
        className="w-full h-1.5 bg-gray-200 rounded-[2px] appearance-none cursor-pointer accent-black mt-4"
        aria-label="Maximum price"
      />
      <div className="text-center text-sm text-gray-500 mt-2">
        Range: {priceRange[0]} BDT - {priceRange[1]} BDT
      </div>
    </div>
  </FilterSection>
);

export default PriceFilter;
