import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  BookOpen,
  ClipboardList,
  ShoppingCart,
  Tag,
  RefreshCcw,
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

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [ordersInProgress, setOrdersInProgress] = useState(0);
  const [activePromotions, setActivePromotions] = useState(0);
  const [refundRequests, setRefundRequests] = useState(0);
  const [pendingManuscripts, setPendingManuscripts] = useState(0);

  const [salesData, setSalesData] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [activities, setActivities] = useState([]);

  const COLORS = ["#0f172a", "#3b82f6", "#22c55e", "#ef4444"];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const statsRes = await adminOrdersAPI.stats();

        if (!mounted) return;

        if (statsRes) {
          const s = statsRes.data || statsRes || {};
          if (typeof s.totalUsers === "number") setTotalUsers(s.totalUsers);
          if (typeof s.totalBooks === "number") setTotalBooks(s.totalBooks);
          const sales = s.salesOverTime || s.revenueOverTime || [];
          setSalesData(
            sales.map((p) => ({
              month: p.month || p.label || "",
              sales: Number(p.sales || p.total || 0),
            }))
          );
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
  }, []);

  const summaryCards = useMemo(
    () => [
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
      totalUsers,
      totalBooks,
      pendingManuscripts,
      ordersInProgress,
      activePromotions,
      refundRequests,
    ]
  );

  if (loading) return <div className="text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white border border-gray-200 rounded-[2px] p-4 flex flex-col items-start shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-gray-700" />
                <h3 className="text-sm font-medium text-gray-600">
                  {card.title}
                </h3>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Over Time */}
        <div className="bg-white border border-gray-200 rounded-[2px] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Sales Over Time
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#0f172a" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Books */}
        <div className="bg-white border border-gray-200 rounded-[2px] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Top-Selling Books
          </h2>
          {topBooks.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topBooks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "sales" ? "Units Sold" : name,
                  ]}
                />
                <Bar dataKey="sales" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-gray-500 h-[250px] flex items-center justify-center">
              Sales aggregation for books not yet implemented.
            </div>
          )}
        </div>

        {/* Orders By Status */}
        <div className="bg-white border border-gray-200 rounded-[2px] p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Orders by Status
          </h2>
          <ResponsiveContainer width="100%" height={250}>
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
      <div className="bg-white border border-gray-200 rounded-[2px] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activities
        </h2>
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="border-b border-gray-200 text-gray-800">
            <tr>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Details</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => (
              <tr
                key={act.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-2 font-medium">{act.type}</td>
                <td className="px-4 py-2">{act.detail}</td>
                <td className="px-4 py-2">{act.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
