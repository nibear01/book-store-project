import React, { useEffect, useState } from "react";

export default function AddAuthorModal({
  open,
  onClose,
  createAuthor,
  uploadPhoto,
  refresh,
  loading,
}) {
  const [form, setForm] = useState({ name: "", title: "", bio: "", dob: "" });
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    if (!open) {
      setForm({ name: "", title: "", bio: "", dob: "" });
      setPhotoFile(null);
    }
  }, [open]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name.trim(),
        title: form.title.trim(),
        bio: form.bio,
        dob: form.dob || null,
        status: "verified",
      };
      const created = await createAuthor(payload);
      if (photoFile) await uploadPhoto(created._id, photoFile);
      await refresh();
      onClose();
    } catch {
      // handled in context
    }
  };

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[96vw] max-w-[680px] rounded-lg bg-white p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="m-0 text-lg font-semibold">Add Author</h3>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-[12px] font-semibold">Name</div>
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="Author name"
                className="w-full rounded-[2px] border border-slate-300 p-2"
                name="add-author-name"
              />
            </div>
            <div>
              <div className="mb-1 text-[12px] font-semibold">Title</div>
              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((s) => ({ ...s, title: e.target.value }))
                }
                placeholder="e.g., Professor"
                className="w-full rounded-[2px] border border-slate-300 p-2"
                name="add-author-title"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 text-[12px] font-semibold">Bio</div>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
              placeholder="Short biography"
              className="w-full rounded-[2px] border border-slate-300 p-2"
              name="add-author-bio"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-[12px] font-semibold">
                Date of Birth
              </div>
              <input
                type="date"
                value={form.dob}
                onChange={(e) =>
                  setForm((s) => ({ ...s, dob: e.target.value }))
                }
                className="w-full rounded-[2px] border border-slate-300 p-2"
                name="add-author-dob"
              />
            </div>
            <div>
              <div className="mb-1 text-[12px] font-semibold">Photo</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="w-full rounded-[2px] border border-slate-300 p-2 file:mr-3 file:rounded-[2px] file:border-0 file:bg-slate-100 file:px-3 file:py-1"
                name="add-author-photo"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded border border-slate-300 hover:bg-slate-50"
              name="add-author-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 rounded border border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
              name="add-author-save"
            >
              {loading ? "Saving..." : "Save Author"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
