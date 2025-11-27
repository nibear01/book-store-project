import React from 'react'

const EditUserModal = ({ editingUser, setEditingUser, closeEditModal, saveEdit, rolesOptions, roleLabel }) => {
  return (
    <div>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="edit-user-backdrop">
          <div className="bg-white p-4 sm:p-6 rounded-md w-full max-w-md max-h-[90vh] overflow-y-auto" data-testid="edit-user-modal" name="edit-user-modal">
            <h3 className="text-lg font-bold mb-4" data-testid="edit-user-title" name="edit-user-title">Edit User</h3>

            <label className="block mb-2 text-sm">Name</label>
            <input
              type="text"
              className="border p-2 rounded-md w-full mb-3"
              value={editingUser.name || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
              data-testid="edit-user-name"
              name="edit-user-name"
            />

            <label className="block mb-2 text-sm">Email</label>
            <input
              type="email"
              className="border p-2 rounded-md w-full mb-3"
              value={editingUser.email || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
              data-testid="edit-user-email"
              name="edit-user-email"
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
              className="border p-2 rounded-md w-full mb-4"
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
              data-testid="edit-user-roles"
              name="edit-user-roles"
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
              value={editingUser.status || "active"}
              onChange={(e) =>
                setEditingUser({ ...editingUser, status: e.target.value })
              }
              data-testid="edit-user-status"
              name="edit-user-status"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="suspended">suspended</option>
            </select>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                onClick={closeEditModal}
                className="px-3 py-2 rounded-md bg-gray-200 mt-2 sm:mt-0"
                data-testid="edit-user-cancel"
                name="edit-user-cancel"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-3 py-2 rounded-md bg-black text-white"
                data-testid="edit-user-save"
                name="edit-user-save"
              >
                Save
              </button>
            </div>
          </div>
        </div>
    </div>
  )
}

export default EditUserModal
