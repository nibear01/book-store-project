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
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
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
    if (e.key === "ArrowLeft") {
      handleModalPrev();
    } else if (e.key === "ArrowRight") {
      handleModalNext();
    } else if (e.key === "Escape") {
      closeModal();
    }
  };

  const openModal = (index = 0) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";
    // Add event listener for keyboard navigation
    document.addEventListener("keydown", handleKeyDown);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Restore background scrolling
    document.body.style.overflow = "unset";
    // Remove event listener when modal closes
    document.removeEventListener("keydown", handleKeyDown);
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
          >
            <div className="relative w-full mb-3 md:mb-4 overflow-hidden rounded-[2px]">
              <img
                src={`http://localhost:5000${currentImage}`}
                alt={book.title}
                className="w-full h-auto object-cover rounded-[2px] shadow-md transition-transform hover:scale-105"
                style={{ maxHeight: "380px" }}
              />
            </div>
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
            <FaHeart
              className={`mr-1 md:mr-2 ${isWishlisted ? "fill-current" : ""}`}
            />
            {isWishlisted
              ? "Wishlisted"
              : isMobile
              ? "Wishlist"
              : "Add to Wishlist"}
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

      {/* Modal for viewing pages - UPDATED POSITIONING */}
      {/* Modal for viewing pages - FIXED HEIGHT ISSUE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
          <div className="relative bg-white rounded-[2px] w-full max-w-4xl max-h-[95vh] overflow-hidden mx-auto my-auto shadow-2xl flex flex-col">
            {/* Header - Compact and centered */}
            <div className="flex-shrink-0 flex justify-between items-center p-3 sm:p-4 border-b bg-white">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold truncate max-w-[60%]">
                {book.title} - Page {modalImageIndex + 1} of{" "}
                {samplePages.length}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close preview"
              >
                <FaTimes />
              </button>
            </div>

            {/* Main Image Container - Centered with proper spacing */}
            <div
              className="flex-1 relative flex items-center justify-center p-3 sm:p-4 md:p-6 bg-gray-50 min-h-[200px]"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Navigation Arrows - Positioned with proper spacing */}
              <button
                onClick={handleModalPrev}
                className="absolute left-2 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl z-10 transition-all duration-200 border border-gray-200"
                aria-label="Previous page"
              >
                <FaChevronLeft className="text-gray-700 text-base sm:text-lg md:text-xl" />
              </button>

              <button
                onClick={handleModalNext}
                className="absolute right-2 sm:right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl z-10 transition-all duration-200 border border-gray-200"
                aria-label="Next page"
              >
                <FaChevronRight className="text-gray-700 text-base sm:text-lg md:text-xl" />
              </button>

              {/* Main Image - Responsive sizing with safe area */}
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={`http://localhost:5000${samplePages[modalImageIndex]}`}
                  alt={`${book.title} - Page ${modalImageIndex + 1}`}
                  className="max-w-[90%] max-h-[60vh] object-contain shadow-lg rounded-[2px]"
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "min(90%, 550px)",
                    maxHeight: "min(60vh, 450px)",
                  }}
                />
              </div>

              {/* Mobile swipe indicators */}
              {isMobile && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                  <span className="text-xs text-gray-600 bg-white/90 px-3 py-2 rounded-full shadow-sm">
                    Swipe ← → to navigate
                  </span>
                </div>
              )}

              {/* Page indicator for mobile */}
              {isMobile && (
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                  <span className="text-sm font-medium bg-black/70 text-white px-3 py-1 rounded-full">
                    {modalImageIndex + 1} / {samplePages.length}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation - Compact and scrollable */}
            <div className="flex-shrink-0 p-3 sm:p-4 border-t bg-gray-50 border-gray-200">
              <div className="flex overflow-x-auto space-x-2 sm:space-x-3 py-2 thumbnail-scroll px-1">
                {samplePages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setModalImageIndex(index)}
                    className={`flex-shrink-0 w-12 h-14 sm:w-14 sm:h-16 border-2 rounded-[2px] overflow-hidden transition-all duration-200 ${
                      index === modalImageIndex
                        ? "border-red-500 shadow-md scale-105"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    aria-label={`Go to page ${index + 1}`}
                  >
                    <img
                      src={`http://localhost:5000${img}`}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="text-xs text-center bg-black/70 text-white py-1 font-medium">
                      {index + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer - Compact actions */}
            <div className="flex-shrink-0 p-3 sm:p-4 border-t bg-white border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Previewing {samplePages.length} sample pages
                </span>
                <div className="flex space-x-2 w-full sm:w-auto justify-center">
                  <button
                    onClick={handleModalPrev}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-[2px] text-sm font-medium transition-colors flex-1 sm:flex-none min-w-[90px]"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleModalNext}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-[2px] text-sm font-medium transition-colors flex-1 sm:flex-none min-w-[90px]"
                  >
                    Next
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-[2px] text-sm font-medium transition-colors flex-1 sm:flex-none min-w-[90px]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookImageGallery;
