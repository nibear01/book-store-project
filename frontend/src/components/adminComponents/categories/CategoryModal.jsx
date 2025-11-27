import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";

const emptyForm = { name: "" };

const CategoryModal = ({ open, onClose, onSubmit, initialCategory }) => {
  const editing = !!initialCategory;
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const title = editing ? "Update Category" : "Add Category";

  useEffect(() => {
    if (editing) {
      setForm({ name: initialCategory.name || "" });
    } else {
      setForm(emptyForm);
    }
  }, [editing, initialCategory]);

  const disabled = useMemo(
    () => saving || !form.name.trim(),
    [saving, form.name]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSubmit(form, editing ? initialCategory : null);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      name="category-modal-overlay"
    >
      <div
        className="relative w-full max-w-md rounded-md shadow-xl bg-white overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        name="category-modal"
      >
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
          <h2
            className="text-lg sm:text-xl font-bold"
            name="category-modal-title"
          >
            {title}
          </h2>
          <button
            className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white/10 hover:bg-white/20 transition"
            onClick={onClose}
            aria-label="Close"
            name="category-modal-close"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full"
          name="category-modal-form"
        >
          <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="category-name"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                placeholder="e.g. Programming"
                required
                id="category-name"
                name="category-name"
              />
            </div>
            {/* Description removed per latest requirements */}
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-md border font-semibold hover:bg-gray-100 transition"
              disabled={saving}
              name="category-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="bg-slate-950 text-white px-6 py-2 rounded-md font-semibold shadow hover:bg-slate-800 transition disabled:opacity-60"
              name="category-submit"
            >
              {saving
                ? editing
                  ? "Saving..."
                  : "Adding..."
                : editing
                ? "Save Changes"
                : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default React.memo(CategoryModal);
