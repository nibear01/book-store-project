import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const { state, dispatch, subtotal, shipping, total } = useCart();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>
      {state.items.length === 0 ? (
        <div className="mt-6">
          <p className="text-gray-600">Your cart is empty.</p>
          <Link to="/shop" className="text-red-500 hover:text-red-600 transition-colors">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {state.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border border-gray-200 p-4 rounded-[2px] hover:shadow-sm transition-all"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-gray-600">${item.price?.toFixed(2)}</p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_QTY",
                      id: item.id,
                      quantity: Number(e.target.value),
                    })
                  }
                  className="w-20 border border-gray-300 rounded-[2px] px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  onClick={() => dispatch({ type: "REMOVE_ITEM", id: item.id })}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="border border-gray-200 rounded-[2px] p-6 h-fit">
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
    </div>
  );
};

export default CartPage;