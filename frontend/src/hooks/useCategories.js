import { useState, useEffect, useRef } from 'react';

export const useCategories = (books) => {
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

    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);

    // Refs for mobile viewport handling
    const viewportRef = useRef(null);
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

    // Calculate categories from books
    const categories = [
        {
            id: 1,
            title: "Programming",
            item: `${books.filter((b) => b.genre === "Programming").length} books`,
            img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 2,
            title: "Science Fiction",
            item: `${books.filter((b) => b.genre === "Science Fiction").length} books`,
            img: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 3,
            title: "Romance",
            item: `${books.filter((b) => b.genre === "Romance").length} books`,
            img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 4,
            title: "Fantasy",
            item: `${books.filter((b) => b.genre === "Fantasy").length} books`,
            img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 5,
            title: "Classic",
            item: `${books.filter((b) => b.genre === "Classic").length} books`,
            img: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 6,
            title: "Mystery",
            item: `${books.filter((b) => b.genre === "Mystery").length} books`,
            img: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
    ];

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

    // Update local list when books change
    useEffect(() => {
        setFilteredBooks(books || []);
    }, [books]);

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
