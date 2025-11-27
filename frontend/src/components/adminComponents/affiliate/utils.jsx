export const formatCurrency = (amount) => `৳${(amount || 0).toFixed(2)}`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const getStatusBadge = (status) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    rejected: "bg-gray-100 text-gray-800",
    completed: "bg-green-100 text-green-800",
    processing: "bg-gray-100 text-gray-800",
    paid: "bg-green-100 text-green-800",
    approved: "bg-gray-100 text-gray-800",
    cancelled: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${
        styles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};
