import { useEffect, useState } from 'react';
import { categoryAPI } from '@/api/category-api';
import { toast } from 'react-toastify';
import CategoryModal from './CategoryModal';

// Category manager with modal-based add/edit (mirrors book modal styling).
// Removed inline form, slug & order columns per latest requirements.
const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('alphaAsc'); // alphaAsc | alphaDesc | booksDesc | booksAsc | newest | oldest

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryAPI.list({ includeEmpty: true, status: 'all' });
      setCategories(data.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Reset page when search or sort changes
  useEffect(() => { setPage(1); }, [search, sort]);

  const normalized = categories.map(c => ({
    ...c,
    _nameLower: (c.name || '').toLowerCase(),
    _createdAt: c.created_at ? new Date(c.created_at) : null,
  }));

  const filtered = normalized.filter(c => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return c._nameLower.includes(q);
  });

  const sorted = filtered.sort((a, b) => {
    switch (sort) {
      case 'alphaDesc':
        return a._nameLower < b._nameLower ? 1 : a._nameLower > b._nameLower ? -1 : 0;
      case 'booksAsc':
        return (a.book_count || 0) - (b.book_count || 0);
      case 'booksDesc':
        return (b.book_count || 0) - (a.book_count || 0);
      case 'newest':
        return (b._createdAt?.getTime() || 0) - (a._createdAt?.getTime() || 0);
      case 'oldest':
        return (a._createdAt?.getTime() || 0) - (b._createdAt?.getTime() || 0);
      case 'alphaAsc':
      default:
        return a._nameLower < b._nameLower ? -1 : a._nameLower > b._nameLower ? 1 : 0;
    }
  });

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const openNew = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setShowModal(true);
  };

  const handleDelete = async (cat) => {
    // Prevent deleting categories that still have books
    if ((cat.book_count ?? 0) > 0) {
      toast.error('Cannot delete a category that has books. Reassign or remove its books first.');
      return;
    }
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone (hard delete).`)) return;
    try {
      await categoryAPI.remove(cat._id, true);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const handleModalSubmit = async (form, existing) => {
    try {
      if (existing) {
        const res = await categoryAPI.update(existing._id, form);
        setCategories((prev) => prev.map((c) => (c._id === existing._id ? res.data : c)));
        toast.success('Category updated');
      } else {
        const res = await categoryAPI.create(form);
        setCategories((prev) => [...prev, res.data]);
        toast.success('Category created');
      }
      setShowModal(false);
      setEditingCategory(null);
    } catch (e) {
      toast.error(e.message || 'Save failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-3">Categories</h2>
        <p className="text-sm text-gray-600">Manage book categories. These correspond to book <code>genre</code> values for counting.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h3 className="text-lg font-semibold">Existing Categories</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full border px-3 py-2 rounded-[2px] text-sm"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full border px-3 py-2 rounded-[2px] text-sm bg-white"
              >
                <option value="alphaAsc">Name A → Z</option>
                <option value="alphaDesc">Name Z → A</option>
                <option value="booksDesc">Books High → Low</option>
                <option value="booksAsc">Books Low → High</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={openNew}
                className="bg-slate-950 text-white px-5 py-2 rounded-[2px] text-sm h-[38px] hover:bg-slate-800"
              >
                + Add Category
              </button>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500">{sorted.length} result{sorted.length === 1 ? '' : 's'} (Page {page} of {totalPages})</div>
      </div>

      <div className="bg-white border rounded-[2px] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Books</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-500">Loading...</td></tr>
            )}
            {error && !loading && (
              <tr><td colSpan={4} className="px-3 py-4 text-center text-red-600">{error}</td></tr>
            )}
            {!loading && !error && categories.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-500">No categories yet.</td></tr>
            )}
            {paged.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.book_count ?? 0}</td>
                <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="px-3 py-1 border rounded-[2px] hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    disabled={(c.book_count ?? 0) > 0}
                    title={(c.book_count ?? 0) > 0 ? 'Cannot delete: category has books' : 'Delete category'}
                    className={`px-3 py-1 border rounded-[2px] ${
                      (c.book_count ?? 0) > 0
                        ? 'text-gray-400 cursor-not-allowed opacity-60'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination Controls */}
        {sorted.length > pageSize && (
          <div className="flex items-center justify-center gap-2 p-4 border-t bg-gray-50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-[2px] text-xs disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages })
              .slice(0, 8)
              .map((_, i) => {
                const pNum = i + 1;
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`px-3 py-1 border rounded-[2px] text-xs ${
                      pNum === page ? 'bg-slate-900 text-white border-slate-900' : 'hover:border-slate-900'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded-[2px] text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <CategoryModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingCategory(null); }}
        onSubmit={handleModalSubmit}
        initialCategory={editingCategory}
      />
    </div>
  );
};

export default CategoryManager;
