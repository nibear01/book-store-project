import React from "react";

const API_BASE = "http://localhost:5000";

const BooksTable = ({ books, toGenreArray, onViewDetails, onEdit, onDelete }) => {
  return (
    <table className="min-w-full border">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left text-sm font-semibold px-3 py-2 border-b">Cover</th>
          <th className="text-left text-sm font-semibold px-3 py-2 border-b">Title</th>
          <th className="text-left text-sm font-semibold px-3 py-2 border-b">Author</th>
          <th className="text-left text-sm font-semibold px-3 py-2 border-b">Genre</th>
          <th className="text-left text-sm font-semibold px-3 py-2 border-b">Stock</th>
          <th className="text-left text-sm font-semibold px-3 py-2 border-b">Price</th>
          <th className="text-left text-sm font-semibold px-3 py-2 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {books.map((b) => {
          const onSale = !!b.is_on_sale && typeof b.sale_price === "number";
          const genreLabel = toGenreArray(b?.genre).join(", ");
          const coverRaw = Array.isArray(b.cover_image) ? b.cover_image[0] : b.cover_image;
          const cover = typeof coverRaw === "string" ? `${API_BASE}${coverRaw}` : null;
          return (
            <tr key={b._id || b.id} className="border-b">
              <td className="px-3 py-2 text-sm">
                {cover ? (
                  <img
                    src={cover}
                    alt={b.title}
                    className="h-12 w-10 object-cover rounded"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-3 py-2 text-sm">{b.title}</td>
              <td className="px-3 py-2 text-sm">{b.author || ""}</td>
              <td className="px-3 py-2 text-sm">{genreLabel}</td>
              <td className="px-3 py-2 text-sm">
                {typeof b.stock === "number" ? b.stock : ""}
              </td>
              <td className="px-3 py-2 text-sm">
                {onSale ? (
                  <span>
                    <span className="font-semibold">${(b.sale_price || 0).toFixed(2)}</span>{" "}
                    <span className="text-gray-500 line-through">${(b.price || 0).toFixed(2)}</span>
                  </span>
                ) : (
                  <>${(b.price || 0).toFixed(2)}</>
                )}
              </td>
              <td className="px-3 py-2 text-sm space-x-3">
                <button onClick={() => onViewDetails(b)} className="text-gray-700 hover:underline">
                  View Details
                </button>
                <button onClick={() => onEdit(b)} className="text-blue-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => onDelete(b)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default BooksTable;
