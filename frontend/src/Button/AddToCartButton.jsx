// src/components/AddToCartButton.jsx
// Stable (no up/down movement) button with per-state visuals
import React from "react";
import { FaShoppingCart, FaCheck } from "react-icons/fa";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

export default function AddToCartButton({
  viewMode = "grid", // "list" | "grid"
  bookTitle = "item",
  stock = 0,
  isAdding = false,
  addSuccess = false,
  onClick,
  className = "",
}) {
  const outOfStock = stock <= 0;

  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black " +
    "disabled:cursor-not-allowed select-none " +
    "min-h-[44px] whitespace-nowrap";

  const shape = viewMode === "list" ? "px-4 py-2" : "w-full px-4 py-2";
  const color = addSuccess
    ? "bg-green-500 text-white"
    : outOfStock
    ? "bg-gray-300 text-gray-500"
    : isAdding
    ? "bg-blue-500 text-white"
    : "bg-black text-white hover:bg-black/90";

  return (
    <button
      onClick={onClick}
      disabled={isAdding || outOfStock}
      className={cx(base, shape, color, className)}
      aria-label={`Add ${bookTitle} to cart`}
      aria-disabled={isAdding || outOfStock}
      aria-busy={isAdding}
    >
      {/* fixed-size icon box prevents layout shift */}
      <span className="inline-flex items-center justify-center w-5 h-5">
        {addSuccess ? (
          <FaCheck className="w-5 h-5" aria-hidden="true" />
        ) : isAdding ? (
          <span
            className="block w-4 h-4 rounded-full border-2 border-white/80 border-t-transparent motion-safe:animate-spin"
            role="status"
            aria-label="Adding"
          />
        ) : outOfStock ? null : (
          <FaShoppingCart className="w-5 h-5" aria-hidden="true" />
        )}
      </span>

      <span>
        {addSuccess
          ? viewMode === "list"
            ? "Added"
            : "Added to Cart"
          : isAdding
          ? viewMode === "list"
            ? "Adding"
            : "Adding..."
          : outOfStock
          ? "Out of Stock"
          : "Add to Cart"}
      </span>
    </button>
  );
}
