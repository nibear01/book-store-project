import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { BooksContext } from "@/context/BooksContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  BookSEO,
  BookBreadcrumb,
  BookLoadingSkeleton,
  BookError,
  BookImageGallery,
  BookDetails,
  BookActions,
  BookTabs,
  RelatedBooksPanel,
  BookPrintConfig,
} from "../components/bookViewComponents";
import { useWishlist } from "../context/WishlistContext";
import { useMemo } from "react";
import {
  getBookPrice,
  defaultPrintState,
} from "../components/bookViewComponents/BookPrintPricing";

const BookViewPage = () => {
  const [book, setBook] = useState(null);
  const { getBookBySlug } = useContext(BooksContext);
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const {
    isInWishlist,
    add: addWishlist,
    remove: removeWishlist,
  } = useWishlist();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [printConfig, setPrintConfig] = useState(null);
  const [printSettings, setPrintSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!slug || slug === "undefined") {
      setError("Invalid book link — no slug provided.");
      return;
    }
    let alive = true; // ignore responses for a book the user already navigated away from
    const fetchBook = async () => {
      try {
        setError(null); // clear a previous book's error
        setLoading(true);
        const data = await getBookBySlug(slug);
        if (!alive) return;
        setBook(data);
        // Opened through an old id link: show the readable slug URL instead of the database id
        if (data?.slug && data.slug !== slug && /^[0-9a-fA-F]{24}$/.test(slug)) {
          navigate(`/bookview/${encodeURIComponent(data.slug)}`, { replace: true });
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || String(err);
        if (alive) setError(`Failed to load book details: ${msg}`);
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchBook();
    return () => {
      alive = false;
    };
  }, [slug, getBookBySlug, navigate]);

  // Load global print settings to know pricing mode (derived vs relative)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/settings/print-config`);
        const data = await res.json();
        if (alive && res.ok && data.success && data.data)
          setPrintSettings(data.data);
      } catch {
        setPrintSettings(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (book?._id) {
      setIsWishlisted(isInWishlist(book._id));
    }
  }, [book?._id, isInWishlist]);

  // Price for the selected print options (same rule the cart charges)
  const { displayPrice, compareAtPrice } = useMemo(() => {
    const p = getBookPrice(book, printSettings, printConfig || defaultPrintState);
    return { displayPrice: p.price, compareAtPrice: p.compareAt };
  }, [printSettings, printConfig, book]);

  // Handle loading state
  if (loading) return <BookLoadingSkeleton />;

  // Handle error state
  if (error) return <BookError error={error} />;

  // Handle book not found
  if (!book) return null;

  return (
    <>
      <BookSEO book={book} currentImageIndex={currentImageIndex} />

      <div className="flex-col justify-center items-center">
        <div className="max-w-6xl mx-auto mt-6 px-5">
          <BookBreadcrumb book={book} />
        </div>

        <div className="max-w-6xl mx-auto my-10 p-5 bg-white shadow-sm rounded-[2px]">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Image Gallery */}
            <BookImageGallery
              book={book}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              isWishlisted={isWishlisted}
              setIsWishlisted={async (v) => {
                if (!isAuthenticated) {
                  navigate("/login");
                  return;
                }
                try {
                  if (v) {
                    await addWishlist(book._id);
                  } else {
                    await removeWishlist(book._id);
                  }
                  setIsWishlisted(v);
                } catch {
                  // no-op
                }
              }}
              isAuthenticated={isAuthenticated}
              navigate={navigate}
            />

            {/* Details & Actions */}
            <div className="md:w-3/5 flex flex-col gap-4">
              <BookDetails
                book={{
                  ...book,
                  _displayPrice: displayPrice,
                  _compareAtPrice: compareAtPrice,
                }}
              />

              {book.isPrintOnDemand && (
                <BookPrintConfig
                  basePrice={Number(book.price || 0)}
                  pages={Number(book.pages || 0)}
                  value={printConfig}
                  onChange={setPrintConfig}
                />
              )}

              <BookActions
                book={{
                  ...book,
                  price: displayPrice,
                  _printConfig: printConfig,
                  _compareAtPrice: compareAtPrice,
                }}
                quantity={quantity}
                setQuantity={setQuantity}
                isAuthenticated={isAuthenticated}
                navigate={navigate}
                addToCart={(payload) => {
                  // payload.item shape from BookActions
                  const variant = printConfig
                    ? {
                        paperQuality: printConfig.paperQuality,
                        printSide: printConfig.printSide,
                        paperSize: printConfig.paperSize,
                        colorMode: printConfig.colorMode,
                      }
                    : undefined;
                  return addToCart({
                    item: {
                      ...payload.item,
                      variant,
                      unit_price: displayPrice,
                      configured: !!printConfig,
                      breakdown: printConfig?.breakdown,
                    },
                    quantity: payload.quantity,
                    variant,
                  });
                }}
              />
            </div>
          </div>

          {/* Tabs Section */}
          <BookTabs
            book={book}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAuthenticated={isAuthenticated}
          />

          {/* Related Books Panel - Add this section */}
          <RelatedBooksPanel book={book} />
        </div>
      </div>
    </>
  );
};

export default BookViewPage;
