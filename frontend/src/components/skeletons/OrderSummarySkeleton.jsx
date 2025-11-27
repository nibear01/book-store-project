import React from "react";

// Skeleton for the Order Summary page.
// Mirrors major layout sections: header, items list, shipping, payment, summary & action buttons.
const OrderSummarySkeleton = ({ items = 3 }) => {
  const arr = Array.from({ length: items });
  return (
    <div className="max-w-4xl mx-auto px-4 py-10" data-testid="order-summary-skeleton" name="order-summary-skeleton">
      {/* Header placeholder */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse" />
        <div className="h-8 w-64 bg-gray-200 rounded-md mx-auto mb-3 animate-pulse" />
        <div className="h-4 w-80 max-w-full bg-gray-200 rounded-md mx-auto animate-pulse" />
      </div>

      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        {/* Order header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            <div className="h-5 w-44 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-4 w-56 bg-gray-200 rounded-md animate-pulse" />
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
        </div>

        <div className="p-6">
          {/* Items list */}
          <div className="mb-8">
            <div className="h-5 w-32 bg-gray-200 rounded-md mb-4 animate-pulse" />
            <div className="space-y-4">
              {arr.map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-16 w-12 bg-gray-200 rounded-md animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-3 w-36 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-3 w-40 bg-gray-200 rounded-md animate-pulse" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 rounded-md animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-8">
            <div className="h-5 w-40 bg-gray-200 rounded-md mb-4 animate-pulse" />
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="h-4 w-56 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-3 w-64 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-3 w-64 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-3 w-48 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-3 w-52 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-3 w-40 bg-gray-200 rounded-md animate-pulse" />
            </div>
          </div>

          {/* Payment Info */}
            <div className="mb-8">
              <div className="h-5 w-52 bg-gray-200 rounded-md mb-4 animate-pulse" />
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="h-3 w-40 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-3 w-36 bg-gray-200 rounded-md animate-pulse" />
              </div>
            </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-6">
            <div className="h-5 w-40 bg-gray-200 rounded-md mb-4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full max-w-[340px] bg-gray-200 rounded-md animate-pulse" />
              <div className="h-3 w-full max-w-[300px] bg-gray-200 rounded-md animate-pulse" />
              <div className="h-3 w-full max-w-[200px] bg-gray-200 rounded-md animate-pulse" />
              <div className="h-6 w-full max-w-[240px] bg-gray-200 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <div className="h-12 w-full sm:w-48 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-12 w-full sm:w-48 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-12 w-full sm:w-48 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  );
};

export default OrderSummarySkeleton;