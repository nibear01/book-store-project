import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const BookDetails = ({ book }) => {
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

  return (
    <>
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

      {/* Price (supports configured price) */}
      <div className="mt-3">
        {book.configuredPrice && book.configuredPrice !== book.price ? (
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 line-through">৳{Number(book.price).toFixed(2)}</span>
            <span className="text-2xl font-semibold">৳{Number(book.configuredPrice).toFixed(2)}</span>
            <span className="text-xs text-gray-500 mt-1">Price reflects selected printing options.</span>
          </div>
        ) : (
          <div className="text-2xl font-semibold">৳{Number(book.price).toFixed(2)}</div>
        )}
      </div>

      {/* Stock Status */}
      {/* <div className={`text-sm font-medium ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
      </div> */}

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
      </div>
    </>
  );
};

export default BookDetails;