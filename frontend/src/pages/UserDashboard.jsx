import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../api/user-api";
import { getUserOrders } from "../api/order-api";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, updateUser, activeRole, switchRole } = useAuth();
  const roles = (user?.roles && user.roles.length
    ? user.roles
    : user?.role
    ? [user.role]
    : ["user"]) || ["user"];
  const [selectedRole, setSelectedRole] = useState(activeRole || roles[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileFile, setProfileFile] = useState(null); // added
  const [preview, setPreview] = useState(null); // added
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "";

  // helper to get correct profile image path from various shapes
  const getProfileImageUrl = useCallback(
    (u) => {
      const img = u?.profile_image ?? u?.data?.profile_image ?? null;
      return img ? `${baseUrl}${img}` : null;
    },
    [baseUrl]
  );

  const fetchRecentOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await getUserOrders();
      console.log("Orders data:", data); // Debug log
      if (data.success) {
        // Get the 3 most recent orders
        setRecentOrders((data.data || []).slice(0, 3));
      } else {
        console.log("Orders fetch failed:", data.message);
        setRecentOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch recent orders:", err);
      setRecentOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("UserDashboard useEffect triggered, user:", user); // Debug log
    if (user) {
      setForm({
        name: (user?.name ?? user?.data?.name) || "",
        email: (user?.email ?? user?.data?.email) || "",
        address: (user?.address ?? user?.data?.address) || "",
      });
      // Handle profile image URL directly
      const img = user?.profile_image ?? user?.data?.profile_image ?? null;
      setPreview(img ? `${baseUrl}${img}` : null);
      setProfileFile(null);
      fetchRecentOrders();
    }
  }, [user, fetchRecentOrders, baseUrl]);

  // Keep local selection in sync with activeRole
  useEffect(() => {
    if (activeRole) setSelectedRole(activeRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRole]);

  const onSwitchRole = () => {
    const ok = switchRole(selectedRole);
    if (!ok) return;
    // Navigate to relevant area based on active role
    if (selectedRole === "admin") navigate("/admin/dashboard");
    else if (selectedRole === "book_manager") navigate("/admin/books");
    else if (selectedRole === "order_manager") navigate("/admin/orders");
    else navigate("/");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-red-100 text-red-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

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

  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    setProfileFile(file || null);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(
        user?.profile_image ? `${baseUrl}${user.profile_image}` : null
      );
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
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
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

      // Close modal after successful password update
      setTimeout(() => {
        setShowPasswordModal(false);
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
                <img
                  src={preview}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
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
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-[2px] hover:bg-gray-800"
            >
              Edit Information
            </button>
            <button
              onClick={openPasswordModal}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-[2px] hover:bg-red-700"
            >
              Change Password
            </button>
          </div>
          {/* Role Switcher */}
          {roles.length > 1 && (
            <div className="mt-4 p-3 border border-gray-200 rounded-[2px] bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1">
                  <span className="block text-sm text-gray-600">
                    Active Role
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="border p-2 rounded-[2px]"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r} className="capitalize">
                          {r.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={onSwitchRole}
                      className="px-3 py-2 bg-gray-900 text-white rounded-[2px] hover:bg-gray-800"
                    >
                      Switch Role
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    You currently have access to:{" "}
                    {roles.join(", ").replaceAll("_", " ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="bg-white border border-gray-200 rounded-[2px] p-4 space-y-4"
        >
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closePasswordModal}
        >
          <div
            className="bg-white rounded-[2px] p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Change Password</h2>
              <button
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={onSubmitPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={onPasswordChange}
                  className="w-full p-3 border border-gray-300 rounded-[2px] focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                  className="w-full p-3 border border-gray-300 rounded-[2px] focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="Enter your new password"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={onPasswordChange}
                  className="w-full p-3 border border-gray-300 rounded-[2px] focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="Confirm your new password"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className={`flex-1 px-4 py-2 rounded-[2px] text-white ${
                    changingPassword
                      ? "bg-gray-400"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="px-4 py-2 rounded-[2px] border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-white border border-gray-200 rounded-[2px] p-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => navigate("/orders")}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            View All Orders →
          </button>
        </div>

        {ordersLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-3">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">No orders yet</p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-gray-900 text-white px-4 py-2 rounded-[2px] text-sm hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-[2px] hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        Order #{order.order_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.order_status
                        )}`}
                      >
                        {order.order_status.charAt(0).toUpperCase() +
                          order.order_status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-gray-600">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""} • Total: $
                      {order.total_amount.toFixed(2)}
                    </p>
                    {/* Book Details */}
                    <div className="mt-2 space-y-1">
                      {order.items.slice(0, 2).map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center gap-2 text-xs text-gray-500"
                        >
                          <div className="flex-shrink-0">
                            {item.book?.image ? (
                              <img
                                src={`${baseUrl}${item.book.image}`}
                                alt={item.book.title}
                                className="h-8 w-6 object-cover rounded"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="h-8 w-6 bg-gray-200 rounded flex items-center justify-center"
                              style={{
                                display: item.book?.image ? "none" : "flex",
                              }}
                            >
                              <svg
                                className="h-4 w-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            </div>
                          </div>
                          <span className="truncate">
                            {item.book?.title || "Unknown Book"}
                          </span>
                          <span className="text-gray-400">
                            ×{item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-gray-400">
                          +{order.items.length - 2} more item
                          {order.items.length - 2 !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/order-summary/${order._id}`)}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
