import React, { useEffect, useMemo, useState } from "react";
import { useAuthorRequests } from "../../context/AuthorRequestContext.jsx";
import { useAuthors } from "../../context/AuthorContext.jsx";
import AuthorReqDetails from "./author/AuthorReqDetails.jsx";

const STATUSES = ["pending", "verified", "cancelled", "unverified"]; // must match backend enum

const AuthorRequest = () => {
  const { requests, loading, error, list, updateStatus } = useAuthorRequests();
  const { create: createAuthor } = useAuthors();

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

  // NEW: map request -> author payload
  const mapRequestToAuthor = (r) => ({
    name: r.fullName,
    title: r.title,
    bio: r.abstract || "",
    status: "verified",
  });

  // NEW: verify request and create corresponding author
  const verifyAndMove = async (reqItem) => {
    if (!reqItem?._id) return;
    setUpdating((m) => ({ ...m, [reqItem._id]: true }));
    try {
      await updateStatus(reqItem._id, "verified");
      await createAuthor(mapRequestToAuthor(reqItem));
    } catch {
      // errors surfaced via contexts
    } finally {
      setUpdating((m) => ({ ...m, [reqItem._id]: false }));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">Author Requests</h1>
          <p className="text-gray-600 text-sm">
            Manage your author requests and details.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="search-input" className="text-sm text-gray-600">
              Search
            </label>
            <input
              id="search-input"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, title…"
              className="border rounded-md px-2 py-1 text-sm min-w-[220px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm text-gray-600">
              Status
            </label>
            <select
              id="status-filter"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="All">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-order" className="text-sm text-gray-600">
              Sort
            </label>
            <select
              id="sort-order"
              name="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-600">Loading requests…</div>
      ) : visibleRequests.length === 0 ? (
        <div className="text-sm text-gray-600">No requests found.</div>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Applicant</th>
                <th className="text-left px-3 py-2">Contact</th>
                <th className="text-left px-3 py-2">Work</th>
                <th className="text-left px-3 py-2">Lang</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Submitted</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">
                      {r.fullName}
                    </div>
                    <div className="text-gray-500">{r.affiliation || "—"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-gray-900">{r.email}</div>
                    <div className="text-gray-500">{r.phone || "—"}</div>
                  </td>
                  <td className="px-3 py-2">
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
                  <td className="px-3 py-2">{r.categoryType || "—"}</td>
                  <td className="px-3 py-2">
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
                  <td className="px-3 py-2 text-gray-600">
                    {fmt(r.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        name="view-details"
                        onClick={() => setSelected(r)}
                        className="px-2 py-1 rounded text-white text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        View
                      </button>
                      {/* UPDATED: Verify triggers verifyAndMove */}
                      <button
                        name="verify-request"
                        onClick={() => verifyAndMove(r)}
                        disabled={updating[r._id] || r.status === "verified"}
                        className={`px-2 py-1 rounded text-white text-xs ${
                          r.status === "verified"
                            ? "bg-gray-300"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        Verify
                      </button>
                      <button
                        name="set-pending"
                        onClick={() => onUpdateStatus(r._id, "pending")}
                        disabled={updating[r._id] || r.status === "pending"}
                        className={`px-2 py-1 rounded text-white text-xs ${
                          r.status === "pending"
                            ? "bg-gray-300"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        name="cancel-request"
                        onClick={() => onUpdateStatus(r._id, "cancelled")}
                        disabled={updating[r._id] || r.status === "cancelled"}
                        className={`px-2 py-1 rounded text-white text-xs ${
                          r.status === "cancelled"
                            ? "bg-gray-300"
                            : "bg-red-600 hover:bg-red-700"
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
            <div className="flex items-center justify-between gap-3 p-3 border-t">
              <div className="text-xs text-gray-600">
                Showing {startIdx + 1}-
                {Math.min(startIdx + pageSize, totalItems)} of {totalItems}
              </div>
              <div className="flex items-center gap-2">
                <button
                  name="prev-page"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium">{safePage}</span> of{" "}
                  {totalPages}
                </span>
                <button
                  name="next-page"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
