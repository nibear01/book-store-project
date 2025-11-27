import React from 'react';

/*
Reusable modal to display full workflow_history remarks list.
Props:
- visible: boolean
- onClose: function
- history: array of { from, to, role, remarks, timestamp }
- orderNumber?: string
Accessibility/testing: name attributes added.
*/
export default function RemarksModal({ visible, onClose, history = [], orderNumber }) {
  if (!visible) return null;
  const has = history && history.length > 0;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4" name="remarks-modal-backdrop">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl overflow-hidden max-h-[85vh] flex flex-col" name="remarks-modal">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold" name="remarks-modal-title">Remarks History{orderNumber ? ` - ${orderNumber}` : ''}</h2>
          <button onClick={onClose} name="remarks-modal-close-btn" className="text-2xl font-bold text-gray-600 hover:text-black">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4" name="remarks-modal-content">
          {!has && <div className="text-sm text-gray-500" name="remarks-modal-empty">No remarks available.</div>}
          {has && (
            <table className="w-full text-xs" name="remarks-modal-table">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 text-left">From</th>
                  <th className="p-2 text-left">To</th>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2 text-left">Remarks</th>
                  <th className="p-2 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {history.slice().reverse().map((h, i) => {
                  const timeVal = h.timestamp?.$date || h.timestamp;
                  const dt = timeVal ? new Date(timeVal) : null;
                  return (
                    <tr key={i} className="border-t" name="remarks-modal-row">
                      <td className="p-2 font-mono break-all">{h.from}</td>
                      <td className="p-2 font-mono break-all">{h.to}</td>
                      <td className="p-2">{h.role}</td>
                      <td className="p-2 max-w-[280px] break-words">{h.remarks || '-'}</td>
                      <td className="p-2 whitespace-nowrap">{dt ? dt.toLocaleString() : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="border-t p-3 bg-gray-50 flex justify-end">
          <button onClick={onClose} name="remarks-modal-close-footer-btn" className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}
