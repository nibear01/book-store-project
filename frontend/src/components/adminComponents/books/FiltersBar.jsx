import React from "react";

const FiltersBar = ({ filters, setFilters, genreOptions, onClear }) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      <div>
        <label className="block text-xs sm:text-sm text-gray-700 mb-1">Genre</label>
        <select
          value={filters.genre}
          onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-500"
          name="books-filter-genre"
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
  <label className="block text-xs sm:text-sm text-gray-700 mb-1">Sort by Price</label>
        <select
          value={filters.sortPrice}
          onChange={(e) => setFilters({ ...filters, sortPrice: e.target.value })}
          className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-500"
          name="books-filter-sort-price"
        >
          <option value="none">None</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
      </div>
      <div>
  <label className="block text-xs sm:text-sm text-gray-700 mb-1">Stock Status</label>
        <select
          value={filters.stock}
          onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
          className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-500"
          name="books-filter-stock"
        >
          <option value="all">All</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>
      <div>
  <label className="block text-xs sm:text-sm text-gray-700 mb-1">Sort by Date</label>
        <select
          value={filters.sortDate || "none"}
          onChange={(e) => setFilters({ ...filters, sortDate: e.target.value })}
          className="w-full p-2 text-sm border rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-500"
          name="books-filter-sort-date"
        >
          <option value="none">None</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <button className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 w-full sm:w-auto" onClick={onClear} name="books-clear-filters-btn">
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FiltersBar;
