import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaShoppingCart,
  FaCheck,
  FaHeart,
  FaEye,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const BookCard = ({ book, baseUrl, viewMode = "grid" }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Select only the first cover image if it's an array
  const coverImage =
    Array.isArray(book.cover_image) && book.cover_image.length > 0
      ? book.cover_image[0]
      : book.cover_image;

  /** Handle adding item to cart */
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsAdding(true);
    try {
      await addToCart({
        item: {
          id: book._id || book.id,
          title: book.title,
          price: book.price,
          cover_image: coverImage,
          slug: book.slug,
        },
        quantity: 1,
      });
      setAddSuccess(true);
      toast.success(`${book.title} added to cart!`);
      setTimeout(() => setAddSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  /** Render star ratings with half-star precision */
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400 text-sm" />);
    }

    if (halfStar) {
      stars.push(
        <FaStarHalfAlt key="half" className="text-yellow-400 text-sm" />
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar key={`empty-${i}`} className="text-yellow-400 text-sm" />
      );
    }

    return (
      <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {stars}
      </div>
    );
  };

  // Container classes based on view mode
  const containerClass = viewMode === "list" 
    ? "bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-row relative overflow-hidden group"
    : "bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col relative overflow-hidden group";

  // Image container classes based on view mode
  const imageContainerClass = viewMode === "list" 
    ? "relative block overflow-hidden flex-shrink-0 w-32 md:w-40"
    : "relative block overflow-hidden";

  // Image aspect ratio based on view mode
  const imageAspectClass = viewMode === "list" 
    ? "relative pt-[120%] w-full"
    : "relative pt-[140%] w-full";

  // Content container classes based on view mode
  const contentClass = viewMode === "list" 
    ? "p-4 flex flex-col flex-grow"
    : "p-3 flex flex-col flex-grow";

  return (
    <div className={containerClass}>
      {book.is_on_sale && (
        <div className={`absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg ${
          viewMode === "list" ? "md:top-4 md:left-4" : ""
        }`}>
          SALE
        </div>
      )}

      {/* Book cover image with overlay */}
      <Link
        to={`/bookview/${book.slug}`}
        className={imageContainerClass}
      >
        <div className={imageAspectClass}>
          <img
            src={`${baseUrl}${coverImage}`}
            alt={book.title}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute top-0 left-0 w-full h-full bg-gray-200 animate-pulse"></div>
          )}
        </div>
      </Link>

      {/* Book details */}
      <div className={contentClass}>
        <div className={`${viewMode === "list" ? "mb-3 flex-grow" : "mb-3"}`}>
          {/* Genre badge */}
          <span className={`inline-block px-2 py-1 text-[10px] font-semibold bg-gradient-to-r from-blue-50 to-gray-80 text-gray-800 rounded-full ${
            viewMode === "list" ? "mb-3" : "mb-3"
          } border`}>
            {Array.isArray(book.genre) ? book.genre[0] : book.genre}
          </span>

          {/* Title and author */}
          <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-gray-800 transition-colors ${
            viewMode === "list" ? "text-lg md:text-xl mb-3" : "text-[15px] mb-2"
          }`}>
            {book.title}
          </h3>
          <p className={`text-gray-500 font-medium ${
            viewMode === "list" ? "text-base mb-4" : "text-[13px] mb-3"
          }`}>
            by {book.author}
          </p>

          {/* Description for list view */}
          {viewMode === "list" && book.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
              {book.description.length > 150 
                ? `${book.description.substring(0, 150)}...` 
                : book.description}
            </p>
          )}

          {/* Rating and pages */}
          <div className={`${viewMode === "list" ? "flex items-center justify-between mb-4" : "flex-col items-center justify-between"}`}>
            <div className="flex items-center gap-2">
              {renderStars(book.rating)}
              <span className={`text-gray-500 font-medium ${
                viewMode === "list" ? "text-sm" : "text-sm"
              }`}>
                ({book.num_reviews})
              </span>
            </div>
            {book.pages && (
              <span className={`text-gray-400 bg-gray-50 px-2 py-1 rounded-full ${
                viewMode === "list" ? "text-xs" : "text-xs"
              }`}>
                {book.pages} pages
              </span>
            )}
          </div>
        </div>

        {/* Price and action section */}
        <div className={`${viewMode === "list" ? "flex items-center justify-between gap-4" : "mt-auto"}`}>
          {/* Price section */}
          <div className={`${viewMode === "list" ? "flex flex-col" : "flex-col justify-center mb-4"}`}>
            <div className="flex items-baseline gap-2">
              {book.is_on_sale && book.sale_price ? (
                <>
                  <p className={`font-bold text-red-600 ${
                    viewMode === "list" ? "text-xl" : "text-[18px]"
                  }`}>
                    {book.sale_price.toFixed(0)} BDT
                  </p>
                  <p className={`text-gray-400 line-through ${
                    viewMode === "list" ? "text-lg" : "text-[18px]"
                  }`}>
                    {book.price.toFixed(0)} BDT
                  </p>
                </>
              ) : (
                <p className={`font-bold text-gray-900 ${
                  viewMode === "list" ? "text-xl" : "text-[18px]"
                }`}>
                  {book.price.toFixed(0)} BDT
                </p>
              )}
            </div>

            {/* Stock status */}
            {/* <span
              className={`font-semibold px-2.5 py-1 rounded-full border ${
                book.stock > 0
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-red-100 text-red-700 border-red-200"
              } ${viewMode === "list" ? "text-xs mt-1" : "text-xs"}`}
            >
              {book.stock > 0 ? `In Stock (${book.stock})` : "Out of Stock"}
            </span> */}
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || book.stock <= 0}
            className={`transition-all duration-300 flex items-center justify-center gap-2 ${
              viewMode === "list" 
                ? `py-2 px-4 rounded-md font-semibold ${
                    addSuccess
                      ? "bg-green-500 text-white"
                      : book.stock <= 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : isAdding
                      ? "bg-blue-500 text-white"
                      : "bg-black text-white"
                  }`
                : `w-full py-2 rounded-md font-semibold ${
                    addSuccess
                      ? "bg-green-500 text-white shadow-green-200"
                      : book.stock <= 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : isAdding
                      ? "bg-blue-500 text-white shadow-blue-200"
                      : "bg-black text-white"
                  }`
            }`}
            aria-label={`Add ${book.title} to cart`}
          >
            {addSuccess ? (
              <>
                <FaCheck className="text-base" />
                {viewMode === "list" ? <span>Added</span> : <span>Added to Cart</span>}
              </>
            ) : isAdding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {viewMode === "list" ? <span>Adding</span> : <span>Adding...</span>}
              </>
            ) : book.stock <= 0 ? (
              viewMode === "list" ? "Out of Stock" : "Out of Stock"
            ) : (
              <>
                <FaShoppingCart className="text-base" />
                {viewMode === "list" ? <span>Add to Cart</span> : <span>Add to Cart</span>}
              </>
            )}
          </button>
        </div>
      </div>


    </div>
  );
};

export default BookCard;