/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { adminUsersAPI } from "../../api/admin-api";
import { Button } from "../../Button/button.jsx";
import WorkflowSkeleton from "./common/WorkflowSkeleton";
import { useDebounce } from "./common/useDebounce";
import AddUser from "./user/AddUser";
import ChangePasswordModal from "./user/ChangePasswordModal";
import DeleteUserModal from "./user/DeleteUserModal";
import { Edit, CheckCircle2, Ban as BanIcon, KeyRound, Trash2 } from "lucide-react";
import EditUserModal from "./user/EditUserModal";
import Pagination from "./user/Pagination";
import { toast } from "react-toastify";

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
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });
  const pageSize = 10; // Changed from 20 to 10 users per page
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
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const roleLabel = (r) =>
    (r || "")
      .split("_")
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(" ");

  const fetchUsers = async (opts = {}) => {
    try {
      setLoading(true);
      setError("");
      const params = { page, limit: pageSize };
      if (statusFilter !== "All") params.status = statusFilter.toLowerCase();
      if (roleFilter !== "All") params.roles = roleFilter;
      // Add sort parameter (newest or oldest)
      params.sort = sortOrder === "oldest" ? "createdAt" : "-createdAt";
      // If API supports server-side search, pass debounced search as q
      if (typeof opts.search === 'string') {
        const term = opts.search.trim();
        if (term) params.q = term; else delete params.q;
      }
      const res = await adminUsersAPI.list(params);
      const list = res.data || [];
      const pag = res.pagination || {
        currentPage: page,
        totalPages: Math.ceil((res.total || list.length) / pageSize),
        totalUsers: res.total || list.length,
      };
      // Server filters already applied. Keep as-is to preserve pagination visibility
      const filtered = list;
      setUsers(filtered);
      setPagination({
        currentPage: page,
        totalPages: pag.totalPages,
        totalUsers: pag.totalUsers,
      });
      setLastUpdated(new Date());
    } catch (err) {
      const errorMsg = err?.message || "Failed to load users";
      console.error("Error loading users:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers({ search: debouncedSearch });
  };

  useEffect(() => {
    fetchUsers({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, statusFilter, sortOrder]);

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

  // Debounced search term (shared hook like Support page)
  const debouncedSearch = useDebounce(search, 300);
  const initialSearchRef = useRef(true);
  useEffect(() => {
    if (initialSearchRef.current) {
      // First render search handled by main fetch effect
      initialSearchRef.current = false;
      return;
    }
    // Reset to first page when search changes
  setPage(1);
  fetchUsers({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const totalPages = pagination.totalPages || 1;
  const totalUsers = pagination.totalUsers || users.length;
  
  // Display users as-is from the server (already paginated and sorted)
  const displayedUsers = users;

  const handleAction = async (id, action) => {
    try {
      if (action === "Approve") {
        await adminUsersAPI.changeStatus(id, "active");
      } else if (action === "Ban") {
        await adminUsersAPI.changeStatus(id, "suspended");
      }
      await fetchUsers();
      toast.success(`✅ ${action} successful for user ID ${id}`);
    } catch (e) {
      toast.error(`Failed to ${action.toLowerCase()} user`);
    }
  };

  const handleResetPassword = (id) => {
    const user = users.find((u) => u._id === id);
    setChangingPwUser(user || { _id: id });
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDelete = (id) => {
    const user = users.find((u) => u._id === id);
    setDeletingUser(user || { _id: id });
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    
    try {
      setIsDeleting(true);
      await adminUsersAPI.delete(deletingUser._id);
      await fetchUsers();
      toast.success(`User ${deletingUser.name || deletingUser._id} deleted`);
      setDeletingUser(null);
    } catch (e) {
      toast.error(e?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeletingUser(null);
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
          toast.error(e?.message || "Failed to change user roles");
        }
      }
      await fetchUsers();
      closeEditModal();
      toast.success(`User updated!`);
    } catch (e) {
      toast.error(e?.message || "Failed to update user");
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
      const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;
      const res = await fetch(`${API_BASE_URL}/users/register`, {
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
          toast.error(e?.message || "Failed to set status for user");
        }
      }

      await fetchUsers();
      setShowAddModal(false);
      toast.success("✅ User created");
    } catch (e) {
      toast.error(e?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0" name="users-admin">
      {/* Header */}
      <div
        className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        name="users-header"
      >
        <div className="min-w-0">
          <h2 className="text-xl sm:text-xl font-bold" name="users-title" data-testid="users-page-title">
            Users
          </h2>
          <p className="text-gray-600 text-sm" name="users-subtitle">
            Manage users, their roles, and statuses.
          </p>
        </div>
        <div className="flex items-center gap-2" name="users-actions">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-2 border rounded-md text-xs sm:text-sm hover:bg-gray-100 disabled:opacity-60"
            name="users-refresh-btn"
            data-testid="users-refresh"
          >
            Refresh
          </button>
          <button
            onClick={openAddModal}
            disabled={loading}
            className="px-3 py-2 rounded-md text-white bg-black hover:bg-slate-900 disabled:opacity-50 text-xs sm:text-sm"
            name="users-add-btn"
            data-testid="users-add-btn"
          >
            + Add User
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-3 text-rose-600" role="alert" name="users-error">
          {error}
        </div>
      ) : null}

      {/* Toolbar */}
      <div
        className="bg-white border rounded-md p-3 sm:p-4 mb-3 sm:mb-4"
        name="users-toolbar"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search users by name or email…"
              className="border border-zinc-200 rounded-md px-3 py-2 text-sm min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="users-search"
              name="users-search-input"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Role</label>
              <select
                className="border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                data-testid="users-role-filter"
                name="users-role-filter"
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
                className="border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                data-testid="users-status-filter"
                name="users-status-filter"
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
                className="border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                data-testid="users-sort"
                name="users-sort-filter"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        </div>
        <div
          className="mt-2 text-xs sm:text-sm text-gray-600"
          name="users-results-info"
        >
          Showing {displayedUsers.length} of {totalUsers} users
        </div>
      </div>

      <div name="users-table-wrap">
        {/* Table for desktop */}
        <div className="bg-white border border-zinc-200 rounded-md overflow-hidden hidden md:block">
            <table className="min-w-full text-sm text-left" data-testid="users-table" name="users-table">
              <thead className="bg-gray-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Phone</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              {loading ? (
                <WorkflowSkeleton rows={8} variant="table" columns={6} />
              ) : (
                <tbody>
                  {displayedUsers.map((user) => (
                    <tr key={user._id} className="border-b border-zinc-100 hover:bg-gray-50 transition-colors" data-testid={`user-row-${user._id}`} name={`user-row-${user._id}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 text-gray-600">{user.phone}</td>
                      <td className="px-4 py-3 capitalize">
                        {Array.isArray(user.roles) && user.roles.length
                          ? user.roles.join(", ").replaceAll("_", " ")
                          : (user.role || "user").replace("_", " ")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
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
                      <td className="px-2 py-2">
                        <div className="flex gap-2 flex-wrap">
                          {!(
                            (Array.isArray(user.roles) && user.roles.includes("admin")) ||
                            user.role === "admin"
                          ) && (
                            <>
                              <Button
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                                  user.status !== "active"
                                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                }`}
                                onClick={() =>
                                  handleAction(
                                    user._id,
                                    user.status !== "active" ? "Approve" : "Ban"
                                  )
                                }
                                size="sm"
                                data-testid={user.status !== "active" ? `user-approve-btn-${user._id}` : `user-ban-btn-${user._id}`}
                                name={user.status !== "active" ? `user-approve-btn-${user._id}` : `user-ban-btn-${user._id}`}
                              >
                                {user.status !== "active" ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Approve
                                  </>
                                ) : (
                                  <>
                                    <BanIcon className="w-3.5 h-3.5" />
                                    Ban
                                  </>
                                )}
                              </Button>
                              <Button
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                                onClick={() => openEditModal(user)}
                                size="sm"
                                data-testid={`user-edit-btn-${user._id}`}
                                name={`user-edit-btn-${user._id}`}
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Edit
                              </Button>
                            </>
                          )}
                          <Button
                            onClick={() => handleResetPassword(user._id)}
                            size="sm"
                            variant="outline"
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-colors"
                            data-testid={`user-change-pw-btn-${user._id}`}
                            name={`user-change-pw-btn-${user._id}`}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            Change PW
                          </Button>
                          {!(
                            (Array.isArray(user.roles) && user.roles.includes("admin")) ||
                            user.role === "admin"
                          ) && (
                            <Button
                              onClick={() => handleDelete(user._id)}
                              size="sm"
                              variant="destructive"
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors"
                              data-testid={`user-delete-btn-${user._id}`}
                              name={`user-delete-btn-${user._id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayedUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-8 text-gray-500 italic"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <WorkflowSkeleton rows={6} variant="cards" />
            ) : displayedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 italic bg-white rounded-md border border-zinc-200">
                No users found
              </div>
            ) : (
              displayedUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white p-4 rounded-md border border-zinc-200 hover:shadow-md transition-shadow"
                  data-testid={`user-card-${user._id}`}
                  name={`user-card-${user._id}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-600">{user.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-md capitalize">
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
                          className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                            user.status !== "active"
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                          data-testid={user.status !== "active" ? `user-approve-btn-${user._id}` : `user-ban-btn-${user._id}`}
                          name={user.status !== "active" ? `user-approve-btn-${user._id}` : `user-ban-btn-${user._id}`}
                        >
                          {user.status !== "active" ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </>
                          ) : (
                            <>
                              <BanIcon className="w-3.5 h-3.5" />
                              Ban
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => openEditModal(user)}
                          size="sm"
                          className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                          data-testid={`user-edit-btn-${user._id}`}
                          name={`user-edit-btn-${user._id}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={() => handleResetPassword(user._id)}
                      size="sm"
                      variant="outline"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-colors col-span-2"
                      data-testid={`user-change-pw-btn-${user._id}`}
                      name={`user-change-pw-btn-${user._id}`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      Change PW
                    </Button>
                    {!(
                      (Array.isArray(user.roles) && user.roles.includes("admin")) ||
                      user.role === "admin"
                    ) && (
                      <Button
                        onClick={() => handleDelete(user._id)}
                        size="sm"
                        variant="destructive"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors col-span-2"
                        data-testid={`user-delete-btn-${user._id}`}
                        name={`user-delete-btn-${user._id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete User
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalUsers}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          itemName="users"
        />
      

      {/* --- Edit Modal --- */}
      {editingUser && (
        <EditUserModal
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          closeEditModal={closeEditModal}
          saveEdit={saveEdit}
          rolesOptions={rolesOptions}
          roleLabel={roleLabel}
        />
      )}

      {/* --- Add User Modal --- */}
      {showAddModal && (
        <AddUser
          newUser={newUser}
          setNewUser={setNewUser}
          rolesOptions={rolesOptions}
          roleLabel={roleLabel}
          handleCreateUser={handleCreateUser}
          closeAddModal={closeAddModal}
          creating={creating}
        />
      )}

      {/* --- Change Password Modal --- */}
      {changingPwUser && (
        <ChangePasswordModal
          changingPwUser={changingPwUser}
          setChangingPwUser={setChangingPwUser}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          adminUsersAPI={adminUsersAPI}
        />
      )}

      {/* --- Delete User Modal --- */}
      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default Users;
