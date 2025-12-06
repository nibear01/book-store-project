import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

const STATUSES = ["pending", "approved", "rejected", "fulfilled"];

const BookRequest = () => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "";
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [updating, setUpdating] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState(null);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const fetchRequests = async (status) => {
    setLoading(true);
    setError("");
    try {
      const url = new URL(`${baseUrl}/api/book-requests`);
      if (status && status !== "All") url.searchParams.set("status", status);
      const res = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load requests");
      setRequests(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      setError(e.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => setPage(1), [statusFilter, search, sortOrder]);

  const updateStatus = async (id, nextStatus) => {
    if (!id || !nextStatus) return;
    setUpdating((m) => ({ ...m, [id]: true }));
    setError("");
    try {
      const res = await fetch(`${baseUrl}/api/book-requests/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update status");
      if (nextStatus === "approved") {
        // Backend deletes the request when approved; remove locally as well
        setRequests((list) => list.filter((r) => r._id !== id));
      } else {
        setRequests((list) => list.map((r) => (r._id === id ? { ...r, status: nextStatus } : r)));
      }
    } catch (e) {
      setError(e.message || "Failed to update status");
    } finally {
      setUpdating((m) => ({ ...m, [id]: false }));
    }
  };

  const fmt = (d) => {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d || "";
    }
  };

  const visibleRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = Array.isArray(requests) ? [...requests] : [];
    if (q) {
      list = list.filter((r) => {
        const hay = [r.name, r.email, r.title, r.author, r.isbn, r.publisher, r.notes]
          .map((s) => (s ? String(s).toLowerCase() : ""))
          .join(" ");
        return hay.includes(q);
      });
    }
    list.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime() || 0;
      const tb = new Date(b.createdAt).getTime() || 0;
      return sortOrder === "oldest" ? ta - tb : tb - ta;
    });
    return list;
  }, [requests, search, sortOrder]);

  const totalItems = visibleRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginatedRequests = visibleRequests.slice(startIdx, startIdx + pageSize);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book Requests</h2>
            <p className="text-gray-600 text-sm mt-1">Review and manage user book requests</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              name="book-request-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, title, ISBN…"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>
          <select
            name="book-request-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white"
          >
            <option value="All">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            name="book-request-sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
      )}

      {/* Results Count */}
      {!loading && visibleRequests.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">Showing {paginatedRequests.length} of {totalItems} requests</div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Requester','Contact','Book','Status','Requested','Actions'].map(h => (
                    <th key={h} className="text-left font-semibold text-gray-700 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-t border-gray-200 animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32"></div><div className="h-3 bg-gray-200 rounded w-24 mt-2"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-64"></div><div className="h-3 bg-gray-200 rounded w-40 mt-2"></div></td>
                    <td className="px-4 py-3"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><div className="h-8 bg-gray-200 rounded w-16"></div><div className="h-8 bg-gray-200 rounded w-20"></div></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : visibleRequests.length === 0 ? (
        <div className="text-sm text-gray-600">No requests found.</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Requester</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Contact</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Book</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Status</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Requested</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((r) => (
                <tr key={r._id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.name}</div>
                    <div className="text-gray-500">{r.user ? "Registered user" : "Guest"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{r.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 truncate max-w-[240px]" title={`${r.title} by ${r.author || "Unknown"}`}>
                      {r.title}
                    </div>
                    <div className="text-gray-500 truncate max-w-[280px]" title={`Author: ${r.author || "—"} • ISBN: ${r.isbn || "—"} • Publisher: ${r.publisher || "—"}`}>
                      {r.author || "—"} • {r.isbn || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        r.status === "approved"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : r.status === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : r.status === "fulfilled"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{fmt(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 justify-start">
                      <button
                        name={`view-request-${r._id}`}
                        onClick={() => setSelected(r)}
                        className="px-3 py-1.5 rounded-md text-sm border border-gray-300 text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all"
                      >
                        View
                      </button>
                      <button
                        name={`approve-request-${r._id}`}
                        onClick={() => updateStatus(r._id, "approved")}
                        disabled={updating[r._id] || r.status === "approved"}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                          r.status === "approved"
                            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                            : "border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        name={`reject-request-${r._id}`}
                        onClick={() => updateStatus(r._id, "rejected")}
                        disabled={updating[r._id] || r.status === "rejected"}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                          r.status === "rejected"
                            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                            : "border border-red-200 text-red-700 bg-red-50 hover:bg-red-600 hover:text-white hover:border-red-600"
                        }`}
                      >
                        Reject
                      </button>
                      <button
                        name={`fulfill-request-${r._id}`}
                        onClick={() => updateStatus(r._id, "fulfilled")}
                        disabled={updating[r._id] || r.status === "fulfilled"}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                          r.status === "fulfilled"
                            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                            : "border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                        }`}
                      >
                        Fulfilled
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalItems > pageSize && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {startIdx + 1}-{Math.min(startIdx + pageSize, totalItems)} of {totalItems}
              </div>
              <div className="flex items-center gap-2">
                <button
                  name="book-request-prev-page"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium">{safePage}</span> of {totalPages}
                </span>
                <button
                  name="book-request-next-page"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-md shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Book Request Details</h3>
              <button 
                name="close-request-details"
                onClick={() => setSelected(null)} 
                className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100" 
                aria-label="Close details"
              >
                Close
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Name</div>
                <div className="font-medium text-gray-900">{selected.name || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Email</div>
                <div className="font-medium text-gray-900">{selected.email || "—"}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-gray-500">Title</div>
                <div className="font-medium text-gray-900">{selected.title || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Author</div>
                <div className="font-medium text-gray-900">{selected.author || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">ISBN</div>
                <div className="font-medium text-gray-900">{selected.isbn || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Publisher</div>
                <div className="font-medium text-gray-900">{selected.publisher || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Requested</div>
                <div className="font-medium text-gray-900">{fmt(selected.createdAt)}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-gray-500">Notes</div>
                <div className="mt-1 whitespace-pre-wrap text-gray-900">{selected.notes || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium text-gray-900">{selected.status}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookRequest;