import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { booksAPI } from '../api/book-api';

// Analytics function
const trackCategoryClick = (categoryId, categoryName) => {
  // Google Analytics or other analytics service
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'category_click', {
      category_id: categoryId,
      category_name: categoryName,
      event_category: 'navigation',
      event_label: categoryName
    });
  }
  
  // Console log for development
  console.log('Analytics: category_click', { categoryId, categoryName });
};

// Generate category slug
const generateCategorySlug = (categoryName) => {
  return categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

const CategorySections = () => {
  const [categoryData, setCategoryData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const observerRef = useRef();
  const [visibleSections, setVisibleSections] = useState(new Set());

  // Intersection Observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryName = entry.target.dataset.category;
            setVisibleSections(prev => new Set([...prev, categoryName]));
          }
        });
      },
      { rootMargin: '100px' }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryList = await booksAPI.getCategories();
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch books for visible categories (only 4 books per category for preview)
  useEffect(() => {
    const fetchBooksForCategories = async () => {
      const newCategoryData = { ...categoryData };
      
      for (const categoryName of visibleSections) {
        if (!newCategoryData[categoryName]) {
          try {
            newCategoryData[categoryName] = { loading: true, books: [], error: null };
            setCategoryData({ ...newCategoryData });
            
            let books = [];
            try {
              const response = await booksAPI.getByCategory(categoryName, 4);
              books = response.data || response.books || [];
            } catch (apiError) {
              console.warn(`API failed for ${categoryName}, using fallback data:`, apiError);
              // Fallback to JSON data when API is unavailable
              try {
                const jsonResponse = await fetch('/Book.json');
                const allBooks = await jsonResponse.json();
                books = allBooks
                  .filter(book => book.category === categoryName)
                  .slice(0, 4)
                  .map(book => ({
                    ...book,
                    _id: book.id,
                    slug: book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    genre: [book.category],
                    rating: Math.random() * 2 + 3, // Random rating between 3-5
                    num_reviews: Math.floor(Math.random() * 100) + 10,
                    stock: Math.floor(Math.random() * 50) + 1,
                    cover_image: [book.image],
                    price: parseFloat(book.price)
                  }));
              } catch (jsonError) {
                console.error(`Both API and JSON fallback failed for ${categoryName}:`, jsonError);
              }
            }
            
            newCategoryData[categoryName] = {
              loading: false,
              books: books,
              error: null
            };
          } catch (error) {
            console.error(`Error fetching books for ${categoryName}:`, error);
            newCategoryData[categoryName] = {
              loading: false,
              books: [],
              error: 'Failed to load books'
            };
          }
        }
      }
      
      setCategoryData(newCategoryData);
    };

    if (visibleSections.size > 0) {
      fetchBooksForCategories();
    }
  }, [visibleSections]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center p-8">
          <div className="animate-spin text-red-600 mb-4">
            <span className="text-4xl">⏳</span>
          </div>
          <p className="text-gray-600 text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Explore by Category
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Click on any category icon to explore our collection.
          </p>
        </div>

        {/* Category Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <CategoryIcon
              key={category.name}
              category={category}
              categoryData={categoryData[category.name]}
              index={index}
              observerRef={observerRef}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Individual Category Icon Component
const CategoryIcon = ({ category, categoryData, index, observerRef }) => {
  const iconRef = useRef();
  const navigate = useNavigate(); // Add navigation hook
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Generate category ID and slug
  const categoryId = category.id || generateCategorySlug(category.name);
  const categorySlug = generateCategorySlug(category.name);
  
  useEffect(() => {
    const currentRef = iconRef.current;
    if (currentRef && observerRef.current) {
      currentRef.dataset.category = category.name;
      observerRef.current.observe(currentRef);
      
      return () => {
        if (observerRef.current && currentRef) {
          observerRef.current.unobserve(currentRef);
        }
      };
    }
  }, [category.name, observerRef]);

  const isLoading = !categoryData || categoryData.loading;
  const books = categoryData?.books || [];
  const hasError = categoryData?.error;
  
  // Create placeholders for missing books (up to 4 total)
  const bookSlots = [...books.slice(0, 4)];
  while (bookSlots.length < 4) {
    bookSlots.push({ isPlaceholder: true, id: `placeholder-${bookSlots.length}` });
  }
  
  // Handle click with analytics
  const handleClick = (e) => {
    e.preventDefault();
    console.log(`🔗 Navigating to category: ${category.name} (${categorySlug})`);
    trackCategoryClick(categoryId, category.name);
    // Use React Router navigation instead of window.location
    navigate(`/category/${categorySlug}`);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  const gradientColors = [
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500', 
    'from-cyan-500 to-blue-500',
    'from-green-500 to-emerald-600',
    'from-indigo-500 to-purple-600',
    'from-red-500 to-pink-500',
    'from-blue-500 to-indigo-600',
    'from-yellow-500 to-amber-600',
    'from-pink-500 to-rose-500',
    'from-gray-500 to-slate-600',
  ];

  const gradientClass = gradientColors[index % gradientColors.length];
  const showOverlay = isHovered || isFocused;

  return (
    <div
      ref={iconRef}
      role="link"
      tabIndex={0}
      aria-label={`Browse ${category.name} books category`}
      className="group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {/* Main Category Icon Container */}
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 p-3 sm:p-4">
        
        {/* Category Icon */}
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-lg sm:text-xl mb-2 sm:mb-3 mx-auto group-hover:scale-110 transition-transform duration-300`}>
          {category.icon}
        </div>
        
        {/* 2x2 Book Thumbnails Grid */}
        <div className="relative">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[2/3] rounded-sm"></div>
                </div>
              ))}
            </div>
          ) : hasError ? (
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 aspect-[2/3] rounded-sm flex items-center justify-center">
                  <span className="text-gray-400 text-xs">📚</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Desktop: Show all 4 thumbnails */}
              <div className="hidden sm:grid grid-cols-2 gap-1 sm:gap-2">
                {bookSlots.map((book, bookIndex) => (
                  <BookThumbnail key={book.id || book._id || `slot-${bookIndex}`} book={book} />
                ))}
              </div>
              
              {/* Mobile: Show only 2 thumbnails */}
              <div className="grid sm:hidden grid-cols-2 gap-1">
                {bookSlots.slice(0, 2).map((book, bookIndex) => (
                  <BookThumbnail key={book.id || book._id || `slot-${bookIndex}`} book={book} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Category Name Overlay */}
      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent rounded-b-xl p-2 sm:p-3 transition-opacity duration-300 ${
        showOverlay ? 'opacity-100' : 'opacity-0'
      }`}>
        <p className="text-white text-xs sm:text-sm font-semibold text-center leading-tight">
          {category.name}
        </p>
      </div>
    </div>
  );
};

// Book Thumbnail Component with Lazy Loading
const BookThumbnail = ({ book }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  if (book.isPlaceholder) {
    return (
      <div className="bg-gray-100 aspect-[2/3] rounded-sm flex items-center justify-center border border-gray-200">
        <span className="text-gray-300 text-xs">📖</span>
      </div>
    );
  }
  
  return (
    <div className="relative overflow-hidden rounded-sm shadow-sm">
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-400 text-xs">⏳</span>
        </div>
      )}
      
      <img
        src={book.cover_image?.[0] || book.image}
        alt={book.title}
        className={`w-full aspect-[2/3] object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          setImageError(true);
          e.target.style.display = 'none';
        }}
      />
      
      {imageError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center border border-gray-200">
          <span className="text-gray-400 text-xs">📚</span>
        </div>
      )}
      
      {/* Price overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-1">
        <span className="text-white text-xs font-medium">
          ${book.price}
        </span>
      </div>
    </div>
  );
};

export default CategorySections;