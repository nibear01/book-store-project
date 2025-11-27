import React from "react";

export default function SearchSortBar({ searchTerm, onSearchChange, sortBy, onSortChange, shownCount, totalCount, onClear }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" name="authors-searchbar">
      <div className="flex items-center gap-2 w-full">
        <input
          placeholder="Search authors by name, title, slug or bio"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-[2px] border border-slate-300 p-2"
          name="authors-search-input"
        />
        <button
          onClick={onClear}
          className="px-3 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50"
          title="Clear filters"
          name="authors-search-clear"
        >
          Clear
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs text-slate-600">Sort:</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-[2px] border border-slate-300 p-2"
          name="authors-sort-select"
        >
          <option value="none">Default</option>
          <option value="books_desc">Most books</option>
          <option value="books_asc">Fewest books</option>
        </select>
        <div className="text-xs text-slate-600" name="authors-searchbar-count">
          Showing {shownCount} of {totalCount}
        </div>
      </div>
    </div>
  );
}
