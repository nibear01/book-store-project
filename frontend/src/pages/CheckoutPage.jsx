import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/order-api";
import { toast } from "react-toastify";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { state, subtotal, shipping, clearCart } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    paymentMethod: "", // dynamic, user selects
  });

  const [loading, setLoading] = useState(false);

  // Derived: discount based on simple conditions
  const itemCount = (state.items || []).reduce((sum, i) => sum + i.quantity, 0);
  const { discountAmount, discountLabel } = (() => {
    let amount = 0;
    let label = "";
    // Rule 1: 15% off if subtotal >= $200
    if (subtotal >= 200) {
      amount = subtotal * 0.15;
      label = "15% off orders $200+";
      // Rule 2: 10% off if subtotal >= $100
    } else if (subtotal >= 100) {
      amount = subtotal * 0.1;
      label = "10% off orders $100+";
      // Rule 3: 5% off if buying 5+ items
    } else if (itemCount >= 5) {
      amount = subtotal * 0.05;
      label = "5% multi-item discount (5+ items)";
    }
    return { discountAmount: Number(amount.toFixed(2)), discountLabel: label };
  })();
  const payableTotal = Math.max(
    0,
    Number((subtotal + shipping - discountAmount).toFixed(2))
  );
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email is invalid";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (
      !/^[\\+]?[1-9][\d]{7,14}$/.test(form.phone.replace(/[\s\-\\(\\)]/g, ""))
    )
      newErrors.phone = "Please enter a valid phone number";
    if (!form.street.trim()) newErrors.street = "Street address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!form.paymentMethod)
      newErrors.paymentMethod = "Payment method is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Place order
  const placeOrder = async (e) => {
    e.preventDefault();

    // Check if cart is empty
    if (!state.items || state.items.length === 0) {
      toast.error("Your cart is empty. Please add items before checkout.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Transform cart items to match backend model structure
    const orderItems = state.items.map((item) => ({
      book: item.id, // Assuming item.id is the book ID
      quantity: item.quantity,
      price: item.price,
    }));

    const orderData = {
      items: orderItems,
      total_amount: payableTotal,
      shipping_address: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        street: form.street,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country || "USA",
      },
      payment_info: {
        method: form.paymentMethod,
        status: "pending",
      },
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to place an order.");
        setLoading(false);
        return;
      }

      const data = await createOrder(orderData);
      console.log(data);

      if (data.success) {
        // Show success message
        toast.success("Order placed successfully!");

        // Clear cart using the clearCart function from context
        await clearCart();

        // Clear form
        setForm({
          fullName: "",
          email: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
          paymentMethod: "",
        });

        // Redirect to order summary page
        navigate(`/order-summary/${data.data._id}`, {
          state: { orderId: data.data._id },
        });
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again later.");
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
              className={`mt-1 w-full border rounded px-3 py-2 ${
                errors.fullName ? "border-red-500" : ""
              }`}
              required
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`mt-1 w-full border rounded px-3 py-2 ${
                errors.email ? "border-red-500" : ""
              }`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className={`mt-1 w-full border rounded px-3 py-2 ${
                errors.phone ? "border-red-500" : ""
              }`}
              required
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Street Address</label>
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              className={`mt-1 w-full border rounded px-3 py-2 ${
                errors.street ? "border-red-500" : ""
              }`}
              required
            />
            {errors.street && (
              <p className="mt-1 text-sm text-red-600">{errors.street}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className={`mt-1 w-full border rounded px-3 py-2 ${
                  errors.city ? "border-red-500" : ""
                }`}
                required
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">State</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                className={`mt-1 w-full border rounded px-3 py-2 ${
                  errors.state ? "border-red-500" : ""
                }`}
                required
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">ZIP Code</label>
              <input
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
                className={`mt-1 w-full border rounded px-3 py-2 ${
                  errors.zipCode ? "border-red-500" : ""
                }`}
                required
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Country</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="USA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Payment Method</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className={`mt-1 w-full border rounded px-3 py-2 ${
                errors.paymentMethod ? "border-red-500" : ""
              }`}
              required
            >
              <option value="">Select Payment Method</option>
              <option value="COD">Cash on Delivery</option>
              <option value="Card">Card Payment</option>
              <option value="Paypal">Paypal</option>
            </select>
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-600">
                {errors.paymentMethod}
              </p>
            )}
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
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  Discount{discountLabel ? ` (${discountLabel})` : ""}
                </span>
                <span>- ${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total</span>
              <span>${payableTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
