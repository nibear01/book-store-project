import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAuthorRequests } from "../../context/AuthorRequestContext.jsx";
import { authorRequestAPI } from "@/api/author-request-api";
import AuthorReqDetails from "./author/AuthorReqDetails.jsx";

const STATUSES = ["pending", "verified", "cancelled", "unverified"]; // must match backend enum

const AuthorRequest = () => {
  const { requests, loading, error, list, updateStatus } = useAuthorRequests();

  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [updating, setUpdating] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState(null);

  // Fetch via context
  useEffect(() => {
    list({ status: statusFilter !== "All" ? statusFilter : undefined }).catch(
      () => {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Reset to first page when filters/search/sort change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, sortOrder]);

  const fmt = (d) => {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d || "";
    }
  };

  const visibleRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    let listArr = Array.isArray(requests) ? [...requests] : [];
    if (q) {
      listArr = listArr.filter((r) => {
        const hay = [
          r.fullName,
          r.email,
          r.phone,
          r.affiliation,
          r.title,
          r.abstract,
          r.categoryType,
        ]
          .map((s) => (s ? String(s).toLowerCase() : ""))
          .join(" ");
        return hay.includes(q);
      });
    }
    listArr.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime() || 0;
      const tb = new Date(b.createdAt).getTime() || 0;
      return sortOrder === "oldest" ? ta - tb : tb - ta;
    });
    return listArr;
  }, [requests, search, sortOrder]);

  const totalItems = visibleRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginatedRequests = visibleRequests.slice(
    startIdx,
    startIdx + pageSize
  );

  const onUpdateStatus = async (id, nextStatus) => {
    if (!id || !nextStatus) return;
    setUpdating((m) => ({ ...m, [id]: true }));
    try {
      await updateStatus(id, nextStatus);
    } catch {
      // error surfaced via context
    } finally {
      setUpdating((m) => ({ ...m, [id]: false }));
    }
  };

  // Note: createAuthor not needed; conversion handled on backend

  // NEW: verify request and create corresponding author via backend conversion
  const verifyAndMove = async (reqItem) => {
    if (!reqItem?._id) return;
    setUpdating((m) => ({ ...m, [reqItem._id]: true }));
    try {
      // Convert on backend (creates Author, deletes the request)
      await authorRequestAPI.convert(reqItem._id);
      // Refresh list to reflect deletion
      await list({ status: statusFilter !== "All" ? statusFilter : undefined });
    } catch {
      // errors surfaced via contexts
    } finally {
      setUpdating((m) => ({ ...m, [reqItem._id]: false }));
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Author Requests</h2>
            <p className="text-gray-600 text-sm mt-1">Review and manage author applications</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="search-input"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, title…"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>
          <select
            id="status-filter"
            name="statusFilter"
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
            id="sort-order"
            name="sortOrder"
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
        <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
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
                  {['Applicant','Contact','Work','Lang','Status','Submitted','Actions'].map(h => (
                    <th key={h} className="text-left font-semibold text-gray-700 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-t border-gray-200 animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-64"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
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
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Applicant</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Contact</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Work</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Lang</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Status</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Submitted</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((r) => (
                <tr key={r._id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {r.fullName}
                    </div>
                    <div className="text-gray-500">{r.affiliation || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{r.email}</div>
                    <div className="text-gray-500">{r.phone || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="font-medium text-gray-900 truncate max-w-[240px]"
                      title={r.title}
                    >
                      {r.title}
                    </div>
                    <div
                      className="text-gray-500 truncate max-w-[280px]"
                      title={r.abstract}
                    >
                      {r.abstract}
                    </div>
                  </td>
                  <td className="px-4 py-3">{r.categoryType || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        r.status === "verified"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : r.status === "cancelled"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : r.status === "pending"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {fmt(r.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 justify-start">
                      <button
                        name="view-details"
                        onClick={() => setSelected(r)}
                        className="px-3 py-1.5 rounded-md text-sm border border-gray-300 text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all"
                      >
                        View
                      </button>
                      {/* UPDATED: Verify triggers verifyAndMove */}
                      <button
                        name="verify-request"
                        onClick={() => verifyAndMove(r)}
                        disabled={updating[r._id] || r.status === "verified"}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                          r.status === "verified"
                            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                            : "border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                        }`}
                      >
                        Verify
                      </button>
                      <button
                        name="set-pending"
                        onClick={() => onUpdateStatus(r._id, "pending")}
                        disabled={updating[r._id] || r.status === "pending"}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                          r.status === "pending"
                            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                            : "border border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-600 hover:text-white hover:border-yellow-600"
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        name="cancel-request"
                        onClick={async () => {
                          if (!r?._id) return;
                          const proceed = confirm("Delete this author request? This cannot be undone.");
                          if (!proceed) return;
                          setUpdating((m) => ({ ...m, [r._id]: true }));
                          try {
                            await authorRequestAPI.remove(r._id);
                            await list({ status: statusFilter !== "All" ? statusFilter : undefined });
                          } catch {
                            // Error handled via context
                          }
                          finally {
                            setUpdating((m) => ({ ...m, [r._id]: false }));
                          }
                        }}
                        disabled={updating[r._id]}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                          updating[r._id]
                            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                            : "border border-red-200 text-red-700 bg-red-50 hover:bg-red-600 hover:text-white hover:border-red-600"
                        }`}
                      >
                        Cancel
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
                  name="prev-page"
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
                  name="next-page"
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
        <AuthorReqDetails
          selected={selected}
          setSelected={setSelected}
          fmt={fmt}
        />
      )}
    </div>
  );
};

export default AuthorRequest;
