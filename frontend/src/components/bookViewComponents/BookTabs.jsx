import { Link } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const BookTabs = ({ book, activeTab, setActiveTab, isAuthenticated }) => {
  const renderStars = (rating = 0) => {
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

  const tabs = [
    { id: "description", label: "Description" },
    { id: "details", label: "Details" },
    { id: "reviews", label: "Reviews" }
  ];

  return (
    <div className="mt-10">
      <div className="flex border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === tab.id
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{book.description}</p>
          </div>
        )}

        {/* Details Tab */}
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

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{book.rating}</div>
              <div>
                <div className="flex">{renderStars(book.rating)}</div>
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
            
            {isAuthenticated ? (
              <button className="mt-4 bg-black text-white px-4 py-2 rounded-[2px] hover:bg-gray-800 transition">
                Write a Review
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                🔒 Please{" "}
                <Link to="/login" className="text-red-500 underline">
                  login
                </Link>{" "}
                to write a review.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookTabs;