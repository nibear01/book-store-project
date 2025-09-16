import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { booksAPI } from "../api/book-api.js";

const ShopPage = () => {
  const { addToCart } = useCart();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await booksAPI.list({ limit: 12, sort: "-created_at" });
        setBooks(res.data || []);
      } catch (e) {
        setError(e.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-6 py-10">Loading books...</div>;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 text-red-600">{error}</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Shop</h1>
      <p className="text-gray-600 mt-2">Discover our collection of books</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {books.map((b) => (
          <div key={b._id} className="border rounded-[2px] p-4">
            {Array.isArray(b.cover_image) && b.cover_image[0] && (
              <img
                src={b.cover_image[0]}
                alt={b.title}
                className="w-full h-48 object-cover rounded mb-3"
              />
            )}
            <h3 className="font-semibold">{b.title}</h3>
            {b.author && <p className="text-sm text-gray-600">by {b.author}</p>}
            <p className="text-gray-700 mb-3 mt-1">
              ${Number(b.price || 0).toFixed(2)}
            </p>
            <button
              onClick={() =>
                addToCart({
                  item: {
                    id: b._id,
                    title: b.title,
                    price: Number(b.price || 0),
                  },
                  quantity: 1,
                })
              }
              className="bg-red-500 text-white px-3 py-2 rounded-[2px] hover:bg-red-600"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
