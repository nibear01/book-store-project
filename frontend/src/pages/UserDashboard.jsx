import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../api/user-api";

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileFile, setProfileFile] = useState(null); // added
  const [preview, setPreview] = useState(null); // added
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "";

  // helper to get correct profile image path from various shapes
  const getProfileImageUrl = (u) => {
    const img = u?.profile_image ?? u?.data?.profile_image ?? null;
    return img ? `${baseUrl}${img}` : null;
  };

  useEffect(() => {
    if (user) {
      setForm({
        name: (user?.name ?? user?.data?.name) || "",
        email: (user?.email ?? user?.data?.email) || "",
        address: (user?.address ?? user?.data?.address) || "",
      });
      setPreview(getProfileImageUrl(user));
      setProfileFile(null);
    }
  }, [user, baseUrl]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    setProfileFile(file || null);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(user?.profile_image ? `${baseUrl}${user.profile_image}` : null);
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
      fd.append("address", form.address);
      if (profileFile) fd.append("profile_image", profileFile);

      const updated = await userAPI.updateProfileById(user._id, fd); // removed manual headers

      // Normalize response: axios => { data: { success, message, data: user } }
      const resData = updated?.data ?? updated;
      const updatedUser = resData?.data ?? resData;

      updateUser(updatedUser);
      setSuccess("Profile updated successfully.");
      setIsEditing(false);
      setPreview(getProfileImageUrl(updatedUser));
      setProfileFile(null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {!isEditing ? (
        <div className="bg-white border border-gray-200 rounded-[2px] p-4 space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 border">
              {preview ? (
                <img src={preview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <span className="text-sm">No Image</span>
                </div>
              )}
            </div>
            <div>
              <span className="text-sm text-gray-600">Profile Picture</span>
              <p className="text-gray-900">{preview ? "Set" : "Not set"}</p>
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Name</span>
            <p className="text-gray-900">{user.name}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Email</span>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Address</span>
            <p className="text-gray-900">{user.address || "—"}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-2 inline-flex items-center px-4 py-2 bg-black text-white rounded-[2px] hover:bg-gray-800"
          >
            Edit Information
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-[2px] p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 border">
              {preview ? (
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <span className="text-sm">No Image</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={onPickImage}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-[2px] cursor-pointer focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">PNG/JPG up to ~5MB.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full p-3 border border-gray-300 rounded-[2px] focus:ring-2 focus:ring-grey-500 focus:border-grey-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className="w-full p-3 border border-gray-300 rounded-[2px] focus:ring-2 focus:ring-grey-500 focus:border-grey-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={onChange}
              className="w-full p-3 border border-gray-300 rounded-[2px] focus:ring-2 focus:ring-grey-500 focus:border-grey-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 rounded-[2px] text-white ${
                saving ? "bg-gray-400" : "bg-black hover:bg-gray-800"
              }`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-[2px] border border-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserDashboard;
