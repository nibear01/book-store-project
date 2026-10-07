import React, {
  useEffect,
  useMemo,
  useRef,
  useContext,
  useCallback,
  useReducer,
  useState,
} from "react";
import { BooksContext } from "../../context/BooksContext";
import { buildImageUrl } from "@/utils/imageUrlHelper";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { usePrintSettings } from "../../context/PrintSettingsContext";
import { toast } from "react-toastify";
import { FaCheck, FaShoppingCart } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  getBookPrice,
  defaultPrintState,
} from "../bookViewComponents/BookPrintPricing";

// Reducer function to handle related state updates together
function dealsReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        deals: action.payload,
        activeIndex: 0,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_ACTIVE_INDEX":
      return { ...state, activeIndex: action.payload };
    case "SET_PAUSED":
      return { ...state, isPaused: action.payload };
    case "SET_TRANSITIONING":
      return { ...state, isTransitioning: action.payload };
    case "SET_TOUCH_START":
      return { ...state, touchStartX: action.payload };
    case "SET_TOUCH_END":
      return { ...state, touchEndX: action.payload };
    case "RESET_TOUCH":
      return { ...state, touchStartX: 0, touchEndX: 0 };
    default:
      return state;
  }
}

// Create an error boundary component for handling errors gracefully
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-600 bg-red-50 rounded-xl border border-red-200">
          <h3 className="font-medium text-lg">Something went wrong</h3>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function DealsV2({ pageSize = 10, autoplayMs = 5000 }) {
  const { t } = useTranslation("home");
  const { url, fetchDealsOfWeek } = useContext(BooksContext);
  const [state, dispatch] = useReducer(dealsReducer, {
    deals: [],
    loading: true,
    error: null,
    activeIndex: 0,
    isPaused: false,
    touchStartX: 0,
    touchEndX: 0,
    isTransitioning: false,
  });
  const { deals, loading, error, activeIndex, isPaused, isTransitioning } =
    state;

  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const rootRef = useRef(null);
  const autoplayRef = useRef(null);
  const mountedRef = useRef(true);
  const imagePreloadRef = useRef(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const { printSettings } = usePrintSettings();

  // Same format as the book cards (৳ and paisa), so the shown price matches what the cart charges
  const fmtBDT = useMemo(() => {
    const nf = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return { format: (n) => `৳${nf.format(Number(n) || 0)}` };
  }, []);

  // Preload next image for smoother transitions
  const preloadNextImage = useCallback(() => {
    if (deals.length <= 1) return;

    const nextIndex = (activeIndex + 1) % deals.length;
    const nextDeal = deals[nextIndex];

    if (!nextDeal) return;

    const nextCover = Array.isArray(nextDeal?.cover_image)
      ? nextDeal.cover_image[0]
      : nextDeal?.cover_image;

    if (nextCover && url) {
      imagePreloadRef.current = new Image();
      imagePreloadRef.current.src = `${url}${nextCover}`;
    }
  }, [activeIndex, deals, url]);

  // Debounced navigation to prevent rapid clicks
  const debounce = useCallback((func, delay) => {
    let timerId;
    return (...args) => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }, []);

  // Load deals
  const loadDeals = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const resp = await fetchDealsOfWeek(pageSize);
      const arr = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
          ? resp
          : [];
      if (!mountedRef.current) return;
      dispatch({ type: "FETCH_SUCCESS", payload: arr });
    } catch (e) {
      if (!mountedRef.current) return;
      dispatch({
        type: "FETCH_ERROR",
        payload: e?.message || "Failed to load deals",
      });
    }
  }, [fetchDealsOfWeek, pageSize]);

  useEffect(() => {
    mountedRef.current = true;
    loadDeals();
    return () => {
      mountedRef.current = false;
      window.clearInterval(autoplayRef.current);
    };
  }, [loadDeals]);

  // Effect for preloading images
  useEffect(() => {
    preloadNextImage();
  }, [activeIndex, preloadNextImage]);

  // Navigation functions
  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning) return;

      dispatch({ type: "SET_TRANSITIONING", payload: true });
      dispatch({ type: "SET_ACTIVE_INDEX", payload: index });

      // Reset transition state after animation completes
      setTimeout(() => {
        dispatch({ type: "SET_TRANSITIONING", payload: false });
      }, 300);
    },
    [isTransitioning],
  );

  const next = useCallback(() => {
    if (deals.length) {
      const nextIndex = (activeIndex + 1) % deals.length;
      goToSlide(nextIndex);
    }
  }, [deals.length, activeIndex, goToSlide]);

  const prev = useCallback(() => {
    if (deals.length) {
      const prevIndex = (activeIndex - 1 + deals.length) % deals.length;
      goToSlide(prevIndex);
    }
  }, [deals.length, activeIndex, goToSlide]);

  // Throttled versions to prevent rapid-fire events
  const throttledNext = useCallback(() => {
    const debouncedFn = debounce(next, 300);
    debouncedFn();
  }, [next, debounce]);
  const throttledPrev = useCallback(() => {
    const debouncedFn = debounce(prev, 300);
    debouncedFn();
  }, [prev, debounce]);

  const setActiveIndex = useCallback(
    (index) => {
      goToSlide(index);
    },
    [goToSlide],
  );

  const setPaused = useCallback((value) => {
    dispatch({ type: "SET_PAUSED", payload: value });
  }, []);

  // Handle touch events for swipe gestures
  const handleTouchStart = useCallback((e) => {
    dispatch({ type: "SET_TOUCH_START", payload: e.touches[0].clientX });
  }, []);

  const handleTouchMove = useCallback((e) => {
    dispatch({ type: "SET_TOUCH_END", payload: e.touches[0].clientX });
  }, []);

  const handleTouchEnd = useCallback(() => {
    const { touchStartX, touchEndX } = state;
    const minSwipeDistance = 50;

    if (touchStartX && touchEndX) {
      if (touchEndX - touchStartX > minSwipeDistance) {
        throttledPrev();
      } else if (touchStartX - touchEndX > minSwipeDistance) {
        throttledNext();
      }
    }

    dispatch({ type: "RESET_TOUCH" });
  }, [state, throttledNext, throttledPrev]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        throttledPrev();
      } else if (e.key === "ArrowRight") {
        throttledNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [throttledNext, throttledPrev]);

  // autoplay
  useEffect(() => {
    window.clearInterval(autoplayRef.current);
    if (!isPaused && deals.length > 1 && autoplayMs > 0) {
      autoplayRef.current = window.setInterval(next, autoplayMs);
    }
    return () => window.clearInterval(autoplayRef.current);
  }, [isPaused, deals.length, autoplayMs, next]);

  // Derived values
  const currentDeal = useMemo(
    () => deals[activeIndex] || {},
    [deals, activeIndex],
  );

  const cover = useMemo(() => {
    const c = currentDeal?.cover_image;
    return Array.isArray(c) ? c[0] : c;
  }, [currentDeal?.cover_image]);

  // Price for the default print options (same rule the cart charges)
  const priceInfo = useMemo(() => {
    const p = getBookPrice(currentDeal, printSettings);
    const baseRef = p.compareAt ?? p.price;
    return {
      isOnSale: p.onSale,
      priceNow: p.price,
      baseRef,
      discount:
        p.onSale && baseRef > 0
          ? Math.max(0, Math.round(((baseRef - p.price) / baseRef) * 100))
          : 0,
      variant: printSettings ? defaultPrintState : null,
      breakdown: p.breakdown,
    };
  }, [currentDeal, printSettings]);

  // Action handlers
  const onAddToCart = useCallback(async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const bid = currentDeal._id || currentDeal.id;
    if (isInCart && isInCart(bid)) {
      toast.info("Already added to cart.");
      return;
    }

    try {
      setIsAdding(true);
      const variant =
        priceInfo.variant
          ? {
              paperQuality: priceInfo.variant.paperQuality,
              printSide: priceInfo.variant.printSide,
              paperSize: priceInfo.variant.paperSize,
              colorMode: priceInfo.variant.colorMode,
            }
          : undefined;
      const unitPrice = Number(priceInfo.priceNow || currentDeal.price || 0);
      await addToCart({
        item: {
          id: currentDeal._id || currentDeal.id,
          title: currentDeal.title,
          price: unitPrice,
          slug: currentDeal.slug,
          configured: !!priceInfo.variant,
          variant,
          breakdown: priceInfo.variant ? priceInfo.breakdown || undefined : undefined,
        },
        quantity: 1,
        variant,
      });
      setAddSuccess(true);
      toast.success("Added to cart.");
      // Reset success state after a short delay
      setTimeout(() => setAddSuccess(false), 1200);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error(error?.message || "Failed to add to cart.");
    } finally {
      setIsAdding(false);
    }
  }, [
    addToCart,
    currentDeal._id,
    currentDeal.id,
    currentDeal.price,
    currentDeal.slug,
    currentDeal.title,
    isAuthenticated,
    isInCart,
    navigate,
    priceInfo.breakdown,
    priceInfo.priceNow,
    priceInfo.variant,
  ]);

  const onImgError = useCallback((e) => {
    e.currentTarget.src =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='640'>
           <rect width='100%' height='100%' fill='#f3f4f6'/>
           <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-size='16'>No image</text>
         </svg>`,
      );
  }, []);

  // UI rendering
  if (loading) {
    return (
      <section className="mt-6 md:mt-10">
        <div className="bg-white/70 backdrop-blur rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-pulse">
          <div className="h-7 w-60 bg-gray-200 rounded mb-5" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-[3/4] bg-gray-100 rounded-xl" />
            <div className="space-y-3">
              <div className="h-6 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
              <div className="h-10 w-44 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-red-200 text-red-600 mt-6">
        {t("deals.error")} {error}{" "}
        <button
          onClick={loadDeals}
          className="ml-3 inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700"
        >
          {t("deals.retry")}
        </button>
      </div>
    );
  }

  if (!deals.length) {
    return (
      <div className="mt-6 bg-white rounded-2xl p-6 md:p-8 border border-gray-200 text-gray-600 text-center">
        {t("deals.noDeals")}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <section
        name="deals-section"
        ref={rootRef}
        className="relative mt-6 md:mt-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label="Deals of the Week"
        tabIndex="0"
      >
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <h2
            name="deals-heading"
            className="text-xl md:text-2xl font-semibold text-gray-900"
          >
            {t("deals.title")}
          </h2>
        </div>

        {/* Card */}
        <div
          className={`relative rounded-md bg-white shadow-md ring-1 ring-gray-100 overflow-hidden transition-opacity duration-300 ${
            isTransitioning ? "opacity-70" : "opacity-100"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left: Cover */}
            <div className="relative p-6 md:p-8 flex items-center justify-center">
              {currentDeal?.is_deal_of_the_week && (
                <span className="absolute left-6 top-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black text-white shadow z-10">
                  🔥 {t("deals.dealBadge")}
                </span>
              )}
              <div className="max-h-[400px] overflow-hidden transition-transform duration-300 hover:scale-105">
                <img
                  src={cover ? buildImageUrl(cover, url) : undefined}
                  onError={onImgError}
                  alt={currentDeal?.title || "Deal cover"}
                  loading="lazy"
                  className="w-56 md:w-72 lg:w-75 object-contain"
                />
              </div>

              {/* Floating nav buttons (desktop) */}
              <button
                name="deals-prev-btn"
                onClick={throttledPrev}
                aria-label="Previous"
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow border hover:bg-white transition-transform hover:scale-110"
              >
                <svg
                  className="m-auto w-5 h-5 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <button
                name="deals-next-btn"
                onClick={throttledNext}
                aria-label="Next"
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow border hover:bg-white transition-transform hover:scale-110"
              >
                <svg
                  className="m-auto w-5 h-5 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>

            {/* Right: Details */}
            <div className="p-6 md:p-8 flex flex-col">
              <h3
                name="deals-title"
                className="text-xl md:text-2xl font-bold text-gray-900 line-clamp-2"
              >
                {currentDeal?.title || "Untitled"}
              </h3>
              <p className="text-gray-600 mt-1">{currentDeal?.author || "—"}</p>

              {/* Meta row */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {typeof currentDeal?.rating === "number" && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                    <svg
                      className="w-4 h-4 text-amber-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    {currentDeal.rating.toFixed?.(1)}
                  </span>
                )}
                {currentDeal?.pages && (
                  <span className="inline-flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                    {currentDeal.pages} {t("deals.pages")}
                  </span>
                )}
                {currentDeal?.category && (
                  <span className="px-2 py-1 rounded-full bg-gray-100">
                    {currentDeal.category}
                  </span>
                )}
              </div>

              {/* Description - limited preview */}
              {currentDeal?.description && (
                <p className="mt-3 text-gray-600 line-clamp-3 text-sm">
                  {currentDeal.description}
                </p>
              )}

              {/* Price block */}
              <div className="mt-5 flex items-center gap-3">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-black text-white text-sm md:text-base font-semibold">
                  {Number.isFinite(priceInfo.priceNow)
                    ? fmtBDT.format(priceInfo.priceNow)
                    : "—"}
                </span>
                {priceInfo.isOnSale && Number.isFinite(priceInfo.baseRef) && (
                  <>
                    <span className="line-through text-gray-500">
                      {fmtBDT.format(priceInfo.baseRef)}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                      {t("deals.save")} {priceInfo.discount}%
                    </span>
                  </>
                )}
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onAddToCart}
                  disabled={isAdding}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 shadow-sm border ${
                    addSuccess
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-transparent"
                      : isAdding
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent"
                        : "border-gray-300 bg-white hover:bg-gray-50 text-gray-800"
                  }`}
                  aria-label={
                    addSuccess
                      ? "Added to cart"
                      : isAdding
                        ? "Adding to cart"
                        : "Add to cart"
                  }
                >
                  {addSuccess ? (
                    <>
                      <FaCheck className="text-base animate-bounce" />
                      <span className="tracking-wide">
                        {t("deals.addedToCart")}
                      </span>
                    </>
                  ) : isAdding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span className="tracking-wide">{t("deals.adding")}</span>
                    </>
                  ) : (
                    <>
                      <FaShoppingCart className="text-base" />
                      <span className="tracking-wide">
                        {t("deals.addToCart")}
                      </span>
                    </>
                  )}
                </button>
                <Link
                  to={`/bookview/${currentDeal.slug || currentDeal._id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-black transition shadow-sm"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {t("deals.viewDetails")}
                </Link>
              </div>

              {/* Mobile nav - improved */}
              <div className="mt-6 grid grid-cols-2 gap-3 md:hidden">
                <button
                  onClick={throttledPrev}
                  className="flex items-center justify-center py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                  {t("deals.previous")}
                </button>
                <button
                  onClick={throttledNext}
                  className="flex items-center justify-center py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50"
                >
                  {t("deals.next")}
                  <svg
                    className="w-5 h-5 ml-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Thumbnails (desktop) - improved with visible active state */}
          {deals.length > 1 && (
            <div className="hidden md:flex items-center gap-3 px-6 pb-6 pt-3 overflow-x-auto">
              {deals.slice(0, 8).map((item, i) => {
                const c = Array.isArray(item?.cover_image)
                  ? item.cover_image[0]
                  : item?.cover_image;
                const active = i === activeIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`group relative rounded-lg overflow-hidden transition-all duration-200 ${
                      active
                        ? "ring-2 ring-black scale-110 z-10"
                        : "ring-1 ring-gray-200 hover:ring-gray-300"
                    }`}
                    aria-label={`Go to deal ${i + 1}`}
                    aria-current={active ? "true" : undefined}
                  >
                    <img
                      src={c ? `${url}${c}` : undefined}
                      onError={(e) => (e.currentTarget.style.opacity = 0.2)}
                      alt=""
                      className={`w-14 h-18 object-cover ${
                        active
                          ? "brightness-110"
                          : "brightness-90 group-hover:brightness-100"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dots - improved with better visual feedback */}
        {deals.length > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {deals.map((_, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                  aria-current={active ? "true" : undefined}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    active
                      ? "w-8 bg-black"
                      : "w-2 bg-gray-300 hover:bg-gray-400 hover:w-3"
                  }`}
                />
              );
            })}
          </div>
        )}
      </section>
    </ErrorBoundary>
  );
}

export default React.memo(DealsV2);
