import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaShare,
  FaTimes,
} from "react-icons/fa";

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('book-gallery-styles')) {
  const style = document.createElement('style');
  style.id = 'book-gallery-styles';
  document.head.appendChild(style);
}

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
    while (samplePages.length < 11) {
      samplePages.push(samplePages[0] || "/images/placeholder-page.svg");
    }
    return samplePages.slice(0, 10);
  };

  const samplePages = getSamplePages();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Detect a PDF url from book.file_url (admin-provided)
  const pdfUrl = useMemo(() => {
    const f = book?.file_url;
    if (!f) return null;
    const isAbsolute = /^https?:\/\//i.test(f);
    const url = isAbsolute ? f : `${BASE_URL}${f}`;
    return /\.pdf($|\?)/i.test(url) ? url : null;
  }, [BASE_URL, book?.file_url]);

  // On-demand PDF page rendering (first 10 pages)
  const [previewPages, setPreviewPages] = useState([]); // data URLs
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentlyRenderingPage, setCurrentlyRenderingPage] = useState(0);

  const ensurePdfJsLoaded = useCallback(async () => {
    // If pdfjs already present, return
    if (window.pdfjsLib && window.pdfjsLib.getDocument) return window.pdfjsLib;
    // Load from CDN to avoid bundler resolution issues
    await new Promise((resolve, reject) => {
      const existing = document.getElementById("pdfjs-lib-script");
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const s = document.createElement("script");
      s.id = "pdfjs-lib-script";
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });
    // Set worker src
    if (window.pdfjsLib?.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    return window.pdfjsLib;
  }, []);

  const loadPdfPreviews = useCallback(async () => {
    if (!pdfUrl) return;
    setIsRendering(true);
    setRenderError(null);
    setLoadingProgress(0);
    setCurrentlyRenderingPage(0);
    try {
      const pdfjsLib = await ensurePdfJsLoaded();
      const task = pdfjsLib.getDocument(pdfUrl);
      const pdf = await task.promise;
      const total = pdf.numPages;
      const pageCount = Math.min(10, total);
      const imgs = [];
      
      // Optimized rendering with higher quality and progress tracking
      for (let i = 1; i <= pageCount; i++) {
        setCurrentlyRenderingPage(i);
        const page = await pdf.getPage(i);
        
        // Higher scale for better quality
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { 
          alpha: false,
          willReadFrequently: false 
        });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Optimize rendering
        await page.render({ 
          canvasContext: ctx, 
          viewport,
          intent: 'display'
        }).promise;
        
        // Use JPEG for better compression and faster loading
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        imgs.push(dataUrl);
        
        // Update progress
        setLoadingProgress(Math.round((i / pageCount) * 100));
        
        // Clean up
        canvas.width = 0;
        canvas.height = 0;
      }
      
      setPreviewPages(imgs);
    } catch (err) {
      setRenderError(err?.message || "Failed to render PDF preview");
    } finally {
      setIsRendering(false);
      setLoadingProgress(0);
      setCurrentlyRenderingPage(0);
    }
  }, [pdfUrl, ensurePdfJsLoaded]);

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

  const handleModalNext = useCallback(() => {
    setModalImageIndex((prevIndex) =>
      prevIndex ===
      (previewPages.length ? previewPages.length : samplePages.length) - 1
        ? 0
        : prevIndex + 1
    );
  }, [previewPages.length, samplePages.length]);

  const handleModalPrev = useCallback(() => {
    setModalImageIndex((prevIndex) =>
      prevIndex === 0
        ? (previewPages.length ? previewPages.length : samplePages.length) - 1
        : prevIndex - 1
    );
  }, [previewPages.length, samplePages.length]);

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

  // Close modal helper (define before handleKeyDown to avoid TDZ on dependency evaluation)
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = "unset";
    document.removeEventListener("keydown", handleKeyDownRef.current);
  }, []);

  // Keep a ref to latest handlers to avoid redef dependency loops
  const handleKeyDownRef = useRef(null);

  // Add keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        handleModalPrev();
      } else if (e.key === "ArrowRight") {
        handleModalNext();
      } else if (e.key === "Escape") {
        closeModal();
      }
    },
    [handleModalPrev, handleModalNext, closeModal]
  );

  // Sync ref after each render of callback
  useEffect(() => {
    handleKeyDownRef.current = handleKeyDown;
  }, [handleKeyDown]);

  const openModal = useCallback(
    async (index = 0) => {
      setModalImageIndex(index);
      setIsModalOpen(true);
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDownRef.current);
      if (pdfUrl && previewPages.length === 0 && !isRendering) {
        // Best-effort load
        loadPdfPreviews();
      }
    },
    [pdfUrl, previewPages.length, isRendering, loadPdfPreviews]
  );

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

  // Resolve image URL (handles backend files, absolute URLs, and frontend placeholders)
  const resolveImageUrl = (p) => {
    if (!p || typeof p !== 'string') return "/images/book-placeholder.svg";
    const isAbsolute = /^https?:\/\//i.test(p);
    if (isAbsolute) return p;
    // Keep frontend-served placeholder assets un-prefixed
    if (p.startsWith("/images/")) return p;
    // Assume backend-served path
    return `${BASE_URL}${p}`;
  };

  const currentImageRaw =
    Array.isArray(book?.cover_image) && book.cover_image.length > 0
      ? book.cover_image[currentImageIndex]
      : book?.cover_image;
  const currentImage = resolveImageUrl(currentImageRaw);

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
            // onClick={() => openModal(currentImageIndex)}
            className="w-full " //cursor-zoom-in - css class removed
          >
            <div className="relative w-full mb-3 md:mb-4 overflow-hidden rounded-[2px]">
              {/* Status Badges positioned relative to image */}
              {book?.is_deal_of_the_week && (
                <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-pink-600 shadow-lg backdrop-blur-sm border border-white/20">
                    <span role="img" aria-label="Deal" className="text-xs">
                      🔥
                    </span>
                    Deal of the Week
                  </span>
                  {book?.is_on_sale && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium text-white bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 shadow-md backdrop-blur-sm border border-white/20">
                      <span
                        role="img"
                        aria-label="Sale"
                        className="text-[10px]"
                      >
                        💸
                      </span>
                      Sale
                    </span>
                  )}
                </div>
              )}
              {!book?.is_deal_of_the_week && book?.is_on_sale && (
                <div className="absolute top-2 right-2 z-20">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 shadow-lg backdrop-blur-sm border border-white/20">
                    <span role="img" aria-label="Sale" className="text-xs">
                      🔥
                    </span>
                    Sale
                  </span>
                </div>
              )}
              <img
                src={currentImage}
                alt={book.title}
                className="w-full h-auto object-cover rounded-[2px] shadow-md transition-transform duration-500 hover:scale-110"
                style={{ maxHeight: "380px" }}
                onError={(e) => {
                  if (
                    e?.currentTarget?.src !== "/images/book-placeholder.svg"
                  ) {
                    e.currentTarget.src = "/images/book-placeholder.svg";
                  }
                }}
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
                    src={resolveImageUrl(img)}
                    alt={`${book.title} view ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (
                        e?.currentTarget?.src !== "/images/book-placeholder.svg"
                      ) {
                        e.currentTarget.src = "/images/book-placeholder.svg";
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview Trigger */}
        <div className="mt-3 md:mt-4 text-center">
          <button
            onClick={() => openModal(0)}
            className="text-red-600 hover:text-red-800 text-xs md:text-sm font-medium disabled:opacity-50 flex items-center gap-2 mx-auto"
            disabled={!!pdfUrl && isRendering && previewPages.length === 0}
          >
            {pdfUrl ? (
              isRendering && previewPages.length === 0 ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Preparing preview ({loadingProgress}%)...</span>
                </>
              ) : (
                `Preview ${Math.max(previewPages.length || 0, 10)} pages ›`
              )
            ) : (
              `Preview ${samplePages.length} pages ›`
            )}
          </button>
          {renderError && (
            <p className="mt-2 text-[11px] text-red-600 bg-red-50 px-3 py-1 rounded-full">{renderError}</p>
          )}
          {isRendering && currentlyRenderingPage > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-red-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-600 mt-1">Loading page {currentlyRenderingPage} of 10...</p>
            </div>
          )}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex p-0 overflow-hidden">
          {/* Desktop Layout - Side Controls */}
          {!isMobile && (
            <div className="relative w-full h-full flex animate-fadeIn">
              
              {/* LEFT SIDE - Full Screen PDF Display */}
              <div 
                className="flex-1 relative flex flex-col items-center justify-center bg-black/50 overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Full Screen PDF Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isRendering && previewPages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-gray-700 border-t-red-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl">📄</span>
                        </div>
                      </div>
                      <div className="text-center space-y-4">
                        <p className="text-lg font-semibold text-white">Rendering PDF Preview</p>
                        <div className="w-80 bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 h-full rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${loadingProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-300">
                          {loadingProgress}% • Page {currentlyRenderingPage} of 10
                        </p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={
                        previewPages.length
                          ? previewPages[modalImageIndex]
                          : resolveImageUrl(samplePages[modalImageIndex])
                      }
                      alt={`${book.title} - Page ${modalImageIndex + 1}`}
                      className="w-full h-full object-contain"
                      style={{
                        imageRendering: "high-quality",
                      }}
                      onError={(e) => {
                        if (e?.currentTarget?.src !== "/images/placeholder-page.svg") {
                          e.currentTarget.src = "/images/placeholder-page.svg";
                        }
                      }}
                    />
                  )}
                </div>

                {/* Page Counter - Top Right */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xl">
                    Page {modalImageIndex + 1} / {previewPages.length || samplePages.length}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE - Compact Controls (Desktop) */}
              <div className="w-16 sm:w-20 md:w-24 bg-black/50 flex flex-col items-center justify-center gap-4 sm:gap-6">
                
                {/* Previous Button */}
                <button
                  onClick={handleModalPrev}
                  className="group flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110"
                  aria-label="Previous page"
                  title="Previous Page"
                >
                  <FaChevronLeft className="text-white text-xl sm:text-2xl md:text-3xl group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="group flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-red-500/90 hover:bg-red-600 rounded-full transition-all hover:scale-110 shadow-lg"
                  aria-label="Close preview"
                  title="Close (ESC)"
                >
                  <FaTimes className="text-white text-xl sm:text-2xl md:text-3xl" />
                </button>

                {/* Next Button */}
                <button
                  onClick={handleModalNext}
                  className="group flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110"
                  aria-label="Next page"
                  title="Next Page"
                >
                  <FaChevronRight className="text-white text-xl sm:text-2xl md:text-3xl group-hover:translate-x-1 transition-transform" />
                </button>

              </div>
            </div>
          )}

          {/* Mobile Layout - Bottom Controls */}
          {isMobile && (
            <div className="relative w-full h-full flex flex-col animate-fadeIn">
              
              {/* MAIN CONTENT - Full Screen PDF Display */}
              <div 
                className="flex-1 relative flex flex-col items-center justify-center bg-black/50 overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Full Screen PDF Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isRendering && previewPages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-gray-700 border-t-red-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl">📄</span>
                        </div>
                      </div>
                      <div className="text-center space-y-4">
                        <p className="text-lg font-semibold text-white">Rendering PDF Preview</p>
                        <div className="w-80 bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 h-full rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${loadingProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-300">
                          {loadingProgress}% • Page {currentlyRenderingPage} of 10
                        </p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={
                        previewPages.length
                          ? previewPages[modalImageIndex]
                          : resolveImageUrl(samplePages[modalImageIndex])
                      }
                      alt={`${book.title} - Page ${modalImageIndex + 1}`}
                      className="w-full h-full object-contain"
                      style={{
                        imageRendering: "high-quality",
                      }}
                      onError={(e) => {
                        if (e?.currentTarget?.src !== "/images/placeholder-page.svg") {
                          e.currentTarget.src = "/images/placeholder-page.svg";
                        }
                      }}
                    />
                  )}
                </div>

                {/* Page Counter - Top Right */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xl">
                    Page {modalImageIndex + 1} / {previewPages.length || samplePages.length}
                  </div>
                </div>

                {/* Mobile Swipe Hint */}
                {!isRendering && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white shadow-lg flex items-center gap-2">
                      <span>👈 Swipe 👉</span>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM CONTROLS - Mobile */}
              <div className="w-full bg-black/50 flex items-center justify-center gap-6 sm:gap-8 py-4">
                
                {/* Previous Button */}
                <button
                  onClick={handleModalPrev}
                  className="group flex flex-col items-center justify-center w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110"
                  aria-label="Previous page"
                  title="Previous Page"
                >
                  <FaChevronLeft className="text-white text-2xl group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="group flex flex-col items-center justify-center w-14 h-14 bg-red-500/90 hover:bg-red-600 rounded-full transition-all hover:scale-110 shadow-lg"
                  aria-label="Close preview"
                  title="Close (ESC)"
                >
                  <FaTimes className="text-white text-2xl" />
                </button>

                {/* Next Button */}
                <button
                  onClick={handleModalNext}
                  className="group flex flex-col items-center justify-center w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110"
                  aria-label="Next page"
                  title="Next Page"
                >
                  <FaChevronRight className="text-white text-2xl group-hover:translate-x-1 transition-transform" />
                </button>

              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default BookImageGallery;