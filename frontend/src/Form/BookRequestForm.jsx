// AuthorRequestForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ButtonFill from "@/Button/ButtonFill";

const COOLDOWN_SECONDS = 60;

const AuthorRequestForm = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    title: "",
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressZip: "",
    addressCountry: "Bangladesh",
    typeOfWork: "Book",
    categoryType: "",
    additionalRequests: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Email verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));

    if (name === "email") {
      setEmailVerified(false);
      setOtpSent(false);
      setOtpCode("");
    }
  };

  const composeAddress = () => {
    const {
      addressStreet,
      addressCity,
      addressState,
      addressZip,
      addressCountry,
    } = form;
    return [
      addressStreet,
      addressCity,
      addressState,
      addressZip,
      addressCountry,
    ]
      .map((s) => s?.trim())
      .filter(Boolean)
      .join(", ");
  };

  const emailLooksValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    [form.email]
  );

  const validate = () => {
    const err = {};
    if (!form.fullName.trim()) err.fullName = "Full name is required.";
    if (!emailLooksValid) err.email = "Valid email required.";
    if (!form.phone.trim()) err.phone = "Phone number is required.";
    if (!form.title.trim()) err.title = "Manuscript title is required.";

    if (!form.addressStreet.trim()) err.addressStreet = "Street is required.";
    if (!form.addressCity.trim()) err.addressCity = "City is required.";
    if (!form.addressState.trim())
      err.addressState = "State/Division is required.";
    if (!form.addressCountry.trim())
      err.addressCountry = "Country is required.";
    if (form.addressZip && form.addressZip.trim().length < 3)
      err.addressZip = "Post/ZIP code looks too short.";

    if (!form.categoryType) err.categoryType = "Please select a language.";
    if (emailLooksValid && !emailVerified)
      err.emailVerified = "Please verify your email to continue.";
    return err;
  };

  const sendCode = async () => {
    if (!emailLooksValid || sending || cooldown > 0) return;
    setSending(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setCooldown(COOLDOWN_SECONDS);
        setMessage({
          text: "📧 Verification code sent to your email.",
          type: "success",
        });
      } else {
        setMessage({
          text: data?.error || "Failed to send code.",
          type: "error",
        });
      }
    } catch {
      setMessage({
        text: "⚠️ Network error while sending code.",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (!otpCode.trim() || verifying) return;
    setVerifying(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: otpCode.trim() }),
      });
      const data = await res.json();
      if (res.ok && data?.verified) {
        setEmailVerified(true);
        setMessage({
          text: "✅ Email verified successfully.",
          type: "success",
        });
      } else {
        setEmailVerified(false);
        setMessage({
          text: data?.error || "❌ Incorrect or expired code.",
          type: "error",
        });
      }
    } catch {
      setMessage({
        text: "⚠️ Network error while verifying code.",
        type: "error",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "276695ce-1e44-4cb0-bc1f-df51e6a92587",
          ...form,
          address: composeAddress(),
          emailVerified: emailVerified ? "true" : "false",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: "✅ Submitted successfully!", type: "success" });
        setForm({
          fullName: "",
          email: "",
          phone: "",
          title: "",
          addressStreet: "",
          addressCity: "",
          addressState: "",
          addressZip: "",
          addressCountry: "Bangladesh",
          typeOfWork: "Book",
          categoryType: "",
          additionalRequests: "",
          date: new Date().toISOString().slice(0, 10),
        });
        setErrors({});
        setEmailVerified(false);
        setOtpSent(false);
        setOtpCode("");
      } else {
        setMessage({ text: "❌ Submission failed. Try again.", type: "error" });
      }
    } catch {
      setMessage({ text: "⚠️ Network error. Please retry.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const errText = (id, msg) =>
    msg ? (
      <p id={id} className="text-red-600 text-sm">
        {msg}
      </p>
    ) : null;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="pt-6">
        <nav className="flex items-center text-[16px] text-gray-600 space-x-2">
          <Link to="/" className="hover:text-gray-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gray-800 transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link
            to="/categories"
            className="hover:text-gray-800 transition-colors"
          >
            Categories
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Book Request</span>
        </nav>
      </div>

      <div className="bg-white rounded-md shadow-lg p-6 md:p-8 max-w-3xl mx-auto my-10">
        <h1 className="text-3xl font-semibold mb-1 text-gray-800">
          Book Request
        </h1>
        <p className="text-gray-600 mb-6">
          Fill in the details below and press{" "}
          <span className="font-medium">Submit</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className={inputClass}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "err-fullName" : undefined}
            />
            {errText("err-fullName", errors.fullName)}
          </div>

          {/* Email + Verify */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  aria-invalid={!!errors.email || !!errors.emailVerified}
                  aria-describedby={
                    errors.email
                      ? "err-email"
                      : errors.emailVerified
                      ? "err-emailVerified"
                      : undefined
                  }
                />
                {errText("err-email", errors.email)}
                {errText("err-emailVerified", errors.emailVerified)}
                {emailVerified && (
                  <p className="text-green-700 text-sm mt-1">Email verified.</p>
                )}
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={
                    !emailLooksValid || emailVerified || sending || cooldown > 0
                  }
                  className={`w-full px-3 py-2 rounded-lg text-white font-medium shadow
                    ${
                      !emailLooksValid ||
                      emailVerified ||
                      sending ||
                      cooldown > 0
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  aria-disabled={
                    !emailLooksValid || emailVerified || sending || cooldown > 0
                  }
                >
                  {sending
                    ? "Sending..."
                    : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : otpSent
                    ? "Resend Code"
                    : "Send Code"}
                </button>
              </div>
            </div>

            {otpSent && !emailVerified && (
              <div className="mt-3">
                <label className="block text-sm font-medium">Enter Code</label>
                <div className="flex gap-3">
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="otpCode"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\s+/g, ""))
                    }
                    className={inputClass + " max-w-xs"}
                    placeholder="6-digit code"
                  />
                  <button
                    type="button"
                    onClick={verifyCode}
                    disabled={!otpCode.trim() || verifying}
                    className={`px-4 py-2 rounded-lg text-white font-medium shadow
                      ${
                        !otpCode.trim() || verifying
                          ? "bg-emerald-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                  >
                    {verifying ? "Verifying..." : "Verify"}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Didn’t receive it? Check spam/junk or wait for resend.
                </p>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={inputClass}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "err-phone" : undefined}
            />
            {errText("err-phone", errors.phone)}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium">Books Name</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClass}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "err-title" : undefined}
            />
            {errText("err-title", errors.title)}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  name="addressStreet"
                  placeholder="Street / House, Road"
                  value={form.addressStreet}
                  onChange={handleChange}
                  className={inputClass}
                  aria-invalid={!!errors.addressStreet}
                  aria-describedby={
                    errors.addressStreet ? "err-street" : undefined
                  }
                />
                {errText("err-street", errors.addressStreet)}
              </div>
              <div>
                <input
                  name="addressCity"
                  placeholder="City"
                  value={form.addressCity}
                  onChange={handleChange}
                  className={inputClass}
                  aria-invalid={!!errors.addressCity}
                  aria-describedby={errors.addressCity ? "err-city" : undefined}
                />
                {errText("err-city", errors.addressCity)}
              </div>
              <div>
                <input
                  name="addressState"
                  placeholder="State / Division"
                  value={form.addressState}
                  onChange={handleChange}
                  className={inputClass}
                  aria-invalid={!!errors.addressState}
                  aria-describedby={
                    errors.addressState ? "err-state" : undefined
                  }
                />
                {errText("err-state", errors.addressState)}
              </div>
              <div>
                <input
                  name="addressZip"
                  placeholder="Post / ZIP Code"
                  value={form.addressZip}
                  onChange={handleChange}
                  className={inputClass}
                  aria-invalid={!!errors.addressZip}
                  aria-describedby={errors.addressZip ? "err-zip" : undefined}
                />
                {errText("err-zip", errors.addressZip)}
              </div>
              <div>
                <input
                  name="addressCountry"
                  placeholder="Country"
                  value={form.addressCountry}
                  onChange={handleChange}
                  className={inputClass}
                  aria-invalid={!!errors.addressCountry}
                  aria-describedby={
                    errors.addressCountry ? "err-country" : undefined
                  }
                />
                {errText("err-country", errors.addressCountry)}
              </div>
            </div>
          </div>

          {/* Type of Work */}
          <div>
            <label className="block text-sm font-medium">Type of Work</label>
            <select
              name="typeOfWork"
              value={form.typeOfWork}
              onChange={handleChange}
              className={inputClass}
            >
              <option>Book</option>
              <option>Research Paper</option>
              <option>Article</option>
              <option>Other</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium">Language / ভাষা</label>
            <select
              name="categoryType"
              value={form.categoryType}
              onChange={handleChange}
              className={inputClass}
              aria-invalid={!!errors.categoryType}
              aria-describedby={
                errors.categoryType ? "err-categoryType" : undefined
              }
            >
              <option value="">Select Language</option>
              <option value="English">English</option>
              <option value="Bangla">Bangla (বাংলা)</option>
              <option value="Bilingual">Bilingual</option>
            </select>
            {errText("err-categoryType", errors.categoryType)}
          </div>

          {/* Additional Requests */}
          <div>
            <label className="block text sm font-medium">
              Additional Requests
            </label>
            <textarea
              name="additionalRequests"
              value={form.additionalRequests}
              onChange={handleChange}
              className={inputClass}
              rows={3}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {message.text && (
            <div
              role="alert"
              className={`p-3 mb-6 rounded-lg text-sm text-center ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <ButtonFill
              type="submit"
              disabled={loading || !emailVerified}
              className={`px-6 py-2.5 rounded-lg text-white font-medium shadow ${
                loading || !emailVerified
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Submitting..."
                : emailVerified
                ? "Submit"
                : "Verify Email to Submit"}
            </ButtonFill>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthorRequestForm;
