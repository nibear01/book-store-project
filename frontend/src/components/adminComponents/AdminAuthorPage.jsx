import React, { useEffect, useMemo, useState } from "react";
import { useAuthors, AuthorProvider } from "../../context/AuthorContext.jsx";
// New: import extracted components and hooks
import SearchSortBar from "./author/SearchSortBar.jsx";
import AuthorTable from "./author/AuthorTable.jsx";
import AddAuthorModal from "./author/AddAuthorModal.jsx";
import EditAuthorModal from "./author/EditAuthorModal.jsx";
import ManageBooksModal from "./author/ManageBooksModal.jsx";
import DeleteConfirmationModal from "./author/DeleteConfirmationModal.jsx";
import ViewBooksModal from "./author/ViewBooksModal.jsx";
import { useDebouncedValue, useImageUrl } from "./author/hooks.js";
import WorkflowSkeleton from "./common/WorkflowSkeleton";
import Pagination from "./user/Pagination";
import { Edit, BookOpen, Trash2, Eye } from "lucide-react";
import { Button } from "../../Button/button.jsx";
import { BACKEND_URL } from "../../api/apiBase";

const AdminAuthorPageInner = () => {
  const {
    authors,
    list,
    create,
    uploadPhoto,
    addBook,
    remove,
    loading,
    error,
    removeBook,
    searchBooks,
    update,
    findBookByISBN, // New: bring directly from context
  } = useAuthors();
  const url = BACKEND_URL;

  // delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Search/sort state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [sortBy, setSortBy] = useState("none");

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10; // Match users page size

  // Modal controls
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [manageAuthor, setManageAuthor] = useState(null);
  const [viewBooksAuthor, setViewBooksAuthor] = useState(null);

  useEffect(() => {
    list().catch(() => {});
  }, [list]);

  // open confirmation modal for deleting an author
  const requestDelete = (author) => {
    setDeleteTarget(author || null);
    setDeleteOpen(true);
  };

  const cancelDelete = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return cancelDelete();
    try {
      await remove(deleteTarget._id);
      // refresh list to be safe
      await list();
    } catch {
      // handled in context
    } finally {
      cancelDelete();
    }
  };

  // Filter + sort authors
  const filteredAuthors = useMemo(() => {
    if (!authors || authors.length === 0) return [];
    const q = (debouncedSearch || "").toLowerCase();
    const arr = authors.filter((a) => {
      if (!q) return true;
      const hay = `${a.name || ""} ${a.title || ""} ${a.slug || ""} ${
        a.bio || ""
      }`.toLowerCase();
      return hay.includes(q);
    });
    if (sortBy === "books_desc")
      return [...arr].sort(
        (x, y) => (y?.books?.length || 0) - (x?.books?.length || 0)
      );
    if (sortBy === "books_asc")
      return [...arr].sort(
        (x, y) => (x?.books?.length || 0) - (y?.books?.length || 0)
      );
    return arr;
  }, [authors, debouncedSearch, sortBy]);

  // Pagination calculations
  const totalAuthors = filteredAuthors.length;
  const totalPages = Math.ceil(totalAuthors / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedAuthors = filteredAuthors.slice(startIndex, endIndex);

  // Utilities
  const makeImgUrl = useImageUrl(url);

  // Row actions
  const onRemoveBookFromRow = async (authorId, bookId) => {
    if (!authorId || !bookId) return;
    try {
      await removeBook(authorId, bookId);
      await list();
    } catch {
      // handled upstream
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0" name="authors-admin">
      {/* Header */}
      <div
        className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        name="authors-header"
      >
        <div className="min-w-0">
          <h2 className="text-xl sm:text-xl font-bold" name="authors-title">
            Authors
          </h2>
          <p className="text-gray-600 text-sm" name="authors-subtitle">
            Manage authors, books, and profiles.
          </p>
        </div>
        <div className="flex items-center gap-2" name="authors-actions">
          <button
            type="button"
            onClick={() => list()}
            disabled={loading}
            className="px-3 py-2 border rounded-md text-xs sm:text-sm hover:bg-gray-100 disabled:opacity-60"
            name="authors-refresh-btn"
          >
            Refresh
          </button>
          <button
            onClick={() => setAddOpen(true)}
            disabled={loading}
            className="px-3 py-2 rounded-md text-white bg-black hover:bg-slate-900 disabled:opacity-50 text-xs sm:text-sm"
            name="authors-add-btn"
          >
            + Add Author
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-3 text-rose-600" role="alert" name="authors-error">
          {error}
        </div>
      ) : null}

      {/* Toolbar */}
      <div
        className="bg-white border rounded-md p-3 sm:p-4 mb-3 sm:mb-4"
        name="authors-toolbar"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search authors by name, title, slug or bio…"
              className="border border-zinc-200 rounded-md px-3 py-2 text-sm min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="authors-search"
              name="authors-search-input"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort</label>
              <select
                className="border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                data-testid="authors-sort"
                name="authors-sort-filter"
              >
                <option value="none">Default</option>
                <option value="books_desc">Most books</option>
                <option value="books_asc">Fewest books</option>
              </select>
            </div>
          </div>
        </div>
        <div
          className="mt-2 text-xs sm:text-sm text-gray-600"
          name="authors-results-info"
        >
          Showing {displayedAuthors.length} of {totalAuthors} authors
        </div>
      </div>

      <div name="authors-table-wrap">
        {/* Table for desktop */}
        <div className="bg-white border border-zinc-200 rounded-md overflow-hidden hidden md:block">
          <AuthorTable
            authors={displayedAuthors}
            loading={loading}
            makeImgUrl={makeImgUrl}
            onManage={(a) => setManageAuthor(a)}
            onEdit={(a) => setEditTarget(a)}
            onDelete={requestDelete}
            onRemoveBook={onRemoveBookFromRow}
            onViewBooks={(a) => setViewBooksAuthor(a)}
          />
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <WorkflowSkeleton rows={6} variant="cards" />
          ) : displayedAuthors.length === 0 ? (
            <div className="text-center py-8 text-gray-500 italic bg-white rounded-md border border-zinc-200">
              No authors found
            </div>
          ) : (
            displayedAuthors.map((author) => (
              <div
                key={author._id}
                className="bg-white p-4 rounded-md border border-zinc-200 hover:shadow-md transition-shadow"
                data-testid={`author-card-${author._id}`}
                name={`author-card-${author._id}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {author.photo ? (
                      <img
                        src={makeImgUrl(author.photo)}
                        alt={author.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : null}
                    <div>
                      <h3 className="font-medium text-gray-900">{author.name}</h3>
                      <p className="text-sm text-gray-600">{author.title}</p>
                      <p className="text-xs text-gray-500">{author.slug}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-md">
                      {(author.books || []).length} {(author.books || []).length === 1 ? "book" : "books"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setEditTarget(author)}
                    size="sm"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                    data-testid={`author-edit-btn-${author._id}`}
                    name={`author-edit-btn-${author._id}`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setManageAuthor(author)}
                    size="sm"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 transition-colors"
                    data-testid={`author-manage-btn-${author._id}`}
                    name={`author-manage-btn-${author._id}`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Manage
                  </Button>
                  <Button
                    onClick={() => setViewBooksAuthor(author)}
                    size="sm"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors"
                    data-testid={`author-view-books-btn-${author._id}`}
                    name={`author-view-books-btn-${author._id}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Books
                  </Button>
                  <Button
                    onClick={() => requestDelete(author)}
                    size="sm"
                    variant="destructive"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors"
                    data-testid={`author-delete-btn-${author._id}`}
                    name={`author-delete-btn-${author._id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Author
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalAuthors}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
        itemName="authors"
      />

      <AddAuthorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        createAuthor={create}
        uploadPhoto={uploadPhoto}
        refresh={list}
        loading={loading}
      />

      <EditAuthorModal
        open={!!editTarget}
        author={editTarget}
        onClose={() => setEditTarget(null)}
        updateAuthor={update}
        uploadPhoto={uploadPhoto}
        refresh={list}
        loading={loading}
      />

      <ManageBooksModal
        open={!!manageAuthor}
        author={manageAuthor}
        onClose={() => setManageAuthor(null)}
        searchBooks={searchBooks}
        addBook={addBook}
        removeBook={removeBook}
        refresh={list}
        makeImgUrl={makeImgUrl}
        loading={loading}
        findBookByISBN={findBookByISBN} // fixed
      />

      <DeleteConfirmationModal
        open={deleteOpen}
        author={deleteTarget}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        loading={loading}
      />

      <ViewBooksModal
        open={!!viewBooksAuthor}
        author={viewBooksAuthor}
        onClose={() => setViewBooksAuthor(null)}
        makeImgUrl={makeImgUrl}
      />
    </div>
  );
};

// Wrap with AuthorProvider to guarantee context availability
export default function AdminAuthorPage() {
  return (
    <AuthorProvider>
      <AdminAuthorPageInner />
    </AuthorProvider>
  );
}
