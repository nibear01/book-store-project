/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  getWorkflowOrder,
  getNextWorkflowStages,
  advanceWorkflowStage,
} from "../../../api/order-api";
import { toast } from "react-toastify";
import RemarksModal from "../common/RemarksModal.jsx";

/*
Props:
- this is used in support, finance, printing and delivery components in the admin components folder
  as work skeleton
- order (object with _id, order_number, internal_stage, etc) required
- onClose() => void
- onAdvanced(updatedOrder) => void (so parent can refresh list)
- remarkRequiredSet: Set of stages requiring remarks (can be empty)
- remarksLabel: string override label text
- filterNextStages?: (string[]) => string[] to optionally filter next stage choices
- showFinancials?: boolean (shows discount/shipping fields)
*/
export default function WorkflowOrderModal({
  order,
  onClose,
  onAdvanced,
  remarkRequiredSet,
  remarksLabel,
  filterNextStages,
  showFinancials = true,
}) {
  const [full, setFull] = useState(order);
  const [nextStages, setNextStages] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [showRemarks, setShowRemarks] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!order?._id) return;
      setLoading(true);
      try {
        const wf = await getWorkflowOrder(order._id);
        if (wf.success) setFull(wf.data);
        const ns = await getNextWorkflowStages(order._id);
        if (ns.success) {
          let st = ns.data;
          if (filterNextStages) st = filterNextStages(st);
          setNextStages(st);
        }
      } catch (e) {
        console.log(`error fetching order detail:`, e);
        toast.error("Failed to load order detail");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [order?._id]);

  const advance = async (stage) => {
    if (!full) return;
    if (remarkRequiredSet?.has(stage) && !remarks.trim()) {
      toast.error("Remarks required");
      return;
    }
    setAdvancing(true);
    try {
      const resp = await advanceWorkflowStage(full._id, {
        targetStage: stage,
        remarks,
      });
      if (resp.success) {
        toast.success("Advanced");
        setFull(resp.data);
        setRemarks("");
        onAdvanced?.(resp.data);
        const ns = await getNextWorkflowStages(resp.data._id);
        if (ns.success)
          setNextStages(filterNextStages ? filterNextStages(ns.data) : ns.data);
        else setNextStages([]);
      } else toast.error(resp.message || "Advance failed");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Advance failed");
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="bg-white w-full max-w-3xl rounded shadow-lg relative top-25">
        <div className="flex justify-between items-start p-4 border-b">
          <div>
            <h3 name="workflow-modal-title" className="font-semibold text-sm md:text-base">
              Order {full?.order_number}
            </h3>
            <p name="workflow-modal-stage" className="text-xs text-gray-500">
              Stage: {full?.internal_stage}
            </p>
          </div>
          <button
            name="workflow-modal-close-btn"
            onClick={onClose}
            className="text-xs px-2 py-1 border rounded"
          >
            Close
          </button>
        </div>
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : (
          <div className="p-4 space-y-5">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <strong>Customer:</strong>{" "}
                  {full?.shipping_address?.fullName || "-"}
                </p>
                <p>
                  <strong>Email:</strong> {full?.shipping_address?.email || "-"}
                </p>
                {full?.shipping_address?.phone && (
                  <p>
                    <strong>Phone:</strong> {full?.shipping_address?.phone}
                  </p>
                )}
                {full?.shipping_address?.street && (
                  <p>
                    <strong>Address:</strong> {full?.shipping_address?.street}
                  </p>
                )}
              </div>
              <div>
                <p>
                  <strong>Subtotal:</strong> ৳
                  {(full?.subtotal_amount ?? full?.total_amount ?? 0).toFixed(
                    2
                  )}
                </p>
                {showFinancials && (
                  <>
                    <p>
                      <strong>Discount:</strong> ৳
                      {(full?.discount_amount || 0).toFixed(2)}
                    </p>
                    <p>
                      <strong>Shipping:</strong> ৳
                      {(full?.shipping_amount || 0).toFixed(2)}
                    </p>
                  </>
                )}
                <p>
                  <strong>Grand:</strong> ৳
                  {(full?.grand_total ?? full?.total_amount ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-sm">Items</h4>
              <div className="overflow-x-auto">
                <table name="workflow-modal-items-table" className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Title</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {full?.items?.map((it, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{it.book_title}</td>
                        <td className="p-2 text-center">{it.quantity}</td>
                        <td className="p-2 text-right">
                          ৳{it.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {(nextStages.length > 0 || full?.workflow_history?.length > 0) && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  {remarksLabel || "Remarks"}{" "}
                  {nextStages.some((s) => remarkRequiredSet?.has(s)) &&
                    "(required for some stages)"}
                </label>
                <textarea
                  name="workflow-modal-remarks"
                  className="w-full border rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add internal note"
                />
                {full?.workflow_history?.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-gray-600 truncate max-w-[65%]" name="workflow-modal-last-remark">
                      Last: {full.workflow_history.at(-1)?.remarks || "—"}
                    </div>
                    <button
                      type="button"
                      name="workflow-modal-view-remarks-btn"
                      onClick={() => setShowRemarks(true)}
                      className="text-[11px] px-2 py-1 border rounded hover:bg-gray-100"
                    >View All Remarks</button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {nextStages.map((ns) => {
                    const need = remarkRequiredSet?.has(ns);
                    return (
                      <button
                        key={ns}
                        name={`workflow-modal-advance-${ns}`}
                        disabled={advancing || (need && !remarks.trim())}
                        onClick={() => advance(ns)}
                        className={`px-3 py-1 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                          need
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        Advance → {ns}
                      </button>
                    );
                  })}
                  <button
                    name="workflow-modal-clear-remarks"
                    type="button"
                    disabled={advancing || !remarks}
                    onClick={() => setRemarks("")}
                    className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <RemarksModal
        visible={showRemarks}
        onClose={() => setShowRemarks(false)}
        history={full?.workflow_history || []}
        orderNumber={full?.order_number}
      />
    </div>
  );
}
