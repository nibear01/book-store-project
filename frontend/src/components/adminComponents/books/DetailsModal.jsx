import React from "react";

const API_BASE = "http://localhost:5000";

const DetailsModal = ({ book, toGenreArray, onClose }) => {
  if (!book) return null;
  const coverRaw = Array.isArray(book.cover_image) ? book.cover_image[0] : book.cover_image;
  const cover = typeof coverRaw === "string" ? `${API_BASE}${coverRaw}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-[2px] shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Book Details</h3>
          <button className="text-gray-600" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="col-span-1">
            {cover ? (
              <img
                src={cover}
                alt={book.title}
                className="w-full h-40 object-cover rounded"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-40 bg-gray-100 rounded" />
            )}
          </div>
          <div className="col-span-2 text-sm space-y-1">
            <p>
              <span className="font-semibold">Title:</span> {book.title}
            </p>
            {book.author && (
              <p>
                <span className="font-semibold">Author:</span> {book.author}
              </p>
            )}
            {toGenreArray(book?.genre).length > 0 && (
              <p>
                <span className="font-semibold">Genre:</span>{" "}
                {toGenreArray(book.genre).join(", ")}
              </p>
            )}
            {typeof book.stock === "number" && (
              <p>
                <span className="font-semibold">Stock:</span> {book.stock}
              </p>
            )}
            <p>
              <span className="font-semibold">Price:</span>{" "}
              {book.is_on_sale && typeof book.sale_price === "number" ? (
                <>
                  <span className="font-semibold">
                    ${Number(book.sale_price || 0).toFixed(2)}
                  </span>{" "}
                  <span className="text-gray-500 line-through">
                    ${Number(book.price || 0).toFixed(2)}
                  </span>
                </>
              ) : (
                <>${Number(book.price || 0).toFixed(2)}</>
              )}
            </p>
            {book.is_deal_of_the_week && (
              <p>
                <span className="font-semibold">Deal:</span>{" "}
                {book.deal_start ? String(book.deal_start).slice(0, 10) : "—"} to{" "}
                {book.deal_end ? String(book.deal_end).slice(0, 10) : "—"}
              </p>
            )}
            {book.description && (
              <p className="mt-2">
                <span className="font-semibold">Description:</span> {book.description}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 rounded-[2px] border" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
