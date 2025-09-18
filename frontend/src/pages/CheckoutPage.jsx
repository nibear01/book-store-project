import { useState } from "react";
import { useCart } from "../context/CartContext";

const CheckoutPage = () => {
  const { state, subtotal, shipping, total, dispatch } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    paymentMethod: "", // dynamic, user selects
  });

  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Place order
  const placeOrder = async (e) => {
    e.preventDefault();
    if (!form.paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    setLoading(true);

    const orderData = {
      shipping_address: {
        fullName: form.fullName,
        email: form.email,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
      },
      payment_method: form.paymentMethod,
      items: state.items, // include cart items
      subtotal,
      shipping,
      total_amount: total,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to place an order.");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      console.log(data);

      if (data.success) {
        alert("Order placed successfully!");
        dispatch({ type: "CLEAR" });
        setForm({
          fullName: "",
          email: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          paymentMethod: "",
        });
      } else {
        alert(data.message || "Failed to place order");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <form onSubmit={placeOrder} className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">State</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">ZIP</label>
              <input
                name="zip"
                value={form.zip}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Payment Method</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Payment Method</option>
              <option value="COD">Cash on Delivery</option>
              <option value="Card">Card Payment</option>
              <option value="Paypal">Paypal</option>
            </select>
          </div>

          <button
            type="submit"
            className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Place Order"}
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
