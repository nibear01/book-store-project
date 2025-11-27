/* eslint-disable no-unused-vars */
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const Settings = () => {
  const { login, user } = useAuth();

  // Admin profile
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatarFile: null,
    avatarPreview: "",
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password
  const [pwd, setPwd] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [pwdMsg, setPwdMsg] = useState(null);

  // Platform settings
  const [platform, setPlatform] = useState({
    siteName: "",
    logoFile: null,
    logoPreview: "",
    socials: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
      linkedin: "",
    },
  });
  const [platformMsg, setPlatformMsg] = useState(null);
  const [savingPlatform, setSavingPlatform] = useState(false);

  // Global price range settings fetched from backend settings API
  const [priceRangeSetting, setPriceRangeSetting] = useState({
    min: 0,
    max: 1500,
  });
  const [priceRangeMsg, setPriceRangeMsg] = useState(null);
  const [savingPriceRange, setSavingPriceRange] = useState(false);

  // Favicon (admin can change favicon)
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState("");
  const [faviconMsg, setFaviconMsg] = useState(null);

  const emailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const onAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProfile((p) => ({
      ...p,
      avatarFile: f,
      avatarPreview: URL.createObjectURL(f),
    }));
  };

  const onFaviconChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFaviconFile(f);
    setFaviconPreview(URL.createObjectURL(f));
  };

  const onLogoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPlatform((p) => ({
      ...p,
      logoFile: f,
      logoPreview: URL.createObjectURL(f),
    }));
  };

  // Combined submit: update name/email/avatar and optionally change password.
  // Sends multipart/form-data to PUT /api/users/:id which the backend `updateUser` supports.
  // If a favicon file is chosen, it will be uploaded to POST /api/admin/favicon (assumed endpoint)
  const submitChanges = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setPwdMsg(null);
    setFaviconMsg(null);

    // Basic validations
    if (!profile.name.trim())
      return setProfileMsg({ type: "error", text: "Name is required." });
    if (!emailValid(profile.email))
      return setProfileMsg({ type: "error", text: "Enter a valid email." });

    // If user provided new password fields, validate them
    const wantsPwdChange = pwd.next || pwd.confirm || pwd.current;
    if (wantsPwdChange) {
      if (!pwd.current)
        return setPwdMsg({
          type: "error",
          text: "Current password is required to change password.",
        });
      if (pwd.next.length < 8)
        return setPwdMsg({
          type: "error",
          text: "New password must be at least 8 characters.",
        });
      if (pwd.next !== pwd.confirm)
        return setPwdMsg({ type: "error", text: "Passwords do not match." });
    }

    setSavingProfile(true);
    try {
      if (!user || !user._id) {
        throw new Error("No authenticated user found");
      }
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("name", profile.name);
      fd.append("email", profile.email);
      // If avatar chosen
      if (profile.avatarFile) fd.append("avatar", profile.avatarFile);

      // If password change requested, send the new password (backend currently stores plain)
      if (wantsPwdChange) {
        // We'll include current password for backend checks if implemented
        fd.append("currentPassword", pwd.current);
        fd.append("password", pwd.next);
      }

      const res = await fetch(`/api/users/${user?._id}`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to update user");
      }

      setProfileMsg({
        type: "success",
        text: data.message || "Profile updated.",
      });
      toast.success(data.message || "Profile updated.");
      // If backend returned a new token or updated user, persist and refresh auth context
      try {
        if (data.token) localStorage.setItem("token", data.token);
        // attempt to update auth context; signature of login may vary so wrap in try/catch
        if (typeof login === "function") {
          try {
            // prefer returned user payload
            const returnedUser = data.data || data.user || null;
            login(data.token || localStorage.getItem("token"), returnedUser);
          } catch (ee) {
            // ignore errors from login invocation
          }
        }
      } catch (e) {
        // ignore storage errors
      }
      // reset password fields on success
      setPwd({ current: "", next: "", confirm: "" });

      // If favicon chosen, upload it separately
      if (faviconFile) {
        try {
          const fd2 = new FormData();
          fd2.append("favicon", faviconFile);
          const res2 = await fetch(`/api/admin/favicon`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd2,
          });
          const d2 = await res2.json();
          if (!res2.ok || !d2.success)
            throw new Error(d2?.message || "Failed to upload favicon");

          // Update favicon in the document immediately. d2.url is assumed to be public path.
          const url = d2.url || (d2.data && d2.data.url) || faviconPreview;
          const link =
            document.querySelector("link[rel~='icon']") ||
            document.createElement("link");
          link.rel = "icon";
          link.href = url;
          if (!document.querySelector("link[rel~='icon']"))
            document.getElementsByTagName("head")[0].appendChild(link);

          setFaviconMsg({ type: "success", text: "Favicon uploaded." });
          toast.success("Favicon uploaded.");
        } catch (e) {
          setFaviconMsg({ type: "error", text: e.message });
          toast.error(e.message || "Failed to upload favicon");
        }
      }
    } catch (e) {
      setProfileMsg({ type: "error", text: e.message });
      toast.error(e.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // submitPassword is no longer used separately; handled in submitChanges

  const submitPlatform = async (e) => {
    e.preventDefault();
    setPlatformMsg(null);
    if (!platform.siteName.trim())
      return setPlatformMsg({ type: "error", text: "Site name is required." });
    setSavingPlatform(true);
    try {
      const token = localStorage.getItem("token");
      // 1) Upload logo if provided
      if (platform.logoFile) {
        const fd = new FormData();
        fd.append("logo", platform.logoFile);
        const r = await fetch("/api/admin/logo", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        const jr = await r.json();
        if (!r.ok || !jr.success)
          throw new Error(jr?.message || "Failed to upload logo");
      }

      // 2) Upload favicon if provided
      if (faviconFile) {
        const fd2 = new FormData();
        fd2.append("favicon", faviconFile);
        const r2 = await fetch("/api/admin/favicon", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd2,
        });
        const jr2 = await r2.json();
        if (!r2.ok || !jr2.success)
          throw new Error(jr2?.message || "Failed to upload favicon");
        // set document favicon immediately
        const url = jr2.url || (jr2.data && jr2.data.url) || faviconPreview;
        const link =
          document.querySelector("link[rel~='icon']") ||
          document.createElement("link");
        link.rel = "icon";
        link.href = url;
        if (!document.querySelector("link[rel~='icon']"))
          document.getElementsByTagName("head")[0].appendChild(link);
      }

      // 3) Save site settings (siteName + socials) - optional backend endpoint
      try {
        const res = await fetch("/api/admin/platform", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            siteName: platform.siteName,
            socials: platform.socials,
          }),
        });
        const jd = await res.json();
        if (!res.ok || !jd.success)
          throw new Error(jd?.message || "Failed to save platform settings");
      } catch (e) {
        // Not fatal if platform endpoint missing; continue
        console.warn("Platform settings save skipped or failed:", e.message);
      }

      setPlatformMsg({ type: "success", text: "Platform settings saved." });
      toast.success("Platform settings saved.");
    } catch (e) {
      setPlatformMsg({
        type: "error",
        text: e.message || "Failed to save platform settings.",
      });
      toast.error(e.message || "Failed to save platform settings.");
    } finally {
      setSavingPlatform(false);
    }
  };

  // Load current price range from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings/price-range");
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setPriceRangeSetting({
            min: Number(data.data.min) || 0,
            max: Number(data.data.max) || 1500,
          });
        } else {
          const msg = data.message || "Failed to fetch price range";
          setPriceRangeMsg({ type: "error", text: msg });
          toast.error(msg);
        }
      } catch (e) {
        const msg = e.message || "Failed to fetch price range";
        setPriceRangeMsg({ type: "error", text: msg });
        toast.error(msg);
      }
    })();
  }, []);

  const savePriceRange = async (e) => {
    e.preventDefault();
    setPriceRangeMsg(null);
    setSavingPriceRange(true);
    try {
      const token = localStorage.getItem("token");
      const body = JSON.stringify({
        min: priceRangeSetting.min,
        max: priceRangeSetting.max,
      });
      const res = await fetch("/api/settings/price-range", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to update price range");
      setPriceRangeSetting({ min: data.data.min, max: data.data.max });
      setPriceRangeMsg({ type: "success", text: "Price range updated." });
      toast.success("Price range updated.");
      try {
        // Notify other tabs/pages to refresh settings
        localStorage.setItem("settings:priceRangeUpdated", String(Date.now()));
      } catch (err) {
        // ignore storage errors
      }
    } catch (e) {
      setPriceRangeMsg({ type: "error", text: e.message });
      toast.error(e.message || "Failed to update price range");
    } finally {
      setSavingPriceRange(false);
    }
  };

  const Msg = ({ msg }) =>
    msg ? (
      <p
        className={`${
          msg.type === "error" ? "text-red-600" : "text-green-600"
        } text-sm mt-2 md:mt-0`}
      >
        {msg.text}
      </p>
    ) : null;

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 md:space-y-10">
      {/* Admin Profile + Password + Avatar + Favicon (single save) */}
      <section className="bg-white rounded-md border p-3 sm:p-4 md:p-6 space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Admin Settings</h2>
        <form onSubmit={submitChanges} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                name="name"
                className="border border-gray-300 rounded-[2px] p-2 sm:p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                value={profile.name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Admin Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                name="email"
                type="email"
                className="border border-gray-300 rounded-[2px] p-2 sm:p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                value={profile.email}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-1">
              <label className="block text-sm mb-1">Current Password</label>
              <input
                type="password"
                className="border border-gray-300 rounded-[2px] p-2 sm:p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                value={pwd.current}
                onChange={(e) =>
                  setPwd((p) => ({ ...p, current: e.target.value }))
                }
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">New Password</label>
              <input
                type="password"
                className="border border-gray-300 rounded-[2px] p-2 sm:p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                value={pwd.next}
                onChange={(e) =>
                  setPwd((p) => ({ ...p, next: e.target.value }))
                }
                placeholder="At least 8 chars"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Confirm Password</label>
              <input
                type="password"
                className="border border-gray-300 rounded-[2px] p-2 sm:p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                value={pwd.confirm}
                onChange={(e) =>
                  setPwd((p) => ({ ...p, confirm: e.target.value }))
                }
                placeholder="Repeat new password"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-[2px] hover:bg-gray-800 transition w-full sm:w-auto text-center"
              disabled={savingProfile}
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
            {/* <Msg msg={profileMsg} />
            <Msg msg={pwdMsg} />
            <Msg msg={faviconMsg} /> */}
          </div>
        </form>
      </section>

      {/* Platform Settings */}
      <section className="bg-white rounded-md border p-3 sm:p-4 md:p-6 space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Platform Settings</h2>
        <form
          onSubmit={submitPlatform}
          className="space-y-4"
          encType="multipart/form-data"
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
            <div>
              <label className="block text-sm mb-1">Site Name</label>
              <input
                name="siteName"
                className="border border-gray-300 rounded-[2px] p-2 sm:p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                value={platform.siteName}
                onChange={(e) =>
                  setPlatform((p) => ({ ...p, siteName: e.target.value }))
                }
                placeholder="Book Store"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-20 sm:w-24 h-10 sm:h-12 border rounded bg-white flex items-center justify-center overflow-hidden mx-auto sm:mx-0">
                {platform.logoPreview ? (
                  <img
                    src={platform.logoPreview}
                    alt="Logo preview"
                    className="max-h-full"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No Logo</span>
                )}
              </div>
              <label className="cursor-pointer inline-block text-center sm:text-left">
                <span className="px-3 py-2 border rounded-md text-sm block">
                  Upload Logo
                </span>
                <input
                  name="logo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onLogoChange}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
            <div>
              <label className="block text-sm mb-1">Favicon</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border rounded overflow-hidden flex items-center justify-center bg-white">
                  {faviconPreview ? (
                    <img
                      src={faviconPreview}
                      alt="favicon"
                      className="max-h-full"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No Favicon</span>
                  )}
                </div>
                <label className="cursor-pointer inline-block text-center">
                  <span className="px-3 py-2 border rounded-md text-sm block">
                    Upload Favicon
                  </span>
                  <input
                    name="favicon"
                    type="file"
                    accept="image/x-icon,image/png,image/svg+xml"
                    className="hidden"
                    onChange={onFaviconChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-[2px] hover:bg-gray-800 transition w-full sm:w-auto text-center"
              disabled={savingPlatform}
            >
              {savingPlatform ? "Saving..." : "Save Settings"}
            </button>
            {/* <Msg msg={platformMsg} /> */}
          </div>
        </form>
      </section>

      {/* Global Price Range Settings */}
      <section className="bg-white rounded-md border p-3 sm:p-4 md:p-6 space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Global Price Range</h2>
        <p className="text-sm text-gray-600">
          This controls the min/max limits users can select on the categories
          page price filter.
        </p>
        <form onSubmit={savePriceRange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="price-min">
                Minimum Price (BDT)
              </label>
              <input
                id="price-min"
                type="number"
                min={0}
                value={priceRangeSetting.min}
                onChange={(e) =>
                  setPriceRangeSetting((p) => ({
                    ...p,
                    min: Number(e.target.value),
                  }))
                }
                className="border border-gray-300 rounded-[2px] p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="price-max">
                Maximum Price (BDT)
              </label>
              <input
                id="price-max"
                type="number"
                min={priceRangeSetting.min}
                value={priceRangeSetting.max}
                onChange={(e) =>
                  setPriceRangeSetting((p) => ({
                    ...p,
                    max: Number(e.target.value),
                  }))
                }
                className="border border-gray-300 rounded-[2px] p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
                required
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-[2px] hover:bg-gray-800 transition w-full sm:w-auto text-center"
              disabled={savingPriceRange}
            >
              {savingPriceRange ? "Saving..." : "Save Price Range"}
            </button>
            {/* <Msg msg={priceRangeMsg} /> */}
          </div>
        </form>
      </section>
    </div>
  );
};

export default Settings;
