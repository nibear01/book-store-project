import { useState, useEffect } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaShare,
  FaTimes,
} from "react-icons/fa";

const BookImageGallery = ({
  book,
  currentImageIndex,
  setCurrentImageIndex,
  isWishlisted,
  setIsWishlisted,
  isAuthenticated,
  navigate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Get sample pages (first 10 images or generate placeholder if less than 10)
  const getSamplePages = () => {
    if (book?.cover_image && book.cover_image.length >= 5) {
      return book.cover_image.slice(0, 10);
    }

    // If less than 10 images, create placeholder array
    const samplePages = book?.cover_image ? [...book.cover_image] : [];
    while (samplePages.length < 5) {
      samplePages.push(samplePages[0] || "/images/placeholder-page.jpg");
    }
    return samplePages.slice(0, 5);
  };

  const samplePages = getSamplePages();

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

  const handleModalNext = () => {
    setModalImageIndex((prevIndex) =>
      prevIndex === samplePages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleModalPrev = () => {
    setModalImageIndex((prevIndex) =>
      prevIndex === 0 ? samplePages.length - 1 : prevIndex - 1
    );
  };

  // Add touch swipe functionality for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleModalNext();
    } else if (isRightSwipe) {
      handleModalPrev();
    }
  };

  // Add keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handleModalPrev();
    } else if (e.key === 'ArrowRight') {
      handleModalNext();
    } else if (e.key === 'Escape') {
      closeModal();
    }
  };

  const openModal = (index = 0) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    // Add event listener for keyboard navigation
    document.addEventListener('keydown', handleKeyDown);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Restore background scrolling
    document.body.style.overflow = 'unset';
    // Remove event listener when modal closes
    document.removeEventListener('keydown', handleKeyDown);
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsWishlisted(!isWishlisted);
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

  const currentImage =
    Array.isArray(book.cover_image) && book.cover_image.length > 0
      ? book.cover_image[currentImageIndex]
      : book.cover_image;

  return (
    <>
      <div className="md:w-2/5 flex flex-col items-center">
        <div className="relative w-full max-w-xs">
          {book.cover_image && book.cover_image.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 md:p-2 shadow-md hover:bg-gray-100 z-10"
              >
                <FaChevronLeft className="text-gray-700 text-sm md:text-base" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 md:p-2 shadow-md hover:bg-gray-100 z-10"
              >
                <FaChevronRight className="text-gray-700 text-sm md:text-base" />
              </button>
            </>
          )}

          <button
            onClick={() => openModal(currentImageIndex)}
            className="w-full cursor-zoom-in"
          ><div className="relative w-full aspect-[3/4] mb-3 md:mb-4 overflow-hidden rounded-[2px]">
            <img
              src={`http://localhost:5000${currentImage}`}
              alt={book.title}
              className="w-full h-auto object-cover rounded-[2px] shadow-md transition-transform hover:scale-105"
              style={{ maxHeight: "380px" }}
            /></div>
          </button>

          {book.cover_image && book.cover_image.length > 1 && (
            <div className="flex mt-3 md:mt-4 space-x-1 md:space-x-2 justify-center overflow-x-auto py-2">
              {book.cover_image.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 border-2 rounded-[2px] overflow-hidden ${
                    index === currentImageIndex
                      ? "border-red-500"
                      : "border-gray-200"
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

        {/* Preview Text */}
        <div className="mt-3 md:mt-4 text-center">
          <button
            onClick={() => openModal(0)}
            className="text-red-600 hover:text-red-800 text-xs md:text-sm font-medium"
          >
            Click to preview {samplePages.length} pages ›
          </button>
        </div>

        <div className="flex mt-4 md:mt-6 space-x-2 md:space-x-4 w-full justify-center flex-wrap gap-2">
          <button
            onClick={handleAddToWishlist}
            className={`flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-[2px] border text-sm md:text-base ${
              isWishlisted
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <FaHeart className={`mr-1 md:mr-2 ${isWishlisted ? "fill-current" : ""}`} />
            {isWishlisted ? "Wishlisted" : isMobile ? "Wishlist" : "Add to Wishlist"}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-[2px] border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm md:text-base"
          >
            <FaShare className="mr-1 md:mr-2" />
            {isMobile ? "Share" : "Share Book"}
          </button>
        </div>
      </div>

      {/* Modal for viewing pages */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="relative bg-white rounded-[2px] w-full max-w-2xl max-h-[95vh] md:max-h-screen overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-3 md:p-4 border-b">
              <h3 className="text-sm md:text-lg font-semibold truncate max-w-[70%]">
                Preview: {book.title} - Page {modalImageIndex + 1} of{" "}
                {samplePages.length}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-lg md:text-xl p-1"
              >
                <FaTimes />
              </button>
            </div>

            {/* Main Image */}
            <div 
              className="relative flex items-center justify-center p-4 md:p-8 bg-gray-100 min-h-[200px] md:min-h-[250px]"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {!isMobile && (
                <>
                  <button
                    onClick={handleModalPrev}
                    className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-gray-100 z-10"
                  >
                    <FaChevronLeft className="text-gray-700 text-base md:text-xl" />
                  </button>

                  <button
                    onClick={handleModalNext}
                    className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-gray-100 z-10"
                  >
                    <FaChevronRight className="text-gray-700 text-base md:text-xl" />
                  </button>
                </>
              )}

              <img
                src={`http://localhost:5000${samplePages[modalImageIndex]}`}
                alt={`${book.title} - Page ${modalImageIndex + 1}`}
                className="max-w-full max-h-[300px] md:max-h-[400px] object-contain shadow-lg"
              />

              {/* Mobile swipe indicators */}
              {isMobile && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <span className="text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
                    Swipe ← → to navigate
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            <div className="p-3 md:p-4 border-t bg-gray-50">
              <div className="flex overflow-x-auto space-x-2 py-2 thumbnail-scroll">
                {samplePages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setModalImageIndex(index)}
                    className={`flex-shrink-0 w-12 h-14 md:w-14 md:h-18 border-2 rounded overflow-hidden ${
                      index === modalImageIndex
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <img
                      src={`http://localhost:5000${img}`}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="text-xs text-center bg-black bg-opacity-50 text-white py-1">
                      {index + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 md:p-4 border-t flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <span className="text-xs md:text-sm text-gray-600">
                Previewing first {samplePages.length} pages
              </span>
              <div className="flex space-x-2 w-full md:w-auto justify-center">
                <button
                  onClick={handleModalPrev}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm md:text-base flex-1 md:flex-none"
                >
                  Previous
                </button>
                <button
                  onClick={handleModalNext}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm md:text-base flex-1 md:flex-none"
                >
                  Next
                </button>
                <button
                  onClick={closeModal}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm md:text-base flex-1 md:flex-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookImageGallery;