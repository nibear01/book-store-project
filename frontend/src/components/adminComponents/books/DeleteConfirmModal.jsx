import React from "react";

const DeleteConfirmModal = ({ open, title, onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="bg-white rounded-[2px] shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h4 className="text-lg font-semibold mb-2">Delete Confirmation</h4>
        <p className="text-sm text-gray-700">
          This action will permanently delete “{title}”. Are you sure you want to continue?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="px-4 py-2 border rounded-[2px] text-sm" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-[2px] text-sm hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete permanently
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
