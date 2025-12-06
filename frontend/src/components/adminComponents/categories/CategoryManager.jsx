import { useEffect, useMemo, useState } from "react";
import { categoryAPI } from "@/api/category-api";
import { toast } from "react-toastify";
import CategoryModal from "./CategoryModal";
import Pagination from "../common/Pagination";
import WorkflowSkeleton from "../common/WorkflowSkeleton";
import { useDebounce } from "../common/useDebounce";

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
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("alphaAsc"); // alphaAsc | alphaDesc | booksDesc | booksAsc | newest | oldest
  const debouncedSearch = useDebounce(search, 250);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryAPI.list({
        includeEmpty: true,
        status: "all",
      });
      setCategories(data.data || []);
    } catch (e) {
      setError(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Reset page when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [search, sort]);

  // Derivations optimized with useMemo + debounced search
  const { sorted, totalPages, paged } = useMemo(() => {
    const normalized = categories.map((c) => ({
      ...c,
      _nameLower: (c.name || "").toLowerCase(),
      _createdAt: c.created_at ? new Date(c.created_at) : null,
    }));

    const q = debouncedSearch.trim().toLowerCase();
    const filtered = q
      ? normalized.filter((c) => c._nameLower.includes(q))
      : normalized;

    const sortedLocal = filtered.sort((a, b) => {
      switch (sort) {
        case "alphaDesc":
          return a._nameLower < b._nameLower
            ? 1
            : a._nameLower > b._nameLower
            ? -1
            : 0;
        case "booksAsc":
          return (a.book_count || 0) - (b.book_count || 0);
        case "booksDesc":
          return (b.book_count || 0) - (a.book_count || 0);
        case "newest":
          return (
            (b._createdAt?.getTime() || 0) - (a._createdAt?.getTime() || 0)
          );
        case "oldest":
          return (
            (a._createdAt?.getTime() || 0) - (b._createdAt?.getTime() || 0)
          );
        case "alphaAsc":
        default:
          return a._nameLower < b._nameLower
            ? -1
            : a._nameLower > b._nameLower
            ? 1
            : 0;
      }
    });

    const total = sortedLocal.length;
    const totalPagesLocal = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const pagedLocal = sortedLocal.slice(start, start + pageSize);
    return {
      sorted: sortedLocal,
      totalPages: totalPagesLocal,
      paged: pagedLocal,
    };
  }, [categories, debouncedSearch, sort, page, pageSize]);

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
      toast.error(
        "Cannot delete a category that has books. Reassign or remove its books first."
      );
      return;
    }
    if (
      !window.confirm(
        `Delete category "${cat.name}"? This cannot be undone (hard delete).`
      )
    )
      return;
    try {
      await categoryAPI.remove(cat._id, true);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  };

  const handleModalSubmit = async (form, existing) => {
    try {
      // Prevent duplicates (case-insensitive) before hitting API
      const incoming = (form?.name || "").trim().toLowerCase();
      if (!incoming) {
        toast.error("Name is required");
        return;
      }
      const duplicate = categories.some((c) => {
        if (existing && c._id === existing._id) return false;
        return (c.name || "").trim().toLowerCase() === incoming;
      });
      if (duplicate) {
        toast.error("Category with this name already exists");
        return; // keep modal open
      }
      if (existing) {
        const res = await categoryAPI.update(existing._id, form);
        setCategories((prev) =>
          prev.map((c) => (c._id === existing._id ? res.data : c))
        );
        toast.success("Category updated");
      } else {
        const res = await categoryAPI.create(form);
        setCategories((prev) => [...prev, res.data]);
        toast.success("Category created");
      }
      setShowModal(false);
      setEditingCategory(null);
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.message || "Save failed";
      if (status === 409 || /exist/i.test(msg)) {
        toast.error("Category with this name already exists");
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className="space-y-6" name="categories-manager">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        {/* <div>
          <h2 className="text-xl font-semibold mb-1" name="categories-title">
            Categories
          </h2>
          <p className="text-sm text-gray-600" name="categories-subtitle">
            Manage book categories. These match book genre values.
          </p>
        </div> */}
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-black text-white border-gray-300 hover:bg-gray-800 transition-colors"
          name="categories-add"
        >
          + Add Category
        </button>
      </div>

      {/* Toolbar */}
      <div
        className="bg-white border rounded-md p-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end justify-between"
        name="categories-toolbar"
      >
        <div className="flex-1 min-w-[200px]">
          <label
            className="block text-xs font-medium text-gray-600 mb-1"
            htmlFor="categories-search"
          >
            Search
          </label>
          <input
            id="categories-search"
            name="categories-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full border px-3 py-2 rounded-md text-sm"
          />
        </div>
        <div className="w-full sm:w-60">
          <label
            className="block text-xs font-medium text-gray-600 mb-1"
            htmlFor="categories-sort"
          >
            Sort By
          </label>
          <select
            id="categories-sort"
            name="categories-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full border px-3 py-2 rounded-md text-sm bg-white"
          >
            <option value="alphaAsc">Name A → Z</option>
            <option value="alphaDesc">Name Z → A</option>
            <option value="booksDesc">Books High → Low</option>
            <option value="booksAsc">Books Low → High</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
        <div
          className="text-xs text-gray-500 sm:self-center"
          name="categories-result-info"
        >
          {sorted.length} result{sorted.length === 1 ? "" : "s"} • Page {page}{" "}
          of {totalPages}
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white border rounded-md overflow-hidden"
        name="categories-table-wrapper"
      >
        <table className="w-full text-sm" name="categories-table">
          <thead className="bg-gray-50 text-left" name="categories-header">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Books</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          {loading ? (
            <WorkflowSkeleton rows={8} variant="table" columns={4} />
          ) : (
            <tbody>
              {error && (
                <tr name="categories-error-row">
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-red-600"
                    name="categories-error"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!error && paged.length === 0 && (
                <tr name="categories-empty-row">
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-gray-500"
                    name="categories-empty"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
              {!error &&
                paged.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t"
                    name={`categories-row-${c._id}`}
                  >
                    <td className="px-3 py-2" name={`categories-name-${c._id}`}>
                      {c.name}
                    </td>
                    <td
                      className="px-3 py-2"
                      name={`categories-books-${c._id}`}
                    >
                      {c.book_count ?? 0}
                    </td>
                    <td
                      className="px-3 py-2 text-gray-500 whitespace-nowrap"
                      name={`categories-created-${c._id}`}
                    >
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td
                      className="px-3 py-2 flex gap-2"
                      name={`categories-actions-${c._id}`}
                    >
                      <button
                        onClick={() => handleEdit(c)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                        name={`categories-edit-${c._id}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={(c.book_count ?? 0) > 0}
                        title={
                          (c.book_count ?? 0) > 0
                            ? "Cannot delete: category has books"
                            : "Delete category"
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                          (c.book_count ?? 0) > 0
                            ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                        name={`categories-delete-${c._id}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          )}
        </table>

        {/* Pagination */}
        {!loading && sorted.length > pageSize && (
          <Pagination
            page={page}
            total={sorted.length}
            pageSize={pageSize}
            onPageChange={setPage}
            namePrefix="categories"
          />
        )}
      </div>

      <CategoryModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
        }}
        onSubmit={handleModalSubmit}
        initialCategory={editingCategory}
      />
    </div>
  );
};

export default CategoryManager;
