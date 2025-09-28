import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { Link, useNavigate } from 'react-router-dom';

const WishlistPage = () => {
  const { items, remove, clear } = useWishlist();
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return (
      <div className="max-w-6xl min-h-[80vh] mx-auto px-5 py-10">
        <h1 className="text-2xl font-semibold mb-4">Your Wishlist</h1>
        <div className="bg-white p-8 min-h-[60vh] rounded-[2px] shadow-sm text-center text-gray-600">
          Your wishlist is empty.
          <div className="mt-4">
            <Link className="text-red-600 hover:underline" to="/shop">Continue shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold">Your Wishlist ({items.length})</h1>
        <button
          onClick={clear}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-[2px] text-gray-700 hover:bg-gray-50"
        >
          Clear all
        </button>
      </div>

      {/* Items */}
      <div className="bg-white rounded-[2px] shadow-sm divide-y">
        {items.map((it) => (
          <div
            key={it.id}
            className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
          >
            {/* Cover */}
            <div className="w-20 h-28 sm:w-16 sm:h-20 bg-gray-100 rounded-[2px] overflow-hidden flex-shrink-0">
              {it.book?.cover_image?.length ? (
                <img
                  src={`http://localhost:5000${it.book.cover_image[0]}`}
                  alt={it.title}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>

            {/* Info + actions */}
            <div className="flex-1 w-full">
              <Link
                to={`/bookview/${it.book?.slug || it.id}`}
                className="block font-medium hover:underline text-[15px] sm:text-base"
              >
                {it.title}
              </Link>
              <div className="text-sm text-gray-600 mt-1">${Number(it.price || 0).toFixed(2)}</div>

              <div className="mt-3 flex w-full sm:w-auto flex-col sm:flex-row gap-2">
                <button
                  onClick={() => navigate(`/bookview/${it.book?.slug || it.id}`)}
                  className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-[2px] hover:bg-gray-50"
                >
                  View
                </button>
                <button
                  onClick={() => remove(it.id)}
                  className="w-full sm:w-auto px-3 py-2 text-sm text-gray-700 border border-transparent rounded-[2px] hover:bg-gray-50 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue shopping (mobile emphasis) */}
      <div className="mt-6 text-center sm:text-right">
        <Link className="inline-block px-4 py-2 text-sm border border-gray-300 rounded-[2px] hover:bg-gray-50" to="/shop">
          Continue shopping
        </Link>
      </div>
    </div>
  );
};

export default WishlistPage;
