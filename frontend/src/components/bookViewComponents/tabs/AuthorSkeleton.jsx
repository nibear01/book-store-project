export default function AuthorSkeleton() {
  return (
    <div className="animate-pulse flex flex-col sm:flex-row gap-6">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-3">
        <div className="h-6 w-3/5 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
