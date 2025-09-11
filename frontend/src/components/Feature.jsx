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
  }, [activeTab]); // This useEffect runs whenever activeTab changes

  const tabs = [
    { name: 'Featured', key: 'featured' },
    { name: 'On Sale', key: 'on_sale' },
    { name: 'Most Viewed', key: 'most_viewed' },
  ];

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 max-w-6xl w-full mx-auto mt-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Featured Books</h2>

      <div className="flex justify-center space-x-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-lg font-medium rounded-full transition-colors duration-200 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {loading && <div className="text-center">Loading books...</div>}
      {error && <div className="text-center text-red-500">Error: {error}</div>}
      
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book, index) => (
            <div key={index} className="flex flex-col items-start text-center p-4 bg-gray-50 rounded-lg shadow-sm">
              <img src={book.cover_image} alt={book.title} className="w-full h-auto mb-4 rounded-md" />
              <p className="text-sm text-gray-500 mb-1">{book.format}</p>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{book.author}</p>
              <span className="font-bold text-gray-900">{book.price || book.price_range}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Feature;