import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
  useCallback,
} from "react";
import { BooksContext } from "@/context/BooksContext";

export default function DealsV2({ pageSize = 10, autoplayMs = 5000 }) {
  const { url, fetchDealsOfWeek } = useContext(BooksContext);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const rootRef = useRef(null);
  const autoplayRef = useRef(null);
  const mountedRef = useRef(true);

  const fmtBDT = useMemo(
    () =>
      new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 0,
      }),
    []
  );

  const loadDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchDealsOfWeek(pageSize);
      const arr = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
        ? resp
        : [];
      if (!mountedRef.current) return;
      setDeals(arr);
      setActiveIndex(0);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e?.message || "Failed to load deals");
    } finally {
      mountedRef.current && setLoading(false);
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

  const next = useCallback(() => {
    setActiveIndex((i) => (deals.length ? (i + 1) % deals.length : 0));
  }, [deals.length]);

  const prev = useCallback(() => {
    setActiveIndex((i) =>
      deals.length ? (i - 1 + deals.length) % deals.length : 0
    );
  }, [deals.length]);

  // autoplay
  useEffect(() => {
    window.clearInterval(autoplayRef.current);
    if (!isPaused && deals.length > 1 && autoplayMs > 0) {
      autoplayRef.current = window.setInterval(next, autoplayMs);
    }
    return () => window.clearInterval(autoplayRef.current);
  }, [isPaused, deals.length, autoplayMs, next]);

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
        Error: {error}{" "}
        <button
          onClick={loadDeals}
          className="ml-3 inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!deals.length) {
    return (
      <div className="bg-white rounded-2xl p-6 md:p-8 border text-gray-700 mt-6">
        No deals available.
      </div>
    );
  }

  const d = deals[activeIndex] || {};
  const cover = Array.isArray(d?.cover_image)
    ? d.cover_image[0]
    : d?.cover_image;
  const isOnSale = !!d?.is_on_sale && typeof d?.sale_price === "number";
  const priceNow = isOnSale ? d?.sale_price : d?.price;

  const onImgError = (e) => {
    e.currentTarget.src =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='640'>
           <rect width='100%' height='100%' fill='#f3f4f6'/>
           <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-size='16'>No image</text>
         </svg>`
      );
  };

  return (
    <section
      ref={rootRef}
      className="relative mt-6 md:mt-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Deals of the Week"
    >
      {/* Decorative gradient background */}
      {/* <div className="absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(1200px_400px_at_10%_0%,#f1f5ff,transparent),radial-gradient(800px_300px_at_90%_10%,#fff7f2,transparent)]" /> */}

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          Deals of the Week
        </h2>
      </div>

      {/* Card */}
      <div className="relative rounded-md bg-white/90 backdrop-blur shadow-md ring-1 ring-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left: Cover */}
          <div className="relative p-6 md:p-8 flex items-center justify-center">
            {d?.is_deal_of_the_week && (
              <span className="absolute left-6 top-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black text-white/90 shadow">
                🔥 Deal of the Week
              </span>
            )}
            <img
              src={cover ? `${url}${cover}` : undefined}
              onError={onImgError}
              alt={d?.title || "Deal cover"}
              loading="lazy"
              className="w-56 md:w-72 lg:w-80 object-contain"
            />
            {/* Floating nav buttons (desktop) */}
            <button
              onClick={prev}
              aria-label="Previous"
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow border hover:bg-white transition"
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
              onClick={next}
              aria-label="Next"
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow border hover:bg-white transition"
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
          <div className="p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 line-clamp-2">
              {d?.title || "Untitled"}
            </h3>
            <p className="text-gray-600 mt-1">{d?.author || "—"}</p>

            {/* Meta row (optional fields are safe) */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {typeof d?.rating === "number" && (
                <span className="inline-flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  {d.rating.toFixed?.(1)}
                </span>
              )}
              {d?.pages && <span>{d.pages} pages</span>}
              {d?.category && (
                <span className="px-2 py-0.5 rounded-full bg-gray-100">
                  {d.category}
                </span>
              )}
            </div>

            {/* Price block */}
            <div className="mt-5 inline-flex items-center gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-black text-white text-lg md:text-xl font-semibold">
                {typeof priceNow === "number" ? fmtBDT.format(priceNow) : "—"}
              </span>
              {isOnSale && typeof d?.price === "number" && (
                <>
                  <span className="line-through text-gray-500">
                    {fmtBDT.format(d.price)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                    Save{" "}
                    {Math.max(
                      0,
                      Math.round(((d.price - priceNow) / d.price) * 100)
                    )}
                    %
                  </span>
                </>
              )}
            </div>

            {/* CTAs – wire to your router/cart later */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={d?.slug ? `/book/${d.slug}` : "#"}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-black transition shadow-sm"
              >
                View details
              </a>
              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
                onClick={() => {
                  // onAddToCart?.(d) // wire when ready
                }}
              >
                Add to cart
              </button>
            </div>

            {/* Mobile nav */}
            <div className="mt-6 flex gap-3 md:hidden">
              <button
                onClick={prev}
                className="flex-1 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={next}
                className="flex-1 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnails (desktop) */}
        {deals.length > 1 && (
          <div className="hidden md:flex items-center gap-3 px-6 pb-6 pt-3">
            {deals.slice(0, 8).map((item, i) => {
              const c = Array.isArray(item?.cover_image)
                ? item.cover_image[0]
                : item?.cover_image;
              const active = i === activeIndex;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`group relative rounded-lg overflow-hidden ring-1 transition ${
                    active ? "ring-black" : "ring-gray-200 hover:ring-gray-300"
                  }`}
                  aria-label={`Go to deal ${i + 1}`}
                >
                  <img
                    src={c ? `${url}${c}` : undefined}
                    onError={(e) => (e.currentTarget.style.opacity = 0.2)}
                    alt=""
                    className="w-14 h-18 object-cover"
                  />
                  <span
                    className={`absolute inset-0 ${
                      active ? "ring-2 ring-inset ring-black/60" : "ring-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-4 gap-2">
        {deals.map((_, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Slide ${i + 1}`}
              aria-current={active ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all ${
                active ? "w-6 bg-black" : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}
