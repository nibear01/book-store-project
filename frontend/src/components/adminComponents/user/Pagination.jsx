import React from "react";
import { Button } from "../../../Button/button.jsx";

/**
 * Reusable Pagination Component
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {number} totalItems - Total number of items
 * @param {number} pageSize - Items per page
 * @param {Function} onPageChange - Callback when page changes
 * @param {string} itemName - Name of items being paginated (e.g., "users", "orders")
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  itemName = "items",
}) => {
  // Calculate display range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display (show max 7 page buttons)
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 7;

    if (totalPages <= maxButtons) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination: show first, last, current, and nearby pages
      if (currentPage <= 4) {
        // Near start: show 1,2,3,4,5 ... last
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near end: show 1 ... last-4, last-3, last-2, last-1, last
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        // Middle: show 1 ... current-1, current, current+1 ... last
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalItems === 0) {
    return null; // Don't show pagination if no items
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-gray-200">
      {/* Items info */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> {itemName}
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          variant="outline"
          size="sm"
          className="rounded-md"
          name="users-pagination-prev"
        >
          Previous
        </Button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((pageNum, idx) => {
            if (pageNum === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={pageNum === currentPage}
                className={`
                  min-w-[32px] h-8 px-3 text-sm font-medium rounded-md
                  transition-colors duration-150
                  ${
                    pageNum === currentPage
                      ? "bg-black text-white cursor-default"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }
                `}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Mobile: Simple page indicator */}
        <div className="sm:hidden text-sm text-gray-600">
          Page <span className="font-medium">{currentPage}</span> of{" "}
          <span className="font-medium">{totalPages}</span>
        </div>

        {/* Next button */}
        <Button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          variant="outline"
          size="sm"
          className="rounded-md"
          name="users-pagination-next"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
