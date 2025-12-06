import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { booksAPI } from '@/api/book-api';

const SearchBar = ({ isMobile = false, onResultClick = () => {} }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const debounceTimerRef = useRef(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await booksAPI.list({ 
        search: searchQuery.trim(),
        limit: 8
      });
      
      // Handle different response formats
      const books = Array.isArray(response) 
        ? response 
        : response?.data || response?.books || [];
      
      setResults(books);
      setShowDropdown(true);
    } catch {
      setError('Failed to search books');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle result click
  const handleResultClick = (book) => {
    const slug = book.slug || book._id;
    setQuery('');
    setShowDropdown(false);
    setResults([]);
    onResultClick();
    navigate(`/bookview/${slug}`);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setError(null);
  };

  // Handle Enter key for first result
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0]);
    }
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div 
      ref={searchRef} 
      className={`relative ${isMobile ? 'w-full' : 'w-full max-w-xl'}`}
    >
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && results.length > 0 && setShowDropdown(true)}
          placeholder={isMobile ? "Search books..." : "Search for books, authors, publishers..."}
          className={`w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent ${
            isMobile ? 'text-sm py-2' : 'text-sm'
          }`}
          aria-label="Search books"
        />
        
        {/* Loading or Clear button */}
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
        ) : query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className={`absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto ${
          isMobile ? 'max-h-[60vh]' : 'max-h-96'
        }`}>
          {error ? (
            <div className="p-4 text-sm text-red-600 text-center">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No books found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {results.map((book) => (
                <button
                  key={book._id}
                  onClick={() => handleResultClick(book)}
                  className="w-full px-4 py-3 hover:bg-gray-50 active:bg-gray-100 flex items-start gap-3 text-left transition-colors"
                >
                  {/* Book Image */}
                  {(() => {
                    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                    
                    // Get the first cover image from cover_image array
                    let imageUrl = null;
                    if (book.cover_image && Array.isArray(book.cover_image) && book.cover_image.length > 0) {
                      imageUrl = book.cover_image[0];
                    } else if (typeof book.cover_image === 'string' && book.cover_image) {
                      imageUrl = book.cover_image;
                    }
                    
                    // Construct full URL if needed
                    const imageSrc = imageUrl 
                      ? (imageUrl.startsWith('http') 
                          ? imageUrl 
                          : `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`)
                      : null;
                    
                    return imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/48x64?text=Book';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                    );
                  })()}

                  {/* Book Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {book.title}
                    </h4>
                    {book.author && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        by {book.author}
                      </p>
                    )}
                    {book.price && (
                      <p className="text-xs font-semibold text-gray-900 mt-1">
                        ৳{Number(book.price).toFixed(2)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
