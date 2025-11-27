import React from "react";

export default function AuthorTable({ authors, loading, makeImgUrl, onManage, onEdit, onDelete, onRemoveBook }) {
  return (
    <div className="overflow-x-auto" name="authors-table">
      <table className="w-full border-collapse text-xs sm:text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left border-b border-slate-200">Name</th>
            <th className="p-2 text-left border-b border-slate-200">Title</th>
            <th className="p-2 text-left border-b border-slate-200">Books</th>
            <th className="p-2 text-left border-b border-slate-200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((a) => {
            const totalBooks = (a.books || []).length;
            const displayBooks = (a.books || []).slice(0, 4);
            return (
              <tr key={a._id} name={`authors-row-${a._id}`} className="align-top">
                <td className="p-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 min-w-0">
                    {a.photo ? (
                      <img src={makeImgUrl(a.photo)} alt={a.name} className="w-9 h-9 rounded object-cover" />
                    ) : null}
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold truncate">{a.name}</span>
                      <small className="text-slate-600 truncate">{a.slug}</small>
                    </div>
                  </div>
                </td>
                <td className="p-2 border-b border-slate-100">{a.title}</td>
                <td className="p-2 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {displayBooks.map((b) => {
                      const id = b._id || b;
                      const title = b.title || b.name || id || String(b);
                      const cover = Array.isArray(b.cover_image) ? b.cover_image[0] : b.cover_image;
                      return (
                        <div
                          key={id}
                          title={title}
                          className="flex max-w-[220px] items-center gap-1.5 rounded-full border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 px-2 py-1"
                        >
                          {cover ? (
                            <img
                              src={makeImgUrl(cover)}
                              alt={title}
                              className="w-[18px] h-[24px] object-cover rounded-[2px] flex-none"
                            />
                          ) : (
                            <span aria-hidden="true">📘</span>
                          )}
                          <span className="text-[12px] text-slate-900 truncate">{title}</span>
                          <button
                            type="button"
                            onClick={() => onRemoveBook(a._id, id)}
                            title="Remove this book from author"
                            className="ml-1 h-[18px] leading-[18px] px-1.5 text-red-500 border border-slate-200 rounded hover:bg-red-50"
                            name={`authors-remove-book-${id}`}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[12px] text-slate-700">
                      {totalBooks} {totalBooks === 1 ? "book" : "books"}
                    </span>
                  </div>
                </td>
                <td className="p-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => onEdit(a)}
                      className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
                      name={`authors-edit-${a._id}`}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onManage(a)}
                      disabled={loading}
                      className="px-2 py-1 rounded border border-sky-600 bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50"
                      name={`authors-manage-${a._id}`}
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => onDelete(a)}
                      disabled={loading}
                      className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                      name={`authors-delete-${a._id}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {authors.length === 0 && !loading ? (
            <tr>
              <td className="p-4 text-center text-slate-600" colSpan={4} name="authors-empty">
                No authors found
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
