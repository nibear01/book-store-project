import React, { useState } from "react";
import dummyBooks from "../data/dummyBooks.json";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { Link } from "react-router-dom";

const SingleBookPage = ({ book }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const handleIncrement = () => {
    if (quantity < book.stock) setQuantity(quantity + 1);
  };
  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const renderStars = (rating = book.rating) => {
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

  return (
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

      <div className="max-w-6xl mx-auto my-10 p-5 bg-white shadow-lg">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <div className="md:w-1/3 flex justify-center items-start">
            <img
              src={book.cover_image}
              alt={book.title}
              className="w-64 h-auto object-cover rounded-[2px] shadow-md"
            />
          </div>

          {/* Details */}
          <div className="md:w-2/3 flex flex-col gap-4">
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <h2 className="text-lg text-gray-700">By {book.author}</h2>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars()}</div>
              <span className="text-gray-500 text-sm">
                ({book.num_reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="text-2xl font-semibold mt-3">${book.price}</div>

            {/* Quantity Selector & Buttons */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <div className="flex items-center border  overflow-hidden">
                <button
                  onClick={handleDecrement}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 transition"
                >
                  -
                </button>
                <span className="px-4">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 transition"
                >
                  +
                </button>
              </div>
              <button className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition">
                Add {quantity} to Cart
              </button>
              <button className="bg-red-500 text-white hover:bg-red-600 px-6 py-2 transition">
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-10">
          <div className="flex border-b border-gray-300">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === "description"
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === "reviews"
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500"
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === "info"
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500"
              }`}
            >
              Additional Info
            </button>
          </div>

          <div className="mt-4">
            {activeTab === "description" && (
              <p className="text-gray-700">{book.description}</p>
            )}

            {activeTab === "reviews" && (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border p-4 rounded-[2px] shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">User{i}</span>
                      <div className="flex">{renderStars()}</div>
                    </div>
                    <p className="text-gray-600">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "info" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-600">
                <div>
                  <span className="font-semibold">Genre:</span> {book.genre}
                </div>
                <div>
                  <span className="font-semibold">Language:</span>{" "}
                  {book.language}
                </div>
                <div>
                  <span className="font-semibold">ISBN:</span> {book.isbn}
                </div>
                <div>
                  <span className="font-semibold">Published:</span>{" "}
                  {book.published_date}
                </div>
                <div>
                  <span className="font-semibold">Stock:</span> {book.stock}
                </div>
                <div>
                  <span className="font-semibold">Rating:</span> {book.rating}{" "}
                  ⭐
                </div>
                <div>
                  <span className="font-semibold">Reviews:</span>{" "}
                  {book.num_reviews}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Books */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">You May Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dummyBooks
              .filter((b) => b.id !== book.id)
              .map((b) => (
                <div
                  key={b.id}
                  className="border overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={b.cover_image}
                    alt={b.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-2">
                    <h4 className="text-sm font-semibold">{b.title}</h4>
                    <span className="text-gray-500 text-xs">{b.author}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Example usage
const BookViewPage = () => {
  const book = dummyBooks[0]; // first book
  return <SingleBookPage book={book} />;
};

export default BookViewPage;
