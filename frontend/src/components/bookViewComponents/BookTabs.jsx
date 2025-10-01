import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { reviewAPI } from "@/api/review-api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

const TABS = [
  { id: "description", label: "Description" },
  { id: "details", label: "Details" },
  { id: "reviews", label: "Reviews" },
  { id: "author", label: "Author" },
];

const srOnly = "sr-only";

/* ---------- Utils ---------- */
const formatDate = (d) => {
  try {
    return d ? new Date(d).toLocaleDateString() : "N/A";
  } catch {
    return "N/A";
  }
};

/* ---------- Subcomponents ---------- */
const StarRating = ({ value = 0 }) => {
  const safe = Number.isFinite(value) ? value : 0;
  const full = Math.floor(safe);
  const half = safe % 1 >= 0.5;
  const icons = [];

  for (let i = 0; i < full && icons.length < 5; i++) {
    icons.push(<FaStar key={`f-${i}`} className="text-yellow-500" />);
  }
  if (half && icons.length < 5)
    icons.push(<FaStarHalfAlt key="h" className="text-yellow-500" />);
  while (icons.length < 5)
    icons.push(
      <FaRegStar key={`e-${icons.length}`} className="text-yellow-500" />
    );

  return (
    <div
      className="inline-flex items-center gap-1"
      aria-label={`Rating ${safe.toFixed(1)} out of 5`}
    >
      {icons}
    </div>
  );
};
StarRating.propTypes = { value: PropTypes.number };

const ReadMore = ({ text = "", initial = 220 }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text)
    return <span className="text-gray-500">No content available.</span>;
  if (text.length <= initial) return <span>{text}</span>;
  return (
    <span>
      {expanded ? text : `${text.slice(0, initial)}…`}{" "}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-blue-600 underline hover:opacity-80"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </span>
  );
};
ReadMore.propTypes = { text: PropTypes.string, initial: PropTypes.number };

