import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingCart,
  Tag,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Books Manuscripts", path: "/admin/books", icon: BookOpen },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Coupons & Promotions", path: "/admin/coupons", icon: Tag },
    { name: "Settings", path: "/admin/settings", icon: Settings },
    { name: "Logout", path: "/logout", icon: LogOut },
  ];

  return (
    <div
      className={`h-screen fixed top-0 left-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-50
        ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex-col">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                BOOK<span className="text-red-500">S</span>TOP
              </span>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-600 hover:text-black transition-colors"
        >
          <ChevronDown
            className={`w-5 h-5 transform transition-transform ${
              isCollapsed ? "-rotate-90" : "rotate-0"
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-[2px] text-sm font-medium transition-colors
                ${
                  active
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
