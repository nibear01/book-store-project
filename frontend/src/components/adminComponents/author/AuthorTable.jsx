import React from "react";
import { Button } from "../../../Button/button.jsx";
import { Edit, BookOpen, Trash2, Eye } from "lucide-react";

export default function AuthorTable({ authors, loading, makeImgUrl, onManage, onEdit, onDelete, onRemoveBook, onViewBooks }) {
  return (
    <div className="overflow-x-auto" name="authors-table">
      <table className="min-w-full text-sm text-left" data-testid="authors-table" name="authors-table">
                <thead className="bg-gray-50 border-b border-zinc-200">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-700">Name</th>
            <th className="px-4 py-3 font-medium text-gray-700">Title</th>
            <th className="px-4 py-3 font-medium text-gray-700">Books</th>
            <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((a) => {
            const totalBooks = (a.books || []).length;
            const displayBooks = (a.books || []).slice(0, 4);
            return (
              <tr key={a._id} className="border-b border-zinc-100 hover:bg-gray-50 transition-colors" data-testid={`author-row-${a._id}`} name={`author-row-${a._id}`}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div className="flex items-center gap-3 min-w-0">
                    {a.photo ? (
                      <img src={makeImgUrl(a.photo)} alt={a.name} className="w-10 h-10 rounded object-cover flex-none" />
                    ) : null}
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{a.name}</span>
                      <small className="text-gray-600 truncate">{a.slug}</small>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{a.title}</td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">
                    {totalBooks} {totalBooks === 1 ? "book" : "books"}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                      onClick={() => onEdit(a)}
                      size="sm"
                      data-testid={`author-edit-btn-${a._id}`}
                      name={`author-edit-btn-${a._id}`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 transition-colors"
                      onClick={() => onManage(a)}
                      size="sm"
                      data-testid={`author-manage-btn-${a._id}`}
                      name={`author-manage-btn-${a._id}`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Manage
                    </Button>
                    <Button
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors"
                      onClick={() => onViewBooks(a)}
                      size="sm"
                      data-testid={`author-view-books-btn-${a._id}`}
                      name={`author-view-books-btn-${a._id}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Books
                    </Button>
                    <Button
                      onClick={() => onDelete(a)}
                      size="sm"
                      variant="destructive"
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors"
                      data-testid={`author-delete-btn-${a._id}`}
                      name={`author-delete-btn-${a._id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
          {authors.length === 0 && !loading ? (
            <tr>
              <td
                colSpan="4"
                className="text-center py-8 text-gray-500 italic"
              >
                No authors found
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
