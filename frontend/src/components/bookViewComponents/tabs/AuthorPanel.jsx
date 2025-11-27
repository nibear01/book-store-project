import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthorSkeleton from "./AuthorSkeleton";
import AuthorUnavailable from "./AuthorUnavailable";
import authorAPI from "@/api/author-api";
import ReadMore from "./ReadMore";

export default function AuthorPanel({
  author,
  author_id,
  author_slug,
  author_bio,
  author_image_url,
}) {
  const [authorData, setAuthorData] = useState(null);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [authorError, setAuthorError] = useState(null);

  useEffect(() => {
    const identifier = author_id || author_slug || author;
    if (!identifier) return;
    let cancelled = false;
    (async () => {
      try {
        setAuthorLoading(true);
        setAuthorError(null);
        const trySlugify = (name) =>
          String(name || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        let data = null;
        try {
          data = await authorAPI.get(identifier);
        } catch (e1) {
          if (author_slug) {
            try {
              data = await authorAPI.getBySlug(author_slug);
            } catch {
              void 0; // ignore and try other strategies
            }
          }
          if (!data && identifier === author) {
            const slugified = trySlugify(author);
            if (slugified && slugified !== author) {
              try {
                data = await authorAPI.getBySlug(slugified);
              } catch {
                void 0; // ignore and try search
              }
            }
          }
          if (!data) {
            try {
              const res = await authorAPI.list({ q: author, limit: 1 });
              data = Array.isArray(res)
                ? res[0]
                : res?.data?.[0] || res?.items?.[0];
            } catch {
              void 0; // ignore; if still not found we rethrow original
            }
          }
          if (!data) throw e1;
        }
        if (cancelled) return;
        setAuthorData(data);
      } catch (err) {
        if (cancelled) return;
        setAuthorError(err?.message || "Unable to load author details");
      } finally {
        if (!cancelled) setAuthorLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [author_id, author_slug, author]);

  const fallbackAvatarUrl = useMemo(() => {
    const name = (authorData?.name || author || "Author").toString();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=E5E7EB&color=111827&size=128&bold=true`;
  }, [authorData?.name, author]);

  const resolveAuthorPhotoUrl = useCallback((p) => {
    if (!p) return null;
    const FILE_HOST =
      import.meta.env.VITE_BACKEND_URL || "http://192.168.0.104:5000";
    const strRaw = String(p).trim();
    if (!strRaw) return null;
    if (/^https?:\/\//i.test(strRaw) || /^data:image\//i.test(strRaw))
      return strRaw;
    if (
      strRaw.startsWith("/images/") ||
      strRaw.startsWith("/img/") ||
      strRaw.startsWith("/assets/")
    )
      return strRaw;
    let normalized = strRaw.replace(/\\/g, "/");
    if (!normalized.startsWith("/")) normalized = "/" + normalized;
    return FILE_HOST + normalized;
  }, []);

  const authorPhoto = useMemo(() => {
    const candidateList = [
      authorData?.photo?.url,
      authorData?.photo?.path,
      authorData?.photo,
      authorData?.image,
      authorData?.avatar,
      authorData?.profilePhoto,
      author_image_url,
    ].filter(Boolean);
    for (const c of candidateList) {
      const resolved = resolveAuthorPhotoUrl(c);
      if (resolved) return resolved;
    }
    return null;
  }, [authorData, author_image_url, resolveAuthorPhotoUrl]);

  if (authorLoading) return <AuthorSkeleton />;
  if (authorError) return <AuthorUnavailable />;

  return (
    <div
      id="panel-author"
      role="tabpanel"
      aria-labelledby="tab-author"
      className="space-y-5 sm:space-y-6"
    >
      <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div
          className="absolute inset-0 pointer-events-none opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent)]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg,#fafafa 0px,#fafafa 10px,#f0f0f0 10px,#f0f0f0 20px)",
          }}
        />
        <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
          <div className="group">
            <div className="relative">
              <img
                src={authorPhoto || fallbackAvatarUrl}
                alt={`${authorData?.name || author} portrait`}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-white shadow-lg shadow-black/10 group-hover:scale-[1.02] transition-transform"
                loading="lazy"
                onError={(e) => {
                  if (e?.currentTarget?.src !== fallbackAvatarUrl) {
                    e.currentTarget.src = fallbackAvatarUrl;
                  }
                }}
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] bg-black text-white tracking-wide shadow font-medium">
                AUTHOR
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h3 className="font-semibold text-xl sm:text-2xl tracking-tight flex items-center gap-2">
                {authorData?.name || author}
                {authorData?.status && (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      authorData.status === "active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {authorData.status}
                  </span>
                )}
              </h3>
              {authorData?._id && (
                <Link
                  to={`/authors/${authorData._id}`}
                  className="inline-flex items-center gap-1 rounded-md bg-black/90 px-3 py-1.5 text-[13px] text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/40"
                >
                  <span>View Profile</span>
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {Number.isFinite(authorData?.bookCount) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 backdrop-blur px-3 py-1 text-xs font-medium border border-gray-200 shadow-sm">
                  <span className="text-gray-500">Books</span>
                  <span className="text-gray-900 tabular-nums">
                    {authorData.bookCount}
                  </span>
                </span>
              )}
              {authorData?.email && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 backdrop-blur px-3 py-1 text-xs font-medium border border-gray-200 shadow-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-900">{authorData.email}</span>
                </span>
              )}
              {authorData?.emailVerified !== undefined && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border shadow-sm ${
                    authorData.emailVerified
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-yellow-50 border-yellow-200 text-yellow-700"
                  }`}
                >
                  {authorData.emailVerified
                    ? "Email Verified"
                    : "Email Unverified"}
                </span>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-gray-800">
              <ReadMore
                initial={300}
                text={
                  authorData?.bio ||
                  author_bio ||
                  "Biography not available for this author."
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
