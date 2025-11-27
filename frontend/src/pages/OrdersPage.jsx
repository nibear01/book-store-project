// src/pages/Admin/OrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllOrders, updateOrderStatus, importOrdersFromCSV } from '../../api/order-api';
import OrderTable from '../../components/OrderTable';
import OrderFilters from '../../components/OrderFilters';
import FileUpload from '../../components/FileUpload';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const OrdersPage = () => {
  const { t } = useTranslation('common');
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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllOrders(filters);
      setOrders(data.list);
      setTotalPages(data.pages);
    } catch (err) {
      setError(err.response?.data?.error || t('adminOrders.failedToFetch'));
      toast.error(t('adminOrders.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // Fetch when filters change

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
      toast.success(t('adminOrders.orderStatusUpdated'));
    } catch (err) {
      toast.error(`${t('adminOrders.failedToUpdate')}: ${err.message}`);
    }
  };

  const handleCSVImport = async (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const result = await importOrdersFromCSV(formData);
      toast.success(`${t('adminOrders.ordersImported')}: ${result.message}`);
      fetchOrders(); // Refresh the order list
    } catch (err) {
      toast.error(err.response?.data?.error || t('adminOrders.failedToImport'));
    }
  };

  return (
    <div className="admin-orders-page">
      <h2>{t('adminOrders.manageOrders')}</h2>

      {/* CSV Import Section */}
      <div className="csv-import-section">
        <h3>{t('adminOrders.importOrders')}</h3>
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
