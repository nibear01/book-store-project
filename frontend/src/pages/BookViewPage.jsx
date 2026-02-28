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
  computeFinalConfiguredPrice,
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
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await getBookBySlug(slug);
        setBook(data);
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || String(err);
        setError(`Failed to load book details: ${msg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [slug, getBookBySlug]);

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

  // Compute display price and discount for current selection and mode
  const { displayPrice, compareAtPrice } = useMemo(() => {
    const settings = printSettings;
    const mode = settings?.mode || "relative";
    const pages = Number(book?.pages || 0);
    const cfg = printConfig || defaultPrintState;
    if (mode === "derived" && settings) {
      // Derived base price for current variant selection
      const { price: derivedVariantFinal } = computeFinalConfiguredPrice({ baseContentPrice: 0, pages, cfg, settings });
      const adminSale = Number(book?.sale_price);
      const hasSale = !!book?.is_on_sale && Number.isFinite(adminSale) && adminSale >= 0;
      if (hasSale) {
        // Compute derived price for default configuration to know baseline
        const { price: derivedDefaultFinal } = computeFinalConfiguredPrice({ baseContentPrice: 0, pages, cfg: defaultPrintState, settings });
        // Preserve discount amount while adding variant differential
        const variantDiff = derivedVariantFinal - derivedDefaultFinal; // could be negative if somehow cheaper variant selected
        const saleVariantFinal = Number((adminSale + variantDiff).toFixed(2));
        return { displayPrice: saleVariantFinal, compareAtPrice: Number(derivedVariantFinal.toFixed(2)) };
      }
      return { displayPrice: Number(derivedVariantFinal.toFixed(2)), compareAtPrice: null };
    }
    // relative mode or no settings
    const basePrice = Number(book?.price || 0);
    const { price: configuredBase } = computeFinalConfiguredPrice({
      baseContentPrice: basePrice,
      pages,
      cfg,
      settings,
    });
    const onSale =
      !!book?.is_on_sale &&
      Number.isFinite(Number(book?.sale_price)) &&
      Number(book?.sale_price) > 0;
    if (onSale) {
      const saleBase = Number(book?.sale_price);
      const { price: configuredSale } = computeFinalConfiguredPrice({
        baseContentPrice: saleBase,
        pages,
        cfg,
        settings,
      });
      return {
        displayPrice: Number(configuredSale),
        compareAtPrice: Number(configuredBase),
      };
    }
    return { displayPrice: Number(configuredBase), compareAtPrice: null };
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
                  addToCart({
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
