import { useState } from "react";

export const SuspendModal = ({ affiliate, onClose, onSuspend }) => {
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Suspend Affiliate</h3>
        <p className="text-sm text-gray-600 mb-4">
          Suspend <strong>{affiliate?.name}</strong>?
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Suspension Notes (Optional)
          </label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            placeholder="Add suspension reason..."
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSuspend(notes)}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
          >
            Suspend
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

export const CommissionModal = ({ affiliate, onClose, onUpdate }) => {
  const [rate, setRate] = useState(affiliate?.commission_rate || 10);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Update Commission Rate</h3>
        <p className="text-sm text-gray-600 mb-4">
          Current rate for <strong>{affiliate?.name}</strong>:{" "}
          {affiliate?.commission_rate}%
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Commission Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onUpdate(rate)}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
          >
            Update
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

export const WithdrawalModal = ({ withdrawal, onClose, onProcess }) => {
  const [action, setAction] = useState("approve");
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Process Withdrawal</h3>
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <p className="text-sm">
            <strong>Affiliate:</strong> {withdrawal?.affiliate?.name}
          </p>
          <p className="text-sm">
            <strong>Amount:</strong> ${withdrawal?.amount?.toFixed(2)}
          </p>
          <p className="text-sm">
            <strong>Method:</strong> {withdrawal?.payment_method}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            >
              <option value="approve">Approve & Complete</option>
              <option value="reject">Reject</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Note
            </label>
            <textarea
              rows="3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
              placeholder="Add processing notes..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onProcess(withdrawal._id, action, note)}
            className={`flex-1 px-4 py-2 text-white rounded-lg ${
              action === "approve"
                ? "bg-black hover:bg-gray-900"
                : "bg-black hover:bg-gray-900"
            }`}
          >
            {action === "approve" ? "Approve" : "Reject"}
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

export const DetailsModal = ({ affiliate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Affiliate Details</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{affiliate?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{affiliate?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{affiliate?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Promo Code</p>
              <code className="font-mono bg-gray-100 px-2 py-1 rounded">
                {affiliate?.promo_code}
              </code>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  affiliate?.status === "active"
                    ? "bg-green-100 text-green-800"
                    : affiliate?.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {affiliate?.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Commission Rate</p>
              <p className="font-medium text-green-600">
                {affiliate?.commission_rate}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="font-medium">
                ${affiliate?.total_earnings?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="font-medium">
                ${affiliate?.available_balance?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Withdrawn Amount</p>
              <p className="font-medium">
                ${affiliate?.withdrawn_amount?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="font-medium">{affiliate?.total_orders || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Referrals</p>
              <p className="font-medium">{affiliate?.total_referrals || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Joined</p>
              <p className="font-medium">
                {new Date(affiliate?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {affiliate?.address && (
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{affiliate.address}</p>
            </div>
          )}

          {affiliate?.bio && (
            <div>
              <p className="text-sm text-gray-600">Bio</p>
              <p className="font-medium">{affiliate.bio}</p>
            </div>
          )}

          {affiliate?.admin_notes && (
            <div>
              <p className="text-sm text-gray-600">Admin Notes</p>
              <p className="font-medium text-orange-600">
                {affiliate.admin_notes}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
