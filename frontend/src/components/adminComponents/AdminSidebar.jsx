import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingCart,
  Printer,
  Truck,
  Banknote,
  Headphones,
  Megaphone,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on mobile by default
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [setIsCollapsed]);

  const roles = user?.roles || (user?.role ? [user.role] : []);
  const isAdmin = roles.includes("admin");
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      show: isAdmin || roles.length > 0,
    },
    { name: "Users", path: "/admin/users", icon: Users, show: isAdmin },
    {
      name: "Books & Categories",
      path: "/admin/books",
      icon: BookOpen,
      show: isAdmin || roles.includes("book_manager"),
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingCart,
      show: isAdmin || roles.includes("order_manager"),
    },
    {
      name: "Printing",
      path: "/admin/printing",
      icon: Printer,
      show: isAdmin || roles.includes("printing_manager"),
    },
    {
      name: "Delivery",
      path: "/admin/delivery",
      icon: Truck,
      show: isAdmin || roles.includes("delivery_manager"),
    },
    {
      name: "Finance",
      path: "/admin/finance",
      icon: Banknote,
      show: isAdmin || roles.includes("finance_manager"),
    },
    {
      name: "Support",
      path: "/admin/support",
      icon: Headphones,
      show: isAdmin || roles.includes("customer_support"),
    },
    {
      name: "Marketing",
      path: "/admin/marketing",
      icon: Megaphone,
      show: isAdmin || roles.includes("marketing_manager"),
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
      show: isAdmin,
    },
    { name: "Logout", path: "/logout", icon: LogOut, show: true },
  ].filter((i) => i.show);

  // Close mobile sidebar when a link is clicked
  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    handleLinkClick();
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-black text-white md:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`h-full fixed top-0 left-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-50
          ${isCollapsed ? "w-20" : "w-64"}
          ${
            isMobile
              ? isMobileOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }
        `}
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
            if (item.name === "Logout") {
              return (
                <button
                  key={item.name}
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-[2px] text-sm font-medium transition-colors text-left
                    text-gray-700 hover:bg-gray-100`}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              );
            }
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={handleLinkClick}
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
    </>
  );
};

export default AdminSidebar;
