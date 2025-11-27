import React, { useEffect, useState } from "react";

export default function EditAuthorModal({ open, author, onClose, updateAuthor, uploadPhoto, refresh, loading }) {
  const [form, setForm] = useState({ name: "", title: "", bio: "", dob: "" });
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    if (!open || !author) return;
    setForm({
      name: author.name || "",
      title: author.title || "",
      bio: author.bio || "",
      dob: author.dob ? String(author.dob).slice(0, 10) : "",
    });
    setPhotoFile(null);
  }, [open, author]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!author) return;
    try {
      const payload = {
        name: form.name.trim(),
        title: form.title.trim(),
        bio: form.bio,
        dob: form.dob || null,
      };
      const updated = await updateAuthor(author._id, payload);
      if (photoFile) await uploadPhoto(updated._id, photoFile);
      await refresh();
      onClose();
    } catch {
      // handled in context
    }
  };

  if (!open || !author) return null;
  return (
    <div role="dialog" aria-modal="true" onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div onClick={(e) => e.stopPropagation()} className="w-[96vw] max-w-[680px] rounded-lg bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="m-0 text-lg font-semibold">Edit Author</h3>
          <button onClick={onClose} className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-50">Close</button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-[12px] font-semibold">Name</div>
              <input required value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="w-full rounded-[2px] border border-slate-300 p-2" placeholder="Author name" name="edit-author-name" />
            </div>
            <div>
              <div className="mb-1 text-[12px] font-semibold">Title</div>
              <input required value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} className="w-full rounded-[2px] border border-slate-300 p-2" placeholder="e.g., Professor" name="edit-author-title" />
            </div>
          </div>

          <div>
            <div className="mb-1 text-[12px] font-semibold">Bio</div>
            <textarea rows={4} value={form.bio} onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))} className="w-full rounded-[2px] border border-slate-300 p-2" placeholder="Short biography" name="edit-author-bio" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-[12px] font-semibold">Date of Birth</div>
              <input type="date" value={form.dob} onChange={(e) => setForm((s) => ({ ...s, dob: e.target.value }))} className="w-full rounded-[2px] border border-slate-300 p-2" name="edit-author-dob" />
            </div>
            <div>
              <div className="mb-1 text-[12px] font-semibold">Photo</div>
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="w-full rounded-[2px] border border-slate-300 p-2 file:mr-3 file:rounded-[2px] file:border-0 file:bg-slate-100 file:px-3 file:py-1" name="edit-author-photo" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border border-slate-300 hover:bg-slate-50" name="edit-author-cancel">Cancel</button>
            <button type="submit" disabled={loading} className="px-3 py-2 rounded border border-sky-700 bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50" name="edit-author-save">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
