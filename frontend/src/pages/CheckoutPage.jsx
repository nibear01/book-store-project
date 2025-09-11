import { useCart } from "../context/CartContext";

const CheckoutPage = () => {
  const { state, subtotal, shipping, total, dispatch } = useCart();

  const placeOrder = (e) => {
    e.preventDefault();
    alert("Order placed! Thank you for shopping with us.");
    dispatch({ type: "CLEAR" });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <form onSubmit={placeOrder} className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input className="mt-1 w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input className="mt-1 w-full border rounded px-3 py-2" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">City</label>
              <input
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">State</label>
              <input
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">ZIP</label>
              <input
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Place Order
          </button>
        </form>
        <div className="border rounded-lg p-4 h-fit">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <ul className="mt-4 text-sm space-y-1">
            {state.items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>
                  {i.title} × {i.quantity}
                </span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
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
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
