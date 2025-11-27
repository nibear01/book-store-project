import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const ProfileSettings = () => {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [pwd, setPwd] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [savingProfile, setSavingProfile] = useState(false);

  const emailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submitChanges = async (e) => {
    e.preventDefault();

    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!emailValid(profile.email)) {
      toast.error("Invalid email");
      return;
    }

    const wantsPwdChange = pwd.next || pwd.confirm || pwd.current;
    if (wantsPwdChange) {
      if (!pwd.current) {
        toast.error("Current password required");
        return;
      }
      if (!pwd.next || pwd.next.length < 8) {
        toast.error("New password must be at least 8 characters");
        return;
      }
      if (pwd.next !== pwd.confirm) {
        toast.error("New passwords do not match");
        return;
      }
    }

    setSavingProfile(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: profile.name,
        email: profile.email,
      };

      if (wantsPwdChange) {
        payload.currentPassword = pwd.current;
        payload.password = pwd.next;
      }

      const userRes = await fetch("/api/settings/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const userData = await userRes.json();
      if (!userRes.ok) {
        // Show detailed error message from server
        const errorMsg = userData.message || "Failed to update profile";
        toast.error(`Error: ${errorMsg}`, { autoClose: 5000 });
        console.error("Profile update error:", {
          status: userRes.status,
          statusText: userRes.statusText,
          message: userData.message,
          error: userData.error,
          fullResponse: userData,
        });
        return;
      }

      if (userData.success && userData.data) {
        login(userData.data);
        toast.success("Profile updated successfully!");

        // Clear password fields
        setPwd({ current: "", next: "", confirm: "" });
      } else {
        toast.error("Update failed: Invalid response from server");
        console.error("Invalid response:", userData);
      }
    } catch (e) {
      toast.error(`Failed to save changes: ${e.message}`, { autoClose: 5000 });
      console.error("Profile update exception:", e);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex-col sm:items-center sm:justify-between gap-3 mb-2 sm:mb-3">
        <h1 className="text-xl sm:text-xl font-bold">Profile Settings</h1>
        <p className="text-gray-600 text-sm">
          Manage your profile information and password
        </p>
      </div>

      <section className="bg-white rounded-md border p-3 sm:p-4 md:p-6 space-y-4">
        <form onSubmit={submitChanges} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                name="name"
                className="border border-gray-300 rounded-md p-1 sm:p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
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
                className="border border-gray-300 rounded-md p-1 sm:p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
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
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  className="border border-gray-300 rounded-md p-1 sm:p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
                  value={pwd.current}
                  onChange={(e) =>
                    setPwd((p) => ({ ...p, current: e.target.value }))
                  }
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((p) => ({ ...p, current: !p.current }))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword.current ? (
                    <VisibilityOff className="w-5 h-5" />
                  ) : (
                    <Visibility className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword.next ? "text" : "password"}
                  className="border border-gray-300 rounded-md p-1 sm:p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
                  value={pwd.next}
                  onChange={(e) =>
                    setPwd((p) => ({ ...p, next: e.target.value }))
                  }
                  placeholder="At least 8 chars"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((p) => ({ ...p, next: !p.next }))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword.next ? (
                    <VisibilityOff className="w-5 h-5" />
                  ) : (
                    <Visibility className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  className="border border-gray-300 rounded-md p-1 sm:p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
                  value={pwd.confirm}
                  onChange={(e) =>
                    setPwd((p) => ({ ...p, confirm: e.target.value }))
                  }
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((p) => ({ ...p, confirm: !p.confirm }))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword.confirm ? (
                    <VisibilityOff className="w-5 h-5" />
                  ) : (
                    <Visibility className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer bg-black text-white px-4 sm:px-6 py-2 sm:py-2 rounded-md hover:bg-gray-800 transition w-full sm:w-auto text-center"
              disabled={savingProfile}
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ProfileSettings;
