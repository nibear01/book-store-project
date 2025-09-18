import React from "react";

const FiltersBar = ({ filters, setFilters, genreOptions, onClear }) => {
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm mb-1">Genre</label>
        <select
          value={filters.genre}
          onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          className="w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          {genreOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Sort by Price</label>
        <select
          value={filters.sortPrice}
          onChange={(e) => setFilters({ ...filters, sortPrice: e.target.value })}
          className="w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm"
        >
          <option value="none">None</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Stock Status</label>
        <select
          value={filters.stock}
          onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
          className="w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Sort by Date</label>
        <select
          value={filters.sortDate || "none"}
          onChange={(e) => setFilters({ ...filters, sortDate: e.target.value })}
          className="w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm"
        >
          <option value="none">None</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
      <div className="md:col-span-4 flex gap-2">
        <button className="px-3 py-2 text-sm border rounded" onClick={onClear}>
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FiltersBar;
