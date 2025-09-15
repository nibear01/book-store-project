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

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const updated = await userAPI.updateProfileById(user._id, {
        name: form.name,
        email: form.email,
        address: form.address,
      });
      updateUser(updated.data);
      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
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
        <form
          onSubmit={onSubmit}
          className="bg-white border border-gray-200 rounded-[2px] p-4 space-y-4"
        >
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
