import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/order-api";
import { validatePromoCode } from "../api/affiliate-api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { BACKEND_URL } from "../api/apiBase";

const asMoney = (n) => (Number.isFinite(n) ? Number(n.toFixed(2)) : 0);

// Phone helpers
const normalizePhone = (raw = "") => raw.replace(/[\s\-()]/g, "");
const isValidPhone = (raw) => /^\+?[1-9]\d{7,14}$/.test(normalizePhone(raw));

const cleanStreet = (s = "") =>
  s.replace(/sylhet\s*,?\s*bangladesh/gi, "").trim();

const CheckoutPage = () => {
  const { t } = useTranslation(['cart', 'common']);
  const navigate = useNavigate();
  const {
    state,
    subtotal: rawSubtotal,
    clearCart,
  } = useCart();
  const { user, isAuthenticated } = useAuth();

  const items = useMemo(() => state.items || [], [state.items]);
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + (i.quantity || 0), 0),
    [items]
  );

  // Guard against NaN coming from context
  const subtotal = useMemo(() => asMoney(rawSubtotal || 0), [rawSubtotal]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "", 
    city: "",
    state: "",
    zipCode: "",
    country: "Bangladesh",
    paymentMethod: "",
    shippingLocation: "", // "insideDhaka" or "outsideDhaka"
  });
  
  // Delivery costs from backend
  const [deliveryCosts, setDeliveryCosts] = useState({
    insideDhaka: 0,
    outsideDhaka: 0,
  });
  const [deliveryCostsLoading, setDeliveryCostsLoading] = useState(true);
  
  const shipping = useMemo(() => {
    if (form.shippingLocation === "insideDhaka") {
      return asMoney(deliveryCosts.insideDhaka);
    } else if (form.shippingLocation === "outsideDhaka") {
      return asMoney(deliveryCosts.outsideDhaka);
    }
    return 0; // until a delivery location is chosen
  }, [form.shippingLocation, deliveryCosts]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [promoCode, setPromoCode] = useState("");
  const [promoCodeApplied, setPromoCodeApplied] = useState(false);
  const [promoCodeData, setPromoCodeData] = useState(null);
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState("");

  const { discountAmount, discountLabel } = useMemo(() => {
    let amount = 0;
    let label = "";
    
    // Apply promo code discount if valid (5% affiliate discount)
    if (promoCodeApplied && promoCodeData) {
      amount = subtotal * (promoCodeData.discount_percentage / 100);
      label = `${promoCodeData.discount_percentage}% off (Promo: ${promoCodeData.promo_code})`;
    }
    // Otherwise apply regular discounts
    else if (subtotal >= 10000) {
      amount = subtotal * 0.15;
      label = "15% off orders ৳10,000+";
    } else if (subtotal >= 5000) {
      amount = subtotal * 0.1;
      label = "10% off orders ৳5,000+";
    } else if (itemCount >= 5) {
      amount = subtotal * 0.05;
      label = "5% multi-item discount (5+ items)";
    }
    return { discountAmount: asMoney(amount), discountLabel: label };
  }, [subtotal, itemCount, promoCodeApplied, promoCodeData]);

  const payableTotal = useMemo(
    () => asMoney(Math.max(0, subtotal + shipping - discountAmount)),
    [subtotal, shipping, discountAmount]
  );

  // Fetch delivery costs from backend
  useEffect(() => {
    const fetchDeliveryCosts = async () => {
      try {
        const baseUrl = BACKEND_URL;
        const res = await fetch(`${baseUrl}/api/settings/delivery-cost`);
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setDeliveryCosts({
            insideDhaka: Number(data.data.insideDhaka) || 0,
            outsideDhaka: Number(data.data.outsideDhaka) || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch delivery costs:", error);
        toast.error("Failed to load delivery costs. Please refresh the page.");
      } finally {
        setDeliveryCostsLoading(false);
      }
    };
    fetchDeliveryCosts();
  }, []);

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
      setErrors((er) => ({ ...er, [name]: "" }));
    },
    []
  );

  // Handle promo code application
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoCodeError("Please enter a promo code");
      return;
    }

    setPromoCodeLoading(true);
    setPromoCodeError("");

    try {
      const result = await validatePromoCode(promoCode.trim());
      
      if (result.success) {
        setPromoCodeApplied(true);
        setPromoCodeData(result.data);
        toast.success(
          `Promo code applied! You get ${result.data.discount_percentage}% off`
        );
      } else {
        setPromoCodeError(result.message || "Invalid promo code");
        toast.error(result.message || "Invalid promo code");
      }
    } catch (error) {
      console.error("Promo code validation error:", error);
      setPromoCodeError("Failed to validate promo code");
      toast.error("Failed to validate promo code");
    } finally {
      setPromoCodeLoading(false);
    }
  };

  // Handle promo code removal
  const handleRemovePromoCode = () => {
    setPromoCode("");
    setPromoCodeApplied(false);
    setPromoCodeData(null);
    setPromoCodeError("");
    toast.info("Promo code removed");
  };

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
    if (!form.shippingLocation) newErrors.shippingLocation = "Please select delivery location";
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
      book: item.id,
      quantity: item.quantity,
      price: asMoney(item.price),
      configured: !!item.configured,
      variant: item.variant || undefined,
      pricing: item.breakdown || undefined,
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
        shippingLocation: form.shippingLocation,
      },
      payment_info: { method: form.paymentMethod, status: "pending" },
      // Include promo code if applied
      ...(promoCodeApplied && promoCodeData && { promo_code: promoCodeData.promo_code }),
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
          shippingLocation: "",
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
          {t('cart:checkout.title')}{hasItems ? ` (${itemCount})` : ""}
        </h1>
      </div>

      {!hasItems ? (
        <div className="bg-white p-8 h-screen rounded-md shadow-sm text-center text-gray-600">
          {t('cart:cart.empty')}
          <div className="mt-4">
            <button
              onClick={() => navigate("/cart")}
              className="text-red-600 hover:underline"
            >
              {t('common:buttons.view')} {t('common:navbar.cart')}
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
              <label className="block text-sm font-medium">{t('cart:checkout.fullName')}</label>
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
              <label className="block text-sm font-medium">{t('cart:checkout.email')}</label>
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
              <label className="block text-sm font-medium">{t('cart:checkout.phone')}</label>
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
                {t('cart:checkout.address')}
              </label>
              <input
                name="street"
                value={form.street}
                onChange={handleChange}
                autoComplete="address-line1"
                placeholder={t('cart:checkout.addressPlaceholder')}
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
                <label className="block text-sm font-medium">{t('cart:checkout.city')}</label>
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
                <label className="block text-sm font-medium">{t('cart:checkout.state')}</label>
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
                <label className="block text-sm font-medium">{t('cart:checkout.zipCode')}</label>
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
              <label className="block text-sm font-medium">{t('cart:checkout.country')}</label>
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Bangladesh"
              />
            </div>

            {/* Delivery Location Selection */}
            <div>
              <label className="block text-sm font-medium">
                {t('cart:checkout.deliveryLocation')}
              </label>
              <select
                name="shippingLocation"
                value={form.shippingLocation}
                onChange={handleChange}
                className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 ${
                  errors.shippingLocation ? "border-red-500" : ""
                }`}
                required
                disabled={deliveryCostsLoading}
              >
                <option disabled value="">{t('cart:checkout.selectDeliveryLocation')}</option>
                <option value="insideDhaka">
                  {t('cart:checkout.insideDhaka')} ({t('common:currency')}{deliveryCosts.insideDhaka.toFixed(2)})
                </option>
                <option value="outsideDhaka">
                  {t('cart:checkout.outsideDhaka')} ({t('common:currency')}{deliveryCosts.outsideDhaka.toFixed(2)})
                </option>
              </select>
              {errors.shippingLocation && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.shippingLocation}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {t('cart:checkout.deliveryCostNote')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('cart:checkout.paymentMethod')}
              </label>

              <fieldset className="mt-1">
                <legend className="sr-only">Select payment method</legend>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <label className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md border ${form.paymentMethod === 'COD' ? 'bg-black text-white border-black' : 'bg-white text-gray-800 border-gray-300'} transition-colors`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={form.paymentMethod === 'COD'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{t('cart:checkout.cashOnDelivery')}</span>
                    <span className="ml-auto text-xs text-gray-500">{t('cart:checkout.payWhenReceive')}</span>
                  </label>

                  <label className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md border ${form.paymentMethod === 'Card' ? 'bg-black text-white border-black' : 'bg-white text-gray-800 border-gray-300'} transition-colors`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Card"
                      checked={form.paymentMethod === 'Card'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{t('cart:checkout.cardPayment')}</span>
                    <span className="ml-auto text-xs text-gray-500">{t('cart:checkout.cardTypes')}</span>
                  </label>

                  <label className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md border ${form.paymentMethod === 'Paypal' ? 'bg-black text-white border-black' : 'bg-white text-gray-800 border-gray-300'} transition-colors`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Paypal"
                      checked={form.paymentMethod === 'Paypal'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{t('cart:checkout.paypal')}</span>
                    <span className="ml-auto text-xs text-gray-500">{t('cart:checkout.onlinePayment')}</span>
                  </label>
                </div>
              </fieldset>

              {errors.paymentMethod && (
                <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>
              )}
            </div>

            {/* Promo Code Section */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('cart:checkout.promoCode')}
              </label>
              {!promoCodeApplied ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoCodeError("");
                    }}
                    placeholder={t('cart:checkout.enterPromoCode')}
                    className={`flex-1 border border-gray-300 rounded-md px-3 py-2 uppercase ${
                      promoCodeError ? "border-red-500" : ""
                    }`}
                    disabled={promoCodeLoading}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromoCode}
                    disabled={promoCodeLoading || !promoCode.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {promoCodeLoading ? t('cart:checkout.checking') : t('cart:checkout.apply')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        {t('cart:checkout.promoCodeApplied')} {promoCodeData?.promo_code}
                      </p>
                      <p className="text-xs text-green-600">
                        {promoCodeData?.discount_percentage}% {t('cart:checkout.discountLabel')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromoCode}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    {t('cart:checkout.remove')}
                  </button>
                </div>
              )}
              {promoCodeError && (
                <p className="mt-1 text-sm text-red-600">{promoCodeError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {t('cart:checkout.promoCodeNote')}
              </p>
            </div>

            <button
              type="submit"
              className={`w-full sm:w-auto bg-black text-white px-5 py-3 rounded-md hover:bg-gray-800 transition-colors ${
                loading || !hasItems ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading || !hasItems}
            >
              {loading ? t('common:buttons.loading') : t('cart:checkout.placeOrder')}
            </button>
          </form>

          {/* Summary */}
          <div className="bg-white rounded-md shadow-sm p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-800">
              {t('cart:checkout.orderSummary')}
            </h2>
            <ul className="mt-4 text-sm space-y-3">
              {items.map((i) => (
                <li key={i.key} className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span>
                      {i.title} × {i.quantity}
                    </span>
                    <span>৳{asMoney(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                  {(() => {
                    const v = i?.variant || { paperQuality: "economy", printSide: "single", paperSize: "A4", colorMode: "bw" };
                    return (
                      <div className="text-xs text-gray-600">
                        POD: Quality {v.paperQuality || "-"}, Side {v.printSide || "-"}, Size {v.paperSize || "-"}, Color {v.colorMode || "-"}
                      </div>
                    );
                  })()}
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart:checkout.subtotal')}</span>
                <span className="text-gray-800">{t('common:currency')}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart:checkout.shipping')}</span>
                <span className="text-gray-800">{t('common:currency')}{shipping.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    {t('cart:checkout.discount')}{discountLabel ? ` (${discountLabel})` : ""}
                  </span>
                  <span>- {t('common:currency')}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-3 border-t border-gray-200">
                <span className="text-gray-800">{t('cart:checkout.grandTotal')}</span>
                <span className="text-black">{t('common:currency')}{payableTotal.toFixed(2)}</span>
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
            {t('cart:cart.continueShopping')}
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
