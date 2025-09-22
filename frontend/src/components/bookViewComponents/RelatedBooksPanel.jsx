import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { BooksContext } from "@/context/BooksContext";
import { FaStar, FaShoppingCart } from "react-icons/fa";

const RelatedBooksPanel = ({ book }) => {
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const context = useContext(BooksContext);

  // Check if context functions exist
  const { getBooksByGenre, getBooksByAuthor, addToCart } = context || {};

  useEffect(() => {
    const fetchRelatedBooks = async () => {
      if (!book) return;

      // Check if required functions are available
      if (typeof getBooksByGenre !== 'function' || typeof getBooksByAuthor !== 'function') {
        console.error('Required context functions are not available');
        setError('Related books feature is currently unavailable');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const promises = [];

        // Fetch books by genre (exclude current book)
        if (book.genre && book.genre.length > 0) {
          promises.push(
            getBooksByGenre(book.genre[0], 4)
          );
        }

        // Fetch books by author (exclude current book)
        if (book.author) {
          promises.push(
            getBooksByAuthor(book.author, 3)
          );
        }

        // If no promises were created, skip fetching
        if (promises.length === 0) {
          setRelatedBooks([]);
          setLoading(false);
          return;
        }

        const results = await Promise.allSettled(promises);

        let combinedBooks = [];
        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value) {
            const filteredBooks = result.value.filter(
              (relatedBook) => relatedBook._id !== book._id
            );
            combinedBooks = [...combinedBooks, ...filteredBooks];
          }
        });

        // Remove duplicates by book ID
        const uniqueBooks = combinedBooks.reduce((acc, current) => {
          if (!acc.find((book) => book._id === current._id)) {
            acc.push(current);
          }
          return acc;
        }, []);

        setRelatedBooks(uniqueBooks.slice(0, 6));
      } catch (error) {
        console.error("Error fetching related books:", error);
        setError("Failed to load related books");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedBooks();
  }, [book, getBooksByGenre, getBooksByAuthor]);

  // Show error state
  if (error) {
    return (
      <div className="mt-12 border-t pt-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">
          You Might Also Like
        </h3>
        <div className="text-center py-8 text-gray-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-12 border-t pt-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">
          You Might Also Like
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-40 rounded-[2px] mb-2"></div>
              <div className="bg-gray-200 h-4 rounded mb-1"></div>
              <div className="bg-gray-200 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!relatedBooks || relatedBooks.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">
        You Might Also Like
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {relatedBooks.map((relatedBook) => (
          <RelatedBookCard 
            key={relatedBook._id} 
            book={relatedBook} 
            addToCart={addToCart}
          />
        ))}
      </div>
    </div>
  );
};

// Updated RelatedBookCard to receive addToCart as prop
const RelatedBookCard = ({ book }) => {
  const [imageError, setImageError] = useState(false);


  const coverImage = book.cover_image?.[0] || "";
  const displayImage =
    coverImage && !imageError
      ? `http://localhost:5000${coverImage}`
      : "/images/book-placeholder.jpg";

  return (
    <Link
      to={`/bookview/${book.slug}`}
      className="group block bg-white rounded-[2px] shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
    >
      <div className="relative overflow-hidden">
        <img
          src={displayImage}
          alt={book.title}
          className="w-full h-40 object-cover rounded-t-[2px] group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />


        {book.stock > 0 ? (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            In Stock
          </span>
        ) : (
          <span className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
            Out of Stock
          </span>
        )}
      </div>

      <div className="p-3">
        <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-gray-700 transition-colors">
          {book.title}
        </h4>
        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
          by {book.author}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-xs font-medium">{book.rating || 0}</span>
            <span className="text-xs text-gray-500">
              ({book.num_reviews || 0})
            </span>
          </div>
          <div className="text-right">
            {book.is_on_sale && book.sale_price ? (
              <>
                <span className="text-sm font-bold text-red-600">
                  ${book.sale_price}
                </span>
                <span className="text-xs text-gray-500 line-through ml-1">
                  ${book.price}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-gray-900">
                ${book.price}
              </span>
            )}
          </div>
        </div>
        {book.genre && book.genre.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {book.genre.slice(0, 2).map((genre, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default RelatedBooksPanel;