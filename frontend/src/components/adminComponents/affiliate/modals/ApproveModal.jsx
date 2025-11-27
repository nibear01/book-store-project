import { useState } from "react";

const ApproveModal = ({ affiliate, onClose, onApprove }) => {
  const [commissionRate, setCommissionRate] = useState(
    affiliate?.commission_rate || 10
  );
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Approve Affiliate</h3>
        <p className="text-sm text-gray-600 mb-4">
          Approve <strong>{affiliate?.name}</strong> as an affiliate?
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commission Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
              placeholder="Add any notes..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onApprove(commissionRate, notes)}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
          >
            Approve
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

export default ApproveModal;
