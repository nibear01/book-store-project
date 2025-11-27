import React, { memo } from "react";

export const ProfileTabSkeleton = memo(function ProfileTabSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading profile">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-24 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
});

export const VerificationTabSkeleton = memo(function VerificationTabSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading verification">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="border border-gray-200/70 rounded-xl p-4 bg-white/90"
        >
          <div className="h-4 w-40 bg-gray-200 rounded mb-3 animate-pulse" />
          <div className="space-y-3">
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 h-9 bg-gray-200 rounded animate-pulse" />
              <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export const SecurityTabSkeleton = memo(function SecurityTabSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading security">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
      <div className="h-9 w-40 bg-gray-200 rounded animate-pulse" />
    </div>
  );
});
