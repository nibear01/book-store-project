/* Displays a table of books with Cover | Title | Author | Genre | Stock | Price | Actions */
const BooksTable = ({ books, onEdit, onDelete }) => {
  return (
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
        {books.map((b) => (
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
            <td className="px-3 py-2 text-sm">${(b.price || 0).toFixed(2)}</td>
            <td className="px-3 py-2 text-sm space-x-3">
              <button
                onClick={() => onEdit(b)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(b.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BooksTable;
