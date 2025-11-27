
const DashboardSkeleton = () => {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-64" />
        </div>
        <div className="h-10 bg-gray-200 rounded w-24" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, idx) => (
          <div
            key={`card-${idx}`}
            className="bg-white border border-zinc-200 rounded-md p-4"
          >
            <div className="flex items-center gap-3">
              {/* Icon placeholder */}
              <div className="w-10 h-10 rounded-md bg-gray-300" />
              {/* Text placeholder */}
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-300 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Over Time Chart Skeleton */}
        <div className="bg-white border border-zinc-200 rounded-md p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
          <div className="space-y-3">
            {/* Chart area */}
            <div className="h-64 bg-gray-100 rounded flex items-end justify-around px-4 pb-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={`line-${i}`}
                  className="bg-gray-300 rounded-t"
                  style={{
                    width: "12%",
                    height: `${Math.random() * 60 + 40}%`,
                  }}
                />
              ))}
            </div>
            {/* X-axis labels */}
            <div className="flex justify-around">
              {[...Array(6)].map((_, i) => (
                <div key={`x-${i}`} className="h-3 bg-gray-200 rounded w-12" />
              ))}
            </div>
          </div>
        </div>

        {/* Top Selling Books Chart Skeleton */}
        <div className="bg-white border border-zinc-200 rounded-md p-4 sm:p-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            {/* Chart area */}
            <div className="h-64 bg-gray-100 rounded flex items-end justify-around px-4 pb-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={`bar-${i}`}
                  className="bg-gray-300 rounded-t"
                  style={{
                    width: "15%",
                    height: `${Math.random() * 60 + 40}%`,
                  }}
                />
              ))}
            </div>
            {/* X-axis labels */}
            <div className="flex justify-around">
              {[...Array(5)].map((_, i) => (
                <div key={`x-${i}`} className="h-3 bg-gray-200 rounded w-16" />
              ))}
            </div>
          </div>
        </div>

        {/* Orders By Status Pie Chart Skeleton */}
        <div className="bg-white border border-zinc-200 rounded-md p-4 sm:p-6 lg:col-span-2">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-80 bg-gray-100 rounded flex items-center justify-center">
            {/* Pie chart circle */}
            <div className="relative w-56 h-56">
              <div className="absolute inset-0 rounded-full border-[40px] border-gray-300" />
              <div className="absolute inset-0 rounded-full border-[40px] border-gray-400 border-t-transparent border-r-transparent rotate-45" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Table Skeleton */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-200">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="overflow-x-auto">
          <div className="space-y-0">
            {/* Table header */}
            <div className="flex gap-4 px-4 py-3 bg-gray-50 border-b border-zinc-200">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
            {/* Table rows */}
            {[...Array(5)].map((_, idx) => (
              <div key={`row-${idx}`} className="flex gap-4 px-4 py-3 border-b border-zinc-100">
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded flex-1" />
                <div className="h-4 bg-gray-100 rounded w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
