import React, { useContext, useEffect, useMemo, useState } from "react";
import { BooksContext } from "@/context/BooksContext";
import { isValidISBN } from "./utils";

const API_BASE = "http://localhost:5000";

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
};

const AddEditBookModal = ({ open, initialBook, onClose, onSuccess, onError }) => {
  const { addBook, updateBook } = useContext(BooksContext);
  const editingId = useMemo(() => (initialBook ? String(initialBook._id || initialBook.id) : null), [initialBook]);

  const [form, setForm] = useState(emptyForm);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    if (!initialBook) {
      setForm(emptyForm);
      setCoverPreview(null);
      return;
    }
    setForm({
      title: initialBook.title || "",
      author: initialBook.author || "",
      genre: Array.isArray(initialBook.genre) ? initialBook.genre.join(", ") : initialBook.genre || "",
      language: initialBook.language || "",
      meta_keywords: Array.isArray(initialBook.meta_keywords)
        ? initialBook.meta_keywords.join(", ")
        : initialBook.meta_keywords || "",
      isbn: initialBook.isbn || "",
      cover_image: null,
      file_url: null,
      price: String(initialBook.price || ""),
      stock: String(initialBook.stock || ""),
      is_active: initialBook.is_active ?? true,
      is_featured: initialBook.is_featured ?? false,
      meta_description: initialBook.meta_description || "",
      meta_title: initialBook.meta_title || "",
      description: initialBook.description || "",
      publisher: initialBook.publisher || "",
      published_date: initialBook.published_date ? String(initialBook.published_date).slice(0, 10) : "",
      pages: typeof initialBook.pages === "number" ? String(initialBook.pages) : initialBook.pages || "",
      is_on_sale: !!initialBook.is_on_sale,
      sale_price:
        initialBook.sale_price !== null && initialBook.sale_price !== undefined
          ? String(initialBook.sale_price)
          : "",
      is_deal_of_the_week: !!initialBook.is_deal_of_the_week,
      deal_start: initialBook.deal_start ? String(initialBook.deal_start).slice(0, 10) : "",
      deal_end: initialBook.deal_end ? String(initialBook.deal_end).slice(0, 10) : "",
    });

    const cover = Array.isArray(initialBook.cover_image)
      ? initialBook.cover_image[0]
      : initialBook.cover_image;
    setCoverPreview(typeof cover === "string" ? cover : null);
  }, [initialBook]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    setForm((f) => ({ ...f, cover_image: file || null }));
    if (file) setCoverPreview(URL.createObjectURL(file));
    else setCoverPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("is_active", form.is_active);
    formData.append("is_featured", form.is_featured);
    formData.append("meta_description", form.meta_description);
    formData.append("meta_title", form.meta_title);
    formData.append("description", form.description);
    formData.append("publisher", form.publisher);
    formData.append("published_date", form.published_date);
    formData.append("pages", form.pages);
    formData.append("is_on_sale", form.is_on_sale);
    if (form.sale_price !== "") formData.append("sale_price", form.sale_price);
    formData.append("is_deal_of_the_week", form.is_deal_of_the_week);
    if (form.deal_start) formData.append("deal_start", form.deal_start);
    if (form.deal_end) formData.append("deal_end", form.deal_end);

    try {
      let result;
      if (editingId) result = await updateBook(editingId, formData);
      else result = await addBook(formData);
      onSuccess?.(result);
    } catch (err) {
      onError?.("Error occurred!");
    }
  };

  if (!open) return null;

  const previewSrc =
    typeof coverPreview === "string" ? `${API_BASE}${coverPreview}` : coverPreview || null;

  return (
    <div className="modal-bg fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">{editingId ? "Update Book" : "Add Book"}</h2>
          <button
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <div className="aspect-[3/4] w-32 sm:w-36 mx-auto rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {previewSrc ? (
                    <img src={previewSrc} alt="Cover preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-sm text-center px-2">No cover</span>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2 space-y-3">
                <label className="block text-sm font-medium">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">JPG/PNG, recommended ratio 3:4. Max ~5MB.</p>
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
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Genre <span className="text-xs text-gray-400">(comma separated) <span className="text-red-500">*</span></span>
                </label>
                <input
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Language <span className="text-red-500">*</span></label>
                <input
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Meta Keywords <span className="text-xs text-gray-400">(comma separated)</span>
                </label>
                <input
                  value={form.meta_keywords}
                  onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Identifiers and files */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ISBN <span className="text-red-500">*</span></label>
                <input
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Book File <span className="text-xs text-gray-400">(PDF)</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setForm({ ...form, file_url: e.target.files?.[0] || null })}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Meta Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.meta_title}
                  onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <input
                  value={form.meta_description}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Active</label>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Featured</label>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            {/* Publisher info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Publisher</label>
                <input
                  value={form.publisher}
                  onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Published Date</label>
                <input
                  type="date"
                  value={form.published_date}
                  onChange={(e) => setForm({ ...form, published_date: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  onChange={(e) => setForm({ ...form, is_on_sale: e.target.checked })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sale Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.sale_price}
                  onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                  disabled={!form.is_on_sale}
                  className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Deal of the Week</label>
                <input
                  type="checkbox"
                  checked={form.is_deal_of_the_week}
                  onChange={(e) => setForm({ ...form, is_deal_of_the_week: e.target.checked })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Deal Start</label>
                  <input
                    type="date"
                    value={form.deal_start}
                    onChange={(e) => setForm({ ...form, deal_start: e.target.value })}
                    disabled={!form.is_deal_of_the_week}
                    className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deal End</label>
                  <input
                    type="date"
                    value={form.deal_end}
                    onChange={(e) => setForm({ ...form, deal_end: e.target.value })}
                    disabled={!form.is_deal_of_the_week}
                    className="mt-1 w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
            <button
              type="button"
              className="px-5 py-2 rounded-lg border font-semibold hover:bg-gray-100 transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-slate-950 text-white px-6 py-2 rounded-[2px] font-semibold shadow hover:bg-slate-800 transition"
            >
              {editingId ? "Save Changes" : "Add Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditBookModal;
