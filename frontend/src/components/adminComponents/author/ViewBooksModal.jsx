import React from "react";
import { X, Eye } from "lucide-react";

export default function ViewBooksModal({ open, author, onClose, makeImgUrl }) {
  if (!open || !author) return null;

  const books = author.books || [];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {author.photo && (
              <img
                src={makeImgUrl(author.photo)}
                alt={author.name}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Books by {author.name}
              </h2>
              <p className="text-sm text-gray-600">{author.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {books.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No books assigned to this author</p>
              <p className="text-gray-400 text-sm mt-2">
                Use the "Manage" button to add books to this author.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((book) => {
                const id = book._id || book;
                const title = book.title || book.name || "Untitled";
                const cover = Array.isArray(book.cover_image) ? book.cover_image[0] : book.cover_image;
                const price = book.price ? `৳${book.price}` : "Price not set";
                const isbn = book.isbn || "No ISBN";

                return (
                  <div
                    key={id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-3">
                      {cover ? (
                        <img
                          src={makeImgUrl(cover)}
                          alt={title}
                          className="w-16 h-20 object-cover rounded flex-none"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center flex-none">
                          <span className="text-2xl">📚</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1 truncate">
                          {title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-1">ISBN: {isbn}</p>
                        <p className="text-xs text-gray-600 mb-1">Price: {price}</p>
                        {book.genre && (
                          <p className="text-xs text-gray-500 truncate">
                            Genre: {Array.isArray(book.genre) ? book.genre.join(", ") : book.genre}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Total books: <span className="font-medium">{books.length}</span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}