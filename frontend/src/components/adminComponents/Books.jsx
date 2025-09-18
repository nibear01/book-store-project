import React, { useContext, useEffect, useMemo, useState } from "react";
import initialBooks from "../../data/dummyBooks.json";
import { BooksContext } from "@/context/BooksContext";
import FiltersBar from "./books/FiltersBar";
import BooksTable from "./books/BooksTable";
import PaginationBar from "./books/PaginationBar";
import AddEditBookModal from "./books/AddEditBookModal";
import DetailsModal from "./books/DetailsModal";
import DeleteConfirmModal from "./books/DeleteConfirmModal";
import Popup from "./books/Popup";
import { toGenreArray, normalizeBook } from "./books/utils";

const Books = () => {
  const { fetchBooks, deleteBook } = useContext(BooksContext);

  // Data
  const [books, setBooks] = useState(initialBooks);

  // UI State
  const [filters, setFilters] = useState({ genre: "all", sortPrice: "none", stock: "all", sortDate: "none" });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [detailsBook, setDetailsBook] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null, title: "" });

  // Popup
  const [popup, setPopup] = useState({ show: false, message: "" });

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchBooks({ status: "all" });
      setBooks(data.data);
    };
    fetchData();
  }, [fetchBooks]);

  // Reset page when filters/data change
  useEffect(() => setCurrentPage(1), [filters, books]);

  // Genre options
  const genreOptions = useMemo(() => {
    const set = new Set();
    (books || []).forEach((b) => toGenreArray(b?.genre).forEach((g) => set.add(g)));
    return Array.from(set);
  }, [books]);

  // Filter + sort
  const filteredSortedBooks = useMemo(() => {
    const safeTime = (b) => {
      const cand =
        b?.published_date ||
        b?.createdAt ||
        b?.created_at ||
        b?.updatedAt ||
        b?.updated_at ||
        "";
      const ms = new Date(cand).getTime();
      return Number.isFinite(ms) ? ms : null;
    };

    return (books || [])
      .filter((b) => (filters.genre === "all" ? true : toGenreArray(b?.genre).includes(filters.genre)))
      .filter((b) =>
        filters.stock === "all"
          ? true
          : filters.stock === "in"
          ? typeof b.stock === "number"
            ? b.stock > 0
            : true
          : typeof b.stock === "number"
          ? b.stock === 0
          : false
      )
      .sort((a, b) => {
        // Date sort (primary)
        if (filters.sortDate && filters.sortDate !== "none") {
          const ta = safeTime(a);
          const tb = safeTime(b);
          const aMs = ta === null ? (filters.sortDate === "newest" ? -Infinity : Infinity) : ta;
          const bMs = tb === null ? (filters.sortDate === "newest" ? -Infinity : Infinity) : tb;
          const cmpDate = filters.sortDate === "newest" ? bMs - aMs : aMs - bMs;
          if (cmpDate !== 0) return cmpDate;
        }
        // Price sort (secondary)
        if (filters.sortPrice === "asc") return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (filters.sortPrice === "desc") return (Number(b.price) || 0) - (Number(a.price) || 0);
        return 0;
      });
  }, [books, filters]);

  // Pagination
  const totalItems = filteredSortedBooks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const currentPageBooks = filteredSortedBooks.slice(startIdx, startIdx + pageSize);

  // Actions
  const openAddModal = () => {
    setSelectedForEdit(null);
    setShowAddModal(true);
  };
  const handleEdit = (book) => {
    setSelectedForEdit(book);
    setShowAddModal(true);
  };
  const onModalClose = () => {
    setShowAddModal(false);
    setSelectedForEdit(null);
  };
  const onModalSuccess = (raw) => {
    const normalized = normalizeBook(raw?.data || raw);
    if (selectedForEdit) {
      const editingId = String(selectedForEdit._id || selectedForEdit.id);
      setBooks((prev) =>
        prev.map((b) =>
          String(b._id || b.id) === editingId ? { ...b, ...normalized, _id: raw?._id ?? b._id } : b
        )
      );
      setPopup({ show: true, message: "Book updated successfully!" });
    } else {
      setBooks((prev) => [...prev, normalized]);
      setPopup({ show: true, message: "Book added successfully!" });
    }
    onModalClose();
  };
  const onModalError = (message) => setPopup({ show: true, message: message || "Error occurred!" });

  const openDeleteConfirm = (book) => setConfirm({ open: true, id: book._id || book.id, title: book.title || "this book" });
  const closeDeleteConfirm = () => setConfirm({ open: false, id: null, title: "" });

  const confirmDelete = async () => {
    if (!confirm.id) return;
    try {
      await deleteBook(confirm.id);
      setBooks((prev) => prev.filter((b) => String(b._id || b.id) !== String(confirm.id)));
      setPopup({ show: true, message: "Book deleted permanently!" });
    } catch (e) {
      setPopup({ show: true, message: "Failed to delete book!" });
    } finally {
      closeDeleteConfirm();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Books</h1>
        <button className="bg-slate-950 text-white px-5 py-2 rounded shadow hover:bg-slate-800 transition" onClick={openAddModal}>
          + Add Book
        </button>
      </div>

      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        genreOptions={genreOptions}
        onClear={() => setFilters({ genre: "all", sortPrice: "none", stock: "all", sortDate: "none" })}
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-3 overflow-x-auto">
          <BooksTable
            books={currentPageBooks}
            toGenreArray={toGenreArray}
            onViewDetails={setDetailsBook}
            onEdit={handleEdit}
            onDelete={openDeleteConfirm}
          />

          <PaginationBar
            totalItems={totalItems}
            startIdx={startIdx}
            pageSize={pageSize}
            totalPages={totalPages}
            currentPage={safePage}
            onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            onGoto={setCurrentPage}
          />
        </div>
      </div>

      {showAddModal && (
        <AddEditBookModal
          open={showAddModal}
          initialBook={selectedForEdit}
          onClose={onModalClose}
          onSuccess={onModalSuccess}
          onError={onModalError}
        />
      )}

      {popup.show && <Popup message={popup.message} onClose={() => setPopup({ show: false, message: "" })} />}

      {detailsBook && <DetailsModal book={detailsBook} toGenreArray={toGenreArray} onClose={() => setDetailsBook(null)} />}

      {confirm.open && (
        <DeleteConfirmModal
          open={confirm.open}
          title={confirm.title}
          onCancel={closeDeleteConfirm}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default Books;