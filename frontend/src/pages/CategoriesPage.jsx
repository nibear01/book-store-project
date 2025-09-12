/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { Link } from "react-router";

const CategoriesPage = ({ book }) => {
  const categories = [
    {
      id: 1,
      title: "Fiction",
      item: `${book.filter((b) => b.genre === "Fiction").length} books`,
      img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Science Fiction",
      item: `${book.filter((b) => b.genre === "Science Fiction").length} books`,
      img: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Romance",
      item: `${book.filter((b) => b.genre === "Romance").length} books`,
      img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "Fantasy",
      item: `${book.filter((b) => b.genre === "Fantasy").length} books`,
      img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 5,
      title: "Classic",
      item: `${book.filter((b) => b.genre === "Classic").length} books`,
      img: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      title: "Mystery",
      item: `${book.filter((b) => b.genre === "Mystery").length} books`,
      img: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  // State management
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 50]);
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

  // Ref for mobile viewport handling
  const viewportRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Track open/closed state of filter sections
  const [filterSections, setFilterSections] = useState({
    price: true,
    rating: true,
    language: true,
    availability: true,
  });

  /**
   * Calculate number of groups needed for current viewport
   */
  const calculateGroupCount = () => {
    return Math.ceil(filteredBooks.length / 4);
  };

  /**
   * Render star ratings with half-star precision using react-icons
   */
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-500" />);
    }

    // Add half star if needed
    if (halfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    }

    // Add empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-500" />);
    }

    return (
      <div className="flex" aria-label={`${rating} out of 5 stars`}>
        {stars}
      </div>
    );
  };

  /**
   * Filter and sort books based on current filter settings
   */
  useEffect(() => {
    let result = [...book];

    // 1. Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.genre.toLowerCase().includes(query)
      );
    }

    // 2. Category filter
    if (selectedCategory !== "All") {
      result = result.filter((book) => book.genre === selectedCategory);
    }

    // 3. Price filter
    result = result.filter(
      (book) => book.price >= priceRange[0] && book.price <= priceRange[1]
    );

    // 4. Rating filter
    if (ratingFilter > 0) {
      result = result.filter((book) => book.rating >= ratingFilter);
    }

    // 5. Language filter
    if (languageFilter !== "All") {
      result = result.filter((book) => book.language === languageFilter);
    }

    // 6. Availability filter
    if (availabilityFilter === "inStock") {
      result = result.filter((book) => book.stock > 0);
    } else if (availabilityFilter === "outOfStock") {
      result = result.filter((book) => book.stock === 0);
    }

    // 7. Sorting
    switch (sortOption) {
      case "priceLowHigh":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceHighLow":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort(
          (a, b) => new Date(b.published_date) - new Date(a.published_date)
        );
        break;
      default: // featured/bestselling
        result.sort(
          (a, b) =>
            b.is_featured - a.is_featured || b.num_reviews - a.num_reviews
        );
    }

    setFilteredBooks(result);
  }, [
    selectedCategory,
    sortOption,
    priceRange,
    ratingFilter,
    languageFilter,
    availabilityFilter,
    searchQuery,
  ]);

  /**
   * Handle category selection
   */
  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? "All" : category);
  };

  /**
   * Reset all filters to default values
   */
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
    });
  };

  /**
   * Toggle filter section open/close state
   */
  const toggleFilterSection = (section) => {
    setFilterSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  /**
   * Handle window resize for responsive behavior
   */
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

  /**
   * Handle touch events for mobile swipe navigation
   */
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

  // FilterSection component for collapsible filter sections
  const FilterSection = ({ title, children, sectionId }) => (
    <div className="mb-6 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => toggleFilterSection(sectionId)}
        className="w-full flex justify-between items-center text-left"
        aria-expanded={filterSections[sectionId]}
        aria-controls={`filter-section-${sectionId}`}
      >
        <h4 className="text-md font-medium text-gray-800">{title}</h4>
        <svg
          className={`h-5 w-5 transform transition-transform ${
            filterSections[sectionId] ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        id={`filter-section-${sectionId}`}
        className={`mt-3 overflow-hidden transition-all duration-300 ${
          filterSections[sectionId]
            ? "max-h-[1000px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );

  // CategoryCard component for displaying individual categories
  const CategoryCard = ({ id, title, item, img, isSelected, onClick }) => (
    <div
      key={id}
      className="group cursor-pointer relative"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === "Enter" && onClick()}
    >
      <div className="relative overflow-hidden rounded-[2px] h-[200px] mb-3">
        <img
          src={img}
          alt={`${title} category`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-xl font-semibold text-white group-hover:text-gray-300 transition-colors">
            {title}
          </h2>
          <p className="text-gray-200 text-sm">{item}</p>
        </div>
      </div>
      {/* Fixed: Added relative positioning to the parent and positioned the line correctly */}
      <div className="relative">
        <div
          className={`${
            isSelected ? "w-full" : "w-0"
          } h-1.5 absolute bottom-0 left-0 group-hover:w-full transition-all duration-300 bg-black`}
        />
      </div>
    </div>
  );

  // BookCard component for displaying individual books
  const BookCard = ({ book }) => (
    <div className="bg-white rounded-[2px] shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      {/* Book cover image */}
      <Link to={`/bookview`}>
        <div className="relative pt-[150%] sm:pt-[130%] md:pt-[140%] lg:pt-[150%] w-full h-[40%]">
          <img
            src={book.cover_image}
            alt={book.title}
            className="absolute top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      {/* {console.log(book)} */}
      {/* Book details */}
      <div className="p-4">
        <div className="flex flex-col h-full">
          {/* Genre tag */}
          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-[2px] w-fit mb-2">
            {book.genre}
          </span>

          {/* Title and author */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-gray-600 text-[12px] mb-3">by {book.author}</p>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex mr-2">{renderStars(book.rating)}</div>
            <span className="text-sm text-gray-600">({book.num_reviews})</span>
          </div>

          {/* Price and stock status */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-black font-bold text-lg">
              ${book.price.toFixed(2)}
            </p>
            <span
              className={`text-xs px-2 py-1 rounded-[2px] ${
                book.stock > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {book.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Add to cart button */}
          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-[2px] transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label={`Add ${book.title} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

  // ViewToggle component for switching between grid and list views
  const ViewToggle = ({ currentView, onViewChange }) => (
    <div className="flex bg-gray-100 rounded-[2px] p-1">
      <button
        onClick={() => onViewChange("grid")}
        className={`flex-1 py-1.5 rounded-[2px] text-sm font-medium transition-colors ${
          currentView === "grid"
            ? "bg-white shadow-sm text-gray-900"
            : "text-gray-600 hover:text-gray-900"
        }`}
        aria-pressed={currentView === "grid"}
        aria-label="Grid view"
      >
        <svg
          className="h-5 w-5 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`flex-1 py-1.5 rounded-[2px] text-sm font-medium transition-colors ${
          currentView === "list"
            ? "bg-white shadow-sm text-gray-900"
            : "text-gray-600 hover:text-gray-900"
        }`}
        aria-pressed={currentView === "list"}
        aria-label="List view"
      >
        <svg
          className="h-5 w-5 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  );

  // MobileStrategyToggle component for switching mobile view strategies
  const MobileStrategyToggle = () => {
    if (!isMobile) return null;

    return (
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Mobile View:
        </div>
        <div className="flex bg-gray-100 rounded-[2px] p-1">
          <button
            onClick={() => setMobileViewStrategy("adaptive")}
            className={`flex-1 py-1.5 rounded-[2px] text-sm font-medium transition-colors ${
              mobileViewStrategy === "adaptive"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
            aria-pressed={mobileViewStrategy === "adaptive"}
          >
            Adaptive Grid
          </button>
          <button
            onClick={() => setMobileViewStrategy("carousel")}
            className={`flex-1 py-1.5 rounded-[2px] text-sm font-medium transition-colors ${
              mobileViewStrategy === "carousel"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
            aria-pressed={mobileViewStrategy === "carousel"}
          >
            Swipe Pager
          </button>
        </div>
      </div>
    );
  };

  // MobileCardPager component for swipeable card groups on mobile
  const MobileCardPager = ({ children }) => {
    const groupCount = calculateGroupCount();

    return (
      <div
        className="mobile-card-pager h-full w-full overflow-hidden relative"
        ref={viewportRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-roledescription="swipeable book groups"
        aria-label={`Book groups, swipe left or right to navigate`}
      >
        {/* Viewport container - ensures full screen coverage */}
        <div className="h-full w-full">
          {/* Groups container - slides horizontally */}
          <div
            className="h-full w-full flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${activeGroupIndex * 100}%)`,
              width: `${groupCount * 100}%`,
            }}
          >
            {children}
          </div>
        </div>

        {/* Pagination indicators */}
        {groupCount > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {Array.from({ length: groupCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveGroupIndex(index)}
                className={`w-2.5 h-2.5 rounded-[2px] transition-all ${
                  index === activeGroupIndex
                    ? "bg-black w-3.5"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to book group ${index + 1}`}
                aria-current={index === activeGroupIndex ? "true" : "false"}
              />
            ))}
          </div>
        )}

        {/* Keyboard navigation hints */}
        <div className="sr-only" aria-live="polite">
          Use left and right arrow keys to navigate between book groups
        </div>
      </div>
    );
  };

  // AdaptiveCardGrid component for scaling cards to maintain 4-group pattern on mobile
  const AdaptiveCardGrid = ({ children }) => (
    <div className="adaptive-card-grid w-full h-full">
      <div className="grid grid-cols-2 gap-4 w-full h-full">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto pt-6 px-5">
        <nav className="flex items-center text-[12px] text-gray-600 space-x-2">
          <Link to="/" className="hover:text-gray-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Categories</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Mobile View Strategy Toggle */}
        <MobileStrategyToggle />

        {/* Main layout with sidebar and content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left sidebar - filters */}
          <aside className="lg:w-1/4 lg:top-24 lg:self-start">
            <div className="bg-white rounded-[2px] shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-black font-medium"
                  aria-label="Reset all filters"
                >
                  Reset All
                </button>
              </div>

              {/* Active Filters */}
              {(selectedCategory !== "All" ||
                ratingFilter > 0 ||
                languageFilter !== "All" ||
                availabilityFilter !== "all" ||
                priceRange[0] > 0 ||
                priceRange[1] < 50 ||
                searchQuery) && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">
                    Active Filters
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory !== "All" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
                        {selectedCategory}
                        <button
                          onClick={() => setSelectedCategory("All")}
                          className="ml-1.5 rounded-[2px] p-0.5 hover:bg-gray-200"
                          aria-label={`Remove ${selectedCategory} filter`}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {ratingFilter > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
                        {ratingFilter}+ Stars
                        <button
                          onClick={() => setRatingFilter(0)}
                          className="ml-1.5 rounded-[2px] p-0.5 hover:bg-gray-200"
                          aria-label={`Remove ${ratingFilter}+ stars filter`}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {languageFilter !== "All" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
                        {languageFilter}
                        <button
                          onClick={() => setLanguageFilter("All")}
                          className="ml-1.5 rounded-[2px] p-0.5 hover:bg-gray-200"
                          aria-label={`Remove ${languageFilter} language filter`}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {availabilityFilter !== "all" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
                        {availabilityFilter === "inStock"
                          ? "In Stock"
                          : "Out of Stock"}
                        <button
                          onClick={() => setAvailabilityFilter("all")}
                          className="ml-1.5 rounded-[2px] p-0.5 hover:bg-gray-200"
                          aria-label={`Remove ${
                            availabilityFilter === "inStock"
                              ? "In Stock"
                              : "Out of Stock"
                          } filter`}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {priceRange[0] > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
                        ${priceRange[0]}+
                        <button
                          onClick={() => setPriceRange([0, priceRange[1]])}
                          className="ml-1.5 rounded-[2px] p-0.5 hover:bg-gray-200"
                          aria-label={`Remove minimum price filter`}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {priceRange[1] < 50 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
                        Under ${priceRange[1]}
                        <button
                          onClick={() => setPriceRange([priceRange[0], 50])}
                          className="ml-1.5 rounded-[2px] p-0.5 hover:bg-gray-200"
                          aria-label={`Remove maximum price filter`}
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-xs font-medium bg-gray-100 text-gray-800">
                        "{searchQuery}"
                        <button
                          onClick={() => setSearchQuery("")}
                          className="ml-1.5 rounded-[2px] p-0.5 hover:bg-gray-200"
                          aria-label={`Remove search query "${searchQuery}"`}
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Search Filter */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search books..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    aria-label="Search books"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Categories Filter */}
              <div className="mb-6 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => toggleFilterSection("categories")}
                  className="w-full flex justify-between items-center text-left"
                  aria-expanded={filterSections.categories}
                  aria-controls="filter-section-categories"
                >
                  <h4 className="text-md font-medium text-gray-800">
                    Categories
                  </h4>
                  <svg
                    className={`h-5 w-5 transform transition-transform ${
                      filterSections.categories ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div
                  id="filter-section-categories"
                  className={`mt-3 overflow-hidden transition-all duration-300 ${
                    filterSections.categories
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={`flex items-center p-2 rounded-[2px] cursor-pointer transition-colors ${
                          selectedCategory === category.title
                            ? "bg-gray-100 text-black font-medium"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleCategorySelect(category.title)}
                      >
                        <span className="flex-1">{category.title}</span>
                        <span className="text-xs text-gray-500">
                          {category.item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Filter */}
              <FilterSection title="Price Range" sectionId="price">
                <div className="px-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="w-full h-1.5 bg-gray-200 rounded-[2px] appearance-none cursor-pointer accent-black"
                    aria-label="Minimum price"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="w-full h-1.5 bg-gray-200 rounded-[2px] appearance-none cursor-pointer accent-black mt-4"
                    aria-label="Maximum price"
                  />
                  <div className="text-center text-sm text-gray-500 mt-2">
                    Range: ${priceRange[0]} - ${priceRange[1]}
                  </div>
                </div>
              </FilterSection>

              {/* Rating Filter */}
              <FilterSection title="Rating" sectionId="rating">
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div
                      key={stars}
                      className="flex items-center cursor-pointer"
                      onClick={() => setRatingFilter(stars)}
                    >
                      <div className="flex mr-2">{renderStars(stars)}</div>
                      <span className="text-sm text-gray-700">&amp; up</span>
                      {ratingFilter === stars && (
                        <div className="ml-auto w-2 h-2 bg-black rounded-[2px]"></div>
                      )}
                    </div>
                  ))}
                </div>
              </FilterSection>

              {/* Language Filter */}
              <FilterSection title="Language" sectionId="language">
                <div className="space-y-2">
                  {["All", "English", "Spanish", "French", "German"].map(
                    (lang) => (
                      <div
                        key={lang}
                        className="flex items-center"
                        onClick={() => setLanguageFilter(lang)}
                      >
                        <input
                          type="radio"
                          id={`language-${lang}`}
                          name="language"
                          checked={languageFilter === lang}
                          onChange={() => setLanguageFilter(lang)}
                          className="h-4 w-4 text-black focus:ring-black border-gray-300"
                        />
                        <label
                          htmlFor={`language-${lang}`}
                          className="ml-3 text-sm text-gray-700 cursor-pointer"
                        >
                          {lang}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </FilterSection>

              {/* Availability Filter */}
              <FilterSection title="Availability" sectionId="availability">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="availability-all"
                      name="availability"
                      checked={availabilityFilter === "all"}
                      onChange={() => setAvailabilityFilter("all")}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <label
                      htmlFor="availability-all"
                      className="ml-3 text-sm text-gray-700 cursor-pointer"
                    >
                      All
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="availability-inStock"
                      name="availability"
                      checked={availabilityFilter === "inStock"}
                      onChange={() => setAvailabilityFilter("inStock")}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <label
                      htmlFor="availability-inStock"
                      className="ml-3 text-sm text-gray-700 cursor-pointer"
                    >
                      In Stock
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="availability-outOfStock"
                      name="availability"
                      checked={availabilityFilter === "outOfStock"}
                      onChange={() => setAvailabilityFilter("outOfStock")}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <label
                      htmlFor="availability-outOfStock"
                      className="ml-3 text-sm text-gray-700 cursor-pointer"
                    >
                      Out of Stock
                    </label>
                  </div>
                </div>
              </FilterSection>
            </div>
          </aside>

          {/* Right content - categories and books */}
          <main className="lg:w-3/4">
            {/* Categories grid */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Browse Categories
                </h2>
                <a href="#" className="text-sm text-gray-600 hover:text-black">
                  View all
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    id={category.id}
                    title={category.title}
                    item={category.item}
                    img={category.img}
                    isSelected={selectedCategory === category.title}
                    onClick={() => handleCategorySelect(category.title)}
                  />
                ))}
              </div>
            </div>

            {/* Book results section */}
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
                  {selectedCategory === "All"
                    ? "All Books"
                    : `${selectedCategory} Books`}
                  <span className="text-gray-500 text-base ml-2">
                    ({filteredBooks.length}{" "}
                    {filteredBooks.length === 1 ? "book" : "books"})
                  </span>
                </h2>

                {/* View toggle and sorting controls */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <ViewToggle
                    currentView={viewMode}
                    onViewChange={setViewMode}
                  />

                  <div className="relative w-full sm:w-auto">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="pl-3 pr-8 py-2 border border-gray-300 rounded-[2px] text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white w-full sm:w-auto"
                      aria-label="Sort books by"
                    >
                      <option value="featured">Featured</option>
                      <option value="bestselling">Best Selling</option>
                      <option value="priceLowHigh">Price: Low to High</option>
                      <option value="priceHighLow">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest Arrivals</option>
                    </select>
                    {/* Custom dropdown icon */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book grid/list display */}
              <div className="mt-4">
                {filteredBooks.length === 0 ? (
                  // Empty state
                  <div className="bg-white rounded-[2px] shadow-sm p-8 text-center mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No books found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters to find what you're looking
                      for.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-black text-white rounded-[2px] hover:bg-gray-800 transition-colors"
                      aria-label="Reset all filters"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : isMobile ? (
                  // Mobile-specific implementation
                  mobileViewStrategy === "carousel" ? (
                    // Mobile Swipe Pager
                    <div
                      className="h-[calc(100vh-200px)]"
                      style={{ minHeight: "400px" }}
                    >
                      <MobileCardPager>
                        {Array.from({ length: calculateGroupCount() }).map(
                          (_, groupIndex) => {
                            const groupBooks = filteredBooks.slice(
                              groupIndex * 4,
                              groupIndex * 4 + 4
                            );

                            return (
                              <div
                                key={groupIndex}
                                className="h-full w-full flex-shrink-0 px-2"
                                style={{
                                  paddingLeft:
                                    groupIndex === 0
                                      ? "env(safe-area-inset-left, 1rem)"
                                      : "1rem",
                                  paddingRight:
                                    groupIndex === calculateGroupCount() - 1
                                      ? "env(safe-area-inset-right, 1rem)"
                                      : "1rem",
                                }}
                              >
                                <div className="grid grid-cols-2 gap-4 h-full">
                                  {groupBooks.map((book) => (
                                    <BookCard key={book.id} book={book} />
                                  ))}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </MobileCardPager>
                    </div>
                  ) : (
                    // Mobile Adaptive Grid
                    <div
                      className="h-[calc(100vh-200px)]"
                      style={{ minHeight: "400px" }}
                    >
                      <AdaptiveCardGrid>
                        {filteredBooks.map((book) => (
                          <BookCard key={book.id} book={book} />
                        ))}
                      </AdaptiveCardGrid>
                    </div>
                  )
                ) : (
                  // Desktop/Tablet Implementation
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
