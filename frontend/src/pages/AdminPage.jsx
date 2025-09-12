import { useState } from "react";
import initialBooks from "../data/dummyBooks.json";
import BooksTable from "../components/dashboard/BooksTable";
import BookForm from "../components/dashboard/BookForm";

const emptyForm = { title: "", author: "", price: "", cover_image: "" };

const AdminPage = () => {
  const [books, setBooks] = useState(initialBooks);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

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
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-600 mt-2">
        Manage dummy books (changes are not persisted).
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 overflow-x-auto">
          <BooksTable
            books={books}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <BookForm
          form={form}
          editingId={editingId}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => {
            setEditingId(null);
            resetForm();
          }}
        />
      </div>
    </div>
  );
};

export default AdminPage;
