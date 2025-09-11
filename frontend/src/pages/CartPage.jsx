import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const { state, dispatch, subtotal, shipping, total } = useCart();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Your Cart</h1>
      {state.items.length === 0 ? (
        <div className="mt-6">
          <p className="text-gray-600">Your cart is empty.</p>
          <Link to="/shop" className="text-red-600 hover:underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {state.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border p-4 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
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
                  className="w-20 border rounded px-2 py-1"
                />
                <button
                  onClick={() => dispatch({ type: "REMOVE_ITEM", id: item.id })}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="border rounded-lg p-4 h-fit">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="mt-4 block text-center bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
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