const TabHeader = ({ tabs, currentTab, setTab }) => {
  const listRef = useRef(null);

  const onKeyDown = useCallback(
    (e) => {
      const idx = tabs.findIndex((t) => t.id === currentTab);
      if (idx < 0) return;

      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabs.length;
      else if (e.key === "ArrowLeft")
        nextIdx = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") nextIdx = 0;
      else if (e.key === "End") nextIdx = tabs.length - 1;
      else return;

      e.preventDefault();
      setTab(tabs[nextIdx].id);

      const btns = listRef.current?.querySelectorAll("[role=tab]");
      btns?.[nextIdx]?.focus();
    },
    [tabs, currentTab, setTab]
  );

  return (
    <div className="relative">
      <div
        ref={listRef}
        role="tablist"
        className="bg-white backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-gray-200 flex overflow-x-auto"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab) => {
          const selected = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(tab.id)}
              className={`relative shrink-0 px-4 sm:px-5 py-3 text-sm sm:text-base font-semibold transition
                focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40
                ${
                  selected ? "text-black" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.label}
              <span className={srOnly}>{selected ? " (current)" : ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
TabHeader.propTypes = {
  tabs: PropTypes.array.isRequired,
  currentTab: PropTypes.string.isRequired,
  setTab: PropTypes.func.isRequired,
};

const KV = ({ label, value }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 p-3 first:rounded-t-md last:rounded-b-md">
    <span className="text-gray-600 font-medium">{label}:</span>
    <span className="sm:col-span-2 text-gray-900">{value ?? "—"}</span>
  </div>
);
KV.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node };

/* ---------- Main Component ---------- */
const BookTabs = ({
  book = {},
  activeTab,
  setActiveTab,
  isAuthenticated = false,
}) => {
  const { user } = useAuth();
  // Uncontrolled fallback
  const [internalTab, setInternalTab] = useState("description");
  const currentTab = activeTab ?? internalTab;
  const setTab = setActiveTab ?? setInternalTab;

  // Normalize fields with safe fallbacks
  const {
    title = "Untitled",
    author = "Unknown",
    description = "",
    isbn,
    publisher,
    published_date,
    pages,
    language,
    genre,
    stock = 0,
    file_url,

    // initial reviews & rating
    rating,
    num_reviews,
    reviews: initialReviews = [],

    // Author details only (no social, no other-books)
    author_bio,
    author_image_url,
  } = book;

  // Local state for reviews and rating count/avg
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewCount, setReviewCount] = useState(
    Number.isFinite(num_reviews) ? num_reviews : initialReviews.length
  );
  const [avgRating, setAvgRating] = useState(
    Number.isFinite(rating) ? rating : calcAvg(initialReviews)
  );

  // Paging
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Editing
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ rating: "", comment: "" });

  // UI messages
  const [banner] = useState(null); // inline alert retained for layout but not used (toasts preferred)
  const sentinelRef = useRef(null);

  const reorderReviews = useCallback(
    (list) => {
      if (!user?._id || !Array.isArray(list) || list.length === 0) return list;
      const idx = list.findIndex(
        (r) => r.userId && String(r.userId) === String(user._id)
      );
      if (idx <= 0) return list; // already first or not found
      const mine = list[idx];
      const rest = list.filter((_, i) => i !== idx);
      return [mine, ...rest];
    },
    [user?._id]
  );

  // Show/hide form
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: "", rating: "", comment: "" });
  const [errors, setErrors] = useState({});

  function calcAvg(list) {
    if (!list?.length) return NaN;
    const s = list.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return s / list.length;
  }

  // Keep tab valid
  useEffect(() => {
    if (!TABS.some((t) => t.id === currentTab)) setTab("description");
  }, [currentTab, setTab]);

  const genreText = useMemo(() => {
    if (Array.isArray(genre)) return genre.join(", ");
    if (typeof genre === "string") return genre || "N/A";
    return "N/A";
  }, [genre]);

  const avgRatingText = Number.isFinite(avgRating) ? avgRating.toFixed(1) : "—";

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) return;
    setShowForm((v) => !v);
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

  // Load reviews from API when switching to Reviews tab, or when book changes
  useEffect(() => {
    const id = book?._id;
    if (!id) return;
    if (currentTab !== "reviews") return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingReviews(true);
        const resp = await reviewAPI.listByBook({
          bookId: id,
          page: 1,
          limit: 10,
        });
        if (cancelled) return;
        const itemsRaw = (resp?.data || []).map((r) => ({
          id: r._id,
          user: r.name || "Anonymous",
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt,
          userId: r.user,
        }));
        const items = reorderReviews(itemsRaw);
        setReviews(items);
        setReviewCount(resp?.pagination?.total ?? items.length);
        if (typeof resp?.meta?.avgRating === "number")
          setAvgRating(resp.meta.avgRating);
        const total = resp?.pagination?.total ?? items.length;
        const limit = resp?.pagination?.limit ?? 10;
        setPage(1);
        setHasMore(total > limit);
      } catch {
        // best-effort; keep existing state
        // console.warn('Failed to load reviews', err);
      } finally {
        setLoadingReviews(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [book?._id, currentTab, reorderReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      bookId: book?._id,
      rating: Number(form.rating),
      comment: form.comment.trim(),
    };

    // Optimistic UI update
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
      // Refresh from server to ensure correct count/avg
      const resp = await reviewAPI.listByBook({
        bookId: book?._id,
        page: 1,
        limit: 10,
      });
      const items = reorderReviews(
        (resp?.data || []).map((r) => ({
          id: r._id,
          user: r.name || "Anonymous",
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt,
          userId: r.user,
        }))
      );
      setReviews(items);
      setReviewCount(resp?.pagination?.total ?? items.length);
      if (typeof resp?.meta?.avgRating === "number")
        setAvgRating(resp.meta.avgRating);
      const total = resp?.pagination?.total ?? items.length;
      const limit = resp?.pagination?.limit ?? 10;
      setPage(1);
      setHasMore(total > limit);
      toast.success("Review submitted.");
    } catch (err) {
      // rollback optimistic if request failed
      setReviews(prev.reviews);
      setReviewCount(prev.reviewCount);
      setAvgRating(prev.avgRating);
      toast.error(err?.message || "Failed to submit review.");
    } finally {
      setForm({ name: "", rating: "", comment: "" });
      setShowForm(false);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!hasMore || loadingReviews || currentTab !== "reviews") return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            handleLoadMore();
          }
        }
      },
      { root: null, rootMargin: "0px", threshold: 1.0 }
    );
    io.observe(el);
    return () => io.unobserve(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current, hasMore, loadingReviews, currentTab, page]);

  const handleLoadMore = async () => {
    const id = book?._id;
    if (!id) return;
    try {
      setLoadingReviews(true);
      const nextPage = page + 1;
      const resp = await reviewAPI.listByBook({
        bookId: id,
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

  const canEdit = (rev) =>
    user?._id && rev?.userId && String(user._id) === String(rev.userId);

  const startEdit = (rev) => {
    setEditingId(rev.id);
    setEditDraft({ rating: String(rev.rating), comment: rev.comment });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ rating: "", comment: "" });
  };

  const saveEdit = async (rev) => {
    try {
      await reviewAPI.update({
        id: rev.id,
        rating: Number(editDraft.rating),
        comment: editDraft.comment.trim(),
      });
      // refresh current listing without resetting to page 1
      const id = book?._id;
      const resp = await reviewAPI.listByBook({
        bookId: id,
        page: 1,
        limit: page * 10,
      });
      const items = reorderReviews(
        (resp?.data || []).map((r) => ({
          id: r._id,
          user: r.name || "Anonymous",
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt,
          userId: r.user,
        }))
      );
      setReviews(items);
      setReviewCount(resp?.pagination?.total ?? items.length);
      if (typeof resp?.meta?.avgRating === "number")
        setAvgRating(resp.meta.avgRating);
      const total = resp?.pagination?.total ?? items.length;
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
    setReviews((list) => list.filter((r) => r.id !== rev.id));
    setReviewCount((c) => Math.max(0, c - 1));
    try {
      await reviewAPI.remove({ id: rev.id });
      // reload current pages to get accurate avg/count
      const id = book?._id;
      const resp = await reviewAPI.listByBook({
        bookId: id,
        page: 1,
        limit: page * 10,
      });
      const items = reorderReviews(
        (resp?.data || []).map((r) => ({
          id: r._id,
          user: r.name || "Anonymous",
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt,
          userId: r.user,
        }))
      );
      setReviews(items);
      setReviewCount(resp?.pagination?.total ?? items.length);
      if (typeof resp?.meta?.avgRating === "number")
        setAvgRating(resp.meta.avgRating);
      const total = resp?.pagination?.total ?? items.length;
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
    <section className="mt-6 sm:mt-8  bg-white border-t border-gray-200">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-2 sm:pt-4">
        <TabHeader tabs={TABS} currentTab={currentTab} setTab={setTab} />
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-5 sm:py-6">
        {/* Description */}
        {currentTab === "description" && (
          <div
            id="panel-description"
            role="tabpanel"
            aria-labelledby="tab-description"
            className="prose max-w-none"
          >
            <p className="text-gray-800 leading-relaxed text-sm sm:text-base">
              <ReadMore
                text={description || "No description available for this title."}
              />
            </p>
          </div>
        )}

        {/* Details */}
        {currentTab === "details" && (
          <div
            id="panel-details"
            role="tabpanel"
            aria-labelledby="tab-details"
            className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6"
          >
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-base sm:text-lg">
                Book Details
              </h3>
              <div className="divide-y divide-gray-100 rounded-md border border-gray-100">
                <KV label="Title" value={title} />
                <KV label="Author" value={author} />
                <KV label="ISBN" value={isbn || "N/A"} />
                <KV label="Publisher" value={publisher || "Unknown"} />
                <KV
                  label="Publication Date"
                  value={formatDate(published_date)}
                />
                <KV label="Pages" value={pages || "Unknown"} />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-base sm:text-lg">
                Additional Information
              </h3>
              <div className="divide-y divide-gray-100 rounded-md border border-gray-100">
                <KV label="Language" value={language || "N/A"} />
                <KV label="Genre(s)" value={genreText} />
                <KV
                  label="Format"
                  value={file_url ? "Digital & Physical" : "Physical"}
                />
                <KV
                  label="Availability"
                  value={
                    <span
                      className={
                        stock > 0
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Reviews (with form) */}
        {currentTab === "reviews" && (
          <div
            id="panel-reviews"
            role="tabpanel"
            aria-labelledby="tab-reviews"
            className="space-y-4 sm:space-y-6"
          >
            {/* Summary */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="text-3xl sm:text-4xl font-bold tabular-nums">
                {avgRatingText}
              </div>
              <div>
                <StarRating value={avgRating} />
                <p className="text-gray-600 text-xs sm:text-sm">
                  {reviewCount
                    ? `Based on ${reviewCount} review${
                        reviewCount > 1 ? "s" : ""
                      }`
                    : "No reviews yet"}
                </p>
              </div>
            </div>

            {/* Banner */}
            {banner && (
              <div
                className={`rounded-md border p-3 sm:p-4 text-sm ${
                  banner.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : banner.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {banner.text}
              </div>
            )}

            {/* Write a Review Button / Login CTA */}
            {isAuthenticated ? (
              <button
                className="inline-flex items-center rounded-md bg-black px-4 py-2 text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                type="button"
                onClick={() => {
                  // If the current user already reviewed, show info banner
                  const already = reviews.some(
                    (r) =>
                      r.userId &&
                      user?._id &&
                      String(r.userId) === String(user._id)
                  );
                  if (already) {
                    toast.info(
                      "You have already submitted a review for this book."
                    );
                    return;
                  }
                  handleWriteReviewClick();
                }}
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

            {/* Review Form */}
            {isAuthenticated && showForm && (
              <form
                onSubmit={handleSubmit}
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
                      value={user.name}
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
                      <p className="mt-1 text-xs text-red-600">
                        {errors.rating}
                      </p>
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
                    <p className="mt-1 text-xs text-red-600">
                      {errors.comment}
                    </p>
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

            {/* Reviews List */}
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
                      {canEdit(rev) && (
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
                              setEditDraft((d) => ({
                                ...d,
                                comment: e.target.value,
                              }))
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

            {/* Load More */}
            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="h-6" aria-hidden="true" />
            )}
          </div>
        )}

        {/* Author (photo + name + bio only) */}
        {currentTab === "author" && (
          <div
            id="panel-author"
            role="tabpanel"
            aria-labelledby="tab-author"
            className="space-y-5 sm:space-y-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              {author_image_url ? (
                <img
                  src={author_image_url}
                  alt={`${author} portrait`}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border border-gray-100 shadow-sm"
                  loading="lazy"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 border border-gray-100 shadow-inner grid place-items-center text-gray-400 text-xs">
                  No Photo
                </div>
              )}

              <div className="flex-1 space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-lg sm:text-xl">{author}</h3>
                <p className="text-gray-800 leading-relaxed text-sm sm:text-base">
                  <ReadMore
                    text={
                      author_bio || "Biography not available for this author."
                    }
                  />
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

BookTabs.propTypes = {
  book: PropTypes.object,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
  isAuthenticated: PropTypes.bool,
};

export default BookTabs;
