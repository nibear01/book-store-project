import React from "react";
import { Button } from "../../ui/button.jsx";

const PaginationBar = ({
  totalItems,
  startIdx,
  pageSize,
  totalPages,
  currentPage,
  onPrev,
  onNext,
  onGoto, // Add this prop
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <div className="text-sm text-gray-600">
        Showing {startIdx + 1} to {Math.min(startIdx + pageSize, totalItems)} of {totalItems} books
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={onPrev}
          disabled={currentPage <= 1}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        
        {/* Page numbers */}
        {getPageNumbers().map((page) => (
          <Button
            key={page}
            onClick={() => onGoto(page)}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            className="min-w-[40px]"
          >
            {page}
          </Button>
        ))}
        
        <div className="text-sm text-gray-600 ml-2">
          Page <span className="font-medium">{currentPage}</span> of {totalPages}
        </div>
        
        <Button
          onClick={onNext}
          disabled={currentPage >= totalPages}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PaginationBar;