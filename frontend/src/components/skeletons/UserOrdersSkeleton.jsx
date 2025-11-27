import React from "react";

// Responsive loading skeleton for the user orders list
// Shows header placeholders and several order card placeholders
const UserOrdersSkeleton = ({ cards = 3 }) => {
  const arr = Array.from({ length: cards });
  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in" data-testid="user-orders-skeleton" name="user-orders-skeleton">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-40 bg-gray-200 rounded-md animate-pulse mb-3" />
          <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse" />
        </div>
        <div className="space-y-6">
          {arr.map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-0"
            >
              {/* Card header */}
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-2 w-full sm:w-auto">
                  <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-4 w-56 bg-gray-200 rounded-md animate-pulse" />
                </div>
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
              </div>
              {/* Items skeleton */}
              <div className="px-6 py-4 space-y-3">
                {[0,1].map(k => (
                  <div key={k} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 h-16 w-12 bg-gray-200 rounded-md animate-pulse" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse" />
                      <div className="h-3 w-32 bg-gray-200 rounded-md animate-pulse" />
                      <div className="h-3 w-40 bg-gray-200 rounded-md animate-pulse" />
                    </div>
                    <div className="h-5 w-12 bg-gray-200 rounded-md animate-pulse" />
                  </div>
                ))}
              </div>
              {/* Footer skeleton */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-2 w-full sm:w-auto">
                  <div className="h-3 w-48 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-3 w-40 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-3 w-32 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-3 w-36 bg-gray-200 rounded-md animate-pulse" />
                </div>
                <div className="h-8 w-28 bg-gray-200 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserOrdersSkeleton;