import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CategoriesPage = ({ book }) => {
  // ---------- States ----------
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);

  // ---------- Categories ----------
  const categories = [
    { id: 1, title: "Fiction" },
    { id: 2, title: "Science Fiction" },
    { id: 3, title: "Romance" },
    { id: 4, title: "Fantasy" },
    { id: 5, title: "Classic" },
    { id: 6, title: "Mystery" },
  ];

  // ---------- Filter Books ----------
  useEffect(() => {
    let result = [...book];

    if (selectedCategory !== "All") {
      result = result.filter((b) => b.genre === selectedCategory);
    }

    if (searchQuery.trim()) {
      result = result.filter((b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBooks(result);
  }, [selectedCategory, searchQuery, book]);

  // ---------- JSX ----------
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-4">
        <Link to="/">Home</Link> / <span>Categories</span>
      </nav>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-1/4 bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Categories</h3>
          <ul>
            <li
              className={`cursor-pointer mb-2 ${
                selectedCategory === "All" ? "font-bold" : ""
              }`}
              onClick={() => setSelectedCategory("All")}
            >
              All
            </li>
            {categories.map((cat) => (
              <li
                key={cat.id}
                className={`cursor-pointer mb-2 ${
                  selectedCategory === cat.title ? "font-bold" : ""
                }`}
                onClick={() => setSelectedCategory(cat.title)}
              >
                {cat.title}
              </li>
            ))}
          </ul>

          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            className="border rounded px-2 py-1 w-full mt-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </aside>

        {/* Books */}
        <main className="md:w-3/4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredBooks.length === 0 ? (
            <p>No books found.</p>
          ) : (
            filteredBooks.map((b) => (
              <div
                key={b.id}
                className="border rounded p-3 bg-white hover:shadow-md"
              >
                <img
                  src={b.cover_image}
                  alt={b.title}
                  className="w-full h-40 object-cover rounded"
                />
                <h4 className="font-semibold mt-2">{b.title}</h4>
                <p className="text-sm text-gray-500">{b.author}</p>
                <p className="text-sm">${b.price}</p>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoriesPage;
