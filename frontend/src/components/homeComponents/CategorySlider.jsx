import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Tailwind helpers
// Add this to your global CSS to hide scrollbars for the slider track:
// .no-scrollbar::-webkit-scrollbar { display: none; }
// .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
// ─────────────────────────────────────────────────────────────────────────────

const CategorySlider = ({
  title = "Categories",
  source = "/category.json",
  autoplayMs = 3800, // set to 0 to disable
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Slider refs/state
  const trackRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise((r) => setTimeout(r, 600)); // simulate delay
      const res = await fetch(source);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setCategories(data?.featured_categories ?? []);
    } catch (e) {
      setError(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Autoplay logic
  useEffect(() => {
    if (!autoplayMs || isHovering || !categories.length) return;
    const el = trackRef.current;
    if (!el) return;
    const id = setInterval(() => {
      const step = Math.floor(el.clientWidth * 0.9);
      const atEnd =
        Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth - 2;
      el.scrollTo({
        left: atEnd ? 0 : el.scrollLeft + step,
        behavior: "smooth",
      });
    }, autoplayMs);
    return () => clearInterval(id);
  }, [isHovering, autoplayMs, categories.length]);

  // Calculate item widths responsively (keeps a bit of next card peeking)
  const itemWidthClasses = useMemo(
    () =>
      "shrink-0 snap-start w-[78%] sm:w-[48%] md:w-[32%] lg:w-[23%] xl:w-[19%]",
    []
  );

  // Loading state
  if (loading) {
    return (
      <section className="py-12 px-4 bg-gradient-to-br from-gray-50 to-white mt-8">
        <div className="max-w-7xl mx-auto">
          <Header title={title} />
          <div className="relative">
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`${itemWidthClasses} h-28 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md border border-gray-100 animate-pulse`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 px-4 bg-gradient-to-br from-gray-50 to-white mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <Header title={title} />
          <div
            className="mx-auto max-w-md bg-white rounded-md border border-red-200 p-6"
            role="alert"
            aria-live="polite"
          >
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold mb-1">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchCategories}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Main render
  return (
    <section className="py-12 px-4 mt-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <Header title={title} />

        {/* Slider container */}
        <div className="relative group">
          {/* Track */}
          <div
            ref={trackRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth scroll-pl-1 pr-2 pb-2"
            role="region"
            aria-label="Category slider"
          >
            {categories.map((category, index) => {
              return (
                <Link
                  key={index}
                  to={category.action_link || "#"}
                  className={`${itemWidthClasses} relative bg-white rounded-md border border-gray-100 p-5 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-800`}
                  tabIndex={0}
                >
                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-1">
                      {category.name}
                    </h3>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 group-hover:border-transparent bg-white/60 backdrop-blur-sm transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4 text-gray-700 group-hover:translate-x-0.5 transition-transform"
                        aria-hidden
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

function Header({ title }) {
  return (
    <div className="text-start mb-6 md:mb-8">
      <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        {title}
      </h2>
    </div>
  );
}

export default CategorySlider;
