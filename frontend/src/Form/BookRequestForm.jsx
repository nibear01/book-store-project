// BookRequestForm.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import ButtonFill from "@/Button/ButtonFill";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const BookRequestForm = () => {
  const { t } = useTranslation(['forms', 'common']);
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "";
  const COOLDOWN_SECONDS = 60;

  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Email verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const emailLooksValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    [form.email]
  );

  // Check if email is already verified from previous requests
  const checkEmailVerification = useCallback(async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    
    setCheckingEmail(true);
    try {
      const endpoint = baseUrl
        ? `${baseUrl}/api/book-requests/check-email?email=${encodeURIComponent(email)}`
        : `/api/book-requests/check-email?email=${encodeURIComponent(email)}`;
      
      const res = await fetch(endpoint);
      const data = await res.json().catch(() => ({}));
      
      if (res.ok && data?.success && data?.verified) {
        setEmailVerified(true);
        setOtpSent(false);
        setOtpCode("");
        toast.success("✅ Email already verified from your previous request.");
      }
    } catch (e) {
      // Silent fail - user can still verify manually
      console.warn("Email verification check failed:", e);
    } finally {
      setCheckingEmail(false);
    }
  }, [baseUrl]);

  // Check email verification status when email becomes valid
  useEffect(() => {
    if (emailLooksValid && !emailVerified && !otpSent) {
      const timer = setTimeout(() => {
        checkEmailVerification(form.email);
      }, 500); // Debounce to avoid too many requests
      return () => clearTimeout(timer);
    }
  }, [form.email, emailLooksValid, emailVerified, otpSent, checkEmailVerification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (name === "email") {
      setEmailVerified(false);
      setOtpSent(false);
      setOtpCode("");
      
      // Inline email validation so UI shows error without requiring submit
      const looksValidNow = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setErrors((prev) => {
        const next = { ...prev };
        if (!looksValidNow) next.email = "Valid email required.";
        else delete next.email;
        // Changing email makes previous verification invalid; clear related error
        delete next.emailVerified;
        return next;
      });
    }
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Your name is required.";
    if (!emailLooksValid) err.email = "Valid email required.";
    if (!form.title.trim()) err.title = "Book title is required.";
    if (emailLooksValid && !emailVerified)
      err.emailVerified = "Please verify your email to continue.";
    return err;
  };

  // OTP handlers (reuse author-requests endpoints for email OTP)
  const sendCode = async () => {
    if (!emailLooksValid || sending || cooldown > 0 || emailVerified) return;
    setSending(true);
    try {
      const endpoint = baseUrl
        ? `${baseUrl}/api/author-requests/otp/send`
        : "/api/author-requests/otp/send";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to send code.");
      setOtpSent(true);
      setCooldown(COOLDOWN_SECONDS);
      toast.success("📧 Verification code sent to your email.");
    } catch (e) {
      toast.error(e.message || "Failed to send code.");
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (!otpCode.trim() || verifying) return;
    setVerifying(true);
    try {
      const endpoint = baseUrl
        ? `${baseUrl}/api/author-requests/otp/verify`
        : "/api/author-requests/otp/verify";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: otpCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.verified) throw new Error(data?.message || "Incorrect or expired code.");
      setEmailVerified(true);
      toast.success("✅ Email verified successfully.");
    } catch (e) {
      setEmailVerified(false);
      toast.error(e.message || "Verification failed.");
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
    try {
      const endpoint = baseUrl
        ? `${baseUrl}/api/book-requests/submit`
        : "/api/book-requests/submit";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          title: form.title.trim(),
          author: form.author?.trim() || undefined,
          isbn: form.isbn?.trim() || undefined,
          publisher: form.publisher?.trim() || undefined,
          notes: form.notes?.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Submission failed. Please try again.");
      }
      toast.success("✅ Book request submitted successfully!");
      setForm({ name: "", email: "", title: "", author: "", isbn: "", publisher: "", notes: "" });
      setErrors({});
      setEmailVerified(false);
      setOtpSent(false);
      setOtpCode("");
      setCooldown(0);
    } catch (e) {
      toast.error(e.message || "❌ Submission failed. Try again.");
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
            {t('common:navbar.home')}
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gray-800 transition-colors">
            {t('common:navbar.shop')}
          </Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-gray-800 transition-colors">
            {t('common:navbar.categories')}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('forms:bookRequest.pageTitle')}</span>
        </nav>
      </div>

      <div className="bg-white rounded-md shadow-lg p-6 md:p-8 max-w-3xl mx-auto my-10">
        <h1 className="text-3xl font-semibold mb-1 text-gray-800">
          {t('forms:bookRequest.pageTitle')}
        </h1>
        <p className="text-gray-600 mb-6">
          {t('forms:bookRequest.subtitle')}{" "}
          <span className="font-medium">{t('forms:bookRequest.submit')}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium">{t('forms:bookRequest.yourName')}</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "err-name" : undefined}
            />
            {errText("err-name", errors.name)}
          </div>

          {/* Email + OTP */}
          <div>
            <label className="block text-sm font-medium">{t('forms:bookRequest.email')}</label>
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
                {checkingEmail && (
                  <p className="text-blue-600 text-sm mt-1">🔍 Checking email verification status...</p>
                )}
                {emailVerified && !checkingEmail && (
                  <p className="text-green-700 text-sm mt-1">✅ {t('forms:bookRequest.emailVerified')}</p>
                )}
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={!emailLooksValid || emailVerified || sending || cooldown > 0 || checkingEmail}
                  className={`w-full px-3 py-2 rounded-lg text-white font-medium shadow ${
                    !emailLooksValid || emailVerified || sending || cooldown > 0 || checkingEmail
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  aria-disabled={!emailLooksValid || emailVerified || sending || cooldown > 0 || checkingEmail}
                >
                  {checkingEmail
                    ? "Checking..."
                    : sending
                    ? t('forms:bookRequest.sending')
                    : cooldown > 0
                    ? `${t('forms:bookRequest.resendIn')} ${cooldown}s`
                    : otpSent
                    ? t('forms:bookRequest.resendCode')
                    : t('forms:bookRequest.sendCode')}
                </button>
              </div>
            </div>

            {otpSent && !emailVerified && (
              <div className="mt-3">
                <label className="block text-sm font-medium">{t('forms:bookRequest.enterCode')}</label>
                <div className="flex gap-3">
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="otpCode"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\s+/g, ""))}
                    className={inputClass + " max-w-xs"}
                    placeholder={t('forms:bookRequest.digitCode')}
                  />
                  <button
                    type="button"
                    onClick={verifyCode}
                    disabled={!otpCode.trim() || verifying}
                    className={`px-4 py-2 rounded-lg text-white font-medium shadow ${
                      !otpCode.trim() || verifying
                        ? "bg-emerald-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {verifying ? t('forms:bookRequest.verifying') : t('forms:bookRequest.verify')}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {t('forms:bookRequest.didntReceive')}
                </p>
              </div>
            )}
          </div>

          {/* Book Title */}
          <div>
            <label className="block text-sm font-medium">{t('forms:bookRequest.bookTitle')}</label>
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

          {/* Optional fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('forms:bookRequest.author')} (optional)</label>
              <input name="author" value={form.author} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('forms:bookRequest.isbn')} (optional)</label>
              <input name="isbn" value={form.isbn} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('forms:bookRequest.publisher')} (optional)</label>
              <input name="publisher" value={form.publisher} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">{t('forms:bookRequest.notes')} (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className={inputClass} rows={3} />
          </div>

          <div className="pt-4 flex justify-end">
            <ButtonFill
              type="submit"
              disabled={loading || !emailLooksValid || !emailVerified}
              className={`px-6 py-2.5 rounded-lg text-white font-medium shadow ${
                loading || !emailLooksValid || !emailVerified
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? t('forms:bookRequest.submitting') : emailVerified ? t('forms:bookRequest.submit') : t('forms:bookRequest.emailVerifyRequired')}
            </ButtonFill>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookRequestForm;
