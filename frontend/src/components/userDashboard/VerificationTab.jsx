import React, { memo } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";

const VerificationTab = ({
  form,
  emailVerified,
  emailSending,
  emailOtpCooldown,
  emailOtpSent,
  emailCode,
  setEmailCode,
  emailVerifying,
  sendEmailOTP,
  verifyEmailOTP,
  phoneNumber,
  setPhoneNumber,
  phoneVerified,
  phoneSending,
  phoneOtpSent,
  phoneOtpCooldown,
  phoneCode,
  setPhoneCode,
  phoneVerifying,
  sendPhoneOTP,
  verifyPhoneOTP,
}) => {
  return (
    <div className="space-y-6" name="verification_tab">
      {/* Email Verification Section */}
      <div
        className="border border-gray-200/70 rounded-xl p-4 bg-white/90"
        name="email_verification_section"
      >
        <h3
          className="font-medium text-gray-800 mb-3"
          name="email_verification_title"
        >
          Email Verification
        </h3>

        <div className="flex flex-col gap-3" name="email_verification_content">
          <div
            className="flex items-center justify-between"
            name="email_display_row"
          >
            <span className="text-gray-900 text-sm truncate flex-1" name="email_value">
              {form.email}
            </span>

            {emailVerified && (
              <span
                name="email_verified_badge"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium shadow-sm ml-2"
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

          {!emailVerified && (
            <div className="flex flex-col sm:flex-row gap-2" name="email_otp_controls">
              <button
                name="btn_email_send_code"
                onClick={sendEmailOTP}
                disabled={emailSending || emailOtpCooldown > 0 || emailVerified}
                className={`px-3 py-2 rounded-lg text-white text-sm shadow-sm transition ${
                  emailSending || emailOtpCooldown > 0 || emailVerified
                    ? "bg-gray-300"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                }`}
              >
                {emailOtpCooldown > 0 ? `Resend in ${emailOtpCooldown}s` : "Send Code"}
              </button>

              {emailOtpSent && (
                <>
                  <input
                    name="email_otp_code"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="Enter code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60"
                  />
                  <button
                    name="btn_email_verify"
                    onClick={verifyEmailOTP}
                    disabled={emailVerifying || !emailCode || emailVerified}
                    className={`px-3 py-2 rounded-lg text-white text-sm shadow-sm transition ${
                      emailVerifying
                        ? "bg-gray-300"
                        : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500"
                    }`}
                  >
                    Verify
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Phone Verification Section */}
      <div
        className="border border-gray-200/70 rounded-xl p-4 bg-white/90"
        name="phone_verification_section"
      >
        <h3
          className="font-medium text-gray-800 mb-3"
          name="phone_verification_title"
        >
          Phone Verification
        </h3>

        <div className="flex flex-col gap-3" name="phone_verification_content">
          <div className="flex items-center justify-between" name="phone_input_row">
            <div
              name="phone_input_wrapper"
              className={`phone-input-custom border rounded-lg flex-1 min-w-0 ${
                phoneVerified ? "border-green-400" : "border-gray-300"
              }`}
            >
              <PhoneInput
                international
                defaultCountry="BD"
                name="verify_phone"
                value={phoneNumber}
                onChange={setPhoneNumber}
                className="px-2 py-1"
              />
            </div>

            {phoneVerified && (
              <span name="phone_verified_text" className="text-green-600 text-sm ml-2 whitespace-nowrap">
                Verified
              </span>
            )}
          </div>

          {!phoneVerified && (
            <div className="flex flex-col sm:flex-row gap-2" name="phone_otp_controls">
              <button
                name="btn_phone_send_code"
                onClick={sendPhoneOTP}
                disabled={phoneSending || phoneOtpCooldown > 0}
                className={`px-3 py-2 rounded-lg text-white text-sm shadow-sm transition ${
                  phoneSending || phoneOtpCooldown > 0
                    ? "bg-gray-300"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                }`}
              >
                {phoneOtpCooldown > 0 ? `Resend in ${phoneOtpCooldown}s` : "Send Code"}
              </button>

              {phoneOtpSent && (
                <>
                  <input
                    name="phone_otp_code"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    placeholder="Enter code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60"
                  />
                  <button
                    name="btn_phone_verify"
                    onClick={verifyPhoneOTP}
                    disabled={
                      phoneVerifying ||
                      !phoneCode ||
                      !isValidPhoneNumber(phoneNumber || "")
                    }
                    className={`px-3 py-2 rounded-lg text-white text-sm shadow-sm transition ${
                      phoneVerifying
                        ? "bg-gray-300"
                        : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500"
                    }`}
                  >
                    Verify
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(VerificationTab);
