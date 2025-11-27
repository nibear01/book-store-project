import { useEffect, useState, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { categoryAPI } from "../../api/category-api";
import { useTranslation } from "react-i18next";

const CategorySlider = ({ title }) => {
  const { t } = useTranslation('common');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const displayTitle = title || t('home.categories.title');

  // Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await categoryAPI.list({ includeEmpty: false });
      const data = Array.isArray(res?.data) ? res.data : [];
      setCategories(data);
    } catch (e) {
      setError(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Derive slug if backend doesn't send
  const slugify = useCallback((s) => {
    return String(s || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .replace(/-{2,}/g, "-");
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="py-12 px-4 bg-gradient-to-br from-gray-50 to-white mt-8">
        <div className="max-w-7xl mx-auto">
          <Header title={displayTitle} />
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl border border-gray-100 animate-pulse"
              />
            ))}
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
          <Header title={displayTitle} />
          <div
            className="mx-auto max-w-md bg-white rounded-md border border-red-200 p-6"
            role="alert"
            aria-live="polite"
          >
            {/* alert symbol removed for a cleaner look */}
            <h3 className="text-lg font-semibold mb-1">
              {t('home.categories.errorTitle')}
            </h3>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchCategories}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
            >
              {t('home.categories.tryAgain')}
            </button>
          </div>
        </div>
      </section>
    );
  }
          

  // Main render
  return (
    <section name="categories-section" className="py-12 px-4 mt-8">
      <div className="max-w-7xl mx-auto">
        <Header title={displayTitle} />

        <div
          name="categories-grid"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          role="region"
          aria-label="Categories"
        >
          {categories.slice(0, 10).map((category, index) => {
            const name = category?.name || "Untitled";
            const slug = category?.slug || slugify(name);
            return (
              <Link
                name={`category-link-${slug}`}
                key={index}
                to={`/categories?category=${encodeURIComponent(slug)}`}
                className="group relative bg-white rounded-xl border border-gray-100 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-800"
              >
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-1">
                    {name}
                  </h3>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white/70 transition-all group-hover:border-black group-hover:bg-black">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="w-4 h-4 text-gray-700 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background:
                      "radial-gradient(120px 60px at 90% 10%, rgba(0,0,0,0.06), transparent 60%)",
                  }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
          

function Header({ title }) {
  return (
    <div className="text-start mb-6 md:mb-8">
      <h2 name="categories-heading" className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        {title}
      </h2>
    </div>
  );
}

export default memo(CategorySlider);