import { Link } from "react-router-dom";

const BookActions = ({ 
  book, 
  quantity, 
  setQuantity, 
  isAuthenticated, 
  navigate, 
  addToCart 
}) => {
  const handleIncrement = () => {
    if (book?.stock && quantity < book.stock) setQuantity(quantity + 1);
  };
  
  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    addToCart({
      item: {
        id: book._id,
        title: book.title,
        price: Number(book.price || 0),
      },
      quantity,
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // TODO: Implement buy now functionality
    console.log("Buy now clicked");
  };

  return (
    <>
      {/* Quantity Selector & Buttons */}
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        <div className="flex items-center border overflow-hidden rounded-[2px]">
          <button
            onClick={handleDecrement}
            disabled={quantity <= 1}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="px-4 py-2 bg-white">{quantity}</span>
          <button
            onClick={handleIncrement}
            disabled={book.stock && quantity >= book.stock}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        <button
          className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition rounded-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddToCart}
          disabled={book.stock === 0}
        >
          Add to Cart
        </button>
        <button 
          className="bg-red-500 text-white hover:bg-red-600 px-6 py-2 transition rounded-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleBuyNow}
          disabled={book.stock === 0}
        >
          Buy Now
        </button>

        {/* Show login prompt only when not authenticated */}
        {!isAuthenticated && (
          <p className="text-sm text-gray-500 mt-2">
            🔒 You'll need to <Link to="/login" className="text-red-500 underline">login</Link> to complete your purchase.
          </p>
        )}
      </div>
    </>
  );
};

export default BookActions;