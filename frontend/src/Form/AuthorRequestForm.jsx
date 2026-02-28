// AuthorRequestForm.jsx
import ButtonFill from "@/Button/ButtonFill";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const COOLDOWN_SECONDS = 60;

const AuthorRequestForm = () => {
  const { t } = useTranslation(['forms', 'common']);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    // Address
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressZip: "",
    addressCountry: "Bangladesh",
    // Author & work
    affiliation: "",
    title: "",
    typeOfWork: "Book",
    abstract: "",
    categoryType: "", // English | Bangla | Bilingual
    // Agreements
    rightsOriginal: false,
    rightsPublish: false,
    agreeEditorial: false,
    // Misc
    additionalRequests: "",
    signature: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ===== Email OTP verification state =====
  // const [emailVerified, setEmailVerified] = useState(true); // TEMP: disable verification requirement
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // cooldown timer
  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const emailLooksValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    [form.email]
  );

  const handleChange = useCallback((e) => {
    const { name, type, value, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    // TEMP: Commenting out email verification reset for testing
    // if (name === "email") {
    //   // editing email resets verification state
    //   setEmailVerified(false);
    //   setOtpSent(false);
    //   setOtpCode("");
    // }
  }, []);

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

  const validate = () => {
    const err = {};
    if (!form.fullName.trim()) err.fullName = "Full name is required.";
    if (!emailLooksValid) err.email = "Valid email required.";
    if (!form.phone.trim()) err.phone = "Phone number is required.";

    if (!form.title.trim()) err.title = "Manuscript title is required.";
    if (!form.abstract.trim()) err.abstract = "Abstract / summary is required.";
    if (!form.categoryType) err.categoryType = "Please select a language.";

    // Address checks
    if (!form.addressStreet.trim()) err.addressStreet = "Street is required.";
    if (!form.addressCity.trim()) err.addressCity = "City is required.";
    if (!form.addressState.trim())
      err.addressState = "State/Division is required.";
    if (!form.addressCountry.trim())
      err.addressCountry = "Country is required.";
    if (form.addressZip && form.addressZip.trim().length < 3)
      err.addressZip = "Post/ZIP code looks too short.";

    // Agreements
    if (!form.rightsOriginal)
      err.rightsOriginal = "You must confirm originality.";
    if (!form.rightsPublish)
      err.rightsPublish = "You must grant publishing permission.";
    if (!form.agreeEditorial)
      err.agreeEditorial = "You must agree to editorial guidelines.";

    // Require verified email (only if email format is ok)
    if (emailLooksValid && !emailVerified)
      err.emailVerified = "Please verify your email to continue.";
    return err;
  };

  // ===== OTP handlers =====
  const sendCode = async () => {
    if (!emailLooksValid || sending || cooldown > 0 || emailVerified) return;
    setSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/author-requests/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send code.");
      setOtpSent(true);
      setCooldown(COOLDOWN_SECONDS);
      toast.success("📧 Verification code sent to your email. (Check spam/junk if needed)");
      // Optional: show Ethereal preview link in dev
      if (data?.preview) {
        console.log("Ethereal preview:", data.preview);
      }
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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/author-requests/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: otpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data?.verified)
        throw new Error(data?.error || "Incorrect or expired code.");
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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/author-requests/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          address: composeAddress(),
          emailVerified: emailVerified,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        toast.success("✅ Submitted successfully!");
        setForm({
          fullName: "",
          email: "",
          phone: "",
          addressStreet: "",
          addressCity: "",
          addressState: "",
          addressZip: "",
          addressCountry: "Bangladesh",
          affiliation: "",
          title: "",
          typeOfWork: "Book",
          abstract: "",
          categoryType: "",
          rightsOriginal: false,
          rightsPublish: false,
          agreeEditorial: false,
          additionalRequests: "",
          signature: "",
          date: new Date().toISOString().slice(0, 10),
        });
        setErrors({});
        setEmailVerified(false);
        setOtpSent(false);
        setOtpCode("");
        setCooldown(0);
      } else {
        toast.error(data?.message || "❌ Submission failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Network error. Please retry.");
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
          <Link to="/author" className="hover:text-gray-800 transition-colors">
            {t('common:navbar.authors')}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('forms:authorRequest.pageTitle')}</span>
        </nav>
      </div>

      <div className="bg-white rounded-md shadow-lg p-6 md:p-8 max-w-3xl mx-auto my-10">
        <h1 className="text-3xl font-semibold mb-1 text-gray-800">
          {t('forms:authorRequest.pageTitle')}
        </h1>
        <p className="text-gray-600 mb-6">
          {t('forms:authorRequest.subtitle')}{" "}
          <span className="font-medium">{t('forms:authorRequest.submit')}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium">{t('forms:authorRequest.fullName')}</label>
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

          {/* Email + OTP */}
          <div>
            <label className="block text-sm font-medium">{t('forms:authorRequest.email')}</label>
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
                  <p className="text-green-700 text-sm mt-1">{t('forms:authorRequest.emailVerified')}</p>
                )}
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={
                    !emailLooksValid || emailVerified || sending || cooldown > 0
                  }
                  className={`w-full px-3 py-2 rounded-lg text-white font-medium shadow ${
                    !emailLooksValid || emailVerified || sending || cooldown > 0
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  aria-disabled={
                    !emailLooksValid || emailVerified || sending || cooldown > 0
                  }
                >
                  {sending
                    ? t('forms:authorRequest.sending')
                    : cooldown > 0
                    ? `${t('forms:authorRequest.resendIn')} ${cooldown}s`
                    : otpSent
                    ? t('forms:authorRequest.resendCode')
                    : t('forms:authorRequest.sendCode')}
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
                    className={`px-4 py-2 rounded-lg text-white font-medium shadow ${
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
            <label className="block text-sm font-medium">{t('forms:authorRequest.phone')}</label>
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

          {/* Address Group */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('forms:authorRequest.address')}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  name="addressStreet"
                  placeholder={t('forms:authorRequest.streetPlaceholder')}
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
                  placeholder={t('forms:authorRequest.cityPlaceholder')}
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
                  placeholder={t('forms:authorRequest.statePlaceholder')}
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
                  placeholder={t('forms:authorRequest.zipPlaceholder')}
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
                  placeholder={t('forms:authorRequest.countryPlaceholder')}
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

          {/* Affiliation */}
          <div>
            <label className="block text-sm font-medium">{t('forms:authorRequest.affiliation')}</label>
            <input
              name="affiliation"
              value={form.affiliation}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium">
              {t('forms:authorRequest.manuscriptTitle')}
            </label>
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

          {/* Type of Work */}
          <div>
            <label className="block text-sm font-medium">{t('forms:authorRequest.typeOfWork')}</label>
            <select
              name="typeOfWork"
              value={form.typeOfWork}
              onChange={handleChange}
              className={inputClass}
            >
              <option>{t('forms:authorRequest.typeBook')}</option>
              <option>{t('forms:authorRequest.typeResearch')}</option>
              <option>{t('forms:authorRequest.typeArticle')}</option>
              <option>{t('forms:authorRequest.typeOther')}</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium">{t('forms:authorRequest.language')}</label>
            <select
              name="categoryType"
              value={form.categoryType}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">{t('forms:authorRequest.selectLanguage')}</option>
              <option value="English">{t('forms:authorRequest.languageEnglish')}</option>
              <option value="Bangla">{t('forms:authorRequest.languageBangla')}</option>
              <option value="Bilingual">{t('forms:authorRequest.languageBilingual')}</option>
            </select>
            {errors.categoryType && (
              <p className="text-red-600 text-sm">{errors.categoryType}</p>
            )}
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-sm font-medium">
              {t('forms:authorRequest.abstractSummary')}
            </label>
            <textarea
              name="abstract"
              value={form.abstract}
              onChange={handleChange}
              className={inputClass}
              rows={4}
            />
            {errors.abstract && (
              <p className="text-red-600 text-sm">{errors.abstract}</p>
            )}
          </div>

          {/* Agreements */}
          <div className="space-y-2">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                name="rightsOriginal"
                checked={form.rightsOriginal}
                onChange={handleChange}
              />
              {t('forms:authorRequest.confirmOriginal')}
            </label>
            {errors.rightsOriginal && (
              <p className="text-red-600 text-sm">{errors.rightsOriginal}</p>
            )}

            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                name="rightsPublish"
                checked={form.rightsPublish}
                onChange={handleChange}
              />
              {t('forms:authorRequest.grantPermission')}
            </label>
            {errors.rightsPublish && (
              <p className="text-red-600 text-sm">{errors.rightsPublish}</p>
            )}

            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                name="agreeEditorial"
                checked={form.agreeEditorial}
                onChange={handleChange}
              />
              {t('forms:authorRequest.agreeGuidelines')}
            </label>
            {errors.agreeEditorial && (
              <p className="text-red-600 text-sm">{errors.agreeEditorial}</p>
            )}
          </div>

          {/* Additional Requests */}
          <div>
            <label className="block text-sm font-medium">
              {t('forms:authorRequest.additionalRequests')}
            </label>
            <textarea
              name="additionalRequests"
              value={form.additionalRequests}
              onChange={handleChange}
              className={inputClass}
              rows={3}
            />
          </div>

          {/* Signature & Date */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('forms:authorRequest.signature')}</label>
              <input
                name="signature"
                value={form.signature}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('forms:authorRequest.date')}</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

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
                ? t('forms:authorRequest.submitting')
                : emailVerified
                ? t('forms:authorRequest.submit')
                : t('forms:authorRequest.emailVerifyRequired')}
            </ButtonFill>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthorRequestForm;
