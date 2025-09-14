import React, { useState, useEffect } from 'react';

const categories = ["All", "History", "Science & Math", "Romance", "Travel"];

const Book = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/Book.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBooks(data);
        setAllBooks(data);
      } catch (err) {
        setError("Failed to load books. Please check the books.json file.");
        console.error("Fetch error: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filterBooks = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setBooks(allBooks);
    } else {
      setBooks(allBooks.filter(book => book.category === category));
    }
  };

  if (loading) {
    return (                                            
      <div className="flex justify-center items-center min-h-[400px] bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700">Loading books...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-white">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <div className="text-lg font-semibold text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-black text-white rounded-[2px] hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center lg:text-left">
            New Releases
          </h1>
          
          {/* Category Filter - Horizontal Scroll for Mobile */}
          <div className="w-full lg:w-auto overflow-x-auto pb-2">
            <div className="flex space-x-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => filterBooks(category)}
                  className={`px-4 py-2 rounded-[2px] transition-all duration-200 text-sm md:text-base whitespace-nowrap min-w-[100px] text-center
                    ${activeCategory === category
                      ? 'bg-black text-white border border-black'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-black hover:text-black'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {books.map(book => (
            <div 
              key={book.id} 
              className="bg-white border border-gray-200 p-3 md:p-4 flex flex-col items-center text-center group transition-all duration-200 hover:border-gray-400"
            >
              {/* Book Image */}
              <div className="relative w-full aspect-[3/4] mb-3 md:mb-4 overflow-hidden rounded-[2px]">
                <img 
                  src={book.image} 
                  alt={book.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  loading="lazy"
                />
              </div>

              {/* Book Details */}
              <div className="w-full space-y-1 md:space-y-2">
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                  {book.type}
                </span>
                
                <h3 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
                  {book.title}
                </h3>
                
                <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                  {book.author}
                </p>

                {/* Price */}
                <div className="pt-1 md:pt-2">
                  {book.originalPrice ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm md:text-base font-bold text-black">
                        ${book.price}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        ${book.originalPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm md:text-base font-bold text-black">
                      ${book.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Hover Overlay Effect */}
              <div className=" group-hover:bg-opacity-5 transition-all duration-200 rounded-[2px] pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {books.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No books found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Book;