import { useEffect, useState, useContext } from 'react';
import { BooksContext } from '@/context/BooksContext';
import { Link } from 'react-router-dom';

function Feature() {
  const [activeTab, setActiveTab] = useState('featured');
  const {
    url,
    books,
    featuredBooks,
    trendingBooks,
    loading,
    error,
    fetchBooks,
    fetchFeaturedBooks,
    fetchTrendingBooks,
  } = useContext(BooksContext);

  useEffect(() => {
    // Load data based on active tab
    if (activeTab === 'featured') {
      fetchFeaturedBooks(10);
    } else if (activeTab === 'most_viewed') {
      fetchTrendingBooks({ limit: 10 });
    } else if (activeTab === 'on_sale') {
      fetchBooks({ onSale: true, limit: 10 });
    }
  }, [activeTab, fetchBooks, fetchFeaturedBooks, fetchTrendingBooks]);

  const tabs = [
    { name: 'Featured', key: 'featured' },
    { name: 'On Sale', key: 'on_sale' },
    { name: 'Most Viewed', key: 'most_viewed' },
  ];

  const selectedBooks =
    activeTab === 'featured'
      ? featuredBooks
      : activeTab === 'most_viewed'
      ? trendingBooks
      : books;

  // Normalize to an array for rendering
  const list = Array.isArray(selectedBooks) ? selectedBooks : (selectedBooks?.data || []);

  return (
    <div className="bg-white rounded-[2px] p-4 md:p-8 max-w-full w-full mx-auto mt-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Featured Books</h2>

      {/* Tabs - responsive layout */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 md:px-4 md:py-2 text-sm md:text-lg font-medium rounded-[2px] transition-colors duration-200 ${
              activeTab === tab.key
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-black border border-gray-300'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-4">Loading books...</div>}
      {!!error && (
        <div className="text-center text-red-500 py-4">
          Error: {typeof error === 'string' ? error : error?.message || 'Failed to load books'}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {list.map((book, index) => {
            const img = Array.isArray(book?.cover_image) ? book.cover_image[0] : book?.cover_image;
            const slug = book?.slug;
            return slug ? (
              <Link
                key={book?.id || book?._id || index}
                to={`/bookview/${slug}`}
                className="flex flex-col items-start p-3 md:p-4 bg-white border border-gray-200 rounded-[2px] hover:shadow-md transition-all"
              >
                <img
                  src={`${url}${img || ''}`}
                  alt={book?.title || 'Book cover'}
                  className="w-full h-auto mb-3 md:mb-4 rounded-[2px]"
                  loading="lazy"
                />
                <p className="text-xs md:text-sm text-gray-500 mb-1">{book?.format || book?.type || ''}</p>
                <h3 className="text-sm md:text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                  {book?.title || 'Untitled'}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-1">
                  {book?.author || (Array.isArray(book?.authors) ? book.authors.join(', ') : '')}
                </p>
                <span className="font-bold text-black text-sm md:text-base">
                  {book?.price ?? book?.price_range ?? ''}
                </span>
              </Link>
            ) : (
              <div
                key={book?.id || book?._id || index}
                className="flex flex-col items-start p-3 md:p-4 bg-white border border-gray-200 rounded-[2px] hover:shadow-md transition-all"
              >
                <img
                  src={`${url}${img || ''}`}
                  alt={book?.title || 'Book cover'}
                  className="w-full h-auto mb-3 md:mb-4 rounded-[2px]"
                  loading="lazy"
                />
                <p className="text-xs md:text-sm text-gray-500 mb-1">{book?.format || book?.type || ''}</p>
                <h3 className="text-sm md:text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                  {book?.title || 'Untitled'}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-1">
                  {book?.author || (Array.isArray(book?.authors) ? book.authors.join(', ') : '')}
                </p>
                <span className="font-bold text-black text-sm md:text-base">
                  {book?.price ?? book?.price_range ?? ''}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Feature;