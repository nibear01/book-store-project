import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { BooksContext } from "@/context/BooksContext";
import { buildImageUrl, normalizeGenre } from "@/utils/imageUrlHelper";
import { isValidISBN } from "./utils";
import {
  computeFinalConfiguredPrice,
  defaultPrintState,
} from "../../bookViewComponents/BookPrintPricing";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Memoized cover preview (module scope to avoid conditional hooks inside component)
const CoverPreview = React.memo(function CoverPreview({ src }) {
  return (
    <div
      className="aspect-[3/4] w-32 sm:w-36 mx-auto rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden"
      name="books-cover-preview"
    >
      {src ? (
        <img
          src={src}
          alt="Cover preview"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-gray-400 text-sm text-center px-2">No cover</span>
      )}
    </div>
  );
});

const emptyForm = {
  title: "",
  author: "",
  genre: "",
  language: "",
  meta_keywords: "",
  isbn: "",
  cover_image: null,
  file_url: null,
  price: "",
  // priceManual used when pricing mode is relative; actual submitted price derived from settings when mode=derived
  priceManual: "",
  stock: "",
  is_active: true,
  is_featured: false,
  meta_description: "",
  meta_title: "",
  description: "",
  publisher: "",
  published_date: "",
  pages: "",
  is_on_sale: false,
  sale_price: "",
  is_deal_of_the_week: false,
  deal_start: "",
  deal_end: "",
  publisher_id: "",
  isPrintOnDemand: false, // added
};

