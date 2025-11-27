import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "./common/useDebounce";
import { DEFAULT_PAGE_SIZE } from "./constants/constants";
import { adminSubscribersAPI } from "@/api/admin-api";
import { toast } from "react-toastify";
import { Mail, Search } from "lucide-react";

// Loading Skeleton for Table Rows
const SubscriberRowSkeleton = () => (
  <tr className="border-t animate-pulse">
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-48"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </td>
    <td className="px-4 py-3 text-right">
      <div className="flex items-center justify-end gap-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    </td>
  </tr>
);

export default function Subscriber() {
  const { activeRole, roles } = useAuth();
  const rolesArr = Array.isArray(roles)
    ? roles
    : activeRole
    ? [activeRole]
    : [];
  const isAdmin = rolesArr.includes("admin");

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Compose Email modal state
  const [showComposer, setShowComposer] = useState(false);
  const [composeTo, setComposeTo] = useState(null); // { _id, name, email } or null for broadcast
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const fetchSubs = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const data = await adminSubscribersAPI.list({
        page,
        limit,
        search: debouncedSearch,
      });
      const { items: list, total: count } = data?.data || {};
      setItems(Array.isArray(list) ? list : []);
      setTotal(Number(count || 0));
    } catch (err) {
      toast.error(err?.message || "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page, limit, isAdmin]);

  const openComposerAll = () => {
    setComposeTo(null);
    setSubject("");
    setMessage("");
    setShowComposer(true);
  };
  const openComposerOne = (s) => {
    setComposeTo({ _id: s._id, name: s.name, email: s.email });
    setSubject("");
    setMessage("");
    setShowComposer(true);
  };
  const closeComposer = () => {
    setShowComposer(false);
    setComposeTo(null);
    setSubject("");
    setMessage("");
  };

  const sendEmail = async () => {
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    setLoading(true);
    try {
      if (composeTo?._id) {
        await adminSubscribersAPI.notifyOne(composeTo._id, {
          subject: subject.trim(),
          text: message.trim(),
        });
        toast.success(`Email sent to ${composeTo.name}`);
      } else {
        const res = await adminSubscribersAPI.notifyAll({
          subject: subject.trim(),
          text: message.trim(),
        });
        const sum = res?.data;
        const details = sum ? `Sent: ${sum.fulfilled}/${sum.total}` : "Sent";
        toast.success(`Broadcast complete. ${details}`);
      }
      closeComposer();
    } catch (err) {
      toast.error(err?.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async (id) => {
    if (!window.confirm("Unsubscribe this email?")) return;
    setLoading(true);
    try {
      await adminSubscribersAPI.remove(id);
      toast.success("Unsubscribed");
      fetchSubs();
    } catch (err) {
      toast.error(err?.message || "Failed to unsubscribe");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );
  const canPrev = page > 1;
  const canNext = page < totalPages;

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Subscribers</h2>
        <p className="text-sm text-gray-600 mt-2">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Subscribers</h2>
            <p className="text-gray-600 text-sm mt-1">Manage newsletter subscriptions</p>
          </div>
          <button
            onClick={openComposerAll}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <Mail className="w-4 h-4" />
            <span>Send to All</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
          />
        </div>
      </div>

      {/* Results Count */}
      {!loading && items.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {items.length} of {total} subscribers
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Name</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Email</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Status</th>
                <th className="text-right font-semibold text-gray-700 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <>
                  {[...Array(5)].map((_, idx) => (
                    <SubscriberRowSkeleton key={idx} />
                  ))}
                </>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No subscribers found</p>
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((s) => (
                  <tr key={s._id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.email}</td>
                    <td className="px-4 py-3">
                      {s.active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openComposerOne(s)}
                          className="px-3 py-1.5 rounded-md text-sm border border-gray-300 text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all"
                        >
                          Send Email
                        </button>
                        <button
                          onClick={() => unsubscribe(s._id)}
                          className="px-3 py-1.5 rounded-md text-sm border border-red-200 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!s.active}
                          title={
                            s.active ? "Unsubscribe" : "Already unsubscribed"
                          }
                        >
                          Unsubscribe
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Page <span className="font-medium text-gray-900">{page}</span> of{" "}
            <span className="font-medium text-gray-900">{totalPages}</span> • {total} total
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => canPrev && setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            <select
              className="ml-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black"
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(Number(e.target.value));
              }}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeComposer}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-lg shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {composeTo
                  ? `Send Email to ${composeTo.name}`
                  : "Send Email to All Subscribers"}
              </h3>
              <button
                onClick={closeComposer}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {composeTo && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Recipient:</p>
                  <p className="text-sm font-medium text-gray-900">{composeTo.email}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeComposer}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                className="px-4 py-2 text-sm rounded-md bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
