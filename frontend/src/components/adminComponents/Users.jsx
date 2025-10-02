/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { adminUsersAPI } from "../../api/admin-api";
import { Button } from "../../Button/button.jsx";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest
  const [editingUser, setEditingUser] = useState(null);
  const [changingPwUser, setChangingPwUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });
  const pageSize = 20;
  const [rolesOptions, setRolesOptions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    roles: [],
    status: "active",
  });

  const roleLabel = (r) =>
    (r || "")
      .split("_")
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(" ");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: pageSize };
      if (statusFilter !== "All") params.status = statusFilter.toLowerCase();
      if (roleFilter !== "All") params.roles = roleFilter;
      const res = await adminUsersAPI.list(params);
      const list = res.data || [];
      const pag = res.pagination || {
        currentPage: page,
        totalPages: 1,
        totalUsers: list.length,
      };
      // Apply client-side search for now
      const filtered = list.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(search.toLowerCase())
      );
      setUsers(filtered);
      setPagination(pag);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, statusFilter]);

  // Load allowed roles for dynamic rendering
  useEffect(() => {
    (async () => {
      try {
        const res = await adminUsersAPI.roles();
        const arr = Array.isArray(res?.data) ? res.data : [];
        setRolesOptions(arr);
      } catch (e) {
        console.error("Failed to load roles", e);
        setRolesOptions([]);
      }
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const totalPages = pagination.totalPages || 1;
  const totalUsers = pagination.totalUsers || users.length;
  // Apply client-side sort similar to AuthorRequest
  const paginatedUsers = [...users].sort((a, b) => {
    const ta = new Date(a.created_at || a.createdAt || 0).getTime();
    const tb = new Date(b.created_at || b.createdAt || 0).getTime();
    return sortOrder === "oldest" ? ta - tb : tb - ta;
  });

  const handleAction = async (id, action) => {
    try {
      if (action === "Approve") {
        await adminUsersAPI.changeStatus(id, "active");
      } else if (action === "Ban") {
        await adminUsersAPI.changeStatus(id, "suspended");
      }
      await fetchUsers();
      alert(`✅ ${action} successful for user ID ${id}`);
    } catch (e) {
      alert(`Failed to ${action.toLowerCase()} user`);
    }
  };

  const handleResetPassword = (id) => {
    const user = users.find((u) => u._id === id);
    setChangingPwUser(user || { _id: id });
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminUsersAPI.delete(id);
        await fetchUsers();
        alert(`🗑️ User ${id} deleted`);
      } catch (e) {
        alert("Failed to delete user");
      }
    }
  };

  const openEditModal = (user) => setEditingUser(user);
  const closeEditModal = () => setEditingUser(null);
  const saveEdit = async () => {
    try {
      await adminUsersAPI.update(editingUser._id, {
        name: editingUser.name,
        email: editingUser.email,
        address: editingUser.address,
        status: editingUser.status,
      });
      // Apply role changes via dedicated endpoint
      const desiredRoles = Array.isArray(editingUser.roles)
        ? editingUser.roles
        : editingUser.role
        ? [editingUser.role]
        : null;
      if (desiredRoles) {
        try {
          await adminUsersAPI.changeRole(editingUser._id, desiredRoles);
        } catch (e) {
          alert(e?.message || "Failed to change user roles");
        }
      }
      await fetchUsers();
      closeEditModal();
      alert(`✏️ User updated`);
    } catch (e) {
      alert(e?.message || "Failed to update user");
    }
  };

  const openAddModal = () => {
    setNewUser({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      roles: [],
      status: "active",
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);

  const handleCreateUser = async () => {
    try {
      if (!newUser.name?.trim()) return alert("Name is required");
      if (!newUser.email?.trim()) return alert("Email is required");
      if (!newUser.phone?.trim()) return alert("Phone is required");
      if (!newUser.password || newUser.password.length < 8)
        return alert("Password must be at least 8 characters");

      setCreating(true);

      // 1) Create the user via public register endpoint
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          phone: newUser.phone,
          address: newUser.address,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to create user");
      }
      const createdId = data?.data?._id;
      if (!createdId) throw new Error("Failed to retrieve new user id");

      // 2) Assign roles if provided (fallback to default 'user' remains if none)
      if (Array.isArray(newUser.roles) && newUser.roles.length) {
        try {
          await adminUsersAPI.changeRole(createdId, newUser.roles);
        } catch (e) {
          console.error("Failed to assign roles", e);
          alert(e?.message || "Failed to set roles for user");
        }
      }

      // 3) Set status if different from default 'active'
      if (newUser.status && newUser.status !== "active") {
        try {
          await adminUsersAPI.changeStatus(createdId, newUser.status);
        } catch (e) {
          console.error("Failed to set status", e);
          alert(e?.message || "Failed to set status for user");
        }
      }

      await fetchUsers();
      setShowAddModal(false);
      alert("✅ User created");
    } catch (e) {
      alert(e?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Search</label>
            <input
              type="text"
              placeholder="Name or email…"
              className="border rounded-md px-2 py-1 text-sm min-w-[220px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Role</label>
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All</option>
              {rolesOptions.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Status</label>
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="suspended">suspended</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort</label>
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <Button className="rounded-[2px]" onClick={openAddModal} size="sm">
            + Add User
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Table for desktop */}
          <div className="overflow-x-auto shadow rounded-[2px] hidden md:block">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.phone}</td>
                    <td className="px-4 py-2 capitalize">
                      {Array.isArray(user.roles) && user.roles.length
                        ? user.roles.join(", ").replaceAll("_", " ")
                        : (user.role || "user").replace("_", " ")}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
                          user.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : user.status === "suspended"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2 flex-wrap">
                      {!(
                        (Array.isArray(user.roles) &&
                          user.roles.includes("admin")) ||
                        user.role === "admin"
                      ) && (
                        <>
                          <Button
                            className="rounded-[2px]"
                            onClick={() =>
                              handleAction(
                                user._id,
                                user.status !== "active" ? "Approve" : "Ban"
                              )
                            }
                            size="sm"
                          >
                            {user.status !== "active" ? "Approve" : "Ban"}
                          </Button>
                          <Button
                            className="rounded-[2px]"
                            onClick={() => openEditModal(user)}
                            size="sm"
                          >
                            Edit
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => handleResetPassword(user._id)}
                        size="sm"
                        variant="outline"
                        className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-[2px]"
                      >
                        Change PW
                      </Button>
                      {!(
                        (Array.isArray(user.roles) &&
                          user.roles.includes("admin")) ||
                        user.role === "admin"
                      ) && (
                        <Button
                          onClick={() => handleDelete(user._id)}
                          size="sm"
                          variant="destructive"
                          className="rounded-[2px]"
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center p-4 text-gray-500 italic"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {paginatedUsers.length === 0 ? (
              <div className="text-center p-4 text-gray-500 italic bg-white rounded-[2px] shadow">
                No users found
              </div>
            ) : (
              paginatedUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white p-4 rounded-[2px] shadow border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-600">{user.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-[2px] capitalize">
                        {Array.isArray(user.roles) && user.roles.length
                          ? user.roles.join(", ").replaceAll("_", " ")
                          : (user.role || "user").replace("_", " ")}
                      </span>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full border capitalize ${
                          user.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : user.status === "suspended"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {!(
                      (Array.isArray(user.roles) &&
                        user.roles.includes("admin")) ||
                      user.role === "admin"
                    ) && (
                      <>
                        <Button
                          onClick={() =>
                            handleAction(
                              user._id,
                              user.status !== "active" ? "Approve" : "Ban"
                            )
                          }
                          size="sm"
                        >
                          {user.status !== "active" ? "Approve" : "Ban"}
                        </Button>
                        <Button onClick={() => openEditModal(user)} size="sm">
                          Edit
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={() => handleResetPassword(user._id)}
                      size="sm"
                      variant="outline"
                      className="bg-gray-200 text-gray-800 hover:bg-gray-300 col-span-2"
                    >
                      Change PW
                    </Button>
                    {!(
                      (Array.isArray(user.roles) &&
                        user.roles.includes("admin")) ||
                      user.role === "admin"
                    ) && (
                      <Button
                        onClick={() => handleDelete(user._id)}
                        size="sm"
                        variant="destructive"
                        className="col-span-2"
                      >
                        Delete User
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {totalUsers > pageSize && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            variant="outline"
            size="sm"
          >
            Prev
          </Button>
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{page}</span> of {totalPages}
          </div>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}

      {/* --- Edit Modal --- */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-[2px] w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>

            <label className="block mb-2 text-sm">Name</label>
            <input
              type="text"
              className="border p-2 rounded-[2px] w-full mb-3"
              value={editingUser.name || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
            />

            <label className="block mb-2 text-sm">Email</label>
            <input
              type="email"
              className="border p-2 rounded-[2px] w-full mb-3"
              value={editingUser.email || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />

            <label className="block mb-1 text-sm">Roles</label>
            <div className="text-xs text-gray-600 mb-1">
              Current roles:{" "}
              {Array.isArray(editingUser.roles) && editingUser.roles.length
                ? editingUser.roles.join(", ").replaceAll("_", " ")
                : (editingUser.role || "user").replace("_", " ")}
            </div>
            <select
              multiple
              className="border p-2 rounded-[2px] w-full mb-4"
              value={
                Array.isArray(editingUser.roles) && editingUser.roles.length
                  ? editingUser.roles
                  : [editingUser.role || "user"]
              }
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map(
                  (o) => o.value
                );
                setEditingUser({
                  ...editingUser,
                  roles: selected.length ? selected : ["user"],
                });
              }}
            >
              {rolesOptions.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>

            <label className="block mb-2 text-sm">Status</label>
            <select
              className="border p-2 rounded-[2px] w-full mb-4"
              value={editingUser.status || "active"}
              onChange={(e) =>
                setEditingUser({ ...editingUser, status: e.target.value })
              }
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="suspended">suspended</option>
            </select>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                onClick={closeEditModal}
                className="px-3 py-2 rounded-[2px] bg-gray-200 mt-2 sm:mt-0"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-3 py-2 rounded-[2px] bg-black text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Add User Modal --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-[2px] w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Add New User</h3>

            <label className="block mb-2 text-sm">Name</label>
            <input
              type="text"
              className="border p-2 rounded-[2px] w-full mb-3"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="John Doe"
            />

            <label className="block mb-2 text-sm">Email</label>
            <input
              type="email"
              className="border p-2 rounded-[2px] w-full mb-3"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="john@example.com"
            />

            <label className="block mb-2 text-sm">Phone</label>
            <input
              type="text"
              className="border p-2 rounded-[2px] w-full mb-3"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="+11234567890"
            />

            <label className="block mb-2 text-sm">Address</label>
            <input
              type="text"
              className="border p-2 rounded-[2px] w-full mb-3"
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              placeholder="123 Main St, City"
            />

            <label className="block mb-2 text-sm">Password</label>
            <input
              type="password"
              className="border p-2 rounded-[2px] w-full mb-4"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="At least 8 characters"
            />

            <label className="block mb-1 text-sm">Roles</label>
            <div className="text-xs text-gray-600 mb-1">
              Select one or more roles to grant access. If none selected, user defaults to "user" only.
            </div>
            <select
              multiple
              className="border p-2 rounded-[2px] w-full mb-4"
              value={newUser.roles}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                setNewUser({ ...newUser, roles: selected });
              }}
            >
              {rolesOptions.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>

            <label className="block mb-2 text-sm">Status</label>
            <select
              className="border p-2 rounded-[2px] w-full mb-4"
              value={newUser.status}
              onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="suspended">suspended</option>
            </select>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                onClick={closeAddModal}
                className="px-3 py-2 rounded-[2px] bg-gray-200 mt-2 sm:mt-0"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-3 py-2 rounded-[2px] bg-black text-white disabled:opacity-60"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Change Password Modal --- */}
      {changingPwUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-[2px] w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Change Password</h3>
            <p className="text-sm text-gray-600 mb-3">
              User: {changingPwUser?.email || changingPwUser?._id}
            </p>

            <label className="block mb-2 text-sm">Previous Password</label>
            <input
              type="text"
              className="border p-2 rounded-[2px] w-full mb-3 bg-gray-100"
              value={changingPwUser?.password || ""}
              readOnly
            />

            <label className="block mb-2 text-sm">New Password</label>
            <input
              type="password"
              className="border p-2 rounded-[2px] w-full mb-3"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />

            <label className="block mb-2 text-sm">Confirm Password</label>
            <input
              type="password"
              className="border p-2 rounded-[2px] w-full mb-4"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                onClick={() => setChangingPwUser(null)}
                className="px-3 py-2 rounded-[2px] bg-gray-200 mt-2 sm:mt-0"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!newPassword || newPassword.length < 8) {
                      alert("Password must be at least 8 characters");
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      alert("Passwords do not match");
                      return;
                    }
                    await adminUsersAPI.changePassword(
                      changingPwUser._id,
                      newPassword
                    );
                    setChangingPwUser(null);
                    setNewPassword("");
                    setConfirmPassword("");
                    alert("✅ Password updated");
                  } catch (e) {
                    alert(e.message || "Failed to update password");
                  }
                }}
                className="px-3 py-2 rounded-[2px] bg-black text-white"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
