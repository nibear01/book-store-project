import React, { useEffect, useMemo, useState } from "react";

const STATUSES = ["pending", "verified", "cancelled", "unverified"]; // must match backend enum

const AuthorRequest = () => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "";
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest
  const [updating, setUpdating] = useState({}); // id => boolean
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState(null);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const fetchRequests = async (status) => {
    setLoading(true);
    setError("");
    try {
      const url = new URL(`${baseUrl}/api/author-requests`);
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

  // Reset to first page when filters/search/sort change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, sortOrder]);

  const updateStatus = async (id, nextStatus) => {
    if (!id || !nextStatus) return;
    setUpdating((m) => ({ ...m, [id]: true }));
    setError("");
    try {
      const res = await fetch(`${baseUrl}/api/author-requests/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update status");
      // Update locally
      setRequests((list) => list.map((r) => (r._id === id ? { ...r, status: nextStatus } : r)));
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
    <div className="p-2 sm:p-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Author Requests</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, title…"
              className="border rounded-md px-2 py-1 text-sm min-w-[220px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Status</label>
            <select
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
            <label className="text-sm text-gray-600">Sort</label>
            <select
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
                    <div className="font-medium text-gray-900">{r.fullName}</div>
                    <div className="text-gray-500">{r.affiliation || "—"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-gray-900">{r.email}</div>
                    <div className="text-gray-500">{r.phone || "—"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900 truncate max-w-[240px]" title={r.title}>
                      {r.title}
                    </div>
                    <div className="text-gray-500 truncate max-w-[280px]" title={r.abstract}>
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
                  <td className="px-3 py-2 text-gray-600">{fmt(r.createdAt)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelected(r)}
                        className="px-2 py-1 rounded text-white text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => updateStatus(r._id, "verified")}
                        disabled={updating[r._id] || r.status === "verified"}
                        className={`px-2 py-1 rounded text-white text-xs ${
                          r.status === "verified" ? "bg-gray-300" : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => updateStatus(r._id, "pending")}
                        disabled={updating[r._id] || r.status === "pending"}
                        className={`px-2 py-1 rounded text-white text-xs ${
                          r.status === "pending" ? "bg-gray-300" : "bg-yellow-600 hover:bg-yellow-700"
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => updateStatus(r._id, "cancelled")}
                        disabled={updating[r._id] || r.status === "cancelled"}
                        className={`px-2 py-1 rounded text-white text-xs ${
                          r.status === "cancelled" ? "bg-gray-300" : "bg-red-600 hover:bg-red-700"
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
                Showing {startIdx + 1}-{Math.min(startIdx + pageSize, totalItems)} of {totalItems}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium">{safePage}</span> of {totalPages}
                </span>
                <button
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-md shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Author Request Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
                aria-label="Close details"
              >
                Close
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Full Name</div>
                <div className="font-medium text-gray-900">{selected.fullName || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Email</div>
                <div className="font-medium text-gray-900">{selected.email || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Phone</div>
                <div className="font-medium text-gray-900">{selected.phone || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Affiliation</div>
                <div className="font-medium text-gray-900">{selected.affiliation || "—"}</div>
              </div>

              <div className="md:col-span-2">
                <div className="text-gray-500">Address</div>
                <div className="font-medium text-gray-900">
                  {typeof selected.address === "string"
                    ? selected.address
                    : selected.address
                    ? [
                        selected.address.street,
                        selected.address.city,
                        selected.address.state,
                        selected.address.zip,
                        selected.address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : "—"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Title</div>
                <div className="font-medium text-gray-900">{selected.title || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Type of Work</div>
                <div className="font-medium text-gray-900">{selected.typeOfWork || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Language</div>
                <div className="font-medium text-gray-900">{selected.categoryType || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Submitted</div>
                <div className="font-medium text-gray-900">{fmt(selected.createdAt)}</div>
              </div>

              <div className="md:col-span-2">
                <div className="text-gray-500">Abstract</div>
                <div className="mt-1 whitespace-pre-wrap text-gray-900">{selected.abstract || "—"}</div>
              </div>

              <div>
                <div className="text-gray-500">Originality Confirmed</div>
                <div className="font-medium text-gray-900">{selected.rightsOriginal ? "Yes" : "No"}</div>
              </div>
              <div>
                <div className="text-gray-500">Publish Permission</div>
                <div className="font-medium text-gray-900">{selected.rightsPublish ? "Yes" : "No"}</div>
              </div>
              <div>
                <div className="text-gray-500">Agreed Editorial</div>
                <div className="font-medium text-gray-900">{selected.agreeEditorial ? "Yes" : "No"}</div>
              </div>

              <div className="md:col-span-2">
                <div className="text-gray-500">Additional Requests</div>
                <div className="mt-1 whitespace-pre-wrap text-gray-900">{selected.additionalRequests || "—"}</div>
              </div>

              <div>
                <div className="text-gray-500">Signature</div>
                <div className="font-medium text-gray-900">{selected.signature || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Date</div>
                <div className="font-medium text-gray-900">{selected.date || "—"}</div>
              </div>

              <div>
                <div className="text-gray-500">Email Verified</div>
                <div className="font-medium text-gray-900">{selected.emailVerified ? "Yes" : "No"}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium text-gray-900">{selected.status}</div>
              </div>
              {selected.reviewNote && (
                <div className="md:col-span-2">
                  <div className="text-gray-500">Review Note</div>
                  <div className="mt-1 whitespace-pre-wrap text-gray-900">{selected.reviewNote}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorRequest;
