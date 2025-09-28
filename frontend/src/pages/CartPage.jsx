import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const { state, subtotal, shipping, total, removeItem, updateQuantity, clearCart } = useCart();

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeItem({ id });
    } else {
      updateQuantity({ id, quantity: newQuantity });
    }
  };

  const hasItems = state.items.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold">Your Cart{hasItems ? ` (${state.items.length})` : ''}</h1>
        {hasItems && (
          <button
            onClick={clearCart}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-[2px] text-gray-700 hover:bg-gray-50"
          >
            Clear all
          </button>
        )}
      </div>

      {!hasItems ? (
        <div className="bg-white p-8 min-h-[50vh] rounded-[2px] shadow-sm text-center text-gray-600">
          Your cart is empty.
          <div className="mt-4">
            <Link className="text-red-600 hover:underline" to="/shop">Continue shopping</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="md:col-span-2 bg-white rounded-[2px] shadow-sm divide-y">
            {state.items.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
              >
                <div className="flex-1 w-full">
                  <p className="font-medium text-[15px] sm:text-base text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600 mt-1">${(item.price || 0).toFixed(2)}</p>

                  <div className="mt-3 flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:items-center">
                    <div className="inline-flex items-center gap-2">
                      <label className="text-sm text-gray-600 hidden sm:block">Qty:</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                        className="w-24 border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <button
                      onClick={() => removeItem({ id: item.id })}
                      className="w-full sm:w-auto px-3 py-2 text-sm text-gray-700 border border-transparent rounded-[2px] hover:bg-gray-50 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-[2px] shadow-sm p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-800">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-3 border-t border-gray-200">
                <span className="text-gray-800">Total</span>
                <span className="text-black">${total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="mt-6 block text-center bg-black text-white py-3 rounded-[2px] hover:bg-gray-800 transition-colors"
            >
              Go to Checkout
            </Link>
          </div>
        </div>
      )}

      {/* Continue shopping */}
      {hasItems && (
        <div className="mt-6 text-center md:text-right">
          <Link className="inline-block px-4 py-2 text-sm border border-gray-300 rounded-[2px] hover:bg-gray-50" to="/shop">
            Continue shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;