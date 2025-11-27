/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback } from "react";
import {
  updateOrderStatus,
  deleteOrder,
  listWorkflowOrders,
  getAllOrders,
  getWorkflowOrder,
  getNextWorkflowStages,
  advanceWorkflowStage,
} from "../../../api/order-api";
import { toast } from "react-toastify";

// ===================== Pure Utility Functions ===================== //

// Convert UTC to Bangladesh Time (UTC+6)
export const convertToBangladeshTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date)) return null;

  //   const bangladeshOffset = 6 * 60 * 60 * 1000;
  return new Date(date.getTime());
};

// Format date in Bangladesh timezoneD
export const formatBangladeshDate = (dateString) => {
  const date = convertToBangladeshTime(dateString);
  if (!date) return "-";

  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${mm}/${dd} ${hh}:${min}`;
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

// Format currency with Taka sign
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "৳ 0.00";
  return `৳ ${amount.toFixed(2)}`;
};

// Get date range for filters
export const getDateRange = (range) => {
  const now = new Date();
  const bangladeshNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  bangladeshNow.setHours(0, 0, 0, 0);

  switch (range) {
    case "1day": {
      const yesterday = new Date(bangladeshNow);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: bangladeshNow };
    }

    case "7days": {
      const sevenDaysAgo = new Date(bangladeshNow);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return { start: sevenDaysAgo, end: bangladeshNow };
    }

    case "15days": {
      const fifteenDaysAgo = new Date(bangladeshNow);
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      return { start: fifteenDaysAgo, end: bangladeshNow };
    }

    case "30days": {
      const thirtyDaysAgo = new Date(bangladeshNow);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return { start: thirtyDaysAgo, end: bangladeshNow };
    }

    default:
      return null;
  }
};

// Handle order status update
export const handleUpdateStatus = async (id, newStatus, setOrders) => {
  try {
    const response = await updateOrderStatus(id, { status: newStatus });
    if (response.success) {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, order_status: newStatus } : order
        )
      );
      toast.success("Order status updated!");
    } else {
      toast.error(response.message || "Failed to update order status");
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to update order status");
  }
};

// NEW: Improved book name fetching function
export const fetchBookNames = async (orderItems, books) => {
  const bookNameMap = {};
  const booksArray = Array.isArray(books) ? books : [];

  for (const item of orderItems) {
    if (item.book && !bookNameMap[item.book]) {
      try {
        // Handle different book ID formats
        let bookId = item.book;

        // If book ID is an object with $oid (MongoDB format)
        if (typeof bookId === "object" && bookId.$oid) {
          bookId = bookId.$oid;
        }

        // If book ID is an object with _id
        if (typeof bookId === "object" && bookId._id) {
          bookId = bookId._id;
        }

        // Convert to string for comparison
        const bookIdStr = String(bookId);

        // Find book in context by comparing string representations
        const existingBook = booksArray.find((b) => {
          // Handle different book ID formats in the books array
          let existingBookId = b._id;
          if (
            existingBookId &&
            typeof existingBookId === "object" &&
            existingBookId.$oid
          ) {
            existingBookId = existingBookId.$oid;
          }
          return String(existingBookId) === bookIdStr;
        });

        if (existingBook) {
          bookNameMap[item.book] = existingBook.title || "Unknown Book";
        } else {
          bookNameMap[item.book] = "Book Not Found";
        }
      } catch (error) {
        console.error(`Error processing book for ID ${item.book}:`, error);
        bookNameMap[item.book] = "Error Loading Book";
      }
    }
  }

  return bookNameMap;
};

// Get book name by ID with safe fallback
export const getBookName = (item, bookNames) => {
  // Use the book_title stored in the order item
  if (item.book_title) {
    return item.book_title;
  }

  // Fallback: try to get from bookNames map (for backward compatibility)
  let bookId = item.book;
  if (typeof bookId === "object" && bookId.$oid) {
    bookId = bookId.$oid;
  }
  if (typeof bookId === "object" && bookId._id) {
    bookId = bookId._id;
  }

  return bookNames[bookId] || bookNames[item.book] || "Loading...";
};

// Update the handleDeleteOrder function:
export const handleDeleteOrder = async (
  selectedOrder,
  orders,
  setOrders,
  setViewOrderVisible
) => {
  // Confirmation dialog
  if (
    !window.confirm(
      "Are you sure you want to delete this order? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const response = await deleteOrder(selectedOrder._id);

    if (response.success) {
      // Remove from local state
      const updatedOrders = orders.filter(
        (order) => order._id !== selectedOrder._id
      );
      setOrders(updatedOrders);
      setViewOrderVisible(false);
      toast.success("Order deleted successfully!");
    } else {
      toast.error(response.message || "Failed to delete order");
    }
  } catch (err) {
    console.error("Error deleting order:", err);
    toast.error("Failed to delete order from database");
  }
};

export const getStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "shipped":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancel":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// ===================== Hooks ===================== //

// Derive access & role state
export function useOrderAccess(activeRole, roles) {
  const raw = Array.isArray(roles) ? roles : [activeRole].filter(Boolean);
  const normalized = raw
    .filter(Boolean)
    .map((r) => String(r).trim().toLowerCase())
    .filter((r, i, a) => a.indexOf(r) === i);
  const rolesLoaded = normalized.length > 0 || !!activeRole;
  const isAdmin = normalized.includes("admin");
  const hasOrderManager =
    normalized.includes("order_manager") || activeRole === "order_manager";
  const canAccess = isAdmin || hasOrderManager;
  return { normalizedRoles: normalized, rolesLoaded, isAdmin, hasOrderManager, canAccess };
}

// Fetch orders (workflow vs aggregate) + associated book names snapshot
export function useOrdersFetcher({ canAccess, internalView, workflowFilterStage, books }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookNames, setBookNames] = useState({});

  const doFetch = useCallback(async () => {
    if (!canAccess) { setOrders([]); return; }
    setLoading(true);
    try {
      let resp;
      if (internalView) {
        const params = {};
        if (workflowFilterStage) params.stage = workflowFilterStage;
        resp = await listWorkflowOrders(params);
      } else {
        resp = await getAllOrders();
      }
      if (resp.success) {
        const list = resp.data || [];
        setOrders(list);
        const items = [];
        for (const o of list) if (Array.isArray(o.items)) for (const it of o.items) if (it.book) items.push(it);
        if (items.length) {
          try { const map = await fetchBookNames(items, books); setBookNames(map); } catch {/* silent */}
        }
      } else {
        setOrders([]);
      }
    } catch (e) {
        console.log(`error fetching orders:`, e);
        
      setOrders([]);
    }
    setLoading(false);
  }, [canAccess, internalView, workflowFilterStage, books]);

  return { orders, setOrders, loading, bookNames, refetch: doFetch };
}

// Selection & workflow advancement
export function useWorkflowSelection() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [nextStages, setNextStages] = useState([]);
  const [advancing, setAdvancing] = useState(false);
  const [advanceRemarks, setAdvanceRemarks] = useState("");
  return { selectedOrder, setSelectedOrder, nextStages, setNextStages, advancing, setAdvancing, advanceRemarks, setAdvanceRemarks };
}

export function useWorkflowActions(state) {
  const {
    selectedOrder,
    setSelectedOrder,
    setNextStages,
    setAdvancing,
    setAdvanceRemarks,
  } = state;
  const TERMINAL_REQUIRE_REMARKS = [
    "TERMINATED_OM",
    "CANCELLED_CSM",
    "CANCELLED_FM",
    "FM_REJECTED",
  ];

  const openOrder = useCallback(async (orderId) => {
    const wf = await getWorkflowOrder(orderId);
    if (wf.success) {
      setSelectedOrder(wf.data);
      const ns = await getNextWorkflowStages(orderId);
      if (ns.success) setNextStages(ns.data); else setNextStages([]);
    }
  }, [setSelectedOrder, setNextStages]);

  const advanceStage = useCallback(async (targetStage, remarks) => {
    if (!selectedOrder) return;
    if (TERMINAL_REQUIRE_REMARKS.includes(targetStage) && !remarks?.trim()) {
      toast.error("Remarks required for terminal transition");
      return;
    }
    setAdvancing(true);
    try {
      const resp = await advanceWorkflowStage(selectedOrder._id, { targetStage, remarks });
      if (resp.success) {
        setSelectedOrder(resp.data);
        setAdvanceRemarks("");
        const ns = await getNextWorkflowStages(resp.data._id);
        if (ns.success) setNextStages(ns.data); else setNextStages([]);
      } else {
        toast.error(resp.message || 'Advance failed');
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Advance failed');
    } finally { setAdvancing(false); }
  }, [selectedOrder, setAdvancing, setSelectedOrder, setAdvanceRemarks, setNextStages]);

  return { openOrder, advanceStage, TERMINAL_REQUIRE_REMARKS };
}

// Workflow history (real-time polling viewer) hook
export function useWorkflowHistory({ selectedOrder, openOrder, enabled, pollInterval }) {
  const [showFlow, setShowFlow] = useState(false);
  const [flowHistory, setFlowHistory] = useState([]);
  const [flowLoading, setFlowLoading] = useState(false);
  const [flowError, setFlowError] = useState(null);
  const [pollId, setPollId] = useState(null);
  const FLOW_POLL_MS = pollInterval && pollInterval > 1000 ? pollInterval : 7000;
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newestId, setNewestId] = useState(null); // store latest timestamp for highlight

  const stopPolling = useCallback(() => {
    if (pollId) {
      clearInterval(pollId);
      setPollId(null);
    }
  }, [pollId]);

  const fetchHistory = useCallback(async () => {
    if (!selectedOrder) return;
    try {
      const resp = await getWorkflowOrder(selectedOrder._id);
      if (resp.success) {
        const newHist = resp.data?.workflow_history || [];
        setFlowHistory((prev) => {
          if (
            prev.length !== newHist.length ||
            (newHist[newHist.length - 1]?.timestamp?.$date !==
              prev[prev.length - 1]?.timestamp?.$date)
          ) {
            const newestTs = newHist[newHist.length - 1]?.timestamp?.$date || newHist[newHist.length - 1]?.timestamp;
            if (newestTs) setNewestId(newestTs);
            setLastUpdated(new Date().toISOString());
            return newHist;
          }
          return prev;
        });
      }
    } catch {/* silent */}
  }, [selectedOrder]);

  const handleViewFlow = useCallback(async () => {
    if (!enabled) {
      toast.error("Access denied");
      return;
    }
    if (!selectedOrder) {
      toast.error("Select an order first");
      return;
    }
    // Toggle off
    if (showFlow) {
      setShowFlow(false);
      stopPolling();
      return;
    }
    // Opening
    setShowFlow(true);
    setFlowLoading(true);
    setFlowError(null);
    try {
      // Ensure we have freshest order (with history)
      await openOrder(selectedOrder._id);
      await fetchHistory();
    } catch (e) {
      setFlowError(e?.response?.data?.message || "Failed to load history");
    } finally {
      setFlowLoading(false);
    }
    if (!pollId) {
      const id = setInterval(fetchHistory, FLOW_POLL_MS);
      setPollId(id);
    }
  }, [enabled, selectedOrder, showFlow, stopPolling, openOrder, fetchHistory, pollId]);

  // Manual refresh
  const manualRefresh = useCallback(async () => {
    setFlowLoading(true);
    try { await fetchHistory(); } finally { setFlowLoading(false); }
  }, [fetchHistory]);

  // Cleanup on unmount or when selectedOrder changes
  const cleanup = useCallback(() => {
    stopPolling();
    setShowFlow(false);
  }, [stopPolling]);

  return {
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
  };
}

// Filtering, sorting & pagination derived data
export function useOrderDerivations({ orders, filter, searchQuery, dateFilter, startDate, endDate, sortBy, sortDirection, page, pageSize }) {
  const filtered = orders
    .filter(o => filter === 'all' ? true : o.order_status === filter)
    .filter(o => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.order_number?.toLowerCase().includes(q) ||
        o.shipping_address?.fullName?.toLowerCase().includes(q) ||
        o.shipping_address?.email?.toLowerCase().includes(q)
      );
    })
    .filter(o => {
      if (dateFilter === 'all' && !startDate && !endDate) return true;
      const created = new Date(o.createdAt);
      if (startDate) { const s = new Date(startDate); if (created < s) return false; }
      if (endDate) { const e = new Date(endDate); if (created > e) return false; }
      if (dateFilter !== 'all') {
        const range = getDateRange(dateFilter);
        if (range) {
          if (range.start && created < range.start) return false;
          if (range.end && created > range.end) return false;
        }
      }
      return true;
    })
    .sort((a,b)=> {
      if (sortBy === 'date') return sortDirection === 'asc' ? new Date(a.createdAt)-new Date(b.createdAt) : new Date(b.createdAt)-new Date(a.createdAt);
      if (sortBy === 'total') return sortDirection === 'asc' ? (a.grand_total||0)-(b.grand_total||0) : (b.grand_total||0)-(a.grand_total||0);
      return 0;
    });
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page-1)*pageSize, page*pageSize);
  return { filtered, paginated, totalPages };
}


