import AdminSidebar from "@/components/adminComponents/AdminSidebar";
import { Outlet } from "react-router";

const AdminPage = () => {

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6 border-b border-gray-200 pb-4">
              <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-sm text-gray-600">
                Manage your bookstore from here.
              </p>
            </header>

            {/* Routed Pages will render here */}
            <div className="bg-white border border-gray-200 rounded-[2px] p-6 shadow-sm">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
