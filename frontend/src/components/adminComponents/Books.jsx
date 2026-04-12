import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import initialBooks from "../../data/dummyBooks.json";
import { BooksContext } from "@/context/BooksContext";
import FiltersBar from "./books/FiltersBar";
import BooksTable from "./books/BooksTable";
import {
  computeFinalConfiguredPrice,
  defaultPrintState,
} from "../bookViewComponents/BookPrintPricing";
import Pagination from "./common/Pagination";
import WorkflowSkeleton from "./common/WorkflowSkeleton";
import AddEditBookModal from "./books/AddEditBookModal";
import DetailsModal from "./books/DetailsModal";
import DeleteConfirmModal from "./books/DeleteConfirmModal";
import { toast } from "react-toastify";
import { toGenreArray, normalizeBook } from "./books/utils";
import CategoryManager from "./categories/CategoryManager";
import { useDebounce } from "./common/useDebounce";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Books = () => {
  const { fetchBooks, deleteBook, addBook } = useContext(BooksContext);

  // Data
  const [books, setBooks] = useState(initialBooks);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
  }); // Track cursor fetch progress

  // UI State
  const [filters, setFilters] = useState({
    genre: "all",
    sortPrice: "none",
    stock: "all",
    sortDate: "none",
  });
  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory' | 'categories'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add: search state
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

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

  // Global print pricing config & mode
  const [printSettings, setPrintSettings] = useState(null);
  const pricingMode = printSettings?.mode || "relative";
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/settings/print-config`,
        );
        const data = await res.json();
        if (alive && res.ok && data.success && data.data)
          setPrintSettings(data.data);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

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
      const normalizeIsbn = (val) => {
        const raw = String(val || "").trim();
        if (!raw) return "";
        // Extract digits first
        let digits = raw.replace(/\D/g, "");
        if (!digits && /e\+/i.test(raw)) {
          // Handle scientific notation like 9.78E+12
          const n = Number(raw);
          if (Number.isFinite(n)) {
            digits = Math.round(n).toString();
          }
        }
        if (digits.length >= 13) return digits.slice(0, 13);
        if (digits.length === 10) return digits;
        return digits;
      };
      const fd = new FormData();
      // required fields
      fd.append("title", get("title") || "");
      fd.append("author", get("author") || "");
      // Pricing: if derived mode use computed derived price (contentFee + per-page + margin), else take CSV price
      if (pricingMode === "derived" && printSettings) {
        const pagesRaw = get("pages");
        const pagesNum = Number(pagesRaw) || 0;
        const { price: derivedPrice } = computeFinalConfiguredPrice({
          baseContentPrice: 0,
          pages: pagesNum,
          cfg: defaultPrintState,
          settings: printSettings,
        });
        fd.append("price", String(derivedPrice));
      } else {
        fd.append("price", get("price") || "");
      }
      fd.append("stock", get("stock") || "0");
      fd.append("meta_title", get("meta_title") || get("title") || "");
      // optionals
      const maybe = [
        "genre",
        "language",
        // isbn handled separately to normalize digits
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
      // Normalize and append ISBN if present
      const isbn = normalizeIsbn(get("isbn"));
      if (isbn) fd.append("isbn", isbn);
      // Also map alternative headers if present
      const altCoverOne = get("image_url") || get("cover_url");
      if (altCoverOne) fd.append("cover_image_url", altCoverOne);
      const altCoverMany = get("image_urls");
      if (altCoverMany) fd.append("cover_image_urls", altCoverMany);

      // booleans/numbers
      const rawIsOnSale = get("is_on_sale");
      const isOnSale = /^true|1|yes$/i.test(rawIsOnSale);
      const rawActive = get("is_active");
      const rawFeatured = get("is_featured");
      const rawDealWeek = get("is_deal_of_the_week");
      const rawPrintOnDemand = get("isPrintOnDemand"); // added
      if (rawActive !== "")
        fd.append("is_active", /^true|1|yes$/i.test(rawActive) ? "1" : "0");
      if (rawFeatured !== "")
        fd.append("is_featured", /^true|1|yes$/i.test(rawFeatured) ? "1" : "0");
      if (rawIsOnSale !== "") fd.append("is_on_sale", isOnSale ? "1" : "0");
      if (rawDealWeek !== "")
        fd.append(
          "is_deal_of_the_week",
          /^true|1|yes$/i.test(rawDealWeek) ? "1" : "0",
        );
      if (rawPrintOnDemand !== "")
        // added
        fd.append(
          "isPrintOnDemand",
          /^true|1|yes$/i.test(rawPrintOnDemand) ? "1" : "0",
        );
      const salePrice = get("sale_price");
      if (isOnSale && salePrice !== "") fd.append("sale_price", salePrice);
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

  // Industry-standard: Cursor-based recursive fetch for unlimited books
  // Fetches all books regardless of count (10K, 100K, 1M+) in 5K batches
  const refetch = async () => {
    try {
      setLoading(true);
      setLoadingProgress({ current: 0, total: 0 });

      const allBooks = [];
      let cursor = null;
      let batchCount = 0;

      // Recursively fetch all books using cursor pagination
      while (true) {
        batchCount++;
        setLoadingProgress({ current: batchCount, total: 0 }); // Show batch progress

        // Fetch with max limit (5000) using cursor
        const response = await fetchBooks({
          status: "all",
          limit: 5000,
          ...(cursor && { cursor }),
        });

        const batchData = response?.data || response || [];
        const pagination = response?.pagination || {};

        // Accumulate books
        allBooks.push(...batchData);

        // Check if there are more pages
        if (!pagination?.hasNextPage || !pagination?.nextCursor) {
          break; // No more pages
        }

        // Update cursor for next batch
        cursor = pagination.nextCursor;
      }

      setBooks(allBooks);
      setLoadingProgress({ current: batchCount, total: batchCount });
    } catch (error) {
      console.error("Failed to fetch books:", error);
      toast.error(
        "Failed to fetch books: " + (error?.message || "Unknown error"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchBooks]);

  // Reset page when filters/data/search change
  useEffect(() => setCurrentPage(1), [filters, books, debouncedSearch]);

  // Genre options
  const genreOptions = useMemo(() => {
    const set = new Set();
    (books || []).forEach((b) =>
      toGenreArray(b?.genre).forEach((g) => set.add(g)),
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

    const q = debouncedSearch.trim().toLowerCase();

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
          : toGenreArray(b?.genre).includes(filters.genre),
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
              : false,
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
  }, [books, filters, debouncedSearch]);

  // Pagination
  const totalItems = filteredSortedBooks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const currentPageBooks = filteredSortedBooks.slice(
    startIdx,
    startIdx + pageSize,
  );

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
            : b,
        ),
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
        prev.filter((b) => String(b._id || b.id) !== String(confirm.id)),
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
          },
        },
      );

      const imgCount = Array.isArray(data?.data?.images)
        ? data.data.images.length
        : 0;
      const fileCount = Array.isArray(data?.data?.files)
        ? data.data.files.length
        : 0;
      toast.success(
        `Bulk upload successful. Images: ${imgCount}, Files: ${fileCount}.`,
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex-col sm:items-center sm:justify-between gap-2 mb-1 sm:mb-3">
          <h1 className="text-lg sm:text-xl font-bold" name="books-page-title">
            Books & Categories Management
          </h1>
          <p className="text-gray-600 text-sm">
            Manage your book inventory and categories here.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="px-2 py-1 rounded bg-gray-100 border text-[11px] uppercase tracking-wide"
              title="Global pricing mode"
            >
              Mode:{" "}
              {pricingMode === "derived"
                ? "Derived (Auto)"
                : "Relative (Manual)"}
            </span>
            {pricingMode === "derived" && printSettings && (
              <span
                className="px-2 py-1 rounded bg-gray-50 border text-[11px]"
                title="Derived pricing formula"
              >
                Content Fee: ৳{Number(printSettings.contentFee || 0).toFixed(2)}{" "}
                · Base/Page: ৳
                {Number(printSettings.basePerPage || 0).toFixed(2)} · Margin:{" "}
                {printSettings.margin?.type === "flat"
                  ? `৳${Number(printSettings.margin?.value || 0).toFixed(2)}`
                  : `${Number(printSettings.margin?.value || 0)}%`}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={refetch}
            className="px-3 py-2 bg-black text-white text-xs sm:text-sm rounded-lg hover:bg-gray-800 transition-colors md:ml-4"
            name="books-refresh-btn"
          >
            Refresh Books
          </button>
          {/* Actions: Bulk Upload, Import CSV, Add Book */}
          <button
            type="button"
            className="px-3 py-2 border rounded-lg hover:bg-gray-100 transition text-xs sm:text-sm"
            onClick={openBulkModal}
            title="Bulk upload images and files"
            name="books-bulk-upload-btn"
          >
            Bulk Upload Assets
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleCSVSelected}
            className="hidden"
            name="books-import-csv-input"
          />
          <button
            type="button"
            className="px-3 py-2 border rounded-lg hover:bg-gray-100 transition disabled:opacity-50 text-xs sm:text-sm"
            onClick={handleOpenCSV}
            disabled={importing}
            title="Bulk Import from CSV"
            name="books-import-csv-btn"
          >
            Import CSV
          </button>
          <button
            className="bg-black text-white px-3 py-2 rounded-lg shadow hover:bg-gray-800 transition text-xs sm:text-sm"
            onClick={openAddModal}
            name="books-add-btn"
          >
            + Add Book
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-zinc-200 rounded-md p-2 flex gap-2 w-full">
        <button
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
            activeTab === "inventory"
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("inventory")}
        >
          Inventory
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
            activeTab === "categories"
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
      </div>

      {activeTab === "inventory" && (
        <>
          {/* Controls Card: Search + Filters */}
          <div className="mb-3 sm:mb-6 bg-white p-3 sm:p-4 rounded-md border-zinc-200 border flex flex-col gap-3">
            <div className="w-full ">
              <div className="">
                <input
                  type="text"
                  placeholder="Search by title, author, ISBN, or genre"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-3 pr-9 sm:pr-10 py-2 text-sm sm:text-base border  rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  name="books-search-input"
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className="absolute inset-y-0 right-2 flex items-center px-1 text-gray-400 hover:text-gray-600"
                    name="books-clear-search-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Filters Grid */}
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

            {importing && (
              <div className="text-sm text-gray-600">
                Importing {importProgress.done}/{importProgress.total} · Errors:{" "}
                {importProgress.errors}
              </div>
            )}

            {loading && (
              <div className="text-sm text-blue-600 font-medium">
                🔄 Loading books...
                {loadingProgress.current > 0 &&
                  ` (Batch ${loadingProgress.current})`}
              </div>
            )}
          </div>

          {/* Books Count */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <div className="mb-3 text-sm text-gray-600">
              Showing {currentPageBooks.length} of {filteredSortedBooks.length}{" "}
              books
            </div>
          </div>

          {/* Table - Desktop */}
          <div className="hidden sm:block overflow-x-auto bg-white border-zinc-200 border rounded-md">
            {loading ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 sm:p-3 text-left border-b">Cover</th>
                    <th className="p-2 sm:p-3 text-left border-b">Title</th>
                    <th className="p-2 sm:p-3 text-left border-b hidden sm:table-cell">
                      Author
                    </th>
                    <th className="p-2 sm:p-3 text-left border-b hidden md:table-cell">
                      Genre
                    </th>
                    <th className="p-2 sm:p-3 text-center border-b">Stock</th>
                    <th className="p-2 sm:p-3 text-right border-b">Price</th>
                    <th className="p-2 sm:p-3 text-center border-b">Actions</th>
                  </tr>
                </thead>
                <WorkflowSkeleton rows={10} variant="table" columns={7} />
              </table>
            ) : (
              <BooksTable
                books={currentPageBooks}
                toGenreArray={toGenreArray}
                onViewDetails={setDetailsBook}
                onEdit={handleEdit}
                onDelete={openDeleteConfirm}
                pricingMode={pricingMode}
                printSettings={printSettings}
              />
            )}
          </div>

          {/* Mobile Cards */}
          <div className="block sm:hidden space-y-4">
            {loading ? (
              <WorkflowSkeleton rows={5} variant="card" />
            ) : currentPageBooks.length === 0 ? (
              <div className="bg-white p-4 rounded-md border text-center text-gray-500">
                No books found matching your criteria
              </div>
            ) : (
              currentPageBooks.map((book) => {
                const genreLabel = toGenreArray(book?.genre).join(", ");
                const coverRaw = Array.isArray(book.cover_image)
                  ? book.cover_image[0]
                  : book.cover_image;
                const cover =
                  typeof coverRaw === "string"
                    ? /^https?:\/\//i.test(coverRaw)
                      ? coverRaw
                      : `${API_BASE}${coverRaw}`
                    : null;

                return (
                  <div
                    key={book._id || book.id}
                    className="bg-white p-4 rounded-md border border-zinc-200"
                  >
                    <div className="flex gap-3">
                      {/* Cover */}
                      <div className="flex-shrink-0">
                        {cover ? (
                          <img
                            src={cover}
                            alt={book.title}
                            className="h-16 w-12 object-cover rounded"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-16 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className="h-6 w-6"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="M4 5.5A2.5 2.5 0 016.5 3H18a1 1 0 011 1v16a1 1 0 01-1.447.894L14 19.118l-3.553 1.776A1 1 0 019 20V5H6.5A2.5 2.5 0 004 7.5v-2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {book.title}
                        </h3>
                        {book.author && (
                          <p className="text-sm text-gray-600 truncate">
                            {book.author}
                          </p>
                        )}
                        {genreLabel && (
                          <p className="text-sm text-gray-500 truncate">
                            {genreLabel}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-medium">Stock: </span>
                            <span
                              className={
                                typeof book.stock === "number" && book.stock > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {typeof book.stock === "number"
                                ? book.stock
                                : "N/A"}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ৳{Number(book.price || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex gap-2 justify-end">
                      <button
                        onClick={() => setDetailsBook(book)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors"
                        name={`book-view-btn-mobile-${book._id || book.id}`}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(book)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                        name={`book-edit-btn-mobile-${book._id || book.id}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(book)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors"
                        name={`book-delete-btn-mobile-${book._id || book.id}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <Pagination
            page={safePage}
            total={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            namePrefix="books"
          />
        </>
      )}

      {showAddModal && (
        <AddEditBookModal
          open={showAddModal}
          initialBook={selectedForEdit}
          onClose={onModalClose}
          onSuccess={onModalSuccess}
          onError={onModalError}
        />
      )}

      {/* Bulk upload modal */}
      {showBulkModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50"
          onClick={closeBulkModal}
          name="books-bulk-modal-overlay"
        >
          <div
            className="bg-white rounded-md shadow-xl w-full max-w-2xl p-6"
            onClick={(e) => e.stopPropagation()}
            name="books-bulk-modal"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bulk Upload Assets</h3>
              <button
                className="text-gray-600"
                onClick={closeBulkModal}
                disabled={uploadingBulk}
                name="books-bulk-close-btn"
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
                  name="bulk-images-input"
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
                  name="bulk-files-input"
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
                  name="bulk-rename-map-input"
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
                    name="bulk-images-names-input"
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
                    name="bulk-files-names-input"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-[2px] text-sm"
                  onClick={closeBulkModal}
                  disabled={uploadingBulk}
                  name="bulk-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 text-white rounded-[2px] text-sm hover:bg-slate-800 disabled:opacity-60"
                  disabled={uploadingBulk}
                  name="bulk-upload-btn"
                >
                  {uploadingBulk ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Category Management Section */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-md border p-4">
          <CategoryManager />
        </div>
      )}
    </div>
  );
};

export default Books;
