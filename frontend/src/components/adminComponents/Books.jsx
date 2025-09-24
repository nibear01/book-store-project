import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import initialBooks from "../../data/dummyBooks.json";
import { BooksContext } from "@/context/BooksContext";
import FiltersBar from "./books/FiltersBar";
import BooksTable from "./books/BooksTable";
import PaginationBar from "./books/PaginationBar";
import AddEditBookModal from "./books/AddEditBookModal";
import DetailsModal from "./books/DetailsModal";
import DeleteConfirmModal from "./books/DeleteConfirmModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toGenreArray, normalizeBook } from "./books/utils";

const API_BASE = "http://localhost:5000"; // added

const Books = () => {
  const { fetchBooks, deleteBook, addBook } = useContext(BooksContext);

  // Data
  const [books, setBooks] = useState(initialBooks);

  // UI State
  const [filters, setFilters] = useState({
    genre: "all",
    sortPrice: "none",
    stock: "all",
    sortDate: "none",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add: search state
  const [search, setSearch] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [detailsBook, setDetailsBook] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null, title: "" });

  // Bulk import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({
    done: 0,
    total: 0,
    errors: 0,
  });
  const csvInputRef = useRef(null);

  // NEW: Bulk assets upload modal state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkImages, setBulkImages] = useState([]);
  const [bulkFiles, setBulkFiles] = useState([]);
  const [renameMapText, setRenameMapText] = useState("");
  const [imagesNamesText, setImagesNamesText] = useState("");
  const [filesNamesText, setFilesNamesText] = useState("");
  const [uploadingBulk, setUploadingBulk] = useState(false);

  // Simple CSV parser with quoted fields support
  const parseCSV = (text) => {
    const rows = [];
    let row = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (ch === '"' && next === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ",") {
          row.push(cur);
          cur = "";
        } else if (ch === "\n" || ch === "\r") {
          if (ch === "\r" && next === "\n") i++;
          row.push(cur);
          if (row.some((c) => c !== "")) rows.push(row);
          row = [];
          cur = "";
        } else {
          cur += ch;
        }
      }
    }
    if (cur.length || row.length) {
      row.push(cur);
      if (row.some((c) => c !== "")) rows.push(row);
    }
    return rows;
  };

  const handleOpenCSV = () => csvInputRef.current?.click();

  const handleCSVSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const text = await file.text();
    const rows = parseCSV(text);
    if (!rows.length) {
      toast.error("CSV is empty.");
      return;
    }
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const dataRows = rows.slice(1);

    // Map function for a row -> FormData
    const toFormData = (cells) => {
      const get = (key) => {
        const idx = headers.indexOf(key);
        return idx >= 0 ? cells[idx]?.trim() : "";
      };
      const fd = new FormData();
      // required fields
      fd.append("title", get("title") || "");
      fd.append("author", get("author") || "");
      fd.append("price", get("price") || "");
      fd.append("stock", get("stock") || "0");
      fd.append("meta_title", get("meta_title") || get("title") || "");
      // optionals
      const maybe = [
        "genre",
        "language",
        "isbn",
        "description",
        "publisher",
        "published_date",
        "pages",
        "meta_description",
        "meta_keywords",
        // NEW: allow URL-based assets from CSV
        "file_url",
        "cover_image",
        "cover_image_url",
        "cover_image_urls",
      ];
      maybe.forEach((k) => {
        const v = get(k);
        if (v !== "") fd.append(k, v);
      });
      // Also map alternative headers if present
      const altCoverOne = get("image_url") || get("cover_url");
      if (altCoverOne) fd.append("cover_image_url", altCoverOne);
      const altCoverMany = get("image_urls");
      if (altCoverMany) fd.append("cover_image_urls", altCoverMany);

      // booleans/numbers
      const bools = [
        "is_active",
        "is_featured",
        "is_on_sale",
        "is_deal_of_the_week",
      ];
      bools.forEach((k) => {
        const v = get(k);
        if (v !== "") fd.append(k, /^true|1|yes$/i.test(v));
      });
      const salePrice = get("sale_price");
      if (salePrice !== "") fd.append("sale_price", salePrice);
      const dealStart = get("deal_start");
      const dealEnd = get("deal_end");
      if (dealStart) fd.append("deal_start", dealStart);
      if (dealEnd) fd.append("deal_end", dealEnd);
      return fd;
    };

    if (!window.confirm(`Import ${dataRows.length} rows from CSV?`)) return;

    setImporting(true);
    setImportProgress({ done: 0, total: dataRows.length, errors: 0 });

    let added = 0;
    let errors = 0;
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      try {
        const fd = toFormData(row);
        const res = await addBook(fd);
        const normalized = normalizeBook(res?.data || res);
        setBooks((prev) => [...prev, normalized]);
        added++;
      } catch {
        errors++;
      } finally {
        setImportProgress({ done: i + 1, total: dataRows.length, errors });
      }
    }
    setImporting(false);
    toast.success(`Import finished. Added: ${added}, Errors: ${errors}.`);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchBooks({ status: "all" });
      console.log(data.data);
      
      setBooks(data.data);
    };
    fetchData();
  }, [fetchBooks]);

  // Reset page when filters/data/search change
  useEffect(() => setCurrentPage(1), [filters, books, search]);

  // Genre options
  const genreOptions = useMemo(() => {
    const set = new Set();
    (books || []).forEach((b) =>
      toGenreArray(b?.genre).forEach((g) => set.add(g))
    );
    return Array.from(set);
  }, [books]);

  // Filter + sort (add search filtering)
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

    const q = search.trim().toLowerCase();

    return (books || [])
      .filter((b) => {
        if (!q) return true;
        const title = String(b?.title || "").toLowerCase();
        const author = String(b?.author || "").toLowerCase();
        const isbn = String(b?.isbn || "").toLowerCase();
        const genres = toGenreArray(b?.genre).join(", ").toLowerCase();
        return (
          title.includes(q) ||
          author.includes(q) ||
          isbn.includes(q) ||
          genres.includes(q)
        );
      })
      .filter((b) =>
        filters.genre === "all"
          ? true
          : toGenreArray(b?.genre).includes(filters.genre)
      )
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
          const aMs =
            ta === null
              ? filters.sortDate === "newest"
                ? -Infinity
                : Infinity
              : ta;
          const bMs =
            tb === null
              ? filters.sortDate === "newest"
                ? -Infinity
                : Infinity
              : tb;
          const cmpDate = filters.sortDate === "newest" ? bMs - aMs : aMs - bMs;
          if (cmpDate !== 0) return cmpDate;
        }
        // Price sort (secondary)
        if (filters.sortPrice === "asc")
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (filters.sortPrice === "desc")
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        return 0;
      });
  }, [books, filters, search]);

  // Pagination
  const totalItems = filteredSortedBooks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const currentPageBooks = filteredSortedBooks.slice(
    startIdx,
    startIdx + pageSize
  );

  // console.log("Total books after filtering:", filteredSortedBooks.length);
  // console.log("Total pages:", totalPages);
  // console.log("Current page:", safePage);

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

  // Add back: success/error handlers so list updates and popup shows
  const onModalSuccess = (raw) => {
    const normalized = normalizeBook(raw?.data || raw);
    if (selectedForEdit) {
      const editingId = String(selectedForEdit._id || selectedForEdit.id);
      setBooks((prev) =>
        prev.map((b) =>
          String(b._id || b.id) === editingId
            ? { ...b, ...normalized, _id: raw?._id ?? b._id }
            : b
        )
      );
      toast.success("Book updated successfully!");
    } else {
      setBooks((prev) => [...prev, normalized]);
      toast.success("Book added successfully!");
    }
    onModalClose();
  };
  const onModalError = (message) => toast.error(message || "Error occurred!");

  // Fix: missing delete confirm helpers
  const openDeleteConfirm = (book) =>
    setConfirm({
      open: true,
      id: book._id || book.id,
      title: book.title || "this book",
    });
  const closeDeleteConfirm = () =>
    setConfirm({ open: false, id: null, title: "" });
  const confirmDelete = async () => {
    if (!confirm.id) return;
    try {
      await deleteBook(confirm.id);
      setBooks((prev) =>
        prev.filter((b) => String(b._id || b.id) !== String(confirm.id))
      );
      toast.success("Book deleted permanently!");
    } catch {
      toast.error("Failed to delete book!");
    } finally {
      closeDeleteConfirm();
    }
  };

  // NEW: Bulk modal open/close
  const openBulkModal = () => {
    setShowBulkModal(true);
    setBulkImages([]);
    setBulkFiles([]);
    setRenameMapText("");
    setImagesNamesText("");
    setFilesNamesText("");
    setUploadingBulk(false);
  };
  const closeBulkModal = () => {
    if (uploadingBulk) return;
    setShowBulkModal(false);
  };

  // NEW: Bulk upload submit
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkImages.length && !bulkFiles.length) {
      toast.error("Select at least one image or file.");
      return;
    }

    let renameMap = null;
    if (renameMapText.trim()) {
      try {
        renameMap = JSON.parse(renameMapText);
        if (typeof renameMap !== "object" || Array.isArray(renameMap)) {
          throw new Error("renameMap must be a JSON object");
        }
      } catch (err) {
        toast.error(`Invalid renameMap JSON: ${err.message}`);
        return;
      }
    }

    const toNamesArray = (txt) =>
      txt
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);

    const imagesNames = imagesNamesText.trim()
      ? toNamesArray(imagesNamesText)
      : null;
    const filesNames = filesNamesText.trim()
      ? toNamesArray(filesNamesText)
      : null;

    const fd = new FormData();
    bulkImages.forEach((f) => fd.append("bulk_images", f));
    bulkFiles.forEach((f) => fd.append("bulk_files", f));
    if (renameMap) fd.append("renameMap", JSON.stringify(renameMap));
    if (imagesNames) fd.append("imagesNames", JSON.stringify(imagesNames));
    if (filesNames) fd.append("filesNames", JSON.stringify(filesNames));

    try {
      setUploadingBulk(true);
      // Use axios + bearer token
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      const { data } = await axios.post(
        `${API_BASE}/api/books/bulk-upload`,
        fd,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            // Do not set Content-Type; browser will set proper boundary for FormData
          },
          // Do not send cookies to avoid CORS credentials issues
        }
      );

      const imgCount = Array.isArray(data?.data?.images)
        ? data.data.images.length
        : 0;
      const fileCount = Array.isArray(data?.data?.files)
        ? data.data.files.length
        : 0;
      toast.success(
        `Bulk upload successful. Images: ${imgCount}, Files: ${fileCount}.`
      );
      setShowBulkModal(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Bulk upload failed.";
      toast.error(String(msg));
    } finally {
      setUploadingBulk(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Books</h1>
        <div className="flex items-center gap-2">
          {/* NEW: Bulk upload trigger */}
          <button
            type="button"
            className="border px-5 py-2 rounded-[2px] hover:bg-gray-100 transition"
            onClick={openBulkModal}
            title="Bulk upload images and files"
          >
            Bulk Upload Assets
          </button>
          {/* existing CSV import */}
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleCSVSelected}
            className="hidden"
          />
          <button
            type="button"
            className="border px-5 py-2 rounded-[2px] hover:bg-gray-100 transition disabled:opacity-50"
            onClick={handleOpenCSV}
            disabled={importing}
            title="Bulk Import from CSV"
          >
            Import CSV
          </button>
          <button
            className="bg-slate-950 text-white px-5 py-2 rounded shadow hover:bg-slate-800 transition"
            onClick={openAddModal}
          >
            + Add Book
          </button>
        </div>
      </div>

      {importing && (
        <div className="mb-3 text-sm text-gray-600">
          Importing {importProgress.done}/{importProgress.total} &middot;
          Errors: {importProgress.errors}
        </div>
      )}

      {/* Add: Search bar */}
      <div className="mt-2 mb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, author, ISBN, or genre"
          className="w-full sm:max-w-md border px-3 py-2 rounded-[2px]"
        />
      </div>

      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        genreOptions={genreOptions}
        onClear={() =>
          setFilters({
            genre: "all",
            sortPrice: "none",
            stock: "all",
            sortDate: "none",
          })
        }
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
            onGoto={setCurrentPage} // Make sure this is included
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

      {/* NEW: Bulk upload modal */}
      {showBulkModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50"
          onClick={closeBulkModal}
        >
          <div
            className="bg-white rounded-[2px] shadow-xl w-full max-w-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bulk Upload Assets</h3>
              <button
                className="text-gray-600"
                onClick={closeBulkModal}
                disabled={uploadingBulk}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setBulkImages(Array.from(e.target.files || []))
                  }
                  disabled={uploadingBulk}
                  className="w-full border px-3 py-2 rounded-[2px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bulkImages.length} selected
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Book Files (PDF/EPUB)
                </label>
                <input
                  type="file"
                  accept="application/pdf,application/epub+zip,.pdf,.epub"
                  multiple
                  onChange={(e) =>
                    setBulkFiles(Array.from(e.target.files || []))
                  }
                  disabled={uploadingBulk}
                  className="w-full border px-3 py-2 rounded-[2px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bulkFiles.length} selected
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Optional renameMap (JSON object: originalName - desired name)
                </label>
                <textarea
                  rows={3}
                  placeholder='e.g. { "old cover.jpg": "new-cover.jpg", "book.pdf": "my-book.pdf" }'
                  value={renameMapText}
                  onChange={(e) => setRenameMapText(e.target.value)}
                  disabled={uploadingBulk}
                  className="mt-1 w-full border px-3 py-2 rounded-[2px] text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Optional image names (one per line, index-aligned)
                  </label>
                  <textarea
                    rows={4}
                    placeholder={"cover-1\ncover-2\ncover-3"}
                    value={imagesNamesText}
                    onChange={(e) => setImagesNamesText(e.target.value)}
                    disabled={uploadingBulk}
                    className="mt-1 w-full border px-3 py-2 rounded-[2px] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Optional file names (one per line, index-aligned)
                  </label>
                  <textarea
                    rows={4}
                    placeholder={"file-1\nfile-2\nfile-3"}
                    value={filesNamesText}
                    onChange={(e) => setFilesNamesText(e.target.value)}
                    disabled={uploadingBulk}
                    className="mt-1 w-full border px-3 py-2 rounded-[2px] text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-[2px] text-sm"
                  onClick={closeBulkModal}
                  disabled={uploadingBulk}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 text-white rounded-[2px] text-sm hover:bg-slate-800 disabled:opacity-60"
                  disabled={uploadingBulk}
                >
                  {uploadingBulk ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      {detailsBook && (
        <DetailsModal
          book={detailsBook}
          toGenreArray={toGenreArray}
          onClose={() => setDetailsBook(null)}
        />
      )}

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
