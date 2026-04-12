import React, { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { buildImageUrl } from "@/utils/imageUrlHelper";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaShoppingCart,
  FaCheck,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { usePrintSettings } from "../../context/PrintSettingsContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  computeFinalConfiguredPrice,
  defaultPrintState,
} from "../bookViewComponents/BookPrintPricing";

// Debounce wishlist toasts globally across cards
let __lastWishlistToastAt = 0;
const emitWishlistToast = (kind, message) => {
  const now = Date.now();
  const MIN_GAP_MS = 800;
  // Always allow error toasts; debounce success/info
  if (kind === "error" || now - __lastWishlistToastAt > MIN_GAP_MS) {
    if (kind === "success") toast.success(message);
    else if (kind === "info") toast.info(message);
    else toast.error(message);
    __lastWishlistToastAt = now;
  }
};

// Isolated wishlist toggle to avoid re-rendering the whole card when wishlist changes
const WishlistToggle = React.memo(function WishlistToggle({ bookId }) {
  const { t } = useTranslation("common");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    isInWishlist,
    add: addWishlist,
    remove: removeWishlist,
  } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);
  const [pulse, setPulse] = useState(false);

  const wished = isInWishlist(bookId);

  const onToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!bookId || isToggling) return;
    setIsToggling(true);
    // trigger tiny pulse on click
    setPulse(true);
    setTimeout(() => setPulse(false), 180);
    try {
      if (wished) {
        await removeWishlist(bookId);
        emitWishlistToast("info", t("bookCard.removedFromWishlist"));
      } else {
        await addWishlist(bookId);
        emitWishlistToast("success", t("bookCard.addedToWishlist"));
      }
    } catch (err) {
      emitWishlistToast(
        "error",
        err?.message || t("bookCard.wishlistActionFailed"),
      );
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isToggling}
      data-testid="wishlist-btn"
      aria-label={
        wished ? t("bookCard.removeFromWishlist") : t("bookCard.addToWishlist")
      }
      title={
        wished ? t("bookCard.removeFromWishlist") : t("bookCard.addToWishlist")
      }
      className={`absolute top-2 right-2 z-20 inline-flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md p-2 shadow-lg border border-white/50 hover:scale-110 hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 md:top-3 md:right-3 ${
        isToggling ? "opacity-70 cursor-wait" : ""
      } ${wished ? "bg-red-50/95 opacity-100" : ""}`}
    >
      <span
        className={`transition-all duration-300 ${
          pulse ? "scale-125 rotate-12" : "scale-100"
        }`}
      >
        {wished ? (
          <FaHeart className="text-red-500 drop-shadow-sm text-sm md:text-base" />
        ) : (
          <FaRegHeart className="text-gray-700 text-sm md:text-base" />
        )}
      </span>
    </button>
  );
});

// Memoized star rating renderer
const StarRating = React.memo(function StarRating({ rating }) {
  const safe = Number.isFinite(rating) ? rating : 0;
  const full = Math.floor(safe);
  const half = safe % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < Math.min(full, 5); i++)
    stars.push(
      <FaStar key={`f-${i}`} className="text-yellow-400 text-xs md:text-sm" />,
    );
  if (half && stars.length < 5)
    stars.push(
      <FaStarHalfAlt
        key="half"
        className="text-yellow-400 text-xs md:text-sm"
      />,
    );
  const empties = 5 - stars.length;
  for (let i = 0; i < empties; i++)
    stars.push(
      <FaRegStar
        key={`e-${i}`}
        className="text-yellow-400 text-xs md:text-sm"
      />,
    );
  return (
    <div className="flex gap-0.5" aria-label={`${safe} out of 5 stars`}>
      {stars}
    </div>
  );
});

