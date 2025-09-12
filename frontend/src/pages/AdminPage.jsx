import AdminSidebar from "@/components/adminComponents/AdminSidebar";
import { Outlet } from "react-router";
import { useState } from "react";

const AdminPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <div
        className={`flex-1 p-6 transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className=" mx-auto">
          {/* Header */}
          <header className="mb-6 border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-sm text-gray-600">
              Manage your bookstore from here.
            </p>
          </header>

          {/* Routed Pages */}
          <div className="bg-white border border-gray-200 rounded-[2px] p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
