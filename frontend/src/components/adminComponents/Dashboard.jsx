import { useEffect, useMemo, useState } from "react";
import {
  Users,
  BookOpen,
  ClipboardList,
  ShoppingCart,
  Tag,
  RefreshCcw,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { adminOrdersAPI } from "../../api/admin-api";
import DashboardSkeleton from "./dashboard/DashboardSkeleton";
import Pagination from "./user/Pagination";

// Month constants and helpers
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const resolveMonthIndex = (val) => {
  if (!val && val !== 0) return null;
  const str = String(val).trim();
  // Numeric month (1-12)
  if (/^(\d{1,2})$/.test(str)) {
    const num = parseInt(str, 10);
    if (num >= 1 && num <= 12) return num - 1;
  }
  // Full name match
  const fullIdx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === str.toLowerCase());
  if (fullIdx !== -1) return fullIdx;
  // Abbreviation match
  const abbrIdx = MONTH_NAMES.findIndex(
    (m) => m.slice(0, 3).toLowerCase() === str.slice(0, 3).toLowerCase()
  );
  if (abbrIdx !== -1) return abbrIdx;
  return null;
};

const resolveEntryYear = (entry, fallbackYear) => {
  const y = entry?.year ?? entry?.y ?? entry?._id?.year ?? entry?._id?.y;
  if (typeof y === "number") return y;
  if (typeof y === "string" && /^\d{4}$/.test(y)) return Number(y);
  const d = entry?.date || entry?.createdAt || entry?.updatedAt;
  if (d) {
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) return dt.getFullYear();
  }
  return fallbackYear;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [ordersInProgress, setOrdersInProgress] = useState(0);
  const [activePromotions, setActivePromotions] = useState(0);
  const [refundRequests, setRefundRequests] = useState(0);
  const [pendingManuscripts, setPendingManuscripts] = useState(0);
  const [totalSales, setTotalSales] = useState(0); // Represents sales for selected month
  // const [totalProfit, setTotalProfit] = useState(0); // Temporarily disabled (profit hidden)

  const [salesData, setSalesData] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [activities, setActivities] = useState([]);

  // Month selection state
  const currentMonthIndex = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Year selection + raw sales storage
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState([currentYear]);
  const [rawSales, setRawSales] = useState([]); // legacy aggregated sales from stats endpoint
  const [rawOrders, setRawOrders] = useState([]); // full orders for accurate filtered sales
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(currentMonthIndex);

  // Helpers moved to module scope
  
  // Pagination for activities
  const [activitiesPage, setActivitiesPage] = useState(1);
  const activitiesPerPage = 10;

  const COLORS = ["#0f172a", "#3b82f6", "#22c55e", "#ef4444"];
  const PALETTE = ["#0f172a", "#60a5fa", "#34d399", "#fb7185", "#f59e0b"];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const statsRes = await adminOrdersAPI.stats();
        let ordersRes = null;
        try {
          ordersRes = await adminOrdersAPI.list({ limit: 100000 });
        } catch (orderErr) {
          // Non-fatal: fallback to stats-only aggregation
          console.warn("Failed to fetch full orders for sales filtering", orderErr?.message);
        }

        if (!mounted) return;

        if (statsRes) {
          const s = statsRes.data || statsRes || {};
          if (typeof s.totalUsers === "number") setTotalUsers(s.totalUsers);
          if (typeof s.totalBooks === "number") setTotalBooks(s.totalBooks);
          // Raw sales entries from API (aggregated)
          const localRawSales = s.salesOverTime || s.revenueOverTime || [];
          setRawSales(localRawSales);
          // Raw orders for precise filtering (exclude cancelled / terminated)
          if (ordersRes && Array.isArray(ordersRes.data)) {
            setRawOrders(ordersRes.data);
          }

          // Determine available years from data (ensure current year present)
          const yearSet = new Set();
          localRawSales.forEach((entry) => {
            const y = resolveEntryYear(entry, currentYear);
            if (y && Number.isFinite(y)) yearSet.add(y);
          });
          if (!yearSet.has(currentYear)) yearSet.add(currentYear);
          const yearsArr = Array.from(yearSet).sort((a, b) => b - a);
          setAvailableYears(yearsArr);
          // If current selection not in available, fall back to current or latest
          if (!yearsArr.includes(selectedYear)) {
            setSelectedYear(yearsArr.includes(currentYear) ? currentYear : yearsArr[0]);
          }
          const byStatus = s.ordersByStatus || s.statusBreakdown || {};
          const statusArr = Object.entries(byStatus).map(([name, value]) => ({
            name,
            value: Number(value),
          }));
          setOrderStatus(statusArr);
          if (typeof s.ordersInProgress === "number")
            setOrdersInProgress(s.ordersInProgress);
          if (typeof s.activePromotions === "number")
            setActivePromotions(s.activePromotions);
          if (typeof s.refundRequests === "number")
            setRefundRequests(s.refundRequests);
          if (typeof s.pendingManuscripts === "number")
            setPendingManuscripts(s.pendingManuscripts);
          // if (typeof s.totalSales === "number") setTotalSales(s.totalSales); // Using monthly breakdown instead
          // if (typeof s.totalProfit === "number") setTotalProfit(s.totalProfit); // Profit temporarily disabled
          if (Array.isArray(s.activities)) setActivities(s.activities);
          if (Array.isArray(s.topBooks)) {
            setTopBooks(
              s.topBooks.map((b) => ({
                name: b.name,
                sales: b.sales,
                revenue: b.revenue,
              }))
            );
          }
          setLastUpdated(new Date());
        }
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [currentYear, selectedYear]);

  // Recompute monthly sales when year / orders change.
  // Prefer rawOrders (order-level filtering) else fall back to aggregated rawSales.
  useEffect(() => {
    const monthsCount = selectedYear === currentYear ? currentMonthIndex + 1 : 12;
    const monthlySales = MONTH_NAMES.slice(0, monthsCount).map((name) => ({ month: name, sales: 0 }));

    if (rawOrders.length) {
      const TERMINATED_STAGES = new Set([
        "TERMINATED_OM",
        "CANCELLED_CSM",
        "CANCELLED_FM",
        "FM_REJECTED",
      ]);
      rawOrders.forEach((o) => {
        if (!o || !o.createdAt) return;
        const created = new Date(o.createdAt);
        if (isNaN(created.getTime())) return;
        const year = created.getFullYear();
        if (year !== selectedYear) return;
        // Exclude cancelled public status or terminated internal stage (but allow OM_COMPLETED)
        if (String(o.order_status).toLowerCase() === "cancelled") return;
        if (TERMINATED_STAGES.has(o.internal_stage)) return;
        const monthIdx = created.getMonth();
        if (monthIdx < monthsCount) {
          const amount = Number(o.grand_total || o.total_amount || 0);
          if (!Number.isNaN(amount)) monthlySales[monthIdx].sales += amount;
        }
      });
    } else {
      // Fallback: use aggregated rawSales (may include cancelled/terminated if backend not filtered)
      rawSales.forEach((entry) => {
        const y = resolveEntryYear(entry, currentYear);
        if (y !== selectedYear) return;
        const idx = resolveMonthIndex(entry.month || entry.label);
        if (idx !== null && idx < monthsCount) {
          monthlySales[idx].sales += Number(entry.sales || entry.total || 0);
        }
      });
    }

    setSalesData(monthlySales);
    const clampedIdx = Math.min(selectedMonthIndex, monthsCount - 1);
    if (clampedIdx !== selectedMonthIndex) setSelectedMonthIndex(clampedIdx);
  }, [rawOrders, rawSales, selectedYear, currentMonthIndex, currentYear, selectedMonthIndex]);

  // Update displayed sales when month selection changes
  useEffect(() => {
    if (salesData.length) {
      setTotalSales(salesData[selectedMonthIndex]?.sales || 0);
    }
  }, [selectedMonthIndex, salesData]);

  const summaryCards = useMemo(
    () => [
      { title: "Total Sales", value: `৳${totalSales.toLocaleString()}`, icon: DollarSign, isCurrency: true },
      // { title: "Total Profit", value: `৳${totalProfit.toLocaleString()}`, icon: TrendingUp, isCurrency: true }, // Temporarily commented out per request
      { title: "Total Users", value: totalUsers, icon: Users },
      { title: "Total Books", value: totalBooks, icon: BookOpen },
      {
        title: "Pending Manuscripts",
        value: pendingManuscripts,
        icon: ClipboardList,
      },
      {
        title: "Orders in Progress",
        value: ordersInProgress,
        icon: ShoppingCart,
      },
      { title: "Active Promotions", value: activePromotions, icon: Tag },
      { title: "Refund Requests", value: refundRequests, icon: RefreshCcw },
    ],
    [
      totalSales,
      totalUsers,
      totalBooks,
      pendingManuscripts,
      ordersInProgress,
      activePromotions,
      refundRequests,
    ]
  );

  if (loading) return <DashboardSkeleton />;
  
  if (error)
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-gray-600 text-sm">
            Overview of your bookstore's performance and activities.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              adminOrdersAPI
                .stats()
                .then(() => {
                  setLastUpdated(new Date());
                  setLoading(false);
                })
                .catch(() => setLoading(false));
            }}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-md hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCcw className="w-4 h-4 text-gray-700" />
            <span className="text-sm text-gray-700">Refresh</span>
          </button>
          <div className="flex items-center gap-2">
            <label htmlFor="year-select" className="text-xs text-gray-500">Year:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="month-select" className="text-xs text-gray-500">Month:</label>
            <select
              id="month-select"
              value={selectedMonthIndex}
              onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              {MONTH_NAMES
                .slice(0, selectedYear === currentYear ? currentMonthIndex + 1 : 12)
                .map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
          </div>
          {lastUpdated && (
            <div className="text-xs text-gray-500">
              Updated {lastUpdated.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white border border-zinc-200 rounded-md p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-md text-white"
                  style={{ background: PALETTE[idx % PALETTE.length] }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 font-medium">
                    {card.title}
                  </div>
                  <div className="mt-1 text-lg font-bold text-gray-900">
                    {card.isCurrency ? card.value : String(card.value || 0).replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Over Time */}
        <div className="bg-white border border-zinc-200 rounded-md p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Sales Over Time
            </h2>
            <div className="text-xs text-gray-500">(Monthly)</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesData} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="6 6" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280" }} />
              <YAxis tick={{ fill: "#6b7280" }} />
              <Tooltip
                formatter={(val) => [val, "Sales"]}
                contentStyle={{ borderRadius: 8 }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#0f172a"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Books */}
        <div className="bg-white border border-zinc-200 rounded-md p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Top-Selling Books
          </h2>
          {topBooks.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topBooks} margin={{ left: -16 }}>
                <CartesianGrid strokeDasharray="6 6" stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickFormatter={(name) =>
                    typeof name === "string" && name.length > 18
                      ? `${name.slice(0, 18)}...`
                      : name
                  }
                />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "sales" ? "Units" : name,
                  ]}
                  contentStyle={{ borderRadius: 8 }}
                />
                <Bar dataKey="sales" radius={[8, 8, 8, 8]}>
                  {topBooks.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PALETTE[index % PALETTE.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-gray-500 h-[250px] flex items-center justify-center">
              Sales aggregation for books not yet implemented.
            </div>
          )}
        </div>

        {/* Orders By Status */}
        <div className="bg-white border border-zinc-200 rounded-md p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Orders by Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {orderStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-200">
          <h2 className="text-lg font-bold text-gray-900">
            Recent Activities
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">Type</th>
                <th className="px-4 py-3 font-medium text-gray-700">Details</th>
                <th className="px-4 py-3 font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? (
                (() => {
                  const startIndex = (activitiesPage - 1) * activitiesPerPage;
                  const endIndex = startIndex + activitiesPerPage;
                  const paginatedActivities = activities.slice(startIndex, endIndex);
                  
                  return paginatedActivities.map((act) => (
                    <tr
                      key={act.id}
                      className="border-b border-zinc-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium">{act.type}</td>
                      <td className="px-4 py-3">{act.detail}</td>
                      <td className="px-4 py-3">{act.date}</td>
                    </tr>
                  ));
                })()
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-gray-500 italic">
                    No recent activities
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {activities.length > activitiesPerPage && (
          <div className="border-t border-zinc-200">
            <Pagination
              currentPage={activitiesPage}
              totalPages={Math.ceil(activities.length / activitiesPerPage)}
              totalItems={activities.length}
              pageSize={activitiesPerPage}
              onPageChange={(newPage) => setActivitiesPage(newPage)}
              itemName="activities"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
