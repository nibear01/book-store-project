import { toast } from "react-toastify";
import { isValidPhoneNumber } from "libphonenumber-js";

/**
 * Hook for password validation logic
 */
export const usePasswordValidation = (passwordForm) => {
  const validatePasswordForm = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      toast.error("Current password is required");
      return false;
    }
    if (!newPassword) {
      toast.error("New password is required");
      return false;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return false;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return false;
    }
    return true;
  };

  return { validatePasswordForm };
};

/**
 * Hook for OTP email operations
 */
export const useEmailOTP = ({
  baseUrl,
  form,
  emailVerified,
  setEmailSending,
  setEmailOtpSent,
  setEmailOtpCooldown, // renamed for clarity
  setEmailVerifying,
  setEmailVerified,
  updateUser,
  user,
  requestJson,
  emailCode,
}) => {
  const sendEmailOTP = async () => {
    try {
      if (emailVerified) {
        toast.info("Email already verified");
        return;
      }
      if (!form.email) throw new Error("Email is required");
      setEmailSending(true);
      await requestJson(`${baseUrl}/api/otp/send`, { email: form.email });
      setEmailOtpSent(true);
      setEmailOtpCooldown(60);
      toast.success("Verification code sent to your email");
    } catch (e) {
      toast.error(e.message || "Failed to send email code");
    } finally {
      setEmailSending(false);
    }
  };

  const verifyEmailOTP = async () => {
    try {
      if (emailVerified) {
        toast.info("Email already verified");
        return;
      }
      if (!emailCode?.trim()) throw new Error("Enter the email code");
      setEmailVerifying(true);
      await requestJson(`${baseUrl}/api/otp/verify`, {
        email: form.email,
        code: emailCode.trim(),
      });
      setEmailVerified(true);
      updateUser({ ...user, isVerified: true });
      toast.success("Email verified successfully! ✔");
    } catch (e) {
      toast.error(e.message || "Failed to verify email");
    } finally {
      setEmailVerifying(false);
    }
  };

  return { sendEmailOTP, verifyEmailOTP };
};

/**
 * Hook for OTP phone operations
 */
export const usePhoneOTP = ({
  baseUrl,
  phoneNumber,
  setPhoneSending,
  setPhoneOtpSent,
  setPhoneOtpCooldown, // renamed for clarity
  setPhoneVerifying,
  setPhoneVerified,
  requestJson,
  phoneCode,
}) => {
  const sendPhoneOTP = async () => {
    try {
      if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
        throw new Error("Enter a valid phone number");
      }
      setPhoneSending(true);
      await requestJson(`${baseUrl}/api/otp/send`, { phone: phoneNumber });
      setPhoneOtpSent(true);
      setPhoneOtpCooldown(60);
      toast.success("Verification code sent to your phone");
    } catch (e) {
      toast.error(e.message || "Failed to send phone code");
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
      toast.success("Phone verified successfully! ✔");
    } catch (e) {
      toast.error(e.message || "Failed to verify phone");
    } finally {
      setPhoneVerifying(false);
    }
  };

  return { sendPhoneOTP, verifyPhoneOTP };
};
