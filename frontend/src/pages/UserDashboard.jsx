import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  startTransition,
} from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../api/user-api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import ProfileHeader from "../components/userDashboard/ProfileHeader";
import AccountOverview from "../components/userDashboard/AccountOverview";
import DashboardTabs from "../components/userDashboard/DashboardTabs";
import OverviewTab from "../components/userDashboard/OverviewTab";
// Lazy-load heavier tabs to improve initial load and scrolling performance
const ProfileTab = lazy(() => import("../components/userDashboard/ProfileTab"));
const VerificationTab = lazy(() =>
  import("../components/userDashboard/VerificationTab")
);
const SecurityTab = lazy(() =>
  import("../components/userDashboard/SecurityTab")
);

import {
  ProfileTabSkeleton,
  VerificationTabSkeleton,
  SecurityTabSkeleton,
} from "../components/userDashboard/Skeletons";

import {
  requestJson,
  getProfileImageUrl,
} from "../components/userDashboard/userDashboardAPI";
import {
  usePasswordValidation,
  useEmailOTP,
  usePhoneOTP,
} from "../components/userDashboard/userDashboardHooks";

const UserDashboard = () => {
  const { t } = useTranslation('common');
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
  const [profileFile, setProfileFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "";

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
  // Separate cooldowns for email and phone
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0);
  const [phoneOtpCooldown, setPhoneOtpCooldown] = useState(0);

  // Revoke preview object URLs to avoid memory leaks
  useEffect(() => {
    if (!preview || !preview.startsWith("blob:")) return;
    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (user) {
      setForm({
        name: (user?.name ?? user?.data?.name) || "",
        email: (user?.email ?? user?.data?.email) || "",
        phone: (user?.phone ?? user?.data?.phone) || "",
        address: (user?.address ?? user?.data?.address) || "",
      });
      setPhoneNumber((user?.phone ?? user?.data?.phone) || "");
      const serverVerified =
        (user?.isVerified ?? user?.data?.isVerified) || false;
      setEmailVerified(!!serverVerified);
      const img = user?.profile_image ?? user?.data?.profile_image ?? null;
      setPreview(img ? `${baseUrl}${img}` : null);
      setProfileFile(null);
    }
  }, [user, baseUrl]);

  // Cooldown timers (separate for email and phone)
  useEffect(() => {
    if (activeTab !== "verification" || emailOtpCooldown <= 0) return;
    const t = setInterval(
      () =>
        startTransition(() => setEmailOtpCooldown((s) => Math.max(0, s - 1))),
      1000
    );
    return () => clearInterval(t);
  }, [activeTab, emailOtpCooldown]);

  useEffect(() => {
    if (activeTab !== "verification" || phoneOtpCooldown <= 0) return;
    const t = setInterval(
      () =>
        startTransition(() => setPhoneOtpCooldown((s) => Math.max(0, s - 1))),
      1000
    );
    return () => clearInterval(t);
  }, [activeTab, phoneOtpCooldown]);

  // Handlers
  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onPasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onPickImage = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      setProfileFile(file || null);
      if (file) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(getProfileImageUrl(user, baseUrl));
      }
    },
    [user, baseUrl]
  );

  // Profile submission
  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("email", form.email);
        if (form.phone) fd.append("phone", form.phone);
        fd.append("address", form.address);
        if (profileFile) fd.append("profile_image", profileFile);

        const updated = await userAPI.updateProfileById(user._id, fd);
        const resData = updated?.data ?? updated;
        const updatedUser = resData?.data ?? resData;

        updateUser(updatedUser);
        toast.success(t('userDashboard.profileUpdated'));
        setActiveTab("overview");
        setPreview(getProfileImageUrl(updatedUser, baseUrl));
        setProfileFile(null);
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            err.message ||
            t('userDashboard.failedToUpdate')
        );
      } finally {
        setSaving(false);
      }
    },
    [
      form.name,
      form.email,
      form.phone,
      form.address,
      profileFile,
      user?._id,
      updateUser,
      baseUrl,
      t,
    ]
  );

  // Password validation and submission
  const { validatePasswordForm } = usePasswordValidation(passwordForm);

  const onSubmitPassword = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validatePasswordForm()) return;

      setChangingPassword(true);
      try {
        await userAPI.login({
          email: user.email,
          password: passwordForm.currentPassword,
        });

        await userAPI.updateProfileById(user._id, {
          password: passwordForm.newPassword,
        });

        toast.success(t('userDashboard.passwordUpdated'));
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (err) {
        if (err.message.includes("Invalid email or password")) {
          toast.error(t('userDashboard.currentPasswordIncorrect'));
        } else {
          toast.error(
            err?.response?.data?.message ||
              err.message ||
              t('userDashboard.failedToUpdatePassword')
          );
        }
      } finally {
        setChangingPassword(false);
      }
    },
    [
      validatePasswordForm,
      user?.email,
      user?._id,
      passwordForm.currentPassword,
      passwordForm.newPassword,
      t,
    ]
  );

  // Email OTP operations
  const { sendEmailOTP, verifyEmailOTP } = useEmailOTP({
    baseUrl,
    form,
    emailVerified,
    setEmailSending,
    setEmailOtpSent,
    setEmailOtpCooldown,
    setEmailVerifying,
    setEmailVerified,
    updateUser,
    user,
    requestJson,
    emailCode,
  });

  // Phone OTP operations
  const { sendPhoneOTP, verifyPhoneOTP } = usePhoneOTP({
    baseUrl,
    phoneNumber,
    setPhoneSending,
    setPhoneOtpSent,
    setPhoneOtpCooldown,
    setPhoneVerifying,
    setPhoneVerified,
    requestJson,
    phoneCode,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader
        preview={preview}
        name={form.name || user.name}
        email={form.email}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="lg:col-span-1">
            <AccountOverview form={form} emailVerified={emailVerified} />
          </aside>

          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <DashboardTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              <div className="p-5">
                {activeTab === "overview" && (
                  <div
                    id="panel_overview"
                    role="tabpanel"
                    aria-labelledby="tab_overview"
                  >
                    <OverviewTab setActiveTab={setActiveTab} />
                  </div>
                )}

                {activeTab === "profile" && (
                  <div
                    id="panel_profile"
                    role="tabpanel"
                    aria-labelledby="tab_profile"
                  >
                    <Suspense fallback={<ProfileTabSkeleton />}>
                      <ProfileTab
                        form={form}
                        setForm={setForm}
                        preview={preview}
                        saving={saving}
                        onSubmit={onSubmit}
                        onChange={onChange}
                        onPickImage={onPickImage}
                        setActiveTab={setActiveTab}
                      />
                    </Suspense>
                  </div>
                )}

                {activeTab === "verification" && (
                  <div
                    id="panel_verification"
                    role="tabpanel"
                    aria-labelledby="tab_verification"
                  >
                    <Suspense fallback={<VerificationTabSkeleton />}>
                      <VerificationTab
                        form={form}
                        emailVerified={emailVerified}
                        emailSending={emailSending}
                        emailOtpCooldown={emailOtpCooldown}
                        emailOtpSent={emailOtpSent}
                        emailCode={emailCode}
                        setEmailCode={setEmailCode}
                        emailVerifying={emailVerifying}
                        sendEmailOTP={sendEmailOTP}
                        verifyEmailOTP={verifyEmailOTP}
                        phoneNumber={phoneNumber}
                        setPhoneNumber={setPhoneNumber}
                        phoneVerified={phoneVerified}
                        phoneSending={phoneSending}
                        phoneOtpSent={phoneOtpSent}
                        phoneOtpCooldown={phoneOtpCooldown}
                        phoneCode={phoneCode}
                        setPhoneCode={setPhoneCode}
                        phoneVerifying={phoneVerifying}
                        sendPhoneOTP={sendPhoneOTP}
                        verifyPhoneOTP={verifyPhoneOTP}
                      />
                    </Suspense>
                  </div>
                )}

                {activeTab === "security" && (
                  <div
                    id="panel_security"
                    role="tabpanel"
                    aria-labelledby="tab_security"
                  >
                    <Suspense fallback={<SecurityTabSkeleton />}>
                      <SecurityTab
                        passwordForm={passwordForm}
                        onPasswordChange={onPasswordChange}
                        onSubmitPassword={onSubmitPassword}
                        changingPassword={changingPassword}
                      />
                    </Suspense>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
