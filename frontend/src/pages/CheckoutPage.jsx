import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/order-api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const asMoney = (n) => (Number.isFinite(n) ? Number(n.toFixed(2)) : 0);

// Phone helpers
const normalizePhone = (raw = "") => raw.replace(/[\s\-()]/g, "");
const isValidPhone = (raw) => /^\+?[1-9]\d{7,14}$/.test(normalizePhone(raw));

// Clean “Sylhet, Bangladesh” if it appears in street
const cleanStreet = (s = "") =>
  s.replace(/sylhet\s*,?\s*bangladesh/gi, "").trim();

const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    state,
    subtotal: rawSubtotal,
    shipping: rawShipping,
    clearCart,
  } = useCart();
  const { user, isAuthenticated } = useAuth();

  const items = state.items || [];
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + (i.quantity || 0), 0),
    [items]
  );

  // Guard against NaN coming from context
  const subtotal = useMemo(() => asMoney(rawSubtotal || 0), [rawSubtotal]);
  const shipping = useMemo(() => asMoney(rawShipping || 0), [rawShipping]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "", // keep blank
    city: "",
    state: "",
    zipCode: "",
    country: "Bangladesh",
    paymentMethod: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Discounts (BDT thresholds; tweak if needed)
  const { discountAmount, discountLabel } = useMemo(() => {
    let amount = 0;
    let label = "";
    if (subtotal >= 2000) {
      amount = subtotal * 0.15;
      label = "15% off orders ৳2,000+";
    } else if (subtotal >= 1000) {
      amount = subtotal * 0.1;
      label = "10% off orders ৳1,000+";
    } else if (itemCount >= 5) {
      amount = subtotal * 0.05;
      label = "5% multi-item discount (5+ items)";
    }
    return { discountAmount: asMoney(amount), discountLabel: label };
  }, [subtotal, itemCount]);

  const payableTotal = useMemo(
    () => asMoney(Math.max(0, subtotal + shipping - discountAmount)),
    [subtotal, shipping, discountAmount]
  );

  // Prefill (NON-DESTRUCTIVE) — note: street stays empty
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
      street: "", // keep street blank explicitly
      country: prev.country || "Bangladesh",
    }));
  }, [isAuthenticated, user]);

  // Input changes (with street cleaner)
  const handleChange = useCallback(
    (e) => {
      const { name } = e.target;
      let { value } = e.target;

      if (name === "street") {
        value = cleanStreet(value);
      }

      setForm((f) => ({ ...f, [name]: value }));

      if (errors[name]) {
        setErrors((er) => ({ ...er, [name]: "" }));
      }
    },
    [errors]
  );

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email looks invalid";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    else if (!isValidPhone(form.phone))
      newErrors.phone = "Enter a valid phone (e.g., +8801XXXXXXXXX)";
    if (!form.street.trim()) newErrors.street = "Street is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.zipCode.trim()) newErrors.zipCode = "Postal code is required";
    if (!form.paymentMethod) newErrors.paymentMethod = "Pick a payment method";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Submit
  const placeOrder = async (e) => {
    e.preventDefault();

    if (!items.length) {
      toast.error("Your cart is empty. Please add items before checkout.");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please log in to place an order.");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    if (!validateForm()) return;

    setLoading(true);

    const orderItems = items.map((item) => ({
      // If your backend needs `book_id`, change key name here
      book: item.id,
      quantity: item.quantity,
      price: asMoney(item.price),
    }));

    const orderData = {
      items: orderItems,
      subtotal_amount: subtotal,
      discount_amount: discountAmount,
      discount_label: discountLabel,
      shipping_amount: shipping,
      grand_total: payableTotal,
      total_amount: payableTotal, // for backward compatibility
      shipping_address: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: normalizePhone(form.phone),
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
        country: form.country?.trim() || "Bangladesh",
      },
      payment_info: { method: form.paymentMethod, status: "pending" },
    };

    try {
      const token = localStorage.getItem("token"); // attach if your API needs it
      const data = await createOrder(orderData, token);

      const ok = data?.success ?? true;
      const orderId = data?.data?._id ?? data?._id ?? data?.id;

      if (ok && orderId) {
        toast.success("Order placed successfully!");
        await clearCart();

        setForm({
          fullName: "",
          email: "",
          phone: "",
          street: "", // reset blank
          city: "",
          state: "",
          zipCode: "",
          country: "Bangladesh",
          paymentMethod: "",
        });

        navigate(`/order-summary/${orderId}`, { state: { orderId } });
      } else {
        toast.error(data?.message || "Failed to place order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const hasItems = items.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold">
          Checkout{hasItems ? ` (${itemCount})` : ""}
        </h1>
      </div>

      {!hasItems ? (
        <div className="bg-white p-8 rounded-md shadow-sm text-center text-gray-600">
          Your cart is empty.
          <div className="mt-4">
            <button
              onClick={() => navigate("/cart")}
              className="text-red-600 hover:underline"
            >
              Go to cart
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
          <form
            onSubmit={placeOrder}
            className="md:col-span-2 bg-white rounded-[2px] shadow-sm p-5 sm:p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 ${
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
                className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 ${
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
                placeholder="+8801XXXXXXXXX"
                className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 ${
                  errors.phone ? "border-red-500" : ""
                }`}
                required
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">
                Street Address
              </label>
              <input
                name="street"
                value={form.street}
                onChange={handleChange}
                autoComplete="address-line1"
                placeholder="House/road, area (no city/country)"
                className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 ${
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
                  className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 ${
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
                  className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 ${
                    errors.state ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Postal Code</label>
                <input
                  name="zipCode"
                  value={form.zipCode}
                  onChange={handleChange}
                  className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 ${
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
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Bangladesh"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 ${
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
              className={`w-full sm:w-auto bg-black text-white px-5 py-3 rounded-md hover:bg-gray-800 transition-colors ${
                loading || !hasItems ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading || !hasItems}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          {/* Summary */}
          <div className="bg-white rounded-md shadow-sm p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-800">
              Order Summary
            </h2>
            <ul className="mt-4 text-sm space-y-1">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>
                    {i.title} × {i.quantity}
                  </span>
                  <span>৳{asMoney(i.price * i.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-800">৳{shipping.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount{discountLabel ? ` (${discountLabel})` : ""}
                  </span>
                  <span>- ৳{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-3 border-t border-gray-200">
                <span className="text-gray-800">Total</span>
                <span className="text-black">৳{payableTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue shopping */}
      {hasItems && (
        <div className="mt-6 text-center md:text-right">
          <button
            onClick={() => navigate("/shop")}
            className="inline-block px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Continue shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
