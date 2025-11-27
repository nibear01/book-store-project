import React from "react";

export default function DeleteConfirmationModal({ open, author, onCancel, onConfirm, loading }) {
  if (!open || !author) return null;
  return (
    <div role="dialog" aria-modal="true" onClick={onCancel} className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 p-4">
      <div onClick={(e) => e.stopPropagation()} className="w-[92vw] max-w-[420px] rounded-lg bg-white p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold m-0">Confirm Delete</h3>
        </div>
        <p className="mb-4 text-slate-700">Are you sure you want to delete author <strong>{author.name}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 rounded border border-slate-300 hover:bg-slate-50" name="authors-delete-cancel">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-3 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
            name="authors-delete-confirm"
          >
            {loading ? "Deleting..." : "Delete Author"}
          </button>
        </div>
      </div>
    </div>
  );
}
