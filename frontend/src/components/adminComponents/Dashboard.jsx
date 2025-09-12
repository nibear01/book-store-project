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

const Dashboard = () => {
  // Dummy analytics data
  const salesData = [
    { month: "Jan", sales: 400 },
    { month: "Feb", sales: 650 },
    { month: "Mar", sales: 800 },
    { month: "Apr", sales: 600 },
    { month: "May", sales: 900 },
  ];

  const topBooks = [
    { name: "Book A", sales: 240 },
    { name: "Book B", sales: 190 },
    { name: "Book C", sales: 300 },
    { name: "Book D", sales: 120 },
  ];

  const orderStatus = [
    { name: "Processing", value: 45 },
    { name: "Shipped", value: 30 },
    { name: "Delivered", value: 80 },
    { name: "Refunded", value: 10 },
  ];

  const COLORS = ["#0f172a", "#3b82f6", "#22c55e", "#ef4444"];

  const activities = [
    { id: 1, type: "User Signup", detail: "John Doe created an account", date: "2025-09-10" },
    { id: 2, type: "Book Upload", detail: "New manuscript uploaded: 'AI Revolution'", date: "2025-09-11" },
    { id: 3, type: "Order Update", detail: "Order #1234 marked as shipped", date: "2025-09-12" },
  ];

  const summaryCards = [
    { title: "Total Users", value: 0, icon: Users },
    { title: "Total Books", value: 0, icon: BookOpen },
    { title: "Pending Manuscripts", value: 0, icon: ClipboardList },
    { title: "Orders in Progress", value: 0, icon: ShoppingCart },
    { title: "Active Promotions", value: 0, icon: Tag },
    { title: "Refund Requests", value: 0, icon: RefreshCcw },
  ];

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
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topBooks}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              <tr key={act.id} className="border-b border-gray-100 hover:bg-gray-50">
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
