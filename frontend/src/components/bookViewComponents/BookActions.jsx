import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const BookActions = ({
  book,
  quantity,
  setQuantity,
  isAuthenticated,
  navigate,
  addToCart,
}) => {
  const { t } = useTranslation(['bookView', 'common']);
  const { isInCart } = useCart();
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

    const id = book?._id || book?.id;
    if (isInCart && id && isInCart(id)) {
      toast.info(t('bookCard.alreadyInCart'));
      return;
    }

    addToCart({
      item: {
        id,
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
    const id = book?._id || book?.id;
    if (!id) {
      toast.error(t('bookView.missingProductId'));
      return;
    }

    try {
      // Only add if not already in cart; otherwise just proceed to checkout
      if (!isInCart || !isInCart(id)) {
        addToCart({
          item: {
            id,
            title: book.title,
            price: Number(book.price || 0),
          },
          quantity,
        });
      }
      navigate("/checkout");
    } catch {
      toast.error(t('bookView.checkoutError'));
    }
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
          {t('bookView.addToCart')}
        </button>
        <button
          className="bg-red-500 text-white hover:bg-red-600 px-6 py-2 transition rounded-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleBuyNow}
          disabled={book.stock === 0}
        >
          {t('bookView.buyNow')}
        </button>

        {/* Show login prompt only when not authenticated */}
        {!isAuthenticated && (
          <p className="text-sm text-gray-500 mt-2">
            🔒 {t('bookView.needLogin')}{" "}
            <Link to="/login" className="text-red-500 underline">
              {t('bookView.login')}
            </Link>{" "}
            {t('bookView.toCompletePurchase')}.
          </p>
        )}
      </div>
    </>
  );
};

export default BookActions;
