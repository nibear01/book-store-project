/* eslint-disable react-hooks/exhaustive-deps */
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { listWorkflowOrders } from "../../api/order-api";
import { toast } from "react-toastify";
import Pagination from "./common/Pagination";
import WorkflowOrderModal from "./support/WorkflowOrderModal";
import WorkflowSkeleton from "./common/WorkflowSkeleton";
import {
  STAGE_SETS,
  REMARK_REQUIRED,
  normalizeRoles,
  DEFAULT_PAGE_SIZE,
  paginate,
} from "./constants/constants";
import { useDebounce } from "./common/useDebounce";

export default function Delivery() {
  const { activeRole, roles } = useAuth();
  const normalizedRoles = normalizeRoles(activeRole, roles);
  const isAdmin = normalizedRoles.includes("admin");
  const hasDelivery =
    normalizedRoles.includes("delivery_manager") ||
    activeRole === "delivery_manager";
  const canSee = isAdmin || hasDelivery;
  const DELIVERY_STAGES = STAGE_SETS.DELIVERY;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stageFilter, setStageFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;
  const debounceSearch = useDebounce(search, 300);

  const fetchOrders = async () => {
    if (!canSee) return;
    setLoading(true);
    try {
      const params = {};
      if (stageFilter) params.stage = stageFilter;
      const resp = await listWorkflowOrders(params);
      if (resp.success) {
        let data = resp.data.filter(
          (o) => isAdmin || DELIVERY_STAGES.includes(o.internal_stage)
        );
        if (debounceSearch) {
          const s = debounceSearch.toLowerCase();
          data = data.filter(
            (o) =>
              o.order_number?.toLowerCase().includes(s) ||
              o.shipping_address?.fullName?.toLowerCase().includes(s)
          );
        }
        setOrders(data);
        setPage(1);
      } else toast.error(resp.message || "Failed");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Load error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, [stageFilter, debounceSearch, canSee, normalizedRoles.join(",")]);
  const paged = useMemo(
    () => paginate(orders, page, pageSize),
    [orders, page, pageSize]
  );
  const total = orders.length;
  const showPagination = total >= pageSize;
  const openOrder = (o) => setSelected(o);
  const handleAdvanced = () => {
    fetchOrders();
  };

  if (!canSee)
    return (
      <div className="p-4 text-sm text-gray-500">
        Access restricted to Delivery Manager or Admin.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold">Delivery Workflow</h2>
          <p className="text-gray-600 text-sm">
            Packing through final delivery confirmation.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="border px-2 py-2 rounded text-sm"
          >
            <option value="">All Delivery Stages</option>
            {DELIVERY_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order/customer"
              className="border pl-2 pr-7 py-2 rounded text-sm w-44 sm:w-56"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-1 flex items-center px-1 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-black text-white rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
      {/* Desktop table */}
      <div className="overflow-x-auto border rounded-md bg-white hidden sm:block">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Order No.</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Stage</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          {loading ? (
            <WorkflowSkeleton rows={8} variant="table" columns={5} />
          ) : (
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No orders
                  </td>
                </tr>
              ) : (
                paged.map((o) => (
                  <tr key={o._id} className="border-t hover:bg-gray-50">
                    <td className="p-2 font-medium">{o.order_number}</td>
                    <td className="p-2">
                      {o.shipping_address?.fullName || "-"}
                      <div className="text-xs text-gray-500">
                        {o.shipping_address?.email || ""}
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium">
                        {o.internal_stage}
                      </span>
                    </td>
                    <td className="p-2 text-xs">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => openOrder(o)}
                        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>
      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <WorkflowSkeleton rows={6} variant="cards" />
        ) : orders.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500 border rounded bg-white">
            No orders
          </div>
        ) : (
          paged.map((o) => (
            <div
              key={o._id}
              className="border rounded bg-white p-3 shadow-sm flex flex-col gap-2"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold text-sm">#{o.order_number}</p>
                  <p className="text-xs text-gray-600 truncate max-w-[180px]">
                    {o.shipping_address?.fullName || "-"}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-medium">
                  {o.internal_stage}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 flex justify-between">
                <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                <span>
                  {new Date(o.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <button
                onClick={() => openOrder(o)}
                className="self-start mt-1 text-[11px] px-2 py-1 bg-indigo-600 text-white rounded"
              >
                Open
              </button>
            </div>
          ))
        )}
      </div>
      {showPagination && (
        <div className="mt-2">
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
      {selected && (
        <WorkflowOrderModal
          order={selected}
          onClose={() => setSelected(null)}
          onAdvanced={handleAdvanced}
          remarkRequiredSet={new Set()}
          remarksLabel="Remarks (optional)"
          showFinancials={false}
        />
      )}
    </div>
  );
}
