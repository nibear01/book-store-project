import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import { formatDate } from "./constants";
import { reviewAPI } from "@/api/review-api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function ReviewsPanel({ bookId, isAuthenticated }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [avgRating, setAvgRating] = useState(NaN);
  const [showForm, setShowForm] = useState(false);
  // Form state must be resilient if user is not yet loaded (null during auth fetch)
  const [form, setForm] = useState({
    name: user?.name || "",
    rating: "",
    comment: "",
  });
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ rating: "", comment: "" });
  const sentinelRef = useRef(null);

  const reorderReviews = useCallback(
    (list) => {
      if (!user?._id || !Array.isArray(list) || list.length === 0) return list;
      const idx = list.findIndex(
        (r) => r.userId && String(r.userId) === String(user._id)
      );
      if (idx <= 0) return list;
      const mine = list[idx];
      const rest = list.filter((_, i) => i !== idx);
      return [mine, ...rest];
    },
    [user?._id]
  );

  const calcAvg = (list) => {
    if (!list?.length) return NaN;
    const s = list.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return s / list.length;
  };

  const avgRatingText = Number.isFinite(avgRating) ? avgRating.toFixed(1) : "—";

  // When auth finishes loading and a user becomes available, sync the display name once.
  useEffect(() => {
    if (user?.name && form.name === "") {
      setForm((f) => ({ ...f, name: user.name }));
    }
  }, [user?.name, form.name]);

  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingReviews(true);
        const resp = await reviewAPI.listByBook({ bookId, page: 1, limit: 10 });
        if (cancelled) return;
        const items = (resp?.data || []).map((r) => ({
          id: r._id,
          user: r.name || "Anonymous",
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt,
          userId: r.user,
        }));
        const ordered = reorderReviews(items);
        setReviews(ordered);
        setReviewCount(resp?.pagination?.total ?? ordered.length);
        setAvgRating(
          typeof resp?.meta?.avgRating === "number"
            ? resp.meta.avgRating
            : calcAvg(ordered)
        );
        const total = resp?.pagination?.total ?? ordered.length;
        const limit = resp?.pagination?.limit ?? 10;
        setPage(1);
        setHasMore(total > limit);
      } finally {
        if (!cancelled) setLoadingReviews(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId, reorderReviews]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingReviews) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            handleLoadMore();
          }
        }
      },
      { threshold: 1.0 }
    );
    io.observe(el);
    return () => io.unobserve(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current, hasMore, loadingReviews, page]);

  const handleLoadMore = async () => {
    if (!bookId) return;
    try {
      setLoadingReviews(true);
      const nextPage = page + 1;
      const resp = await reviewAPI.listByBook({
        bookId,
        page: nextPage,
        limit: 10,
      });
      const items = (resp?.data || []).map((r) => ({
        id: r._id,
        user: r.name || "Anonymous",
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
        userId: r.user,
      }));
      setReviews((prevList) => reorderReviews([...prevList, ...items]));
      const total = resp?.pagination?.total ?? 0;
      const limit = resp?.pagination?.limit ?? 10;
      const loaded = nextPage * limit;
      setPage(nextPage);
      setHasMore(loaded < total);
    } catch (err) {
      toast.error(err?.message || "Failed to load more reviews.");
    } finally {
      setLoadingReviews(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.rating || Number(form.rating) < 1 || Number(form.rating) > 5)
      e.rating = "Please select a rating 1–5.";
    if (!form.comment || form.comment.trim().length < 5)
      e.comment = "Comment should be at least 5 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) return;
    setShowForm((v) => !v);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      bookId,
      rating: Number(form.rating),
      comment: form.comment.trim(),
    };
    const optimistic = {
      user: form.name?.trim() || "You",
      rating: payload.rating,
      comment: payload.comment,
      date: new Date().toISOString(),
    };
    const prev = { reviews, reviewCount, avgRating };
    const nextReviews = [optimistic, ...reviews];
    const nextCount = reviewCount + 1;
    const nextAvg = Number.isFinite(avgRating)
      ? (avgRating * reviewCount + optimistic.rating) / nextCount
      : calcAvg(nextReviews);
    setReviews(nextReviews);
    setReviewCount(nextCount);
    setAvgRating(nextAvg);
    try {
      await reviewAPI.create(payload);
      const resp = await reviewAPI.listByBook({ bookId, page: 1, limit: 10 });
      const items = (resp?.data || []).map((r) => ({
        id: r._id,
        user: r.name || "Anonymous",
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
        userId: r.user,
      }));
      const ordered = reorderReviews(items);
      setReviews(ordered);
      setReviewCount(resp?.pagination?.total ?? ordered.length);
      setAvgRating(
        typeof resp?.meta?.avgRating === "number"
          ? resp.meta.avgRating
          : calcAvg(ordered)
      );
      const total = resp?.pagination?.total ?? ordered.length;
      const limit = resp?.pagination?.limit ?? 10;
      setPage(1);
      setHasMore(total > limit);
      toast.success("Review submitted.");
    } catch (err) {
      setReviews(prev.reviews);
      setReviewCount(prev.reviewCount);
      setAvgRating(prev.avgRating);
      toast.error(err?.message || "Failed to submit review.");
    } finally {
      setForm({ name: "", rating: "", comment: "" });
      setShowForm(false);
    }
  };

  const canEdit = (rev) =>
    Boolean(user?._id) &&
    rev?.userId &&
    String(user._id) === String(rev.userId);

  const startEdit = (rev) => {
    setEditingId(rev.id);
    setEditDraft({
      rating: String(rev.rating ?? ""),
      comment: rev.comment ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ rating: "", comment: "" });
  };

  const saveEdit = async (rev) => {
    if (!editingId) return;
    const r = Number(editDraft.rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      toast.error("Please choose a rating between 1 and 5.");
      return;
    }
    const comment = String(editDraft.comment || "").trim();
    if (comment.length < 5) {
      toast.error("Comment should be at least 5 characters.");
      return;
    }
    try {
      await reviewAPI.update({ id: rev.id, rating: r, comment });
      // Refresh currently loaded pages to keep pagination intact
      const resp = await reviewAPI.listByBook({
        bookId,
        page: 1,
        limit: page * 10,
      });
      const items = (resp?.data || []).map((rr) => ({
        id: rr._id,
        user: rr.name || "Anonymous",
        rating: rr.rating,
        comment: rr.comment,
        date: rr.createdAt,
        userId: rr.user,
      }));
      const ordered = reorderReviews(items);
      setReviews(ordered);
      setReviewCount(resp?.pagination?.total ?? ordered.length);
      setAvgRating(
        typeof resp?.meta?.avgRating === "number"
          ? resp.meta.avgRating
          : calcAvg(ordered)
      );
      const total = resp?.pagination?.total ?? ordered.length;
      const limit = resp?.pagination?.limit ?? 10;
      setHasMore(total > page * limit);
      toast.success("Review updated.");
      cancelEdit();
    } catch (err) {
      toast.error(err?.message || "Failed to update review.");
    }
  };

  const deleteReview = async (rev) => {
    const prevState = { reviews, reviewCount, avgRating };
    // Optimistic remove
    setReviews((list) => list.filter((r) => r.id !== rev.id));
    setReviewCount((c) => Math.max(0, c - 1));
    try {
      await reviewAPI.remove({ id: rev.id });
      // Reload to recalc avg/count
      const resp = await reviewAPI.listByBook({
        bookId,
        page: 1,
        limit: page * 10,
      });
      const items = (resp?.data || []).map((rr) => ({
        id: rr._id,
        user: rr.name || "Anonymous",
        rating: rr.rating,
        comment: rr.comment,
        date: rr.createdAt,
        userId: rr.user,
      }));
      const ordered = reorderReviews(items);
      setReviews(ordered);
      setReviewCount(resp?.pagination?.total ?? ordered.length);
      setAvgRating(
        typeof resp?.meta?.avgRating === "number"
          ? resp.meta.avgRating
          : calcAvg(ordered)
      );
      const total = resp?.pagination?.total ?? ordered.length;
      const limit = resp?.pagination?.limit ?? 10;
      setHasMore(total > page * limit);
      toast.success("Review deleted.");
    } catch (err) {
      // rollback
      setReviews(prevState.reviews);
      setReviewCount(prevState.reviewCount);
      setAvgRating(prevState.avgRating);
      toast.error(err?.message || "Failed to delete review.");
    }
  };

  return (
    <div
      id="panel-reviews"
      role="tabpanel"
      aria-labelledby="tab-reviews"
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="text-3xl sm:text-4xl font-bold tabular-nums">
          {avgRatingText}
        </div>
        <div>
          <StarRating value={avgRating} />
          <p className="text-gray-600 text-xs sm:text-sm">
            {reviewCount
              ? `Based on ${reviewCount} review${reviewCount > 1 ? "s" : ""}`
              : "No reviews yet"}
          </p>
        </div>
      </div>

      {isAuthenticated ? (
        <button
          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
          type="button"
          onClick={handleWriteReviewClick}
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      ) : (
        <p className="text-sm text-gray-600">
          🔒 Please{" "}
          <Link to="/login" className="text-red-600 underline">
            login
          </Link>{" "}
          to write a review.
        </p>
      )}

      {isAuthenticated && showForm && (
        <form
          onSubmit={submit}
          className="rounded-md border border-gray-100 p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4 bg-gray-50"
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name (optional)
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Your display name"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rating *
              </label>
              <select
                required
                value={form.rating}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rating: e.target.value }))
                }
                className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30 ${
                  errors.rating ? "border-red-400" : "border-gray-300"
                }`}
              >
                <option value="">Select…</option>
                <option value="5">★★★★★ (5)</option>
                <option value="4">★★★★☆ (4)</option>
                <option value="3">★★★☆☆ (3)</option>
                <option value="2">★★☆☆☆ (2)</option>
                <option value="1">★☆☆☆☆ (1)</option>
              </select>
              {errors.rating && (
                <p className="mt-1 text-xs text-red-600">{errors.rating}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comment *
            </label>
            <textarea
              required
              rows={4}
              value={form.comment}
              onChange={(e) =>
                setForm((f) => ({ ...f, comment: e.target.value }))
              }
              placeholder="Share what you liked or disliked…"
              className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30 ${
                errors.comment ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.comment && (
              <p className="mt-1 text-xs text-red-600">{errors.comment}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-black px-4 py-2 text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
            >
              Submit Review
            </button>
          </div>
        </form>
      )}

      {reviews?.length ? (
        <ul className="space-y-3 sm:space-y-4">
          {reviews.map((rev, idx) => (
            <li
              key={idx}
              className="rounded-md border border-gray-100 p-3 sm:p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-semibold text-sm sm:text-base">
                    {rev?.user || "Anonymous"}
                  </span>
                  <div className="mt-1">
                    <StarRating value={rev?.rating} />
                  </div>
                </div>
                {isAuthenticated && canEdit(rev) && (
                  <div className="flex items-center gap-2">
                    {editingId === rev.id ? (
                      <>
                        <button
                          className="text-sm rounded-md bg-black px-3 py-1 text-white hover:bg-gray-800"
                          onClick={() => saveEdit(rev)}
                        >
                          Save
                        </button>
                        <button
                          className="text-sm rounded-md border px-3 py-1 hover:bg-gray-50"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-sm rounded-md border px-3 py-0.5 hover:bg-gray-50"
                          onClick={() => startEdit(rev)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-sm rounded-md border border-red-300 text-red-600 px-3 py-0.5 hover:bg-red-50"
                          onClick={() => deleteReview(rev)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {editingId === rev.id ? (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Rating *
                      </label>
                      <select
                        value={editDraft.rating}
                        onChange={(e) =>
                          setEditDraft((d) => ({
                            ...d,
                            rating: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30 border-gray-300"
                      >
                        <option value="">Select…</option>
                        <option value="5">★★★★★ (5)</option>
                        <option value="4">★★★★☆ (4)</option>
                        <option value="3">★★★☆☆ (3)</option>
                        <option value="2">★★☆☆☆ (2)</option>
                        <option value="1">★☆☆☆☆ (1)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Comment *
                    </label>
                    <textarea
                      rows={3}
                      value={editDraft.comment}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, comment: e.target.value }))
                      }
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30 border-gray-300"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-2 text-gray-800 text-sm sm:text-base">
                    {rev?.comment}
                  </p>
                  <p className="mt-1 text-gray-400 text-[11px] sm:text-xs">
                    {rev?.date ? formatDate(rev.date) : "Date unknown"}
                  </p>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 text-sm sm:text-base">
          No reviews yet. Be the first to review this book!
        </p>
      )}

      {hasMore && <div ref={sentinelRef} className="h-6" aria-hidden="true" />}
    </div>
  );
}
