import React, { useState } from "react";
import initialBooks from "../../data/dummyBooks.json";

const emptyForm = {
  title: "",
  author: "",
  genre: "",
  language: "",
  slug: "",
  meta_keywords: "",
  isbn: "",
  cover_image: null, // file
  file_url: null,    // file
  price: "",
  stock: "",
  rating: "",
  num_reviews: "",
  is_active: true,
  is_featured: false,
  meta_description: "",
  meta_title: "",
};

const Books = () => {
  const [books, setBooks] = useState(initialBooks);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [detailsBook, setDetailsBook] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    genre: "all",
    sortPrice: "none",
    stock: "all",
  });

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("author", form.author);
    formData.append("genre", form.genre);
    formData.append("language", form.language);
    formData.append("slug", form.slug);
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

    // For demo, just add to local state (simulate upload)
    const nextId = Math.max(0, ...books.map((b) => b.id || 0)) + 1;
    setBooks((prev) => [
      ...prev,
      {
        id: nextId,
        title: formData.get("title"),
        author: formData.get("author"),
        genre: formData.get("genre").split(",").map((g) => g.trim()).filter(Boolean),
        language: formData.get("language"),
        slug: formData.get("slug"),
        meta_keywords: formData.get("meta_keywords").split(",").map((k) => k.trim()).filter(Boolean),
        isbn: formData.get("isbn"),
        cover_image: form.cover_image ? URL.createObjectURL(form.cover_image) : "",
        file_url: form.file_url ? form.file_url.name : "",
        price: Number(formData.get("price")) || 0,
        stock: Number(formData.get("stock")) || 0,
        rating: Number(formData.get("rating")) || 0,
        num_reviews: Number(formData.get("num_reviews")) || 0,
        is_active: form.is_active,
        is_featured: form.is_featured,
        meta_description: formData.get("meta_description"),
        meta_title: formData.get("meta_title"),
      },
    ]);
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title || "",
      author: book.author || "",
      genre: Array.isArray(book.genre) ? book.genre.join(", ") : (book.genre || ""),
      language: book.language || "",
      slug: book.slug || "",
      meta_keywords: Array.isArray(book.meta_keywords) ? book.meta_keywords.join(", ") : (book.meta_keywords || ""),
      isbn: book.isbn || "",
      cover_image: Array.isArray(book.cover_image) ? book.cover_image.join(", ") : (book.cover_image || ""),
      file_url: book.file_url || "",
      price: String(book.price || ""),
      stock: String(book.stock || ""),
      rating: String(book.rating || ""),
      num_reviews: String(book.num_reviews || ""),
      is_active: book.is_active ?? true,
      is_featured: book.is_featured ?? false,
      meta_description: book.meta_description || "",
      meta_title: book.meta_title || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    if (editingId === id) {
      setEditingId(null);
      resetForm();
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Books</h1>
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700 transition"
          onClick={() => {
            setShowAddModal(true);
            setEditingId(null);
            resetForm();
          }}
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
                  <tr key={b.id} className="border-b">
                    <td className="px-3 py-2 text-sm">
                      {b.cover_image ? (
                        <img
                          src={b.cover_image}
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
                        onClick={() => handleDelete(b.id)}
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
          className="modal-bg fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={handleModalBgClick}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full p-8 relative animate-fade-in overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => {
                setShowAddModal(false);
                setEditingId(null);
                resetForm();
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2">
              {editingId ? "Edit Book" : "Add Book"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Author</label>
                  <input
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Genre <span className="text-xs text-gray-400">(comma separated)</span></label>
                  <input
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Language</label>
                  <input
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Meta Keywords <span className="text-xs text-gray-400">(comma separated)</span></label>
                  <input
                    value={form.meta_keywords}
                    onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">ISBN</label>
                  <input
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Cover Image <span className="text-xs text-gray-400">(image file)</span></label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, cover_image: e.target.files[0] })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Book File <span className="text-xs text-gray-400">(PDF)</span></label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setForm({ ...form, file_url: e.target.files[0] })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Num Reviews</label>
                  <input
                    type="number"
                    value={form.num_reviews}
                    onChange={(e) => setForm({ ...form, num_reviews: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Meta Title</label>
                  <input
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Meta Description</label>
                  <input
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <label className="block text-sm font-medium">Active</label>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <label className="block text-sm font-medium">Featured</label>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  {editingId ? "Save Changes" : "Add Book"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
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
                    src={detailsBook.cover_image}
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
