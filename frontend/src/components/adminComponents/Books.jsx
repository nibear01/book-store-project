import React, { useState } from "react";
import initialBooks from "../../data/dummyBooks.json";

const emptyForm = { title: "", author: "", price: "", cover_image: "" };

const Books = () => {
  const [books, setBooks] = useState(initialBooks);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [detailsBook, setDetailsBook] = useState(null);
  const [filters, setFilters] = useState({
    genre: "all",
    sortPrice: "none", // none | asc | desc
    stock: "all",
  });

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = (e) => {
    e.preventDefault();
    const priceNum = Number(form.price) || 0;
    if (editingId) {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === editingId ? { ...b, ...form, price: priceNum } : b
        )
      );
      setEditingId(null);
    } else {
      const nextId = Math.max(0, ...books.map((b) => b.id || 0)) + 1;
      setBooks((prev) => [
        ...prev,
        {
          id: nextId,
          title: form.title,
          author: form.author,
          price: priceNum,
          cover_image: form.cover_image,
        },
      ]);
    }
    resetForm();
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title || "",
      author: book.author || "",
      price: String(book.price || ""),
      cover_image: book.cover_image || "",
    });
  };

  const handleDelete = (id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    if (editingId === id) {
      setEditingId(null);
      resetForm();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Books</h1>
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
        <div className="md:col-span-2 overflow-x-auto">
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

        <div className="border rounded-[2px] p-4 h-fit">
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit Book" : "Add Book"}
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Author</label>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm">Price</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm">Cover Image URL</label>
              <input
                value={form.cover_image}
                onChange={(e) =>
                  setForm({ ...form, cover_image: e.target.value })
                }
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="bg-red-500 text-white px-4 py-2 rounded-[2px] hover:bg-red-600"
              >
                {editingId ? "Save Changes" : "Add Book"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-[2px] border"
                  onClick={() => {
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
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
