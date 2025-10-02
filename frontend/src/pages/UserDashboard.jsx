import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../api/user-api";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileFile, setProfileFile] = useState(null); // added
  const [preview, setPreview] = useState(null); // added
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "";

  // Email/Phone verification state
  const [emailCode, setEmailCode] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // helper to get correct profile image path from various shapes
  const getProfileImageUrl = useCallback(
    (u) => {
      const img = u?.profile_image ?? u?.data?.profile_image ?? null;
      return img ? `${baseUrl}${img}` : null;
    },
    [baseUrl]
  );

  useEffect(() => {
    if (user) {
      setForm({
        name: (user?.name ?? user?.data?.name) || "",
        email: (user?.email ?? user?.data?.email) || "",
        phone: (user?.phone ?? user?.data?.phone) || "",
        address: (user?.address ?? user?.data?.address) || "",
      });
      setPhoneNumber((user?.phone ?? user?.data?.phone) || "");
      // Initialize email verified state from server user
      const serverVerified =
        (user?.isVerified ?? user?.data?.isVerified) || false;
      setEmailVerified(!!serverVerified);
      // Handle profile image URL directly
      const img = user?.profile_image ?? user?.data?.profile_image ?? null;
      setPreview(img ? `${baseUrl}${img}` : null);
      setProfileFile(null);
    }
  }, [user, baseUrl]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    // Clear password errors when user starts typing
    if (passwordError) {
      setPasswordError("");
    }
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    setProfileFile(file || null);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(getProfileImageUrl(user));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      if (form.phone) fd.append("phone", form.phone);
      fd.append("address", form.address);
      if (profileFile) fd.append("profile_image", profileFile);

      const updated = await userAPI.updateProfileById(user._id, fd); // removed manual headers

      // Normalize response: axios => { data: { success, message, data: user } }
      const resData = updated?.data ?? updated;
      const updatedUser = resData?.data ?? resData;

      updateUser(updatedUser);
      setSuccess("Profile updated successfully.");
      setActiveTab("overview");
      setPreview(getProfileImageUrl(updatedUser));
      setProfileFile(null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const validatePasswordForm = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      setPasswordError("Current password is required");
      return false;
    }
    if (!newPassword) {
      setPasswordError("New password is required");
      return false;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return false;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return false;
    }
    return true;
  };

  const onSubmitPassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!validatePasswordForm()) {
      return;
    }

    setChangingPassword(true);
    try {
      // First verify current password by attempting login
      await userAPI.login({
        email: user.email,
        password: passwordForm.currentPassword,
      });

      // If login successful, update password
      await userAPI.updateProfileById(user._id, {
        password: passwordForm.newPassword,
      });

      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Clear success after delay
      setTimeout(() => {
        setPasswordSuccess("");
      }, 2000);
    } catch (err) {
      if (err.message.includes("Invalid email or password")) {
        setPasswordError("Current password is incorrect");
      } else {
        setPasswordError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to update password"
        );
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // NOTE: keep hooks above, then guard render for user below to satisfy Hooks rules

  // Shared OTP request helper
  const requestJson = async (endpoint, payload) => {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Request failed");
    return data;
  };

  // Cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setInterval(
      () => setOtpCooldown((s) => Math.max(0, s - 1)),
      1000
    );
    return () => clearInterval(t);
  }, [otpCooldown]);

  if (!user) {
    return null;
  }

  // Email OTP
  const sendEmailOTP = async () => {
    try {
      if (emailVerified) {
        setSuccess("Email already verified");
        return;
      }
      if (!form.email) throw new Error("Email is required");
      setEmailSending(true);
      await requestJson(`${baseUrl}/api/otp/send`, { email: form.email });
      setEmailOtpSent(true);
      setOtpCooldown(60);
    } catch (e) {
      setError(e.message || "Failed to send email code");
    } finally {
      setEmailSending(false);
    }
  };

  const verifyEmailOTP = async () => {
    try {
      if (emailVerified) {
        setSuccess("Email already verified");
        return;
      }
      if (!emailCode?.trim()) throw new Error("Enter the email code");
      setEmailVerifying(true);
      await requestJson(`${baseUrl}/api/otp/verify`, {
        email: form.email,
        code: emailCode.trim(),
      });
      setEmailVerified(true);
      // persist into auth context
      updateUser({ ...user, isVerified: true });
      setSuccess("Email verified ✔");
    } catch (e) {
      setError(e.message || "Failed to verify email");
    } finally {
      setEmailVerifying(false);
    }
  };

  // Phone OTP
  const sendPhoneOTP = async () => {
    try {
      if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
        throw new Error("Enter a valid phone number");
      }
      setPhoneSending(true);
      await requestJson(`${baseUrl}/api/otp/send`, { phone: phoneNumber });
      setPhoneOtpSent(true);
      setOtpCooldown(60);
    } catch (e) {
      setError(e.message || "Failed to send phone code");
    } finally {
      setPhoneSending(false);
    }
  };

  const verifyPhoneOTP = async () => {
    try {
      if (!phoneCode?.trim()) throw new Error("Enter the phone code");
      setPhoneVerifying(true);
      await requestJson(`${baseUrl}/api/otp/verify`, {
        phone: phoneNumber,
        code: phoneCode.trim(),
      });
      setPhoneVerified(true);
      setSuccess("Phone verified ✔");
    } catch (e) {
      setError(e.message || "Failed to verify phone");
    } finally {
      setPhoneVerifying(false);
    }
  };

  return (
    <div className="min-h-[80vh]">
      {/* Header */}
      <div className=" bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-6xl mx-auto px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-white/20 border border-white/40">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/80 text-sm">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold leading-tight">
                {form.name || user.name}
              </h1>
              <div className="text-white text-sm">{form.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 my-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Overview card */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">
                Account Overview
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center border-b pb-2 gap-2">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-900 flex items-center gap-2">
                    {form.email || "—"}
                    {emailVerified && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium"
                        title="Email is verified"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 1 0-1.414 1.414l2 2c.39.39 1.024.39 1.414 0l4-4Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-900">{form.phone || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Address</span>
                  <span
                    className="text-gray-900 max-w-[60%] text-right truncate"
                    title={form.address}
                  >
                    {form.address || "—"}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Tabs */}
          <section className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-1 border-b px-3">
                {[
                  { key: "overview", label: "Overview" },
                  { key: "profile", label: "Profile" },
                  { key: "verification", label: "Verification" },
                  { key: "security", label: "Security" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                      activeTab === t.key
                        ? "border-black text-black"
                        : "border-transparent text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Welcome back! Use the tabs to update your profile, verify
                      your email/phone, or change your password.
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium text-gray-800">Profile</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Name, email, phone, address, and profile photo.
                        </p>
                        <button
                          onClick={() => {
                            setActiveTab("profile");
                          }}
                          className="mt-3 px-3 py-2 rounded-md bg-black text-white text-sm hover:bg-gray-800"
                        >
                          Edit Profile
                        </button>
                      </div>
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium text-gray-800">
                          Verification
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Verify your email and phone number for account
                          security.
                        </p>
                        <button
                          onClick={() => setActiveTab("verification")}
                          className="mt-3 px-3 py-2 rounded-md bg-gray-100 text-sm hover:bg-gray-200"
                        >
                          Manage Verification
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "profile" && (
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 border">
                        {preview ? (
                          <img
                            src={preview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <span className="text-sm">No Image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Profile Picture
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onPickImage}
                          className="py-1 w-[calc(100%-7.5rem)] text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          PNG/JPG up to ~5MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={onChange}
                          className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={onChange}
                          className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700">
                          Phone
                        </label>
                        <div className="phone-input-custom border rounded-md border-gray-300">
                          <PhoneInput
                            international
                            defaultCountry="BD"
                            value={form.phone}
                            onChange={(v) =>
                              setForm((prev) => ({ ...prev, phone: v || "" }))
                            }
                            className="w-full p-1.5 focus:ring-1 focus:border-grey-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={form.address}
                          onChange={onChange}
                          className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-grey-500 focus:border-grey-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className={`px-4 py-2 rounded-[2px] text-white ${
                          saving
                            ? "bg-gray-600 mt-3 px-3 py-2 rounded-md text-sm"
                            : "mt-3 px-3 py-2 rounded-md bg-black text-white text-sm hover:bg-gray-800"
                        }`}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("overview");
                        }}
                        className="mt-3 px-3 py-2 rounded-md bg-white text-black text-sm border border-gray-300 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "verification" && (
                  <div className="space-y-6">
                    {/* Email verification */}
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium text-gray-800">
                        Email Verification
                      </h3>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-gray-900">{form.email}</span>
                        {!emailVerified ? (
                          <>
                            <button
                              onClick={sendEmailOTP}
                              disabled={
                                emailSending || otpCooldown > 0 || emailVerified
                              }
                              className={`px-3 py-1 rounded-lg text-white text-sm ${
                                emailSending || otpCooldown > 0 || emailVerified
                                  ? "bg-gray-300"
                                  : "bg-black hover:bg-gray-800"
                              }`}
                            >
                              {otpCooldown > 0
                                ? `Resend in ${otpCooldown}s`
                                : "Send Code"}
                            </button>
                            {emailOtpSent && (
                              <div className="flex items-center gap-2">
                                <input
                                  value={emailCode}
                                  onChange={(e) => setEmailCode(e.target.value)}
                                  placeholder="Enter code"
                                  className="p-2 border rounded-lg text-sm"
                                />
                                <button
                                  onClick={verifyEmailOTP}
                                  disabled={
                                    emailVerifying ||
                                    !emailCode ||
                                    emailVerified
                                  }
                                  className={`px-3 py-1 rounded-lg text-white text-sm ${
                                    emailVerifying
                                      ? "bg-gray-300"
                                      : "bg-black hover:bg-gray-800"
                                  }`}
                                >
                                  Verify
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium"
                            title="Email is verified"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 1 0-1.414 1.414l2 2c.39.39 1.024.39 1.414 0l4-4Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phone verification */}
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium text-gray-800">
                        Phone Verification
                      </h3>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <div
                          className={`phone-input-custom border rounded-lg ${
                            phoneVerified
                              ? "border-green-400"
                              : "border-gray-300"
                          }`}
                        >
                          <PhoneInput
                            international
                            defaultCountry="BD"
                            value={phoneNumber}
                            onChange={setPhoneNumber}
                            className="px-2 py-1"
                          />
                        </div>
                        {!phoneVerified ? (
                          <>
                            <button
                              onClick={sendPhoneOTP}
                              disabled={phoneSending || otpCooldown > 0}
                              className={`px-3 py-1 rounded-lg text-white text-sm ${
                                phoneSending || otpCooldown > 0
                                  ? "bg-gray-300"
                                  : "bg-black hover:bg-gray-800"
                              }`}
                            >
                              {otpCooldown > 0
                                ? `Resend in ${otpCooldown}s`
                                : "Send Code"}
                            </button>
                            {phoneOtpSent && (
                              <div className="flex items-center gap-2">
                                <input
                                  value={phoneCode}
                                  onChange={(e) => setPhoneCode(e.target.value)}
                                  placeholder="Enter code"
                                  className="p-2 border rounded-lg text-sm"
                                />
                                <button
                                  onClick={verifyPhoneOTP}
                                  disabled={
                                    phoneVerifying ||
                                    !phoneCode ||
                                    !isValidPhoneNumber(phoneNumber || "")
                                  }
                                  className={`px-3 py-1 rounded-lg text-white text-sm ${
                                    phoneVerifying
                                      ? "bg-gray-300"
                                      : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                                  }`}
                                >
                                  Verify
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-green-600 text-sm">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <form onSubmit={onSubmitPassword} className="space-y-4">
                    {passwordError && (
                      <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {passwordSuccess}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Current Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={onPasswordChange}
                        className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        placeholder="Enter your current password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={onPasswordChange}
                        className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        placeholder="Enter your new password"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Confirm New Password{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={onPasswordChange}
                        className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        placeholder="Confirm your new password"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className={`p-2 rounded-md text-sm text-white ${
                          changingPassword
                            ? "bg-gray-400"
                            : "bg-black hover:bg-gray-800 "
                        }`}
                      >
                        {changingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Global messages */}
        {(error || success) && (
          <div className="mt-4">
            {error && (
              <div className="mb-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
