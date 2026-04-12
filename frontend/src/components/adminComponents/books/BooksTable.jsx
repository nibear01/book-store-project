import React from "react";
import { buildImageUrl } from "@/utils/imageUrlHelper";
import {
  computeFinalConfiguredPrice,
  defaultPrintState,
} from "../../bookViewComponents/BookPrintPricing";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// pricingMode: 'derived' | 'relative'
// printSettings: global config fetched by parent
const BooksTable = ({
  books,
  toGenreArray,
  onViewDetails,
  onEdit,
  onDelete,
  pricingMode,
  printSettings,
}) => {
  const computePrices = (b) => {
    const adminBase = Number(b.price || 0);
    const adminSale = Number(b.sale_price || 0);
    const pages = Number(b.pages || 0);
    const hasSale =
      !!b.is_on_sale && Number.isFinite(adminSale) && adminSale > 0;
    if (!printSettings) {
      return {
        mode: pricingMode,
        price: adminBase,
        sale: hasSale ? adminSale : null,
        adminPrice: adminBase,
      };
    }
    const cfg = defaultPrintState;
    if (pricingMode === "derived") {
      const { price: derivedBase } = computeFinalConfiguredPrice({
        baseContentPrice: 0,
        pages,
        cfg,
        settings: printSettings,
      });
      // Sale override: use adminSale if valid and lower than derivedBase
      const finalSale = hasSale && adminSale < derivedBase ? adminSale : null;
      return {
        mode: "derived",
        price: Number(derivedBase),
        sale: finalSale,
        adminPrice: adminBase,
      };
    }
    // relative mode: scale admin price and sale price
    const { price: relativeBase } = computeFinalConfiguredPrice({
      baseContentPrice: adminBase,
      pages,
      cfg,
      settings: printSettings,
    });
    const relativeSale = hasSale
      ? computeFinalConfiguredPrice({
          baseContentPrice: adminSale,
          pages,
          cfg,
          settings: printSettings,
        }).price
      : null;
    return {
      mode: "relative",
      price: Number(relativeBase),
      sale: hasSale ? Number(relativeSale) : null,
      adminPrice: adminBase,
    };
  };

  return (
    <table className="w-full text-xs sm:text-sm" name="books-table">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-2 sm:p-3 text-left border-b">Cover</th>
          <th className="p-2 sm:p-3 text-left border-b">Title</th>
          <th className="p-2 sm:p-3 text-left border-b hidden sm:table-cell">
            Author
          </th>
          <th className="p-2 sm:p-3 text-left border-b hidden md:table-cell">
            Genre
          </th>
          <th className="p-2 sm:p-3 text-center border-b">Stock</th>
          <th className="p-2 sm:p-3 text-right border-b">
            {pricingMode === "derived"
              ? "Price (Derived)"
              : "Price (Admin / Configured)"}
          </th>
          <th className="p-2 sm:p-3 text-center border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {books.length === 0 ? (
          <tr>
            <td colSpan="7" className="p-4 text-center text-sm text-gray-500">
              No books found matching your criteria
            </td>
          </tr>
        ) : (
          books.map((b) => {
            // onSale computed inside computePrices via b fields if needed
            const genreLabel = Array.isArray(b?.genre)
              ? b.genre.join(", ")
              : toGenreArray(b?.genre).join(", ");

            // Get cover image URL with proper fallback handling
            const getCoverUrl = () => {
              const images = Array.isArray(b?.cover_image)
                ? b.cover_image
                : b?.cover_image
                  ? [b.cover_image]
                  : [];
              if (!images.length) return null;

              const coverRaw = images[0];
              if (!coverRaw || typeof coverRaw !== "string") return null;

              // Use centralized image URL builder
              return buildImageUrl(coverRaw, API_BASE);
            };

            const cover = getCoverUrl();
            const prices = computePrices(b);
            return (
              <tr key={b._id || b.id} className="border-b hover:bg-gray-50">
                <td className="p-2 sm:p-3">
                  {cover ? (
                    <img
                      src={cover}
                      alt={b.title || "Book cover"}
                      className="h-12 w-9 sm:w-10 object-cover rounded"
                      loading="lazy"
                      onError={(e) => {
                        // Log error for debugging
                        console.error(`Failed to load image: ${cover}`);
                      }}
                    />
                  ) : (
                    <div className="h-12 w-9 sm:w-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M4 5.5A2.5 2.5 0 016.5 3H18a1 1 0 011 1v16a1 1 0 01-1.447.894L14 19.118l-3.553 1.776A1 1 0 019 20V5H6.5A2.5 2.5 0 004 7.5v-2z" />
                      </svg>
                    </div>
                  )}
                </td>
                <td className="p-2 sm:p-3">
                  <div className="sm:hidden text-xs">
                    <div className="text-black font-medium">{b.title}</div>
                    {b.author && (
                      <div className="text-gray-600">{b.author}</div>
                    )}
                    {genreLabel && (
                      <div className="text-gray-500">{genreLabel}</div>
                    )}
                  </div>
                  <div className="hidden sm:block text-sm font-medium">
                    {b.title}
                  </div>
                </td>
                <td className="p-2 sm:p-3 hidden sm:table-cell text-sm">
                  {b.author || ""}
                </td>
                <td className="p-2 sm:p-3 hidden md:table-cell text-sm">
                  {genreLabel}
                </td>
                <td className="p-2 sm:p-3 text-center text-sm">
                  {typeof b.stock === "number" ? b.stock : ""}
                </td>
                <td className="p-2 sm:p-3 text-right text-sm">
                  {prices.mode === "derived" ? (
                    prices.sale != null ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="text-xs text-red-600 font-semibold">
                          ৳{prices.sale.toFixed(2)}
                        </div>
                        <div className="text-[10px] line-through text-gray-400">
                          ৳{prices.price.toFixed(2)}
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-gray-500">
                          Derived Sale
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-800">
                        <span className="font-semibold">
                          ৳{prices.price.toFixed(2)}
                        </span>
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-gray-500">
                          Derived
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-end gap-0.5">
                      {prices.sale != null ? (
                        <div className="text-xs text-indigo-700 font-semibold">
                          ৳{prices.sale.toFixed(2)}{" "}
                          <span className="ml-1 line-through text-gray-400">
                            ৳{prices.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-800 font-semibold">
                          ৳{prices.price.toFixed(2)}
                        </div>
                      )}
                      <div className="text-[10px] uppercase tracking-wide text-gray-500">
                        Configured
                      </div>
                    </div>
                  )}
                </td>
                <td className="p-2 sm:p-3">
                  <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
                    <button
                      onClick={() => onViewDetails(b)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors"
                      name={`book-view-btn-${b._id || b.id}`}
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(b)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                      name={`book-edit-btn-${b._id || b.id}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(b)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors"
                      name={`book-delete-btn-${b._id || b.id}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};

export default BooksTable;
