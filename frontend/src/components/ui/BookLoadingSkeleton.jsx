const SingleCard = () => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col relative overflow-hidden animate-pulse mt-6">
    <div className="relative pt-[140%] w-full bg-gray-200"></div>
    <div className="p-3 flex flex-col flex-grow">
      <div className="h-6 w-20 bg-gray-200 rounded-full mb-3"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="flex items-center justify-between mb-3">
        <div className="h-8 w-32 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="mt-auto">
        <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
        <div className="h-11 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const BookLoadingSkeleton = ({ count = 10, gridClassName }) => {
  if (count <= 1) return <SingleCard />;
  const grid =
    gridClassName ||
    "grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6";
  return (
    <div className={grid}>
      {Array.from({ length: count }).map((_, idx) => (
        <SingleCard key={idx} />
      ))}
    </div>
  );
};

export default BookLoadingSkeleton;
