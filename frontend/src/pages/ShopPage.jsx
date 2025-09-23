import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { booksAPI } from "../api/book-api.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams, useSearchParams } from "react-router-dom"; // ✅ import navigate and params
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ShopPage = () => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate(); // ✅ use navigate
  const { slug } = useParams(); // Get category slug from URL
  const [searchParams] = useSearchParams(); // Get query parameters
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");

  // Convert slug back to category name
  const slugToCategory = (slug) => {
    if (!slug) return null;
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        let categoryFilter = null;
        
        // Check if we have a category slug from the URL
        if (slug) {
          categoryFilter = slugToCategory(slug);
          setCategoryName(categoryFilter);
          console.log(`📚 Loading books for category: ${categoryFilter} (from slug: ${slug})`);
        } else {
          // Check for category query parameter
          const categoryParam = searchParams.get('category');
          if (categoryParam) {
            categoryFilter = categoryParam;
            setCategoryName(categoryParam);
            console.log(`📚 Loading books for category: ${categoryParam} (from query param)`);
          }
        }
        
        // Fetch books with or without category filter
        if (categoryFilter) {
          try {
            const res = await booksAPI.getByCategory(categoryFilter, 20);
            setBooks(res.data || res.books || []);
          } catch (apiError) {
            console.warn('API failed, using fallback data:', apiError);
            // Fallback to JSON data
            const jsonResponse = await fetch('/Book.json');
            const allBooks = await jsonResponse.json();
            const filteredBooks = allBooks
              .filter(book => book.category === categoryFilter)
              .map(book => ({
                ...book,
                _id: book.id,
                slug: book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                cover_image: [book.image],
                price: parseFloat(book.price),
                stock: Math.floor(Math.random() * 50) + 1
              }));
            setBooks(filteredBooks);
          }
        } else {
          const res = await booksAPI.list({ limit: 12, sort: "-created_at" });
          setBooks(res.data || []);
        }
      } catch (e) {
        setError(e.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, searchParams]);

  const handleAddToCart = async (book) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await addToCart({
        item: {
          id: book._id,
          title: book.title,
          price: Number(book.price || 0),
        },
        quantity: 1,
      });
      toast.success(`${book.title} added to cart!`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-6 py-10">Loading books...</div>;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 text-red-600">{error}</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">
        {categoryName ? `${categoryName} Books` : 'Shop'}
      </h1>
      <p className="text-gray-600 mt-2">
        {categoryName 
          ? `Explore our collection of ${categoryName.toLowerCase()} books`
          : 'Discover our collection of books'
        }
      </p>
      
      {categoryName && (
        <div className="mt-4">
          <Link 
            to="/shop" 
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            ← Back to All Books
          </Link>
        </div>
      )}

      {books.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No books found{categoryName && ` in ${categoryName}`}
          </h3>
          <p className="text-gray-600">
            {categoryName 
              ? `We don't have any ${categoryName.toLowerCase()} books available right now.`
              : 'No books are currently available.'
            }
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6 mt-8">
        {books.map((b) => (
          <div key={b._id} className="border rounded-[2px] p-4 flex flex-col">
            {Array.isArray(b.cover_image) && b.cover_image[0] && (
              <Link to={`/bookview/${b.slug}`}>
                <div className="relative w-full aspect-[3/4] mb-3 md:mb-4 overflow-hidden rounded-[2px]">
                  <img
                    src={b.cover_image[0].startsWith('/') ? b.cover_image[0] : `http://localhost:5000${b.cover_image[0]}`}
                    alt={b.title}
                    className="w-full object-cover rounded mb-3 hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-book.jpg';
                    }}
                  />
                </div>
              </Link>
            )}
            <Link
              to={`/bookview/${b.slug}`}
              className="text-black hover:text-gray-700"
            >
              <h3 className="font-semibold">{b.title}</h3>
            </Link>
            {b.author && <p className="text-sm text-gray-600">by {b.author}</p>}
            <p className="text-gray-700 mb-3 mt-1">
              ${Number(b.price || 0).toFixed(2)}
            </p>

            {/* Always show Add to Cart button */}
            <button
              onClick={() => handleAddToCart(b)}
              className={`mt-auto w-full py-2.5 rounded-[2px] text-white transition-colors ${
                b.stock > 0
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={b.stock <= 0}
            >
              {b.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
