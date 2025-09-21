import { useContext, useEffect, useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaChevronLeft, FaChevronRight, FaHeart, FaShare } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useParams } from "react-router";
import { BooksContext } from "@/context/BooksContext";
import { useAuth } from "../context/AuthContext";
import { Helmet } from "react-helmet";

const BookViewPage = () => {
  const [book, setBook] = useState(null);
  const { getBookBySlug } = useContext(BooksContext);
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await getBookBySlug(slug);
        setBook(data);
      } catch (err) {
        setError(`Failed to load book details ${err}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [slug, getBookBySlug]);

  const handleIncrement = () => {
    if (book?.stock && quantity < book.stock) setQuantity(quantity + 1);
  };
  
  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleNextImage = () => {
    if (book?.cover_image && book.cover_image.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === book.cover_image.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (book?.cover_image && book.cover_image.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? book.cover_image.length - 1 : prevIndex - 1
      );
    }
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement actual wishlist functionality
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: book.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const renderStars = (rating = book?.rating || 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++)
      stars.push(<FaStar key={i} className="text-yellow-500" />);
    if (halfStar)
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++)
      stars.push(<FaRegStar key={"empty" + i} className="text-yellow-500" />);
    return stars;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 h-80 bg-gray-200 rounded"></div>
            <div className="md:w-2/3 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 text-red-600">{error}</div>
    );
  }

  if (!book) return null;

  const currentImage = Array.isArray(book.cover_image) && book.cover_image.length > 0
    ? book.cover_image[currentImageIndex]
    : book.cover_image;

  return (
    <>
      <Helmet>
        <title>{book.meta_title || book.title} | BookStore</title>
        <meta name="description" content={book.meta_description || book.description} />
        {book.meta_keywords && book.meta_keywords.length > 0 && (
          <meta name="keywords" content={book.meta_keywords.join(', ')} />
        )}
        <meta property="og:title" content={book.meta_title || book.title} />
        <meta property="og:description" content={book.meta_description || book.description} />
        {currentImage && (
          <meta property="og:image" content={`http://localhost:5000${currentImage}`} />
        )}
        <meta property="og:type" content="book" />
      </Helmet>

      <div className="flex-col justify-center items-center">
        <div className="max-w-6xl mx-auto mt-6 px-5">
          <nav className="flex items-center text-[12px] text-gray-600 space-x-2">
            <Link
              to="/"
              className="hover:text-[var(--hover-color)] transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              to={`/categories`}
              className="hover:text-[var(--hover-color)] transition-colors"
            >
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {book.title}
            </span>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto my-10 p-5 bg-white shadow-lg rounded-md">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image Gallery - Reduced size */}
            <div className="md:w-2/5 flex flex-col items-center">
              <div className="relative w-full max-w-xs"> {/* Reduced from max-w-sm */}
                {book.cover_image && book.cover_image.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
                    >
                      <FaChevronLeft className="text-gray-700" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
                    >
                      <FaChevronRight className="text-gray-700" />
                    </button>
                  </>
                )}
                
                <img
                  src={`http://localhost:5000${currentImage}`}
                  alt={book.title}
                  className="w-full h-auto object-cover rounded-[2px] shadow-md"
                  style={{ maxHeight: '380px' }} // Added maxHeight constraint
                />
                
                {book.cover_image && book.cover_image.length > 1 && (
                  <div className="flex mt-4 space-x-2 justify-center">
                    {book.cover_image.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-10 h-10 border-2 rounded-[2px] overflow-hidden ${
                          index === currentImageIndex ? 'border-red-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={`http://localhost:5000${img}`}
                          alt={`${book.title} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex mt-6 space-x-4 w-full justify-center">
                <button
                  onClick={handleAddToWishlist}
                  className={`flex items-center px-4 py-2 rounded-[2px] border ${
                    isWishlisted 
                      ? 'bg-red-50 text-red-600 border-red-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <FaHeart className={`mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                  {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 rounded-[2px] border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  <FaShare className="mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="md:w-3/5 flex flex-col gap-4">
              <h1 className="text-3xl font-bold">{book.title}</h1>
              <h2 className="text-lg text-gray-700">By {book.author}</h2>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars()}</div>
                <span className="text-gray-500 text-sm">
                  ({book.num_reviews} reviews)
                </span>
              </div>

              {/* Genres */}
              {book.genre && book.genre.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {book.genre.map((genre, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="text-2xl font-semibold mt-3">${book.price}</div>

              {/* Stock Status */}
              <div className={`text-sm font-medium ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
              </div>

              {/* Quantity Selector & Buttons */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center border overflow-hidden rounded-[2px]">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 bg-white">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    disabled={book.stock && quantity >= book.stock}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                {isAuthenticated ? (
                  <>
                    <button
                      className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition rounded-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        addToCart({
                          item: {
                            id: book._id,
                            title: book.title,
                            price: Number(book.price || 0),
                          },
                          quantity,
                        })
                      }
                      disabled={book.stock === 0}
                    >
                      Add to Cart
                    </button>
                    <button 
                      className="bg-red-500 text-white hover:bg-red-600 px-6 py-2 transition rounded-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={book.stock === 0}
                    >
                      Buy Now
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    🔒 Please{" "}
                    <Link to="/login" className="text-red-500 underline">
                      login
                    </Link>{" "}
                    to purchase this book.
                  </p>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-semibold">Language:</span> {book.language}
                </div>
                <div>
                  <span className="font-semibold">ISBN:</span> {book.isbn || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Published:</span>{" "}
                  {book.published_date ? new Date(book.published_date).toLocaleDateString() : 'N/A'}
                </div>
                {/* <div>
                  <span className="font-semibold">Format:</span> {book.file_url ? 'Digital & Physical' : 'Physical'}
                </div> */}
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-10">
            <div className="flex border-b border-gray-300">
              {["description", "details", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-semibold transition ${
                    activeTab === tab
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              )}

              {activeTab === "details" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Book Details</h3>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex justify-between">
                        <span className="font-medium">Title:</span>
                        <span>{book.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Author:</span>
                        <span>{book.author}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">ISBN:</span>
                        <span>{book.isbn || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Publisher:</span>
                        <span>{"Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Publication Date:</span>
                        <span>{book.published_date ? new Date(book.published_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Pages:</span>
                        <span>{"Unknown"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Additional Information</h3>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex justify-between">
                        <span className="font-medium">Language:</span>
                        <span>{book.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Genre(s):</span>
                        <span>{book.genre?.join(', ') || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Format:</span>
                        <span>{book.file_url ? 'Digital & Physical' : 'Physical'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Availability:</span>
                        <span className={book.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                          {book.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold">{book.rating}</div>
                    <div>
                      <div className="flex">{renderStars()}</div>
                      <p className="text-gray-600 text-sm">Based on {book.num_reviews} reviews</p>
                    </div>
                  </div>
                  
                  {book.reviews?.length ? (
                    <div className="space-y-4">
                      {book.reviews.map((review, index) => (
                        <div key={index} className="border p-4 rounded-[2px] shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">{review.user}</span>
                            <div className="flex">{renderStars(review.rating)}</div>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                          <p className="text-gray-400 text-sm mt-2">
                            {review.date ? new Date(review.date).toLocaleDateString() : 'Date unknown'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No reviews yet. Be the first to review this book!</p>
                  )}
                  
                  {isAuthenticated && (
                    <button className="mt-4 bg-black text-white px-4 py-2 rounded-[2px] hover:bg-gray-800 transition">
                      Write a Review
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookViewPage;