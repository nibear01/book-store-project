import { useState, useEffect, useRef } from "react";
import { categoryAPI } from "../api/category-api";

export const useCategories = (books) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [languageFilter, setLanguageFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [mobileViewStrategy, setMobileViewStrategy] = useState("adaptive");
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filteredBooks, setFilteredBooks] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  // Refs for mobile viewport handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Track open/closed state of filter sections
  const [filterSections, setFilterSections] = useState({
    price: true,
    rating: true,
    language: true,
    availability: true,
    categories: true,
  });

  // Categories state fetched from backend
  const [categories, setCategories] = useState([]); // { _id, name, slug, book_count }
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const res = await categoryAPI.list({ includeEmpty: false });
        if (!cancelled) {
          const mapped = (res.data || []).map((c, idx) => ({
            id: c._id || idx,
            title: c.name,
            slug: c.slug,
            count: c.book_count || 0,
            item: `${c.book_count || 0} book${
              (c.book_count || 0) === 1 ? "" : "s"
            }`,
          }));
          setCategories(mapped);
        }
      } catch (e) {
        if (!cancelled)
          setCategoriesError(e.message || "Failed to load categories");
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate number of groups needed for current viewport
  const calculateGroupCount = () => {
    return Math.ceil(filteredBooks.length / 4);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? "All" : category);
  };

  // Reset all filters to default values
  const resetFilters = () => {
    setSelectedCategory("All");
    setSortOption("featured");
    setPriceRange([0, 50]);
    setRatingFilter(0);
    setLanguageFilter("All");
    setAvailabilityFilter("all");
    setSearchQuery("");
    setFilterSections({
      price: true,
      rating: true,
      language: true,
      availability: true,
      categories: true,
    });
  };

  // Toggle filter section open/close state
  const toggleFilterSection = (section) => {
    setFilterSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      window.requestAnimationFrame(() => {
        setWindowWidth(window.innerWidth);
        setIsMobile(window.innerWidth < 768);

        // Reset active group when viewport size changes significantly
        if (window.innerWidth >= 768 && activeGroupIndex > 0) {
          setActiveGroupIndex(0);
        }
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeGroupIndex]);

  // Handle touch events for mobile swipe navigation
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diffX = touchStartX.current - touchEndX.current;

    // Only trigger if swipe is significant enough
    if (Math.abs(diffX) > 50) {
      if (diffX > 0 && activeGroupIndex < calculateGroupCount() - 1) {
        // Swiped left - go to next group
        setActiveGroupIndex(activeGroupIndex + 1);
      } else if (diffX < 0 && activeGroupIndex > 0) {
        // Swiped right - go to previous group
        setActiveGroupIndex(activeGroupIndex - 1);
      }
    }

    // Reset values
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Helper to normalize genre into array (avoid importing admin utils here)
  const toGenreArray = (g) =>
    Array.isArray(g)
      ? g.map((s) => String(s).trim()).filter(Boolean)
      : String(g || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

  // Derive filteredBooks based on selectedCategory (client-side refinement)
  useEffect(() => {
    if (!Array.isArray(books)) {
      setFilteredBooks([]);
      return;
    }
    if (selectedCategory === "All") {
      setFilteredBooks(books);
      return;
    }
    const catLower = selectedCategory.toLowerCase();
    const next = books.filter((b) => {
      const genres = toGenreArray(b.genre).map((g) => g.toLowerCase());
      return genres.includes(catLower);
    });
    setFilteredBooks(next);
  }, [books, selectedCategory]);

  // Reset to page 1 when changing any non-page filter
  useEffect(() => {
    setPage(1);
  }, [
    selectedCategory,
    sortOption,
    priceRange,
    ratingFilter,
    languageFilter,
    availabilityFilter,
    searchQuery,
  ]);

  return {
    // States
    selectedCategory,
    sortOption,
    priceRange,
    ratingFilter,
    languageFilter,
    availabilityFilter,
    searchQuery,
    viewMode,
    mobileViewStrategy,
    activeGroupIndex,
    windowWidth,
    isMobile,
    filteredBooks,
    page,
    limit,
    filterSections,
    categories,
    categoriesLoading,
    categoriesError,

    // Calculated values
    groupCount: calculateGroupCount(),

    // Handlers
    setSelectedCategory,
    setSortOption,
    setPriceRange,
    setRatingFilter,
    setLanguageFilter,
    setAvailabilityFilter,
    setSearchQuery,
    setViewMode,
    setMobileViewStrategy,
    setActiveGroupIndex,
    setPage,
    setLimit,
    handleCategorySelect,
    resetFilters,
    toggleFilterSection,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
