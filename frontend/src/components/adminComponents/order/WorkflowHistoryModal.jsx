import React, { useEffect } from 'react';
import { useWorkflowHistory } from './hooks.js';
import { formatBangladeshDate } from './hooks.js';
import { getWorkflowOrder } from '../../../api/order-api';

// Role badge color map
const ROLE_COLORS = {
  admin: 'bg-indigo-100 text-indigo-700',
  order_manager: 'bg-emerald-100 text-emerald-700',
  finance_manager: 'bg-amber-100 text-amber-700',
  user: 'bg-gray-100 text-gray-700',
  csm: 'bg-blue-100 text-blue-700',
  pm: 'bg-purple-100 text-purple-700',
  dm: 'bg-pink-100 text-pink-700',
};

// Helper to derive badge class
function roleBadge(role) {
  if (!role) return 'bg-gray-100 text-gray-600';
  const key = String(role).toLowerCase();
  return ROLE_COLORS[key] || 'bg-gray-100 text-gray-600';
}

// Poll interval from env or fallback
const DEFAULT_INTERVAL = 7000;
const ENV_INTERVAL = Number(import.meta?.env?.VITE_WORKFLOW_POLL_INTERVAL_MS) || DEFAULT_INTERVAL;

export default function WorkflowHistoryModal({ visible, orderId, orderNumber, onClose, enabled }) {
  const openOrder = async (id) => {
    const wf = await getWorkflowOrder(id);
    return wf; // consumed by useWorkflowHistory
  };

  const {
    showFlow,
    flowHistory,
    flowLoading,
    flowError,
    handleViewFlow,
    cleanup,
    FLOW_POLL_MS,
    manualRefresh,
    lastUpdated,
    newestId,
  } = useWorkflowHistory({
    selectedOrder: visible ? { _id: orderId } : null,
    openOrder: openOrder,
    enabled,
    pollInterval: ENV_INTERVAL,
  });

  // Auto start when opened
  useEffect(() => {
    if (visible && enabled && !showFlow) handleViewFlow();
    if (!visible) cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, enabled]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl overflow-hidden max-h-[85vh] flex flex-col" name="workflow-history-modal">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg sm:text-xl font-bold" name="workflow-history-title">Workflow History - {orderNumber || orderId}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={manualRefresh}
              disabled={flowLoading}
              className="px-3 py-1.5 text-xs rounded border hover:bg-gray-100 disabled:opacity-50"
              name="workflow-history-refresh-btn"
            >
              Refresh
            </button>
            <button
              onClick={handleViewFlow}
              className="px-3 py-1.5 text-xs rounded border hover:bg-gray-100"
              name="workflow-history-toggle-btn"
            >
              {showFlow ? 'Pause' : 'Start'}
            </button>
            <button
              className="text-2xl font-bold text-gray-600 hover:text-black"
              onClick={onClose}
              name="workflow-history-close-btn"
            >
              &times;
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {flowLoading && (
            <div className="text-sm text-gray-500 mb-3">Loading history...</div>
          )}
          {flowError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded mb-3 flex justify-between">
              <span>{flowError}</span>
              <button
                onClick={handleViewFlow}
                className="underline text-red-600 hover:text-red-800 text-xs"
              >Retry</button>
            </div>
          )}
          {!flowError && showFlow && !flowLoading && flowHistory.length === 0 && (
            <div className="text-sm text-gray-500">No workflow transitions yet.</div>
          )}
          {!flowError && flowHistory.length > 0 && (
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="p-2 text-left">From</th>
                    <th className="p-2 text-left">To</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left">Remarks</th>
                    <th className="p-2 text-left">Timestamp (BD)</th>
                  </tr>
                </thead>
                <tbody>
                  {flowHistory.map((h, i) => {
                    const ts = h.timestamp?.$date || h.timestamp;
                    const highlight = newestId && newestId === ts;
                    return (
                      <tr
                        key={i}
                        className={`border-t hover:bg-gray-50 ${highlight ? 'bg-yellow-50' : ''}`}
                      >
                        <td className="p-2 font-mono text-[11px]">{h.from}</td>
                        <td className="p-2 font-mono text-[11px]">{h.to}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium inline-block ${roleBadge(h.role)}`}>
                            {h.role || '—'}
                          </span>
                        </td>
                        <td className="p-2 text-[11px] max-w-[240px] break-words">{h.remarks || '-'}</td>
                        <td className="p-2 text-[11px]">{formatBangladeshDate(ts)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 text-[11px] text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Auto-refresh interval: {(FLOW_POLL_MS/1000).toFixed(1)}s (env: {ENV_INTERVAL}ms)</span>
            {lastUpdated && <span>Last update: {formatBangladeshDate(lastUpdated)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
