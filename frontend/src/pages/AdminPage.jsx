import AdminSidebar from "@/components/adminComponents/AdminSidebar";
import { Outlet } from "react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const AdminPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile by default
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Close mobile sidebar when resizing to desktop
  useEffect(() => {
    if (!isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [isMobile, isMobileOpen]);

  // Close mobile sidebar when a link is clicked
  const handleContentClick = () => {
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'}
        transition-transform duration-300
      `}>
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 p-4 md:p-6 transition-all duration-300 ${
          isCollapsed && !isMobile ? "ml-20" : "ml-0 md:ml-64"
        }`}
        onClick={handleContentClick}
      >
        <div className="mx-auto">
          {/* Header with mobile menu button */}
          <header className="mb-4 md:mb-6 border-b border-gray-200 pb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button
                    className="p-2 rounded-md bg-black text-white mr-2 md:hidden"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                  >
                    {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                )}
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Admin Panel</h1>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Manage your bookstore from here.
              </p>
            </div>
          </header>

          {/* Routed Pages */}
          <div className="bg-white border border-gray-200 rounded-[2px] p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;