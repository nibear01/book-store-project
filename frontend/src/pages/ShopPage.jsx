import { useCart } from "../context/CartContext";
import books from "../data/dummyBooks.json";

const ShopPage = () => {
  const { dispatch } = useCart();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Shop</h1>
      <p className="text-gray-600 mt-2">Discover our collection of books</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {books.map((b) => (
          <div key={b.id} className="border rounded-[2px] p-4">
            {b.cover_image && (
              <img
                src={b.cover_image}
                alt={b.title}
                className="w-full h-48 object-cover rounded mb-3"
              />
            )}
            <h3 className="font-semibold">{b.title}</h3>
            {b.author && <p className="text-sm text-gray-600">by {b.author}</p>}
            <p className="text-gray-700 mb-3 mt-1">${b.price.toFixed(2)}</p>
            <button
              onClick={() =>
                dispatch({
                  type: "ADD_ITEM",
                  item: { id: b.id, title: b.title, price: b.price },
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
