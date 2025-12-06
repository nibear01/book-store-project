import React from "react";

export default function Pagination({ page, total, pageSize, onPageChange, namePrefix }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const go = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange(p);
  };

  // Smart pagination: show sliding window of 10 pages
  const getPageNumbers = () => {
    const maxVisible = 10;
    const pages = [];

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate the start of the current window
      // Current window is based on: Math.floor((page - 1) / maxVisible) * maxVisible + 1
      const currentWindow = Math.floor((page - 1) / maxVisible);
      const start = currentWindow * maxVisible + 1;
      const end = Math.min(start + maxVisible - 1, totalPages);

      // Always show first page
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      // Show current window
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Always show last page
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 p-2 text-xs" {...(namePrefix ? { name: `${namePrefix}-pagination` } : {})}>
      <div className="text-gray-600 w-full sm:w-auto text-center sm:text-left">
        Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)}{" "}
        of {total}
      </div>
      <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
        <button
          onClick={() => go(page - 1)}
          disabled={page === 1}
          className="px-2 sm:px-3 py-1.5 border rounded disabled:opacity-40 text-sm hover:bg-gray-100"
          {...(namePrefix ? { name: `${namePrefix}-pagination-prev` } : {})}
        >
          Prev
        </button>
        {pageNumbers.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1.5 text-gray-500"
              >
                ...
              </span>
            );
          }
          return (
            <button
              key={p}
              onClick={() => go(p)}
              className={`px-2 sm:px-3 py-1.5 rounded border text-sm ${
                p === page
                  ? "bg-black text-white border-black"
                  : "hover:bg-gray-100"
              }`}
              {...(namePrefix ? { name: `${namePrefix}-pagination-page-${p}` } : {})}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          className="px-2 sm:px-3 py-1.5 border rounded disabled:opacity-40 hover:bg-gray-100"
          {...(namePrefix ? { name: `${namePrefix}-pagination-next` } : {})}
        >
          Next
        </button>
      </div>
    </div>
  );
}
