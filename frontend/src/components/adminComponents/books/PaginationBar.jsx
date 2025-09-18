import React from "react";

const PaginationBar = ({
  totalItems,
  startIdx,
  pageSize,
  totalPages,
  currentPage,
  onPrev,
  onNext,
  onGoto,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("ellipsis-" + p);
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      <div className="text-sm text-gray-600">
        Showing {totalItems === 0 ? 0 : startIdx + 1}-{Math.min(startIdx + pageSize, totalItems)} of {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={onPrev} disabled={currentPage <= 1}>
          Prev
        </button>
        {pages.map((p) =>
          typeof p === "string" ? (
            <span key={p} className="px-2 text-gray-400">...</span>
          ) : (
            <button
              key={p}
              className={`px-3 py-1 border rounded ${p === currentPage ? "bg-slate-900 text-white" : ""}`}
              onClick={() => onGoto(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={onNext}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationBar;
