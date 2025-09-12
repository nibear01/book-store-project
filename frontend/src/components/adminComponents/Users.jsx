import React, { useEffect, useState } from "react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const pageSize = 5;

  useEffect(() => {
    // Fetch from dummy JSON file
    fetch("/users.json")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error loading users:", err));
  }, []);

  // --- Filtered & paginated users ---
  const filteredUsers = users.filter((user) => {
    const roleMatch = roleFilter === "All" || user.role.trim() === roleFilter;
    const statusMatch = statusFilter === "All" || user.status.trim() === statusFilter;
    const searchMatch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    return roleMatch && statusMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // --- Action handlers ---
  const handleAction = (id, action) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === id) {
          if (action === "Approve") return { ...user, status: "Active" };
          if (action === "Ban") return { ...user, status: "Banned" };
        }
        return user;
      })
    );
    alert(`✅ ${action} successful for user ID ${id}`);
  };

  const handleResetPassword = (id) => {
    const user = users.find((u) => u.id === id);
    alert(`🔑 Password reset link sent to ${user.email}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      alert(`🗑️ User ${id} deleted`);
    }
  };

  // --- Edit modal handlers ---
  const openEditModal = (user) => setEditingUser(user);
  const closeEditModal = () => setEditingUser(null);
  const saveEdit = () => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === editingUser.id ? editingUser : user
      )
    );
    closeEditModal();
    alert(`✏️ User ${editingUser.id} updated`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Users Management</h2>

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <select
          className="border p-2 rounded w-full md:w-auto"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
        >
          <option value="All">All Roles</option>
          <option value="User">User</option>
          <option value="Author">Author</option>
          <option value="Admin">Admin</option>
        </select>

        <select
          className="border p-2 rounded w-full md:w-auto"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Banned">Banned</option>
        </select>

        <input
          type="text"
          placeholder="Search by name or email"
          className="border p-2 rounded flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role}</td>
                <td className="px-4 py-2">{user.status}</td>
                <td className="px-4 py-2 flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleAction(user.id, "Approve")}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(user.id, "Ban")}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Ban
                  </button>
                  <button
                    onClick={() => openEditModal(user)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleResetPassword(user.id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500 italic">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded ${
                p === page ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* --- Edit Modal --- */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>

            <label className="block mb-2 text-sm">Name</label>
            <input
              type="text"
              className="border p-2 rounded w-full mb-3"
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
            />

            <label className="block mb-2 text-sm">Email</label>
            <input
              type="email"
              className="border p-2 rounded w-full mb-3"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />

            <label className="block mb-2 text-sm">Role</label>
            <select
              className="border p-2 rounded w-full mb-4"
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value })
              }
            >
              <option value="User">User</option>
              <option value="Author">Author</option>
              <option value="Admin">Admin</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeEditModal}
                className="px-3 py-1 rounded bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-3 py-1 rounded bg-blue-500 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
