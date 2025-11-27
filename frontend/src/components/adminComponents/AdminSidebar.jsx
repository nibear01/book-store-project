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
  Users2,
  Building2,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  PenTool,
  ClipboardList,
  FileText,
  UserPlus,
  UserCog,
  FilePlus,
  Package,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const CategorySection = ({ 
  title, 
  // eslint-disable-next-line no-unused-vars
  icon: Icon, 
  children, 
  isCollapsed, 
  isExpanded, 
  onToggle 
}) => {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
        title={isCollapsed ? title : undefined}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-gray-600" />
          {!isCollapsed && <span>{title}</span>}
        </div>
        {!isCollapsed && (
          <ChevronRight
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        )}
      </button>
      {isExpanded && !isCollapsed && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
          {children}
        </div>
      )}
    </div>
  );
};

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    users: false,
    requests: false,
    printBook: false,
    settings: false,
  });

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
  const isBookManager = roles.includes("book_manager");
  const canManagePricing = isAdmin || isBookManager;
  const hasAnyAdminRole = roles.some((r) => r && r !== "user");

  // Dashboard - standalone
  const dashboardItem = {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    show: isAdmin,
  };

  // Author Panel - standalone for authors
  const authorPanelItem = {
    name: "Author Panel",
    path: "/admin/author",
    icon: PenTool,
    show: roles.includes("author"),
  };

  // User Management Category
  const userManagementItems = [
    { name: "Users", path: "/admin/users", icon: Users, show: isAdmin },
    { name: "Affiliates", path: "/admin/affiliates", icon: Users2, show: isAdmin },
    { name: "Authors", path: "/admin/authors", icon: PenTool, show: isAdmin },
    { name: "Publishers", path: "/admin/publishers", icon: Building2, show: isAdmin || roles.includes("book_manager") },
    { name: "Subscribers", path: "/admin/subscribers", icon: UserPlus, show: isAdmin },
  ].filter((i) => i.show);

  // Request Management Category
  const requestManagementItems = [
    { name: "Author Requests", path: "/admin/author-requests", icon: ClipboardList, show: isAdmin },
    { name: "Book Requests", path: "/admin/book-requests", icon: FileText, show: isAdmin },
  ].filter((i) => i.show);

  // Print & Book Operations Category
  const printBookItems = [
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart, show: isAdmin || roles.includes("order_manager") },
    { name: "Support", path: "/admin/support", icon: Headphones, show: isAdmin || roles.includes("customer_support") },
    { name: "Finance", path: "/admin/finance", icon: Banknote, show: isAdmin || roles.includes("finance_manager") },
    { name: "Printing", path: "/admin/printing", icon: Printer, show: isAdmin || roles.includes("printing_manager") },
    { name: "Delivery", path: "/admin/delivery", icon: Truck, show: isAdmin || roles.includes("delivery_manager") },
  ].filter((i) => i.show);

  // Settings Management Category
  const settingsManagementItems = [
    { name: "Profile Settings", path: "/admin/settings/profile", icon: UserCog, show: hasAnyAdminRole },
    { name: "Print-on-Demand", path: "/admin/settings/print-on-demand", icon: Printer, show: canManagePricing },
    { name: "Delivery Cost", path: "/admin/settings/delivery-cost", icon: Truck, show: canManagePricing },
    { name: "Price Range", path: "/admin/settings/price-range", icon: Settings, show: canManagePricing },
  ].filter((i) => i.show);

  // Other standalone items
  const standaloneItems = [
    { name: "Books & Categories", path: "/admin/books", icon: BookOpen, show: isAdmin || roles.includes("book_manager") },
    { name: "Marketing", path: "/admin/marketing", icon: Megaphone, show: isAdmin || roles.includes("marketing_manager") },
  ].filter((i) => i.show);

  // Auto-expand categories when their items are active or when sidebar expands
  useEffect(() => {
    // Only run on initial load or when sidebar collapse state changes
    if (isCollapsed) {
      // Collapse all when sidebar is collapsed
      setExpandedCategories({
        users: false,
        requests: false,
        printBook: false,
        settings: false,
      });
      return;
    }

    // Check if current path matches any item in the categories
    const isUserManagementActive = userManagementItems.some(item => 
      location.pathname === item.path || location.pathname.startsWith(item.path + "/")
    );
    const isRequestManagementActive = requestManagementItems.some(item => 
      location.pathname === item.path || location.pathname.startsWith(item.path + "/")
    );
    const isPrintBookActive = printBookItems.some(item => 
      location.pathname === item.path || location.pathname.startsWith(item.path + "/")
    );
    const isSettingsActive = settingsManagementItems.some(item => 
      location.pathname === item.path || location.pathname.startsWith(item.path + "/")
    );

    // Only update if a category should be expanded due to active route
    // Don't collapse categories that are already open
    setExpandedCategories(prev => ({
      users: prev.users || isUserManagementActive,
      requests: prev.requests || isRequestManagementActive,
      printBook: prev.printBook || isPrintBookActive,
      settings: prev.settings || isSettingsActive,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isCollapsed]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

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
              {/* <Link to="/" className="flex items-center"> */}
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                BOOK<span className="text-red-500">S</span>TOP
              </span>
              {/* </Link> */}
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
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {/* Dashboard */}
          {dashboardItem.show && (
            <Link
              to={dashboardItem.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                ${
                  location.pathname === dashboardItem.path || location.pathname.startsWith(dashboardItem.path + "/")
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              title={isCollapsed ? dashboardItem.name : undefined}
            >
              <dashboardItem.icon className="w-5 h-5" />
              {!isCollapsed && <span>{dashboardItem.name}</span>}
            </Link>
          )}

          {/* Author Panel */}
          {authorPanelItem.show && (
            <Link
              to={authorPanelItem.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                ${
                  location.pathname === authorPanelItem.path || location.pathname.startsWith(authorPanelItem.path + "/")
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              title={isCollapsed ? authorPanelItem.name : undefined}
            >
              <authorPanelItem.icon className="w-5 h-5" />
              {!isCollapsed && <span>{authorPanelItem.name}</span>}
            </Link>
          )}

          {/* User Management Category */}
          {userManagementItems.length > 0 && (
            <CategorySection
              title="User Management"
              icon={UserCog}
              isCollapsed={isCollapsed}
              isExpanded={expandedCategories.users}
              onToggle={() => toggleCategory('users')}
            >
              {userManagementItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                      ${
                        active
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </CategorySection>
          )}

          {/* Request Management Category */}
          {requestManagementItems.length > 0 && (
            <CategorySection
              title="Requests"
              icon={FilePlus}
              isCollapsed={isCollapsed}
              isExpanded={expandedCategories.requests}
              onToggle={() => toggleCategory('requests')}
            >
              {requestManagementItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                      ${
                        active
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </CategorySection>
          )}

          {/* Print & Book Operations Category */}
          {printBookItems.length > 0 && (
            <CategorySection
              title="Print & Book Operations"
              icon={Package}
              isCollapsed={isCollapsed}
              isExpanded={expandedCategories.printBook}
              onToggle={() => toggleCategory('printBook')}
            >
              {printBookItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                      ${
                        active
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    name={item.path === "/admin/orders" ? "admin-nav-orders" : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </CategorySection>
          )}
          
          {/* Books & Other Standalone Items */}
          {standaloneItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          {/* Settings Management Category */}
          {settingsManagementItems.length > 0 && (
            <CategorySection
              title="Settings"
              icon={Settings}
              isCollapsed={isCollapsed}
              isExpanded={expandedCategories.settings}
              onToggle={() => toggleCategory('settings')}
            >
              {settingsManagementItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                      ${
                        active
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </CategorySection>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 my-2" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all text-gray-700 hover:bg-red-50 hover:text-red-600"
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;