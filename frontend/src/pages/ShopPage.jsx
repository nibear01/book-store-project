import { useCart } from "../context/CartContext";

const demoBooks = [
  { id: 1, title: "The Great Gatsby", price: 12.99 },
  { id: 2, title: "1984", price: 10.5 },
  { id: 3, title: "To Kill a Mockingbird", price: 11.25 },
];

const ShopPage = () => {
  const { dispatch } = useCart();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Shop</h1>
      <p className="text-gray-600 mt-2">Discover our collection of books</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {demoBooks.map((b) => (
          <div key={b.id} className="border rounded-[2px] p-4">
            <h3 className="font-semibold">{b.title}</h3>
            <p className="text-gray-700 mb-3">${b.price.toFixed(2)}</p>
            <button
              onClick={() => dispatch({ type: "ADD_ITEM", item: b })}
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
