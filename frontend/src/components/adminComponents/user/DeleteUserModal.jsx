import React from "react";
import { Button } from "../../../Button/button.jsx";
import { X, AlertTriangle } from "lucide-react";

const DeleteUserModal = ({ user, onConfirm, onCancel, isDeleting }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        data-testid="delete-user-modal"
        name="delete-user-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isDeleting}
            data-testid="delete-modal-close-btn"
            name="delete-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this user?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="text-sm">
              <p className="font-medium text-gray-900 mb-1">
                <span className="text-gray-600">Name:</span> {user?.name}
              </p>
              <p className="font-medium text-gray-900 mb-1">
                <span className="text-gray-600">Email:</span> {user?.email}
              </p>
            </div>
          </div>
          <p className="text-sm text-red-600 font-medium">
            ⚠️ This action cannot be undone!
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-zinc-200">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border border-zinc-300 bg-white text-gray-700 hover:bg-gray-50"
            disabled={isDeleting}
            data-testid="delete-modal-cancel-btn"
            name="delete-modal-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="destructive"
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
            disabled={isDeleting}
            data-testid="delete-modal-confirm-btn"
            name="delete-modal-confirm-btn"
          >
            {isDeleting ? "Deleting..." : "Delete User"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
