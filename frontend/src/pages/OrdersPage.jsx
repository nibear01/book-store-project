// src/pages/Admin/OrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, importOrdersFromCSV } from '../../api/order-api';
import OrderTable from '../../components/OrderTable';
import OrderFilters from '../../components/OrderFilters';
import FileUpload from '../../components/FileUpload';
import { toast } from 'react-toastify'; // Assuming toast library is used

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    orderNumber: '',
    startDate: '',
    endDate: '',
  });
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllOrders(filters);
      setOrders(data.list);
      setTotalPages(data.pages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]); // Fetch when filters change

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, { status: newStatus });
      setOrders(prevOrders =>
        prevOrders.map(order => order._id === orderId ? updatedOrder : order)
      );
      toast.success('Order status updated');
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const handleCSVImport = async (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const result = await importOrdersFromCSV(formData);
      toast.success(`Orders imported: ${result.message}`);
      fetchOrders(); // Refresh the order list
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to import CSV');
    }
  };

  return (
    <div className="admin-orders-page">
      <h2>Manage Orders</h2>

      {/* CSV Import Section */}
      <div className="csv-import-section">
        <h3>Import Orders from CSV</h3>
        <FileUpload onFileUpload={handleCSVImport} accept=".csv" />
      </div>

      {/* Filters Section */}
      <OrderFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Orders Table */}
      <OrderTable
        orders={orders}
        loading={loading}
        onStatusChange={handleStatusUpdate}
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default OrdersPage;
