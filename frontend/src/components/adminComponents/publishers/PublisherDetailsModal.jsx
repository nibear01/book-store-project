import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Building2,
  Globe,
  Calendar,
  MapPin,
  BookOpen,
  Plus,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import * as publisherApi from "../../../api/publisher-api";
import * as bookApi from "../../../api/book-api";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Loading Skeleton for Books Grid
const BookCardSkeleton = () => (
  <div className="flex gap-3 p-3 border border-gray-200 rounded-lg animate-pulse">
    <div className="w-16 h-24 flex-shrink-0 bg-gray-200 rounded"></div>
    <div className="flex-1 min-w-0">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
    </div>
    <div className="w-6 h-6 bg-gray-200 rounded"></div>
  </div>
);

const PublisherDetailsModal = ({ open, publisher, onClose, onEdit, onRefresh }) => {
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [addingBook, setAddingBook] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingBooks, setSearchingBooks] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (open && publisher) fetchPublisherBooks();
  }, [open, publisher]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (searchQuery.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchAvailableBooks(searchQuery);
      }, 300);
    } else {
      setAvailableBooks([]);
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const fetchPublisherBooks = async () => {
    setLoadingBooks(true);
    try {
      const res = await publisherApi.getBooksByPublisher(publisher._id);
      setBooks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch publisher books", err);
      toast.error("Failed to load publisher books");
    } finally {
      setLoadingBooks(false);
    }
  };

  const searchAvailableBooks = async (query) => {
    if (!query || query.trim().length < 2) {
      setAvailableBooks([]);
      return;
    }

    try {
      setSearchingBooks(true);
      const res = await bookApi.getBooks({ search: query.trim(), status: "all", limit: 20 });
      const bookIds = books.map((b) => b._id);
      setAvailableBooks((res.data || []).filter((b) => !bookIds.includes(b._id)));
      setShowDropdown(true);
    } catch (err) {
      console.error("Search books failed", err);
      toast.error("Failed to search books");
    } finally {
      setSearchingBooks(false);
    }
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setSearchQuery(book.title);
    setShowDropdown(false);
    setAvailableBooks([]);
  };

  const handleAddBook = async () => {
    if (!selectedBook) return toast.error("Please select a book");
    setAddingBook(true);
    try {
      await publisherApi.addBookToPublisher(publisher._id, selectedBook._id);
      toast.success("Book added to publisher");
      fetchPublisherBooks();
      setShowAddBookModal(false);
      setSelectedBook(null);
      setSearchQuery("");
      setAvailableBooks([]);
      onRefresh?.();
    } catch (err) {
      console.error("Add book failed", err);
      toast.error(err?.response?.data?.message || "Failed to add book");
    } finally {
      setAddingBook(false);
    }
  };

  const handleRemoveBook = async (bookId, title) => {
    if (!confirm(`Remove "${title}" from this publisher?`)) return;
    try {
      await publisherApi.removeBookFromPublisher(publisher._id, bookId);
      toast.success("Book removed");
      fetchPublisherBooks();
      onRefresh?.();
    } catch (err) {
      console.error("Remove book failed", err);
      toast.error(err?.response?.data?.message || "Failed to remove book");
    }
  };

  const getLogoUrl = (logo) => {
    if (!logo) return null;
    if (logo.startsWith("http")) return logo;
    return `${API_BASE}/${logo}`;
  };

  const getCoverUrl = (cover) => {
    if (!cover) return null;
    const img = Array.isArray(cover) ? cover[0] : cover;
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${API_BASE}/${img}`;
  };

  if (!open || !publisher) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Publisher Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Publisher Info */}
          <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
            <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
              {publisher.logo ? (
                <img src={getLogoUrl(publisher.logo)} alt={publisher.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{publisher.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Publisher ID: {publisher.publisher_id}</p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${publisher.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {publisher.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {publisher.description && <p className="text-gray-700 mb-4">{publisher.description}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {publisher.country && (<div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" />{publisher.country}</div>)}
                {publisher.founded_year && (<div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" />Founded {publisher.founded_year}</div>)}
                {publisher.website && (<div className="flex items-center gap-2 text-gray-600 col-span-2"><Globe className="w-4 h-4" /><a href={publisher.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{publisher.website}</a></div>)}
              </div>
            </div>
          </div>

          {/* Books Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Books ({books.length})</h4>
              <button onClick={() => { setShowAddBookModal(true); setSearchQuery(""); setSelectedBook(null); setAvailableBooks([]); }} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition-colors"><Plus className="w-4 h-4" /> Add Book</button>
            </div>

            {loadingBooks ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, idx) => (
                  <BookCardSkeleton key={idx} />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No books assigned to this publisher</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map((book) => (
                  <div key={book._id} className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-16 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">{book.cover_image ? (<img src={getCoverUrl(book.cover_image)} alt={book.title} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-gray-400" /></div>)}</div>
                    <div className="flex-1 min-w-0"><h5 className="font-medium text-gray-900 truncate">{book.title}</h5><p className="text-sm text-gray-600 truncate">{book.author}</p><p className="text-sm text-gray-900 font-semibold mt-1">${book.price}</p></div>
                    <button onClick={() => handleRemoveBook(book._id, book.title)} className="text-red-500 hover:text-red-700 p-1" title="Remove book"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Close</button>
          <button onClick={onEdit} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Edit Publisher</button>
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddBookModal && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b"><h3 className="font-semibold text-gray-900">Add Book to Publisher</h3><button onClick={() => { setShowAddBookModal(false); setSearchQuery(""); setSelectedBook(null); setAvailableBooks([]); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-4">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search for a book</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (selectedBook && e.target.value !== selectedBook.title) setSelectedBook(null); }} onFocus={() => { if (availableBooks.length > 0) setShowDropdown(true); }} placeholder="Type to search books..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                  {searchingBooks && (<div className="absolute right-3 top-1/2 transform -translate-y-1/2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div></div>)}
                </div>

                {/* Search Results Dropdown */}
                {showDropdown && availableBooks.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {availableBooks.map((book) => (
                      <button key={book._id} onClick={() => handleSelectBook(book)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-14 flex-shrink-0 bg-gray-100 rounded overflow-hidden">{book.cover_image ? (<img src={getCoverUrl(book.cover_image)} alt={book.title} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-gray-400" /></div>)}</div>
                          <div className="flex-1 min-w-0"><p className="font-medium text-gray-900 truncate">{book.title}</p><p className="text-sm text-gray-600 truncate">{book.author}</p><p className="text-xs text-gray-500 mt-1">${book.price} • ISBN: {book.isbn || "N/A"}</p></div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.trim().length >= 2 && !searchingBooks && availableBooks.length === 0 && (<p className="text-sm text-gray-500 mt-2">No books found. Try a different search term.</p>)}
                {searchQuery.trim().length < 2 && (<p className="text-xs text-gray-500 mt-2">Type at least 2 characters to search</p>)}
              </div>

              {/* Selected Book Preview */}
              {selectedBook && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Selected Book:</p>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">{selectedBook.cover_image ? (<img src={getCoverUrl(selectedBook.cover_image)} alt={selectedBook.title} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-gray-400" /></div>)}</div>
                    <div className="flex-1 min-w-0"><p className="font-medium text-gray-900">{selectedBook.title}</p><p className="text-sm text-gray-600">{selectedBook.author}</p><p className="text-sm text-gray-900 font-semibold mt-1">${selectedBook.price}</p></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <button onClick={() => { setShowAddBookModal(false); setSearchQuery(""); setSelectedBook(null); setAvailableBooks([]); }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50" disabled={addingBook}>Cancel</button>
              <button onClick={handleAddBook} disabled={addingBook || !selectedBook} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">{addingBook ? "Adding..." : "Add Book"}</button>
            </div>
          </div>
        </div>, document.body)}
    </div>,
    document.body
  );
};

export default PublisherDetailsModal;
