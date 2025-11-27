import React, { useEffect, useState } from 'react';
import { useWorkflowSelection, useWorkflowActions } from './hooks.js';
import { getWorkflowOrder, getNextWorkflowStages } from '../../../api/order-api';
import { formatBangladeshDate } from './hooks.js';
import RemarksModal from '../common/RemarksModal.jsx';

export default function WorkflowActionsModal({ visible, orderId, onClose, enabled }) {
  const selection = useWorkflowSelection();
  const { selectedOrder, setSelectedOrder, nextStages, setNextStages, advancing, advanceRemarks, setAdvanceRemarks } = selection;
  const { advanceStage, TERMINAL_REQUIRE_REMARKS } = useWorkflowActions(selection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRemarks, setShowRemarks] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!visible || !orderId || !enabled) return;
      setLoading(true); setError(null);
      try {
        const wf = await getWorkflowOrder(orderId);
        if (wf.success) {
          setSelectedOrder(wf.data);
          const ns = await getNextWorkflowStages(orderId);
          if (ns.success) setNextStages(ns.data); else setNextStages([]);
        } else {
          setError(wf.message || 'Failed to load workflow order');
        }
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load workflow order');
      } finally { setLoading(false); }
    };
    load();
  }, [visible, orderId, enabled, setSelectedOrder, setNextStages]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg sm:text-xl font-bold" name="workflow-actions-title">Workflow Actions{selectedOrder?.order_number ? ` - ${selectedOrder.order_number}` : ''}</h2>
          <button className="text-2xl font-bold text-gray-600 hover:text-black" onClick={onClose} name="workflow-actions-close-btn">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {loading && <div className="text-sm text-gray-500">Loading workflow data...</div>}
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>}
          {!loading && !error && selectedOrder && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span className="font-medium">Current Stage:</span> {selectedOrder.internal_stage}</div>
                <div><span className="font-medium">Handler Role:</span> {selectedOrder.current_handler_role}</div>
                <div><span className="font-medium">Public Status:</span> {selectedOrder.order_status}</div>
                <div><span className="font-medium">Created:</span> {formatBangladeshDate(selectedOrder.created_at || selectedOrder.createdAt)}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Remarks (required for termination / cancellation / rejection)</label>
                <textarea
                  className="w-full border rounded px-2 py-1 text-sm min-h-[70px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Add context / reason for this transition"
                  value={advanceRemarks}
                  onChange={(e) => setAdvanceRemarks(e.target.value)}
                  name="workflow-actions-remarks"
                />
                {selectedOrder?.workflow_history?.length > 0 && (
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[11px] text-gray-600 truncate max-w-[65%]" name="workflow-actions-last-remark">
                      Last: {selectedOrder.workflow_history.at(-1)?.remarks || '—'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRemarks(true)}
                      name="workflow-actions-view-remarks-btn"
                      className="text-[11px] px-2 py-1 border rounded hover:bg-gray-100"
                    >View All Remarks</button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {nextStages.map(ns => {
                  const needs = TERMINAL_REQUIRE_REMARKS.includes(ns);
                  const disabled = advancing || (needs && !advanceRemarks.trim());
                  return (
                    <button
                      key={ns}
                      disabled={disabled}
                      onClick={() => advanceStage(ns, advanceRemarks)}
                      className={`px-3 py-1 rounded text-xs font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${needs ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                      name={`workflow-actions-advance-${ns}`}
                    >
                      {advancing ? '...' : 'Advance →'} {ns}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setAdvanceRemarks('')}
                  disabled={advancing || !advanceRemarks}
                  className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40"
                  name="workflow-actions-clear-remarks"
                >Clear</button>
              </div>
              {selectedOrder.workflow_history?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-sm">Recent History</h3>
                  <div className="max-h-48 overflow-y-auto border rounded">
                    <table className="w-full text-[11px]">
                      <thead className="bg-gray-100 text-gray-600 uppercase">
                        <tr>
                          <th className="p-1 text-left">From</th>
                          <th className="p-1 text-left">To</th>
                          <th className="p-1 text-left">Role</th>
                          <th className="p-1 text-left">Time</th>
                          <th className="p-1 text-left">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.workflow_history.slice().reverse().slice(0,15).map((h,i) => (
                          <tr key={i} className="border-t">
                            <td className="p-1 font-mono">{h.from}</td>
                            <td className="p-1 font-mono">{h.to}</td>
                            <td className="p-1">{h.role}</td>
                            <td className="p-1">{formatBangladeshDate(h.timestamp?.$date || h.timestamp)}</td>
                            <td className="p-1 max-w-[160px] truncate" title={h.remarks}>{h.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="border-t p-3 bg-gray-50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors text-sm" name="workflow-actions-close-footer-btn">Close</button>
        </div>
      </div>
      <RemarksModal
        visible={showRemarks}
        onClose={() => setShowRemarks(false)}
        history={selectedOrder?.workflow_history || []}
        orderNumber={selectedOrder?.order_number}
      />
    </div>
  );
}
