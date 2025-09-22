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
  RelatedBooksPanel, // Add this import
} from "../components/bookViewComponents";

const BookViewPage = () => {
  const [book, setBook] = useState(null);
  const { getBookBySlug } = useContext(BooksContext);
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
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
              setIsWishlisted={setIsWishlisted}
              isAuthenticated={isAuthenticated}
              navigate={navigate}
            />

            {/* Details & Actions */}
            <div className="md:w-3/5 flex flex-col gap-4">
              <BookDetails book={book} />

              <BookActions
                book={book}
                quantity={quantity}
                setQuantity={setQuantity}
                isAuthenticated={isAuthenticated}
                navigate={navigate}
                addToCart={addToCart}
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