import React, { useEffect, useMemo, useState } from "react";
import { useAuthors, AuthorProvider } from "../../context/AuthorContext.jsx";
// New: import extracted components and hooks
import SearchSortBar from "./author/SearchSortBar.jsx";
import AuthorTable from "./author/AuthorTable.jsx";
import AddAuthorModal from "./author/AddAuthorModal.jsx";
import EditAuthorModal from "./author/EditAuthorModal.jsx";
import ManageBooksModal from "./author/ManageBooksModal.jsx";
import DeleteConfirmationModal from "./author/DeleteConfirmationModal.jsx";
import { useDebouncedValue, useImageUrl } from "./author/hooks.js";

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
  const url = import.meta.env.VITE_BACKEND_URL;

  // delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Search/sort state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [sortBy, setSortBy] = useState("none");

  // Modal controls
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [manageAuthor, setManageAuthor] = useState(null);

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
        <SearchSortBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          shownCount={filteredAuthors.length}
          totalCount={authors.length}
          onClear={() => {
            setSearchTerm("");
            setSortBy("none");
          }}
        />
        <div
          className="mt-2 text-xs sm:text-sm text-gray-600"
          name="authors-results-info"
        >
          Showing {filteredAuthors.length} of {authors.length} authors
        </div>
      </div>

      <div name="authors-table-wrap">
        <AuthorTable
          authors={filteredAuthors}
          loading={loading}
          makeImgUrl={makeImgUrl}
          onManage={(a) => setManageAuthor(a)}
          onEdit={(a) => setEditTarget(a)}
          onDelete={requestDelete}
          onRemoveBook={onRemoveBookFromRow}
        />
      </div>

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
