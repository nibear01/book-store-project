import { useState } from "react";

const RejectModal = ({ affiliate, onClose, onReject }) => {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Reject Affiliate</h3>
        <p className="text-sm text-gray-600 mb-4">
          Reject <strong>{affiliate?.name}</strong>'s application?
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason
          </label>
          <textarea
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            placeholder="Explain why the application was rejected..."
            required
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onReject(reason)}
            disabled={!reason}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