function BookCardInner({ book, baseUrl, viewMode = "grid" }) {
  const { t } = useTranslation("common");
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Select only the first cover image if it's an array
  const coverImage = useMemo(() => {
    return Array.isArray(book.cover_image) && book.cover_image.length > 0
      ? book.cover_image[0]
      : book.cover_image;
  }, [book.cover_image]);

  const id = useMemo(() => book._id || book.id, [book._id, book.id]);
  const rating = useMemo(() => Number(book.rating) || 0, [book.rating]);
  const isOnSale = !!(book.is_on_sale && book.sale_price);
  const isDealOfWeek = !!book.is_deal_of_the_week;

  // Load global print pricing settings from context
  const { printSettings } = usePrintSettings();

  // Compute listing prices using default configuration and book.pages
  const {
    displayPrice,
    displaySalePrice,
    listingVariant,
    listingBreakdown,
    dealOverride,
  } = useMemo(() => {
    const basePrice = Number(book.price || 0);
    const salePrice = Number(book.sale_price || 0);
    const pages = Number(book.pages || 0);
    // If this is a Deal of the Week and on sale, show the admin-provided sale value as-is
    if (isDealOfWeek && isOnSale) {
      return {
        displayPrice: basePrice.toFixed(0),
        displaySalePrice: salePrice.toFixed(0),
        listingVariant: null,
        listingBreakdown: null,
        dealOverride: true,
      };
    }
    if (!printSettings) {
      return {
        displayPrice: basePrice.toFixed(0),
        displaySalePrice: isOnSale ? salePrice.toFixed(0) : null,
        listingVariant: null,
        listingBreakdown: null,
        dealOverride: false,
      };
    }
    // Use default print configuration for listing
    const cfg = defaultPrintState;
    const mode = printSettings.mode || "relative";
    if (mode === "derived") {
      // Derived: contentFee + basePerPage*pages*multipliers + margin
      const { price: derivedFinal, breakdown } = computeFinalConfiguredPrice({
        baseContentPrice: 0,
        pages,
        cfg,
        settings: printSettings,
      });
      const useSale =
        isOnSale && Number.isFinite(salePrice) && salePrice >= 0
          ? salePrice
          : null;
      return {
        displayPrice: Number(derivedFinal).toFixed(2),
        displaySalePrice: useSale != null ? Number(useSale).toFixed(2) : null,
        listingVariant: cfg,
        listingBreakdown: breakdown,
        dealOverride: false,
      };
    }
    // relative mode
    const baseComputed = computeFinalConfiguredPrice({
      baseContentPrice: basePrice,
      pages,
      cfg,
      settings: printSettings,
    });
    const saleComputed = isOnSale
      ? computeFinalConfiguredPrice({
          baseContentPrice: salePrice,
          pages,
          cfg,
          settings: printSettings,
        })
      : null;
    return {
      displayPrice: Number(baseComputed.price || basePrice).toFixed(2),
      displaySalePrice: isOnSale
        ? Number(saleComputed?.price ?? salePrice).toFixed(2)
        : null,
      listingVariant: cfg,
      listingBreakdown: baseComputed.breakdown,
      dealOverride: false,
    };
  }, [
    book.price,
    book.sale_price,
    book.pages,
    isOnSale,
    isDealOfWeek,
    printSettings,
  ]);

  /** Handle adding item to cart */
  const handleAddToCart = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      // Prevent duplicate adds
      const bid = book._id || book.id;
      if (isInCart && isInCart(bid)) {
        toast.info(t("bookCard.alreadyInCart"));
        return;
      }

      setIsAdding(true);
      try {
        // If print settings exist, add default-configured variant and price to keep consistency with listing price
        // If Deal of the Week + sale, keep admin-provided sale as-is (no POD config)
        const variant =
          printSettings && !dealOverride
            ? {
                paperQuality: listingVariant?.paperQuality,
                printSide: listingVariant?.printSide,
                paperSize: listingVariant?.paperSize,
                colorMode: listingVariant?.colorMode,
              }
            : undefined;
        const unitPrice = dealOverride
          ? isOnSale && displaySalePrice != null
            ? Number(displaySalePrice)
            : Number(displayPrice)
          : printSettings
            ? isOnSale && displaySalePrice != null
              ? Number(displaySalePrice)
              : Number(displayPrice)
            : Number(book.price);
        await addToCart({
          item: {
            id: bid,
            title: book.title,
            price: unitPrice,
            cover_image: coverImage,
            slug: book.slug,
            configured: !!(printSettings && !dealOverride),
            variant,
            breakdown:
              printSettings && !dealOverride ? listingBreakdown : undefined,
          },
          quantity: 1,
          variant,
        });
        setAddSuccess(true);
        toast.success(`${book.title} ${t("bookCard.addedSuccess")}`);
        setTimeout(() => setAddSuccess(false), 2000);
      } catch (error) {
        console.error("Failed to add to cart:", error);
        toast.error(t("bookCard.failedToAdd"));
      } finally {
        setIsAdding(false);
      }
    },
    [
      t,
      isAuthenticated,
      navigate,
      isInCart,
      addToCart,
      book._id,
      book.id,
      book.title,
      book.price,
      coverImage,
      book.slug,
      printSettings,
      isOnSale,
      displaySalePrice,
      displayPrice,
      listingVariant,
      listingBreakdown,
      dealOverride,
    ],
  );

  // Responsive container classes
  const containerClass = useMemo(() => {
    const base =
      "bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 relative overflow-hidden group";

    if (viewMode === "list") {
      return `${base} flex flex-col sm:flex-row hover:-translate-y-0.5`;
    }

    return `${base} flex flex-col hover:-translate-y-1`;
  }, [viewMode]);

  // Responsive image container classes
  const imageContainerClass = useMemo(() => {
    if (viewMode === "list") {
      return "relative block overflow-hidden flex-shrink-0 w-full sm:w-32 md:w-40 lg:w-48 group-hover:brightness-105 transition-all duration-1000";
    }

    return "relative block overflow-hidden";
  }, [viewMode]);

  // Responsive image aspect ratio
  const imageAspectClass = useMemo(() => {
    if (viewMode === "list") {
      return "relative pt-[120%] sm:pt-[140%] w-full";
    }

    return "relative pt-[130%] w-full";
  }, [viewMode]);

  // Responsive content classes
  const contentClass = useMemo(() => {
    if (viewMode === "list") {
      return "p-3 sm:p-4 flex flex-col flex-grow";
    }

    return "p-3 flex flex-col flex-grow";
  }, [viewMode]);

  return (
    <div className={containerClass}>
      {/* Sale Badge - Improved mobile positioning */}
      {book.is_on_sale && (
        <div
          className={`absolute top-2 left-2 z-20 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg animate-pulse ${
            viewMode === "list" ? "sm:top-3 sm:left-3" : ""
          } backdrop-blur-xs border border-white/20`}
        >
          <span className="flex items-center gap-1">
            <span className="hidden xs:inline">🔥</span> {t("bookCard.sale")}
          </span>
        </div>
      )}

      {/* Optimized wishlist toggle (isolated context consumer) */}
      {id && <WishlistToggle bookId={id} />}

      {/* Book cover image with overlay */}
      <Link
        to={`/bookview/${book.slug || book._id || book.id}`}
        className={imageContainerClass}
      >
        <div className={imageAspectClass}>
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-500 z-10"></div>

          <img
            src={buildImageUrl(coverImage, baseUrl)}
            alt={book.title}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Loading skeleton with shimmer */}
          {!imageLoaded && (
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
          )}
        </div>
      </Link>

      {/* Book details */}
      <div className={contentClass}>
        <div
          className={`${
            viewMode === "list"
              ? "mb-3 flex-grow space-y-2 sm:space-y-3"
              : "mb-3 space-y-2"
          }`}
        >
          {/* Genre badge with gradient */}
          {book.genre && (
            <span
              className={`inline-block px-2 py-1 text-[10px] xs:text-xs font-bold bg-gray-100 rounded-full border border-indigo-100 shadow-sm transition-all duration-300 line-clamp-1 ${
                viewMode === "list" ? "mb-2 sm:mb-3" : ""
              }`}
            >
              {Array.isArray(book.genre) ? book.genre[0] : book.genre}
            </span>
          )}

          {/* Title and author */}
          <div className="space-y-1">
            <h3
              className={`font-bold text-gray-900 line-clamp-2 leading-tight transition-colors duration-300 ${
                viewMode === "list"
                  ? "text-base sm:text-lg md:text-xl mb-1"
                  : "text-sm xs:text-[15px]"
              }`}
            >
              {book.title}
            </h3>
            <p
              className={`text-gray-500 font-medium ${
                viewMode === "list"
                  ? "text-sm sm:text-base"
                  : "text-xs xs:text-[13px]"
              }`}
            >
              <span className="text-gray-400">{t("bookCard.by")}</span>{" "}
              <span className="text-gray-600">{book.author}</span>
            </p>
          </div>

          {/* Description for list view */}
          {viewMode === "list" && book.description && (
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 hidden xs:block">
              {book.description.length > 150
                ? `${book.description.substring(0, 150)}...`
                : book.description}
            </p>
          )}

          {/* Rating and pages */}
          <div
            className={`flex items-center justify-between ${
              viewMode === "list" ? "pt-1" : ""
            }`}
          >
            <div className="flex items-center gap-1 xs:gap-2 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
              <StarRating rating={rating} />
              <span
                className={`text-gray-600 font-semibold ${
                  viewMode === "list" ? "text-xs sm:text-sm" : "text-xs"
                }`}
              >
                ({book.num_reviews || 0})
              </span>
            </div>
            {book.pages && (
              <span
                className={`text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100 font-medium ${
                  viewMode === "list" ? "text-xs" : "text-[10px] xs:text-xs"
                }`}
              >
                📖 {book.pages}
                {t("bookCard.pages")}
              </span>
            )}
          </div>
        </div>

        {/* Price and action section */}
        <div
          className={`${
            viewMode === "list"
              ? "flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 sm:gap-4 mt-auto"
              : "mt-auto space-y-2"
          }`}
        >
          {/* Price section */}
          <div
            className={`${
              viewMode === "list" ? "flex flex-col" : "flex-col justify-center"
            }`}
          >
            <div className="flex items-baseline gap-2">
              {isOnSale && displaySalePrice != null ? (
                <>
                  <p
                    className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 ${
                      viewMode === "list"
                        ? "text-xl sm:text-2xl"
                        : "text-lg sm:text-xl"
                    }`}
                  >
                    {t("common:currency")} {displaySalePrice}
                  </p>
                  <p
                    className={`text-gray-400 line-through ${
                      viewMode === "list"
                        ? "text-base sm:text-lg"
                        : "text-sm sm:text-base"
                    }`}
                  >
                    {displayPrice}
                  </p>
                </>
              ) : (
                <p
                  className={`font-bold text-gray-900 ${
                    viewMode === "list"
                      ? "text-xl sm:text-2xl"
                      : "text-lg sm:text-xl"
                  }`}
                >
                  {t("common:currency")} {displayPrice}
                </p>
              )}
            </div>
          </div>

          {/* Add to cart button with enhanced responsive styling */}
          <button
            onClick={handleAddToCart}
            name="add-to-cart-btn"
            disabled={isAdding || book.stock <= 0}
            className={`transition-all duration-300 flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl active:scale-95 ${
              viewMode === "list"
                ? `py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base ${
                    addSuccess
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      : book.stock <= 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : isAdding
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                          : "bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700"
                  }`
                : `w-full py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
                    addSuccess
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-200"
                      : book.stock <= 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                        : isAdding
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-200"
                          : "bg-black text-white hover:from-gray-700 hover:to-gray-600"
                  }`
            }`}
            aria-label={`Add ${book.title} to cart`}
          >
            {addSuccess ? (
              <>
                <FaCheck className="text-sm sm:text-base animate-bounce" />
                <span className="tracking-wide whitespace-nowrap">
                  {viewMode === "list"
                    ? t("bookCard.added")
                    : t("bookCard.addedToCart")}
                </span>
              </>
            ) : isAdding ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                <span className="tracking-wide whitespace-nowrap">
                  {t("bookCard.adding")}
                </span>
              </>
            ) : book.stock <= 0 ? (
              <span className="tracking-wide whitespace-nowrap">
                {t("bookCard.outOfStock")}
              </span>
            ) : (
              <>
                <FaShoppingCart className="text-sm sm:text-base group-hover:animate-pulse" />
                <span className="tracking-wide whitespace-nowrap">
                  {t("bookCard.addToCart")}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const areBooksEqual = (a, b) => {
  const pick = (x) => ({
    id: x?._id || x?.id,
    title: x?.title,
    price: x?.price,
    sale_price: x?.sale_price,
    is_on_sale: x?.is_on_sale,
    rating: x?.rating,
    num_reviews: x?.num_reviews,
    pages: x?.pages,
    slug: x?.slug,
    author: x?.author,
    cover0:
      Array.isArray(x?.cover_image) && x.cover_image.length
        ? x.cover_image[0]
        : x?.cover_image,
  });
  const pa = pick(a);
  const pb = pick(b);
  for (const k in pa) {
    if (pa[k] !== pb[k]) return false;
  }
  return true;
};

function areEqual(prev, next) {
  if (prev.baseUrl !== next.baseUrl) return false;
  if (prev.viewMode !== next.viewMode) return false;
  return areBooksEqual(prev.book, next.book);
}

export default React.memo(BookCardInner, areEqual);
