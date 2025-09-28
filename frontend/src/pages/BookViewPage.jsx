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

const BookViewPage = () => {
  const [book, setBook] = useState(null);
  const { getBookBySlug } = useContext(BooksContext);
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, add: addWishlist, remove: removeWishlist } = useWishlist();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [printConfig, setPrintConfig] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await getBookBySlug(slug);
        setBook(data);
      } catch (err) {
        setError(`Failed to load book details ${err}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [slug, getBookBySlug]);

  useEffect(() => {
    if (book?._id) {
      setIsWishlisted(isInWishlist(book._id));
    }
  }, [book?._id, isInWishlist]);

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
                if (!isAuthenticated) { navigate('/login'); return; }
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
              <BookDetails book={{ ...book, configuredPrice: printConfig?.price }} />

              <BookPrintConfig
                basePrice={Number(book.price || 0)}
                value={printConfig}
                onChange={setPrintConfig}
              />

              <BookActions
                book={{ ...book, price: printConfig?.price || book.price, _printConfig: printConfig }}
                quantity={quantity}
                setQuantity={setQuantity}
                isAuthenticated={isAuthenticated}
                navigate={navigate}
                addToCart={(payload) => {
                  // payload.item shape from BookActions
                  const variant = printConfig ? {
                    paperQuality: printConfig.paperQuality,
                    printSide: printConfig.printSide,
                    paperSize: printConfig.paperSize,
                    colorMode: printConfig.colorMode,
                  } : undefined;
                  addToCart({
                    item: {
                      ...payload.item,
                      variant,
                      unit_price: payload.item.price,
                      configured: !!printConfig,
                    },
                    quantity: payload.quantity,
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