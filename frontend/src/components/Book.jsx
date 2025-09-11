import React, { useState, useEffect } from 'react';

const categories = ["History", "Science & Math", "Romance", "Travel"];

const App = () => {
  const [activeCategory, setActiveCategory] = useState("History");
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the books.json file
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
    // Use the stored allBooks data to filter
    if (category === "All") {
      setBooks(allBooks);
    } else {
      setBooks(allBooks.filter(book => book.category === category));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 font-sans">
        <div className="text-xl font-semibold text-gray-700">Loading books...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 font-sans">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-col sm:flex-row">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">New Releases</h1>
          <div className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => filterBooks(category)}
                className={`px-4 py-2 rounded-full transition-colors duration-200 text-sm sm:text-base whitespace-nowrap
                  ${activeCategory === category
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col justify-between items-center text-center">
            <img src="../assets/images/32-120x183.jpg" alt="Get Extra books" className="w-full h-auto rounded-md mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Get Extra</h2>
            <p className="text-4xl font-extrabold text-red-500 mb-2">Sale -25%</p>
            <p className="text-gray-500 mb-6 text-sm">ON ORDER OVER $100</p>
            <button className="bg-red-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-600 transition-colors duration-200">
              View More
            </button>
          </div>
          <div className="col-span-1 md:col-span-3 lg:col-span-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.map(book => (
                <div key={book.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center">
                  <img src={book.image} alt={book.title} className="w-full h-auto rounded-md mb-4" />
                  <span className="text-xs text-gray-500 uppercase font-semibold mb-1">{book.type}</span>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                  <div className="text-md font-bold text-gray-800">
                    {book.originalPrice && <span className="text-gray-400 line-through mr-1">${book.originalPrice}</span>}
                    ${book.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
