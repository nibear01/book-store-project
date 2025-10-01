import { useEffect, useState, useContext } from "react";
import { BooksContext } from "@/context/BooksContext";
import BookCard from "../categories/BookCard";

function Feature() {
  const [activeTab, setActiveTab] = useState("featured");
  const {
    url,
    featuredBooks,
    loading,
    error,
    fetchFeaturedBooks,
    onSaleBooks,
    mostViewedBooks,
    fetchOnSaleBooks,
    fetchMostViewedBooks,
  } = useContext(BooksContext);

  useEffect(() => {
    // Load data based on active tab
    if (activeTab === "featured") {
      fetchFeaturedBooks(10);
    } else if (activeTab === "most_viewed") {
      fetchMostViewedBooks(10);
    } else if (activeTab === "on_sale") {
      fetchOnSaleBooks(10);
    }
  }, [activeTab, fetchFeaturedBooks, fetchMostViewedBooks, fetchOnSaleBooks]);

  const tabs = [
    { name: "Featured", key: "featured" },
    { name: "On Sale", key: "on_sale" },
    { name: "Most Viewed", key: "most_viewed" },
  ];

  const selectedBooks =
    activeTab === "featured"
      ? featuredBooks
      : activeTab === "most_viewed"
      ? mostViewedBooks
      : onSaleBooks;

  // Normalize to an array for rendering
  const list = Array.isArray(selectedBooks)
    ? selectedBooks
    : selectedBooks?.data || [];

  return (
    <div className="p-4 md:p-8 max-w-full w-full mx-auto mt-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
        Featured Books
      </h2>

      {/* Tabs - responsive layout */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 md:px-4 md:py-2 text-sm md:text-lg font-medium rounded-md transition-colors duration-200 ${
              activeTab === tab.key
                ? "bg-black text-white"
                : "text-gray-600 hover:text-black border border-gray-300"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-4">Loading books...</div>}
      {!!error && (
        <div className="text-center text-red-500 py-4">
          Error:{" "}
          {typeof error === "string"
            ? error
            : error?.message || "Failed to load books"}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {list
            .filter((b) => !!b?.slug)
            .map((b, index) => (
              <BookCard
                key={b?._id || b?.id || b?.slug || index}
                book={b}
                baseUrl={url}
                viewMode="grid"
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default Feature;
