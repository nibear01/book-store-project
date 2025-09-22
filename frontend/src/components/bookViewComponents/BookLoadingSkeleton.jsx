const BookLoadingSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 h-80 bg-gray-200 rounded"></div>
          <div className="md:w-2/3 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLoadingSkeleton;