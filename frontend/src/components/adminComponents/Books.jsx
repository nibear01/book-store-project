import React, { useContext, useEffect, useState } from "react";
import initialBooks from "../../data/dummyBooks.json";
import { BooksContext } from "@/context/BooksContext";

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
  rating: "",
  num_reviews: "",
  is_active: true,
  is_featured: false,
  meta_description: "",
  meta_title: "",
  description: "",
  publisher: "", // added
  published_date: "", // added
  pages: "", // added
};

const Books = () => {
  const { addBook, updateBook, deleteBook, fetchBooks, loading, error } = useContext(BooksContext);

  const [books, setBooks] = useState(initialBooks);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchBooks();
      // console.log(data.data);
      setBooks(data.data);
    };
    fetchData();
  }, []);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [detailsBook, setDetailsBook] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    genre: "all",
    sortPrice: "none",
    stock: "all",
  });
  const [coverPreview, setCoverPreview] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: "" });

  const resetForm = () => setForm(emptyForm);

  // Normalize API book -> UI book shape
  const normalizeBook = (b) => ({
    id: b.id || b._id || b.id,
    title: b.title || "",
    author: b.author || "",
    genre: Array.isArray(b.genre) ? b.genre.join(", ") : (b.genre || ""),
    language: b.language || "",
    cover_image: Array.isArray(b.cover_image) ? (b.cover_image[0] || "") : (b.cover_image || ""),
    file_url: b.file_url || "",
    price: typeof b.price === "number" ? b.price : Number(b.price) || 0,
    stock: typeof b.stock === "number" ? b.stock : Number(b.stock) || 0,
    rating: typeof b.rating === "number" ? b.rating : Number(b.rating) || 0,
    num_reviews: typeof b.num_reviews === "number" ? b.num_reviews : Number(b.num_reviews) || 0,
    is_active: Boolean(b.is_active),
    is_featured: Boolean(b.is_featured),
    meta_description: b.meta_description || "",
    meta_title: b.meta_title || "",
    meta_keywords: Array.isArray(b.meta_keywords) ? b.meta_keywords : (b.meta_keywords || []),
    isbn: b.isbn || "",
    description: b.description || "",
    pages: typeof b.pages === "number" ? b.pages : Number(b.pages) || 0, // added
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    formData.append("rating", form.rating);
    formData.append("num_reviews", form.num_reviews);
    formData.append("is_active", form.is_active);
    formData.append("is_featured", form.is_featured);
    formData.append("meta_description", form.meta_description);
    formData.append("meta_title", form.meta_title);
    formData.append("description", form.description);
    formData.append("publisher", form.publisher);
    formData.append("published_date", form.published_date);
    formData.append("pages", form.pages); // added

    try {
      if (editingId) {
        const updated = await updateBook(editingId, formData);
        const updatedRaw = updated?.data || updated;
        const updatedBook = normalizeBook(updatedRaw);
        setBooks((prev) =>
          prev.map((b) =>
            (b._id && String(b._id) === String(editingId)) || (b.id && String(b.id) === String(editingId))
              ? { ...b, ...updatedBook, _id: updatedRaw?._id ?? b._id }
              : b
          )
        );
        setPopup({ show: true, message: "Book updated successfully!" });
      } else {
        const created = await addBook(formData);
        const newBook = normalizeBook(created?.data || created);
        setBooks((prev) => [...prev, newBook]);
        setPopup({ show: true, message: "Book added successfully!" });
      }
      resetForm();
      setCoverPreview(null);
      setShowAddModal(false);
      setEditingId(null);
    } catch (err) {
      setPopup({ show: true, message: "Error occurred!" });
    }
  };

  const handleEdit = (book) => {
    const id = book._id || book.id;
    setEditingId(String(id));
    setForm({
      title: book.title || "",
      author: book.author || "",
      genre: Array.isArray(book.genre) ? book.genre.join(", ") : (book.genre || ""),
      language: book.language || "",
      meta_keywords: Array.isArray(book.meta_keywords) ? book.meta_keywords.join(", ") : (book.meta_keywords || ""),
      isbn: book.isbn || "",
      cover_image: "", // always reset file input for edit
      file_url: book.file_url || "",
      price: String(book.price || ""),
      stock: String(book.stock || ""),
      rating: String(book.rating || ""),
      num_reviews: String(book.num_reviews || ""),
      is_active: book.is_active ?? true,
      is_featured: book.is_featured ?? false,
      meta_description: book.meta_description || "",
      meta_title: book.meta_title || "",
      description: book.description || "",
      publisher: book.publisher || "",
      published_date: book.published_date ? book.published_date.slice(0, 10) : "",
      pages: typeof book.pages === "number" ? String(book.pages) : (book.pages || ""), // added
    });
    // set preview from existing image (supports string or array)
    const cover =
      Array.isArray(book.cover_image) ? book.cover_image[0] : book.cover_image;
    setCoverPreview(typeof cover === "string" ? cover : null);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    try {
      // optional confirm
      if (!window.confirm("Are you sure you want to delete this book?")) return;
      await deleteBook(id);
      setBooks((prev) =>
        prev.filter((b) => String(b._id || b.id) !== String(id))
      );
      setPopup({ show: true, message: "Book deleted successfully!" });
      if (editingId && String(editingId) === String(id)) {
        setEditingId(null);
        resetForm();
      }
    } catch (err) {
      setPopup({ show: true, message: "Failed to delete book!" });
    }
  };

  // Modal close on background click
  const handleModalBgClick = (e) => {
    if (e.target.classList.contains("modal-bg")) {
      setShowAddModal(false);
      setEditingId(null);
      resetForm();
    }
  };

  // Update cover image preview when file changes
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, cover_image: file });
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverPreview(null);
    }
  };

  // Reset preview on modal close
  const closeModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    resetForm();
    setCoverPreview(null);
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setEditingId(null);
    resetForm();
    setCoverPreview(null); // ensure preview is cleared for add
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Books</h1>
        <button
          className="bg-slate-950 text-white px-5 py-2 rounded shadow hover:bg-slate-800 transition"
          onClick={openAddModal}
        >
          + Add Book
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm mb-1">Genre</label>
          <select
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            {[...new Set(books.map((b) => b.genre).filter(Boolean))].map(
              (g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              )
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Sort by Price</label>
          <select
            value={filters.sortPrice}
            onChange={(e) =>
              setFilters({ ...filters, sortPrice: e.target.value })
            }
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="none">None</option>
            <option value="asc">Low to High</option>
            <option value="desc">High to Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Stock Status</label>
          <select
            value={filters.stock}
            onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <div className="md:col-span-4 flex gap-2">
          <button
            className="px-3 py-2 text-sm border rounded"
            onClick={() =>
              setFilters({ genre: "all", sortPrice: "none", stock: "all" })
            }
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-3 overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-sm font-semibold px-3 py-2 border-b">
                  Cover
                </th>
                <th className="text-left text-sm font-semibold px-3 py-2 border-b">
                  Title
                </th>
                <th className="text-left text-sm font-semibold px-3 py-2 border-b">
                  Author
                </th>
                <th className="text-left text-sm font-semibold px-3 py-2 border-b">
                  Genre
                </th>
                <th className="text-left text-sm font-semibold px-3 py-2 border-b">
                  Stock
                </th>
                <th className="text-left text-sm font-semibold px-3 py-2 border-b">
                  Price
                </th>
                <th className="text-left text-sm font-semibold px-3 py-2 border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {books
                .filter((b) =>
                  filters.genre === "all" ? true : b.genre === filters.genre
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
                  if (filters.sortPrice === "asc") {
                    return (Number(a.price) || 0) - (Number(b.price) || 0);
                  }
                  if (filters.sortPrice === "desc") {
                    return (Number(b.price) || 0) - (Number(a.price) || 0);
                  }
                  return 0;
                })
                .map((b) => (
                  <tr key={b._id || b.id} className="border-b">
                    <td className="px-3 py-2 text-sm">
                      {b.cover_image ? (
                        <img
                          src={`http://localhost:5000${b.cover_image}`}
                          alt={b.title}
                          className="h-12 w-10 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">{b.title}</td>
                    <td className="px-3 py-2 text-sm">{b.author || ""}</td>
                    <td className="px-3 py-2 text-sm">{b.genre || ""}</td>
                    <td className="px-3 py-2 text-sm">
                      {typeof b.stock === "number" ? b.stock : ""}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      ${(b.price || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-sm space-x-3">
                      <button
                        onClick={() => setDetailsBook(b)}
                        className="text-gray-700 hover:underline"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleEdit(b)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b._id || b.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Book Modal */}
      {showAddModal && (
        <div
          className="modal-bg fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6"
          onClick={handleModalBgClick}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold">
                {editingId ? "Update Book" : "Add Book"}
              </h2>
              <button
                className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition"
                onClick={closeModal}
                aria-label="Close"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                {/* Cover image uploader with preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <div className="aspect-[3/4] w-32 sm:w-36 mx-auto rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {coverPreview ? (
                        <img
                          src={
                            editingId
                              ? `http://localhost:5000${coverPreview}`
                              : coverPreview
                          }
                          alt="Cover preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm text-center px-2">
                          No cover
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-3">
                    <label className="block text-sm font-medium">Cover Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Genre <span className="text-xs text-gray-400">(comma separated)</span>
                    </label>
                    <input
                      value={form.genre}
                      onChange={(e) => setForm({ ...form, genre: e.target.value })}
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <input
                      value={form.language}
                      onChange={(e) => setForm({ ...form, language: e.target.value })}
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Meta Keywords <span className="text-xs text-gray-400">(comma separated)</span>
                    </label>
                    <input
                      value={form.meta_keywords}
                      onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Identifiers and files */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ISBN</label>
                    <input
                      value={form.isbn}
                      onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Book File <span className="text-xs text-gray-400">(PDF)</span>
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setForm({ ...form, file_url: e.target.files[0] })}
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.rating}
                      onChange={(e) => setForm({ ...form, rating: e.target.value })}
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Num Reviews</label>
                    <input
                      type="number"
                      value={form.num_reviews}
                      onChange={(e) => setForm({ ...form, num_reviews: e.target.value })}
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Description</label>
                    <input
                      value={form.meta_description}
                      onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                {/* Description textarea */}
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Publisher
                    </label>
                    <input
                      value={form.publisher}
                      onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Published Date
                    </label>
                    <input
                      type="date"
                      value={form.published_date}
                      onChange={(e) => setForm({ ...form, published_date: e.target.value })}
                      className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  className="px-5 py-2 rounded-lg border font-semibold hover:bg-gray-100 transition"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-950 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-slate-800 transition"
                >
                  {editingId ? "Save Changes" : "Add Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success/Error Popup */}
      {popup.show && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded shadow-lg flex items-center gap-2">
            <span>{popup.message}</span>
            <button
              className="ml-4 px-2 py-1 bg-white/20 rounded hover:bg-white/30"
              onClick={() => setPopup({ show: false, message: "" })}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[2px] shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Book Details</h3>
              <button
                className="text-gray-600"
                onClick={() => setDetailsBook(null)}
              >
                ✕
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="col-span-1">
                {detailsBook.cover_image ? (
                  <img
                    src={`http://localhost:5000${detailsBook.cover_image}`}
                    alt={detailsBook.title}
                    className="w-full h-40 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded" />
                )}
              </div>
              <div className="col-span-2 text-sm space-y-1">
                <p>
                  <span className="font-semibold">Title:</span>{" "}
                  {detailsBook.title}
                </p>
                {detailsBook.author && (
                  <p>
                    <span className="font-semibold">Author:</span>{" "}
                    {detailsBook.author}
                  </p>
                )}
                {detailsBook.genre && (
                  <p>
                    <span className="font-semibold">Genre:</span>{" "}
                    {detailsBook.genre}
                  </p>
                )}
                {typeof detailsBook.stock === "number" && (
                  <p>
                    <span className="font-semibold">Stock:</span>{" "}
                    {detailsBook.stock}
                  </p>
                )}
                <p>
                  <span className="font-semibold">Price:</span> $
                  {(detailsBook.price || 0).toFixed(2)}
                </p>
                {detailsBook.description && (
                  <p className="mt-2">
                    <span className="font-semibold">Description:</span>{" "}
                    {detailsBook.description}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 rounded-[2px] border"
                onClick={() => setDetailsBook(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
