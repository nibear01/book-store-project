import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDebouncedValue } from "./hooks";

export default function ManageBooksModal({
  open,
  author,
  onClose,
  searchBooks,
  addBook,
  removeBook,
  refresh,
  makeImgUrl,
  loading,
  findBookByISBN,
}) {
  const [bookSearch, setBookSearch] = useState("");
  const [bookResults, setBookResults] = useState([]);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState("");
  const [selectedBookIds, setSelectedBookIds] = useState(new Set());
  const [existingBookIds, setExistingBookIds] = useState(new Set());

  // CSV import state
  const [csvIsbns, setCsvIsbns] = useState([]);
  const [csvError, setCsvError] = useState("");
  const [importRunning, setImportRunning] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!open || !author) return;
    const ids = new Set((author?.books || []).map((b) => b._id || b.id || b));
    setExistingBookIds(ids);
    setSelectedBookIds(new Set());
    setBookSearch("");
    setBookResults([]);
    setCsvIsbns([]);
    setCsvError("");
    setImportRunning(false);
    setImportStats(null);
  }, [open, author]);

  const fetchBooks = useCallback(
    async (q = "") => {
      setBookLoading(true);
      setBookError("");
      try {
        const listArr = await searchBooks(q, { limit: 15 });
        setBookResults(listArr);
        if (!listArr.length)
          setBookError("No books found. Try a different search.");
      } catch (e) {
        setBookError(e.message || "Failed to load books");
      } finally {
        setBookLoading(false);
      }
    },
    [searchBooks]
  );

  const debouncedSearch = useDebouncedValue(bookSearch, 300);
  useEffect(() => {
    if (!open) return;
    fetchBooks(debouncedSearch);
  }, [open, debouncedSearch, fetchBooks]);

  const toggleSelect = (bookId) => {
    setSelectedBookIds((prev) => {
      if (existingBookIds.has(bookId)) return prev;
      const next = new Set(prev);
      next.has(bookId) ? next.delete(bookId) : next.add(bookId);
      return next;
    });
  };

  const addSelectedBooks = async () => {
    if (!author) return;
    const toAdd = [...selectedBookIds].filter((id) => !existingBookIds.has(id));
    if (toAdd.length === 0) return onClose();
    try {
      await Promise.all(toAdd.map((id) => addBook(author._id, id)));
      await refresh();
      onClose();
    } catch {
      // handled in context
    }
  };

  const onRemove = async (bookId) => {
    if (!author || !bookId) return;
    try {
      await removeBook(author._id, bookId);
      await refresh();
      setExistingBookIds((prev) => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
      setSelectedBookIds((prev) => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
    } catch {
      // handled in context
    }
  };

  // CSV handlers
  const normalizeIsbn = (s) =>
    String(s || "")
      .replace(/[^0-9Xx]/g, "")
      .toUpperCase();
  const onCsvSelected = (file) => {
    setCsvError("");
    setImportStats(null);
    if (!file) {
      setCsvIsbns([]);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const tokens = text
          .split(/\r?\n/)
          .flatMap((line) => line.split(/[,;|\t]/))
          .map((t) => t.trim())
          .filter(Boolean);
        const cleaned = tokens.filter((t) => t.toLowerCase() !== "isbn");
        const isbns = Array.from(
          new Set(cleaned.map(normalizeIsbn).filter(Boolean))
        );
        if (!isbns.length) {
          setCsvError("No ISBNs found in CSV.");
          setCsvIsbns([]);
        } else {
          setCsvIsbns(isbns);
        }
      } catch {
        setCsvError("Failed to read CSV file.");
        setCsvIsbns([]);
      }
    };
    reader.onerror = () => setCsvError("Failed to read CSV file.");
    reader.readAsText(file);
  };
  const onBrowseClick = () => fileInputRef.current?.click();
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && /\.csv$/i.test(file.name)) onCsvSelected(file);
    else if (file) setCsvError("Please drop a .csv file.");
  };

  const processCsvImport = async () => {
    if (!author || !csvIsbns.length) return;
    setImportRunning(true);
    setCsvError("");
    const stats = {
      queued: csvIsbns.length,
      added: 0,
      already: 0,
      notFound: 0,
      failed: 0,
    };
    for (const isbn of csvIsbns) {
      try {
        const book = await findBookByISBN(isbn);
        if (!book) {
          stats.notFound += 1;
          continue;
        }
        const id = book?._id || book?.id;
        if (!id) {
          stats.failed += 1;
          continue;
        }
        if (existingBookIds.has(id)) {
          stats.already += 1;
          continue;
        }
        await addBook(author._id, id);
        setExistingBookIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        stats.added += 1;
      } catch {
        stats.failed += 1;
      }
    }
    try {
      await refresh();
    } finally {
      setImportStats(stats);
      setImportRunning(false);
    }
  };

  if (!open || !author) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[96vw] max-w-[760px] rounded-lg bg-white p-4 max-h-[90vh] overflow-auto"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="m-0 text-lg font-semibold">
            Add Books to {author?.name}
          </h3>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mb-3 flex gap-2">
          <input
            placeholder="Search books by title, author, or ISBN"
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
            className="w-full rounded-md border border-slate-300 p-2"
            name="author-manage-books-search"
          />
          <button
            onClick={() => fetchBooks(bookSearch)}
            disabled={bookLoading}
            className="px-3 py-2  rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50"
            name="author-manage-books-search-btn"
          >
            {bookLoading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="mb-4 rounded-md border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
            <div className="font-semibold text-sm">Bulk add by CSV</div>
            <div className="text-xs text-slate-500">
              One column of ISBNs, header optional
            </div>
          </div>
          <div
            className={`p-4 transition-colors ${
              isDragging ? "bg-emerald-50" : "bg-slate-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div
              className={`rounded-md border-2 border-dashed ${
                isDragging ? "border-emerald-400" : "border-slate-300"
              } bg-white p-4 text-center`}
            >
              <div className="mb-2 text-slate-700">
                Drag & drop your CSV here, or
                <button
                  type="button"
                  onClick={onBrowseClick}
                  className="ml-1 text-emerald-700 hover:underline"
                >
                  browse
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => onCsvSelected(e.target.files?.[0] || null)}
                className="hidden"
                name="author-manage-books-csv-input"
              />
              <div className="text-xs text-slate-500">Accepted: .csv only</div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs">
                {csvError ? (
                  <span className="text-rose-600">{csvError}</span>
                ) : csvIsbns.length ? (
                  <span className="text-slate-700">
                    Queued ISBNs: <strong>{csvIsbns.length}</strong>
                    {csvIsbns.length > 0 ? (
                      <span className="ml-2 text-slate-500">
                        {csvIsbns.slice(0, 5).join(", ")}
                        {csvIsbns.length > 5 ? "…" : ""}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Each line or comma separated. Example: 9780131103627,
                    0596007124
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCsvIsbns([]);
                    setCsvError("");
                    setImportStats(null);
                  }}
                  disabled={!csvIsbns.length || importRunning}
                  className="px-3 py-2  rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50"
                  name="author-manage-books-csv-clear"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={processCsvImport}
                  disabled={!csvIsbns.length || importRunning || loading}
                  className="px-3 py-2  rounded-md border border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                  name="author-manage-books-csv-import"
                >
                  {importRunning ? "Importing..." : "Import CSV"}
                </button>
              </div>
            </div>
            {importStats ? (
              <div className="mt-2 text-xs text-slate-700">
                Imported:{" "}
                <strong className="text-emerald-700">
                  {importStats.added}
                </strong>
                {" • "}Already: <strong>{importStats.already}</strong>
                {" • "}Not found: <strong>{importStats.notFound}</strong>
                {" • "}Failed:{" "}
                <strong className="text-rose-600">{importStats.failed}</strong>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mb-2 text-xs text-slate-500">
          Showing up to 15 results
        </div>
        {bookError ? (
          <div className="mb-2 text-rose-600">{bookError}</div>
        ) : null}

        <div className=" rounded-md border border-slate-200">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left border-b border-slate-200">
                  Select
                </th>
                <th className="p-2 text-left border-b border-slate-200">
                  Title
                </th>
                <th className="p-2 text-left border-b border-slate-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookResults.map((b) => {
                const id = b._id || b.id;
                const isExisting = existingBookIds.has(id);
                const checked = isExisting || selectedBookIds.has(id);
                const cover = Array.isArray(b.cover_image)
                  ? b.cover_image[0]
                  : b.cover_image;
                return (
                  <tr key={id} className={isExisting ? "opacity-70" : ""}>
                    <td className="p-2 border-b border-slate-100">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isExisting}
                        onChange={() => toggleSelect(id)}
                        title={
                          isExisting
                            ? "Already added to this author"
                            : "Select to add"
                        }
                        className="h-4 w-4  rounded-md disabled:cursor-not-allowed"
                        name={`author-manage-select-${id}`}
                      />
                    </td>
                    <td className="p-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        {cover ? (
                          <img
                            src={makeImgUrl(cover)}
                            alt={b.title}
                            className="h-10 w-7 rounded-md object-cover"
                          />
                        ) : null}
                        <div className="flex flex-col">
                          <span className="font-semibold">{b.title}</span>
                          {b.author ? (
                            <small className="text-slate-600">
                              {b.author?.name || String(b.author)}
                            </small>
                          ) : null}
                          {isExisting ? (
                            <small className="font-semibold text-emerald-600">
                              Already added
                            </small>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 border-b border-slate-100">
                      {isExisting ? (
                        <button
                          type="button"
                          onClick={() => onRemove(id)}
                          className="px-2.5 py-1.5  rounded-md border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100"
                          name={`author-manage-remove-${id}`}
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not added
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {bookResults.length === 0 && !bookLoading ? (
                <tr>
                  <td className="p-3 text-center text-slate-600" colSpan={3}>
                    No books found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-slate-700">
            Selected:{" "}
            {
              [...selectedBookIds].filter((id) => !existingBookIds.has(id))
                .length
            }{" "}
            new, {existingBookIds.size} already added
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedBookIds(new Set())}
              disabled={
                [...selectedBookIds].filter((id) => !existingBookIds.has(id))
                  .length === 0
              }
              className="px-3 py-2  rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              name="author-manage-deselect-all"
              title="Clear current selection"
            >
              Deselect All
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2  rounded-md border border-slate-300 hover:bg-slate-50"
              name="author-manage-cancel"
            >
              Cancel
            </button>
            <button
              onClick={addSelectedBooks}
              disabled={
                [...selectedBookIds].filter((id) => !existingBookIds.has(id))
                  .length === 0 || loading
              }
              className="px-3 py-2  rounded-md border border-sky-700 bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
              name="author-manage-add-selected"
            >
              {loading ? "Adding..." : "Add Selected"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
