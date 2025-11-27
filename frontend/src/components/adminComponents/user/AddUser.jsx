import React from "react";

const AddUser = ({
  newUser,
  setNewUser,
  rolesOptions,
  roleLabel,
  handleCreateUser,
  closeAddModal,
  creating,
}) => {
  return (
    <div>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="add-user-backdrop">
        <div className="bg-white p-4 sm:p-6 rounded-md w-full max-w-md max-h-[90vh] overflow-y-auto" data-testid="add-user-modal" name="add-user-modal">
          <h3 className="text-lg font-bold mb-4" data-testid="add-user-title" name="add-user-title">Add New User</h3>

          <label className="block mb-2 text-sm">Name</label>
          <input
            type="text"
            className="border p-2 rounded-md w-full mb-3"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="John Doe"
            data-testid="add-user-name"
            name="add-user-name"
          />

          <label className="block mb-2 text-sm">Email</label>
          <input
            type="email"
            className="border p-2 rounded-md w-full mb-3"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="john@example.com"
            data-testid="add-user-email"
            name="add-user-email"
          />

          <label className="block mb-2 text-sm">Phone</label>
          <input
            type="text"
            className="border p-2 rounded-md w-full mb-3"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            placeholder="+11234567890"
            data-testid="add-user-phone"
            name="add-user-phone"
          />

          <label className="block mb-2 text-sm">Address</label>
          <input
            type="text"
            className="border p-2 rounded-md w-full mb-3"
            value={newUser.address}
            onChange={(e) =>
              setNewUser({ ...newUser, address: e.target.value })
            }
            placeholder="123 Main St, City"
            data-testid="add-user-address"
            name="add-user-address"
          />

          <label className="block mb-2 text-sm">Password</label>
          <input
            type="password"
            className="border p-2 rounded-md w-full mb-4"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            placeholder="At least 8 characters"
            data-testid="add-user-password"
            name="add-user-password"
          />

          <label className="block mb-1 text-sm">Roles</label>
          <div className="text-xs text-gray-600 mb-1">
            Select one or more roles to grant access. If none selected, user
            defaults to "user" only.
          </div>
          <select
            multiple
            className="border p-2 rounded-md w-full mb-4"
            value={newUser.roles}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(
                (o) => o.value
              );
              setNewUser({ ...newUser, roles: selected });
            }}
            data-testid="add-user-roles"
            name="add-user-roles"
          >
            {rolesOptions.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </select>

          <label className="block mb-2 text-sm">Status</label>
          <select
            className="border p-2 rounded-md w-full mb-4"
            value={newUser.status}
            onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
            data-testid="add-user-status"
            name="add-user-status"
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="suspended">suspended</option>
          </select>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              onClick={closeAddModal}
              className="px-3 py-2 rounded-md bg-gray-200 mt-2 sm:mt-0"
              disabled={creating}
              data-testid="add-user-cancel"
              name="add-user-cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateUser}
              className="px-3 py-2 rounded-md bg-black text-white disabled:opacity-60"
              disabled={creating}
              data-testid="add-user-submit"
              name="add-user-submit"
            >
              {creating ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
