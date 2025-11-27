import PropTypes from "prop-types";

export default function KV({ label, value }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 p-3 first:rounded-t-md last:rounded-b-md">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className="sm:col-span-2 text-gray-900">{value ?? "—"}</span>
    </div>
  );
}

KV.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node };
