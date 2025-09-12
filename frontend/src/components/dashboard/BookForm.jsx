/* Form to add/edit a book */
const BookForm = ({ form, editingId, onChange, onSubmit, onCancel }) => {
  return (
    <div className="border rounded-[2px] p-4 h-fit">
      <h2 className="text-lg font-semibold">
        {editingId ? "Edit Book" : "Add Book"}
      </h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm">Title</label>
          <input
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Author</label>
          <input
            value={form.author}
            onChange={(e) => onChange({ ...form, author: e.target.value })}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Price</label>
          <input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => onChange({ ...form, price: e.target.value })}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Cover Image URL</label>
          <input
            value={form.cover_image}
            onChange={(e) => onChange({ ...form, cover_image: e.target.value })}
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
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BookForm;
