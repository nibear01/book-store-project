import { FaChevronLeft, FaChevronRight, FaHeart, FaShare } from "react-icons/fa";

const BookImageGallery = ({ 
  book, 
  currentImageIndex, 
  setCurrentImageIndex, 
  isWishlisted, 
  setIsWishlisted, 
  isAuthenticated, 
  navigate 
}) => {
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
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
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

  const currentImage = Array.isArray(book.cover_image) && book.cover_image.length > 0
    ? book.cover_image[currentImageIndex]
    : book.cover_image;

  return (
    <div className="md:w-2/5 flex flex-col items-center">
      <div className="relative w-full max-w-xs">
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
          style={{ maxHeight: '380px' }}
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
  );
};

export default BookImageGallery;