const AddEditBookModal = ({
  open,
  initialBook,
  onClose,
  onSuccess,
  onError,
  autoSubmit = false,
}) => {
  const { addBook, updateBook } = useContext(BooksContext);
  const editingId = useMemo(
    () => (initialBook ? String(initialBook._id || initialBook.id) : null),
    [initialBook],
  );

  const [form, setForm] = useState(emptyForm);
  // CHANGED: keep raw preview string (either blob: URL or server path)
  const [coverPreview, setCoverPreview] = useState(null);
  const [printSettings, setPrintSettings] = useState(null);
  const pricingMode = printSettings?.mode || "relative";

  // Fetch global print pricing config when modal opens
  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  // Revoke blob URL on unmount/change to avoid memory leaks
  useEffect(() => {
    return () => {
      if (coverPreview && String(coverPreview).startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  useEffect(() => {
    if (!initialBook) {
      setForm(emptyForm);
      // reset preview (revoke any blob url)
      setCoverPreview((prev) => {
        if (prev && String(prev).startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    setForm({
      title: initialBook.title || "",
      author: initialBook.author || "",
      genre: normalizeGenre(initialBook.genre).join(", "),
      language: initialBook.language || "",
      meta_keywords: Array.isArray(initialBook.meta_keywords)
        ? initialBook.meta_keywords.join(", ")
        : initialBook.meta_keywords || "",
      isbn: initialBook.isbn || "",
      cover_image: null,
      // Support string URL for file_url from CSV
      file_url: initialBook.file_url || null,
      price: String(initialBook.price || ""),
      priceManual: String(initialBook.price || ""),
      stock: String(initialBook.stock || ""),
      is_active: initialBook.is_active ?? true,
      is_featured: initialBook.is_featured ?? false,
      meta_description: initialBook.meta_description || "",
      meta_title: initialBook.meta_title || "",
      description: initialBook.description || "",
      publisher: initialBook.publisher || "",
      published_date: initialBook.published_date
        ? String(initialBook.published_date).slice(0, 10)
        : "",
      pages:
        typeof initialBook.pages === "number"
          ? String(initialBook.pages)
          : initialBook.pages || "",
      is_on_sale: !!initialBook.is_on_sale,
      sale_price:
        initialBook.sale_price !== null && initialBook.sale_price !== undefined
          ? String(initialBook.sale_price)
          : "",
      is_deal_of_the_week: !!initialBook.is_deal_of_the_week,
      deal_start: initialBook.deal_start
        ? String(initialBook.deal_start).slice(0, 10)
        : "",
      deal_end: initialBook.deal_end
        ? String(initialBook.deal_end).slice(0, 10)
        : "",
      publisher_id: initialBook.publisher_id || "",
      // Extra fields to pass through to backend if provided
      cover_image_url: initialBook.cover_image_url || "",
      cover_image_urls: initialBook.cover_image_urls || "",
      isPrintOnDemand: !!initialBook.isPrintOnDemand, // added
    });

    const cover = Array.isArray(initialBook.cover_image)
      ? initialBook.cover_image[0]
      : initialBook.cover_image;
    setCoverPreview(typeof cover === "string" ? cover : null);
  }, [initialBook]);

  const handleCoverImageChange = useCallback((e) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({ ...f, cover_image: file }));
    setCoverPreview((prev) => {
      if (prev && String(prev).startsWith("blob:")) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault();

      if (form.isbn && !isValidISBN(form.isbn)) {
        onError?.("Invalid ISBN. Enter a valid ISBN-10 or ISBN-13.");
        return;
      }

      // Promotions validation
      const priceNum = Number(form.price);
      const saleNum = Number(form.sale_price);
      if (form.is_on_sale) {
        if (!Number.isFinite(saleNum) || saleNum < 0) {
          onError?.("Invalid sale price.");
          return;
        }
        if (!Number.isFinite(priceNum) || !(saleNum < priceNum)) {
          onError?.("Sale price must be less than price.");
          return;
        }
      }
      if (form.deal_start && form.deal_end) {
        const ds = new Date(form.deal_start);
        const de = new Date(form.deal_end);
        if (isNaN(ds.getTime()) || isNaN(de.getTime()) || de < ds) {
          onError?.("Deal end date must be after start date.");
          return;
        }
      }

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("genre", form.genre);
      formData.append("language", form.language);
      formData.append("meta_keywords", form.meta_keywords);
      formData.append("isbn", form.isbn);
      if (form.cover_image) formData.append("cover_image", form.cover_image);
      if (form.file_url) formData.append("file_url", form.file_url);
      if (form.cover_image_url)
        formData.append("cover_image_url", form.cover_image_url);
      if (form.cover_image_urls)
        formData.append("cover_image_urls", form.cover_image_urls);
      // Determine final price based on pricing mode
      let finalPrice = form.priceManual;
      if (pricingMode === "derived" && printSettings) {
        const pagesNum = Number(form.pages) || 0;
        const { price: derivedPrice } = computeFinalConfiguredPrice({
          baseContentPrice: 0,
          pages: pagesNum,
          cfg: defaultPrintState,
          settings: printSettings,
        });
        finalPrice = String(derivedPrice);
      }
      formData.append("price", finalPrice);
      formData.append("stock", form.stock);
      // Send booleans as '1'/'0' to avoid backend treating 'false' as truthy
      formData.append("is_active", form.is_active ? "1" : "0");
      formData.append("is_featured", form.is_featured ? "1" : "0");
      formData.append("meta_description", form.meta_description);
      formData.append("meta_title", form.meta_title);
      formData.append("description", form.description);
      formData.append("publisher", form.publisher);
      formData.append("published_date", form.published_date);
      formData.append("pages", form.pages);
      formData.append("is_on_sale", form.is_on_sale ? "1" : "0");
      if (form.is_on_sale && form.sale_price !== "") {
        formData.append("sale_price", form.sale_price);
      }
      formData.append(
        "is_deal_of_the_week",
        form.is_deal_of_the_week ? "1" : "0",
      );
      if (form.deal_start) formData.append("deal_start", form.deal_start);
      if (form.deal_end) formData.append("deal_end", form.deal_end);
      if (form.publisher_id) formData.append("publisher_id", form.publisher_id);
      formData.append("isPrintOnDemand", form.isPrintOnDemand ? "1" : "0"); // added

      try {
        let result;
        if (editingId) result = await updateBook(editingId, formData);
        else result = await addBook(formData);
        onSuccess?.(result);
      } catch (err) {
        console.log("Book add/update error:", err);
        if (err.response) {
          console.log("Response data:", err.response.data);
          onError?.(err.response.data?.message || "Error occurred!");
        } else {
          onError?.("Error occurred!");
        }
      }
    },
    [
      form,
      editingId,
      addBook,
      updateBook,
      onError,
      onSuccess,
      pricingMode,
      printSettings,
    ],
  );

  // Auto-submit when instructed (used for CSV->modal import)
  useEffect(() => {
    if (!open || !autoSubmit) return;
    // Allow one tick for form to populate from initialBook
    const t = setTimeout(() => {
      handleSubmit();
    }, 0);
    return () => clearTimeout(t);
  }, [open, autoSubmit, initialBook, handleSubmit]);

  const previewSrc = useMemo(() => {
    if (!coverPreview) return null;

    // If blob URL from file input, use as-is
    if (String(coverPreview).startsWith("blob:")) return coverPreview;

    // Use centralized image URL builder for server paths
    return buildImageUrl(String(coverPreview), API_BASE);
  }, [coverPreview]);

  if (!open) return null;

  // Render via portal for smoother layering and fewer reflows
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      onClick={onClose}
      name="books-addedit-modal-overlay"
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-md shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        name="books-addedit-modal"
      >
        <div className="bg-black border border-black text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-bold">
            {editingId ? "Update Book" : "Add Book"}
          </h2>
          <button
            className="inline-flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-md bg-white/10 hover:bg-white/20 transition"
            onClick={onClose}
            aria-label="Close"
            name="books-addedit-close-btn"
          >
            <span className="text-xl sm:text-2xl leading-none">&times;</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="flex flex-col h-full"
        >
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <CoverPreview src={previewSrc} />
              </div>
              <div className="sm:col-span-2 space-y-3">
                <label className="block text-sm font-medium">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="books-input-cover-image"
                />
                <p className="text-xs text-gray-500">
                  JPG/PNG, recommended ratio 3:4. Max ~5MB.
                </p>
              </div>
            </div>

            {/* Basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  name="books-input-title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  name="books-input-author"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Genre{" "}
                  <span className="text-xs text-gray-400">
                    (comma separated) <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  name="books-input-genre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Language <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.language}
                  onChange={(e) =>
                    setForm({ ...form, language: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  name="books-input-language"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Meta Keywords{" "}
                  <span className="text-xs text-gray-400">
                    (comma separated)
                  </span>
                </label>
                <input
                  value={form.meta_keywords}
                  onChange={(e) =>
                    setForm({ ...form, meta_keywords: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="books-input-meta-keywords"
                />
              </div>
            </div>

            {/* Identifiers and files */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  ISBN <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  name="books-input-isbn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Book File <span className="text-xs text-gray-400">(PDF)</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setForm({ ...form, file_url: e.target.files?.[0] || null })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="books-input-book-file"
                />
              </div>
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {pricingMode === "derived" ? "Derived Price" : "Price"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                {pricingMode === "derived" && printSettings ? (
                  <div
                    className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 flex items-center justify-between"
                    name="books-derived-price-display"
                  >
                    <span>
                      ৳
                      {computeFinalConfiguredPrice({
                        baseContentPrice: 0,
                        pages: Number(form.pages) || 0,
                        cfg: defaultPrintState,
                        settings: printSettings,
                      }).price.toFixed(2)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-gray-500">
                      Auto
                    </span>
                  </div>
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    value={form.priceManual}
                    onChange={(e) =>
                      setForm({ ...form, priceManual: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    name="books-input-price"
                  />
                )}
                {pricingMode === "derived" && printSettings && (
                  <p className="text-xs text-gray-600 mt-1">
                    Formula: Content Fee (৳
                    {Number(printSettings.contentFee || 0).toFixed(2)}) + Pages
                    × Base/Page (৳
                    {Number(printSettings.basePerPage || 0).toFixed(2)}) ×
                    multipliers + Margin (
                    {printSettings.margin?.type === "flat"
                      ? `৳${Number(printSettings.margin?.value || 0).toFixed(2)}`
                      : `${Number(printSettings.margin?.value || 0)}%`}
                    ).
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  name="books-input-stock"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pages</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.pages}
                  onChange={(e) => setForm({ ...form, pages: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="books-input-pages"
                />
              </div>
            </div>

            {pricingMode === "derived" && printSettings && (
              <div className="border rounded-md p-3 bg-gray-50 text-xs space-y-1">
                <strong className="block text-sm mb-1">
                  Derived Pricing Breakdown
                </strong>
                {(() => {
                  const pagesNum = Number(form.pages) || 0;
                  const result = computeFinalConfiguredPrice({
                    baseContentPrice: 0,
                    pages: pagesNum,
                    cfg: defaultPrintState,
                    settings: printSettings,
                  });
                  return (
                    <ul className="space-y-1">
                      <li>
                        Content Fee: ৳
                        {Number(printSettings.contentFee || 0).toFixed(2)}
                      </li>
                      <li>Pages: {pagesNum}</li>
                      <li>
                        Base/Page: ৳
                        {Number(printSettings.basePerPage || 0).toFixed(2)}
                      </li>
                      <li>
                        Multipliers (quality/side/size/color):{" "}
                        {
                          printSettings.multipliers?.quality?.[
                            defaultPrintState.paperQuality
                          ]
                        }{" "}
                        ×{" "}
                        {
                          printSettings.multipliers?.side?.[
                            defaultPrintState.printSide
                          ]
                        }{" "}
                        ×{" "}
                        {
                          printSettings.multipliers?.size?.[
                            defaultPrintState.paperSize
                          ]
                        }{" "}
                        ×{" "}
                        {
                          printSettings.multipliers?.color?.[
                            defaultPrintState.colorMode
                          ]
                        }
                      </li>
                      <li>
                        Print Cost: ৳{result.breakdown.printCost.toFixed(2)}
                      </li>
                      <li>
                        Margin{" "}
                        {printSettings.margin?.type === "flat"
                          ? "(flat)"
                          : "(percent)"}
                        :{" "}
                        {printSettings.margin?.type === "flat"
                          ? `৳${result.breakdown.margin.toFixed(2)}`
                          : `${printSettings.margin?.value}% (৳${result.breakdown.margin.toFixed(2)})`}
                      </li>
                      <li className="font-medium">
                        Final Price: ৳{result.price.toFixed(2)}
                      </li>
                    </ul>
                  );
                })()}
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Meta Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.meta_title}
                  onChange={(e) =>
                    setForm({ ...form, meta_title: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  name="books-input-meta-title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Meta Description
                </label>
                <input
                  value={form.meta_description}
                  onChange={(e) =>
                    setForm({ ...form, meta_description: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="books-input-meta-description"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Active</label>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                  name="books-input-is-active"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Featured</label>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm({ ...form, is_featured: e.target.checked })
                  }
                  name="books-input-is-featured"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Print on Demand?</label>
                <input
                  type="checkbox"
                  checked={form.isPrintOnDemand}
                  onChange={(e) =>
                    setForm({ ...form, isPrintOnDemand: e.target.checked })
                  }
                  name="books-input-is-print-on-demand"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                name="books-input-description"
              />
            </div>

            {/* Publisher info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Publisher
                </label>
                <input
                  value={form.publisher}
                  onChange={(e) =>
                    setForm({ ...form, publisher: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="books-input-publisher"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Publisher ID{" "}
                  <span className="text-xs text-gray-400">(6 digits)</span>
                </label>
                <input
                  type="text"
                  value={form.publisher_id}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setForm({ ...form, publisher_id: val });
                  }}
                  placeholder="e.g. 123456"
                  maxLength={6}
                  pattern="\d{6}"
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="books-input-publisher-id"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Enter 6-digit publisher ID for auto-linking
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Published Date
                </label>
                <input
                  type="date"
                  value={form.published_date}
                  onChange={(e) =>
                    setForm({ ...form, published_date: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="books-input-published-date"
                />
              </div>
            </div>

            {/* Promotions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">On Sale</label>
                <input
                  type="checkbox"
                  checked={form.is_on_sale}
                  onChange={(e) =>
                    setForm({ ...form, is_on_sale: e.target.checked })
                  }
                  name="books-input-is-on-sale"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sale Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.sale_price}
                  onChange={(e) =>
                    setForm({ ...form, sale_price: e.target.value })
                  }
                  disabled={!form.is_on_sale}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="books-input-sale-price"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Deal of the Week</label>
                <input
                  type="checkbox"
                  checked={form.is_deal_of_the_week}
                  onChange={(e) =>
                    setForm({ ...form, is_deal_of_the_week: e.target.checked })
                  }
                  name="books-input-deal-of-week"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Deal Start
                  </label>
                  <input
                    type="date"
                    value={form.deal_start}
                    onChange={(e) =>
                      setForm({ ...form, deal_start: e.target.value })
                    }
                    disabled={!form.is_deal_of_the_week}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="books-input-deal-start"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Deal End
                  </label>
                  <input
                    type="date"
                    value={form.deal_end}
                    onChange={(e) =>
                      setForm({ ...form, deal_end: e.target.value })
                    }
                    disabled={!form.is_deal_of_the_week}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="books-input-deal-end"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-end gap-2 sm:gap-3 border-t">
            <button
              type="button"
              className="px-4 sm:px-5 py-2 rounded-md border font-semibold hover:bg-gray-100 transition"
              onClick={onClose}
              name="books-addedit-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-slate-950 text-white px-5 sm:px-6 py-2 rounded-md font-semibold shadow hover:bg-slate-800 transition"
              name="books-addedit-submit-btn"
            >
              {editingId ? "Save Changes" : "Add Book"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default React.memo(AddEditBookModal);
