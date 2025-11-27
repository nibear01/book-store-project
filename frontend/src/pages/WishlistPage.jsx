import React, { useCallback, useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://192.168.0.104:5000";

const WishlistItem = React.memo(function WishlistItem({ item, onRemove, onView, t }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const cover = Array.isArray(item.book?.cover_image) && item.book.cover_image.length
    ? `${BASE_URL}${item.book.cover_image[0]}`
    : null;
  const viewHref = `/bookview/${item.book?.slug || item.id}`;

  return (
    <div
      className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
    >
      {/* Cover */}
      <div className="w-20 h-28 sm:w-16 sm:h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative">
        {cover ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
              src={cover}
              alt={item.title}
              className={`w-full h-full object-cover ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : null}
      </div>

      {/* Info + actions */}
      <div className="flex-1 w-full">
        <Link
          to={viewHref}
          className="block font-medium hover:text-gray-600 text-[15px] sm:text-base"
        >
          {item.title}
        </Link>
        <div className="text-sm text-gray-600 mt-1">
          {t('common:currency')}{Number(item.price || 0).toFixed(2)}
        </div>

        <div className="mt-3 flex w-full sm:w-auto flex-col sm:flex-row gap-2">
          <button
            onClick={() => onView(viewHref)}
            className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('common:buttons.view')}
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="w-full sm:w-auto px-3 py-2 text-sm text-gray-700 border border-transparent rounded-md hover:bg-gray-50 hover:text-red-600"
          >
            {t('common:buttons.delete')}
          </button>
        </div>
      </div>
    </div>
  );
});

const WishlistPage = () => {
  const { t } = useTranslation('common');
  const { items, remove, clear } = useWishlist();
  const navigate = useNavigate();

  const count = items?.length || 0;
  const handleRemove = useCallback((id) => remove(id), [remove]);
  const handleView = useCallback((href) => navigate(href), [navigate]);

  if (!items || count === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-semibold mb-4">{t('common:navbar.wishlist')}</h1>
        <div className="bg-white min-h-[70vh] p-8 rounded-md shadow-sm text-center text-gray-600">
          {t('common:navbar.wishlist')} {t('common:navbar.wishlistEmpty')}.
          <div className="mt-4">
            <Link className="text-red-600 hover:text-red-500" to="/shop">
              {t('common:shop.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold">{t('common:navbar.yourWishlist')} ({count})</h1>
        <button
          onClick={clear}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          {t('common:shop.clearAll')}
        </button>
      </div>

      {/* Items */}
      <div className="bg-white rounded-md shadow-sm divide-y">
        {items.map((it) => (
          <WishlistItem key={it.id} item={it} onRemove={handleRemove} onView={handleView} t={t} />
        ))}
      </div>

      {/* Continue shopping (mobile emphasis) */}
      <div className="mt-6 text-center sm:text-right">
        <Link
          className="inline-block px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          to="/shop"
        >
          {t('common:shop.continueShopping')}
        </Link>
      </div>
    </div>
  );
};

export default WishlistPage;
