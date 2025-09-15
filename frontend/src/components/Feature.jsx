import { useEffect, useState } from 'react';

function Feature() {
  const [activeTab, setActiveTab] = useState('featured');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/${activeTab}_books.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setBooks(data.books);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [activeTab]);

  const tabs = [
    { name: 'Featured', key: 'featured' },
    { name: 'On Sale', key: 'on_sale' },
    { name: 'Most Viewed', key: 'most_viewed' },
  ];

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
      {error && <div className="text-center text-red-500 py-4">Error: {error}</div>}
      
      {!loading && !error && (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {books.map((book, index) => (
            <div key={index} className="flex flex-col items-start p-3 md:p-4 bg-white border border-gray-200 rounded-[2px] hover:shadow-md transition-all">
              <img 
                src={book.cover_image} 
                alt={book.title} 
                className="w-full h-auto mb-3 md:mb-4 rounded-[2px]" 
              />
              <p className="text-xs md:text-sm text-gray-500 mb-1">{book.format}</p>
              <h3 className="text-sm md:text-lg font-semibold text-gray-800 mb-1 line-clamp-2">{book.title}</h3>
              <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-1">{book.author}</p>
              <span className="font-bold text-black text-sm md:text-base">{book.price || book.price_range}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Feature;