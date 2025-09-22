import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const BookCard = ({ book, baseUrl }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

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

  /** Render star ratings with half-star precision using react-icons */
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-500" />);
    }

    if (halfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-500" />);
    }

    return <div className="flex" aria-label={`${rating} out of 5 stars`}>{stars}</div>;
  };

  return (
    <div className="bg-white rounded-[2px] shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col">
      {/* Book cover image */}
      <Link to={`/bookview/${book.slug}`}>
        <div className="relative pt-[150%] sm:pt-[130%] md:pt-[140%] lg:pt-[150%] w-full">
          <img
            src={`${baseUrl}${coverImage}`}
            alt={book.title}
            className="absolute top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Book details */}
      <div className="p-4 flex flex-col flex-grow">
        <div>
          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-[2px] w-fit mb-2">
            {book.genre}
          </span>

          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-gray-600 text-[12px] mb-3">by {book.author}</p>

          <div className="flex items-center mb-2">
            <div className="flex mr-2">{renderStars(book.rating)}</div>
            <span className="text-sm text-gray-600">({book.num_reviews})</span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-black font-bold text-lg">${book.price.toFixed(2)}</p>
            <span
              className={`text-xs px-2 py-1 rounded-[2px] ${
                book.stock > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {book.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || book.stock <= 0}
            className={`w-full py-2.5 rounded-[2px] transition-all duration-200 shadow-sm hover:shadow-md ${
              addSuccess
                ? "bg-green-500 text-white"
                : book.stock <= 0
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : isAdding
                ? "bg-blue-500 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            aria-label={`Add ${book.title} to cart`}
          >
            {addSuccess ? (
              <span className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Added!
              </span>
            ) : isAdding ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </span>
            ) : book.stock <= 0 ? (
              "Out of Stock"
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
