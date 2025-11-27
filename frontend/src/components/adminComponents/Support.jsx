/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import { useDebounce } from "./common/useDebounce";
import { listWorkflowOrders } from "../../api/order-api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
// Using local adminComponents constants (shared file not present at ../../constants/constants)
import {
  STAGE_SETS,
  REMARK_REQUIRED,
  normalizeRoles,
  DEFAULT_PAGE_SIZE,
  paginate,
} from "./constants/constants";
// Corrected relative paths (common components are one level up from adminComponents)
import Pagination from "./common/Pagination";
import WorkflowOrderModal from "./support/WorkflowOrderModal";
import WorkflowSkeleton from "./common/WorkflowSkeleton";

export default function Support() {
  const { activeRole, roles } = useAuth();
  const normalizedRoles = normalizeRoles(activeRole, roles);
  const isAdmin = normalizedRoles.includes("admin");
  const hasCSM =
    normalizedRoles.includes("customer_support") ||
    activeRole === "customer_support";
  const canSee = isAdmin || hasCSM;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [stageFilter, setStageFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;
  

  const CSM_STAGES = STAGE_SETS.SUPPORT;
  const remarkRequiredSet = REMARK_REQUIRED.SUPPORT;

  const fetchOrders = async () => {
    if (!canSee) return;
    setLoading(true);
    try {
      const params = {};
      if (stageFilter) params.stage = stageFilter;
      const resp = await listWorkflowOrders(params);
      if (resp.success) {
        const filtered = resp.data.filter(
          (o) => isAdmin || CSM_STAGES.includes(o.internal_stage)
        );
        const searchLower = debouncedSearch.toLowerCase();
        const final = debouncedSearch
          ? filtered.filter(
              (o) =>
                o.order_number?.toLowerCase().includes(searchLower) ||
                o.shipping_address?.fullName
                  ?.toLowerCase()
                  .includes(searchLower) ||
                o.shipping_address?.email?.toLowerCase().includes(searchLower)
            )
          : filtered;
        setOrders(final);
        setPage(1);
      } else toast.error(resp.message || "Failed to load orders");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed loading orders");
    } finally {
      setLoading(false);
    }
  };

  // Refetch when role set or filters change
  useEffect(() => {
    fetchOrders();
  }, [stageFilter, debouncedSearch, canSee, normalizedRoles.join(",")]);

  const paged = useMemo(
    () => paginate(orders, page, pageSize),
    [orders, page, pageSize]
  );
  const total = orders.length;
  const showPagination = total >= pageSize;
  const openOrder = (order) => setSelected(order);
  const handleAdvanced = () => {
    fetchOrders();
  };
  const filterNext = (stages) =>
    stages.filter((s) => !["OM_COMPLETED"].includes(s));

  if (!canSee) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Access restricted to Customer Support or Admin.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold" name="support-page-title">Customer Support Queue</h2>
          <p className="text-gray-600 text-sm">
            Address verification & post-delivery feedback.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            name="support-stage-filter"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="border px-2 py-2 rounded text-sm"
          >
            <option value="">All CSM Stages</option>
            {CSM_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="relative">
            <input
              name="support-search-input"
              placeholder="Search order/customer"
              className="border pl-2 pr-7 py-2 rounded text-sm w-44 sm:w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                name="support-search-clear-btn"
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
            name="support-refresh-btn"
            onClick={fetchOrders}
            className="px-4 py-2 bg-black text-white rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="overflow-x-auto border rounded-md bg-white hidden sm:block">
        <table name="support-table" className="min-w-full text-sm">
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
                    No orders in queue
                  </td>
                </tr>
              ) : (
                paged.map((o) => (
                  <tr key={o._id} name="support-row" className="border-t hover:bg-gray-50">
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
                        name="support-open-btn"
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
            No orders in queue
          </div>
        ) : (
          paged.map((o) => (
            <div
              key={o._id}
              name="support-mobile-card"
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
                name="support-mobile-open-btn"
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
            namePrefix="support"
          />
        </div>
      )}

      {selected && (
        <WorkflowOrderModal
          order={selected}
          onClose={() => setSelected(null)}
          onAdvanced={handleAdvanced}
          remarkRequiredSet={remarkRequiredSet}
          remarksLabel="Remarks"
          filterNextStages={filterNext}
          showFinancials={true}
        />
      )}
    </div>
  );
}
