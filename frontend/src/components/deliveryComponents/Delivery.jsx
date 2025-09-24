import React, { useState, useEffect } from 'react';

// A single, self-contained React component for a Delivery Management dashboard.
const Delivery = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [sortBy, setSortBy] = useState('Delivery Date');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);

  // Sample data to simulate an API response.
  const sampleData = [
    { id: 'DEL-1758652230611', customer: 'Norah Al-Ajam - Niki', total: '$120.50', date: '2023-09-26', status: 'Delivered', driver: 'John Doe' },
    { id: 'DEL-1758652230612', customer: 'Jane Doe', total: '$75.00', date: '2023-09-25', status: 'Shipped', driver: 'Jane Smith' },
    { id: 'DEL-1758652230613', customer: 'John Smith', total: '$200.00', date: '2023-09-27', status: 'Pending', driver: 'N/A' },
    { id: 'DEL-1758652230614', customer: 'Emily White', total: '$45.75', date: '2023-09-24', status: 'Delivered', driver: 'Mike Davis' },
    { id: 'DEL-1758652230615', customer: 'Michael Brown', total: '$90.00', date: '2023-09-28', status: 'Cancelled', driver: 'N/A' },
  ];

  // Simulate fetching data on component mount.
  useEffect(() => {
    // Simulate network delay
    setTimeout(() => {
      setDeliveries(sampleData);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort deliveries whenever state changes.
  useEffect(() => {
    let results = [...deliveries];
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(delivery =>
        Object.values(delivery).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by status
    if (statusFilter !== 'All Status') {
      results = results.filter(delivery => delivery.status === statusFilter);
    }

    // Filter by date range
    if (dateFilter === 'Today') {
      results = results.filter(delivery => delivery.date === today);
    } else if (dateFilter === 'Last 1 Day') {
      const oneDayAgo = new Date(now);
      oneDayAgo.setDate(now.getDate() - 1);
      results = results.filter(delivery => new Date(delivery.date) >= oneDayAgo);
    } else if (dateFilter === 'Last 7 Days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      results = results.filter(delivery => new Date(delivery.date) >= sevenDaysAgo);
    } else if (dateFilter === 'Last 15 Days') {
      const fifteenDaysAgo = new Date(now);
      fifteenDaysAgo.setDate(now.getDate() - 15);
      results = results.filter(delivery => new Date(delivery.date) >= fifteenDaysAgo);
    } else if (dateFilter === 'Last 30 Days') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      results = results.filter(delivery => new Date(delivery.date) >= thirtyDaysAgo);
    } else if (dateFilter === 'Custom Range') {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      results = results.filter(delivery => {
        const deliveryDate = new Date(delivery.date);
        const isAfterStart = start ? deliveryDate >= start : true;
        const isBeforeEnd = end ? deliveryDate <= end : true;
        return isAfterStart && isBeforeEnd;
      });
    }

    // Sort the results based on the 'Sort By' and 'Order' selections.
    if (sortBy === 'Delivery Date') {
      results.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'Newest First' ? dateB - dateA : dateA - dateB;
      });
    } else if (sortBy === 'Total Amount') {
      results.sort((a, b) => {
        const totalA = parseFloat(a.total.replace('$', ''));
        const totalB = parseFloat(b.total.replace('$', ''));
        return sortOrder === 'Newest First' ? totalB - totalA : totalA - totalB;
      });
    } else if (sortBy === 'Customer Name') {
      results.sort((a, b) => {
        const nameA = a.customer.split(' - ')[0].toLowerCase();
        const nameB = b.customer.split(' - ')[0].toLowerCase();
        return sortOrder === 'Newest First' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
      });
    }

    setFilteredDeliveries(results);
  }, [searchTerm, statusFilter, dateFilter, sortBy, sortOrder, deliveries, startDate, endDate]);

  // Function to get the color for the status pill.
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to handle status change
  const handleStatusChange = (id, newStatus) => {
    const updatedDeliveries = deliveries.map(delivery =>
      delivery.id === id ? { ...delivery, status: newStatus } : delivery
    );
    setDeliveries(updatedDeliveries);
    setActiveDropdown(null); // Close the dropdown after selection
  };
  
  // Handle date filter change and toggle custom range inputs
  const handleDateFilterChange = (e) => {
    const value = e.target.value;
    setDateFilter(value);
    if (value === 'Custom Range') {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
      setStartDate('');
      setEndDate('');
    }
  };

  // Function to toggle the dropdown
  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-medium text-gray-500">Loading deliveries...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          Delivery Management
        </h1>
        <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
          Manage and track all customer deliveries in real-time.
        </p>

        {/* Search/Filter Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, email, phone, or delivery ID"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter and Sort options */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <select
              className="p-2 border border-gray-300 rounded-lg text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {['All Status', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Date Range</span>
            <select
              className="p-2 border border-gray-300 rounded-lg text-sm"
              value={dateFilter}
              onChange={handleDateFilterChange}
            >
              <option>All Dates</option>
              <option>Today</option>
              <option>Last 1 Day</option>
              <option>Last 7 Days</option>
              <option>Last 15 Days</option>
              <option>Last 30 Days</option>
              <option>Custom Range</option>
            </select>
          </div>
          {showCustomRange && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort By</span>
            <select
              className="p-2 border border-gray-300 rounded-lg text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Delivery Date</option>
              <option>Total Amount</option>
              <option>Customer Name</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Order</span>
            <select
              className="p-2 border border-gray-300 rounded-lg text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
          </div>
          <button
            className="ml-auto px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All Status');
              setDateFilter('All Dates');
              setSortBy('Delivery Date');
              setSortOrder('Newest First');
              setShowCustomRange(false);
              setStartDate('');
              setEndDate('');
            }}
          >
            Refresh Deliveries
          </button>
        </div>

        {/* Delivery List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                  Delivery Info
                </th>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="hidden sm:table-cell px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="hidden md:table-cell px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date (BD Time)
                </th>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
             
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                      {delivery.id}
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500">
                      {delivery.customer}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500">
                      {delivery.total}
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500">
                      {delivery.date}
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm relative">
                      <button
                        onClick={() => toggleDropdown(delivery.id)}
                        className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(delivery.status)} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                      >
                        {delivery.status}
                        <svg className="-mr-1 ml-1 h-4 w-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                        </svg>
                      </button>
                      {activeDropdown === delivery.id && (
                        <div className="absolute z-10 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            {['Pending', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(delivery.id, status)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
               
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500 text-sm">
                    No deliveries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredDeliveries.length} of {deliveries.length} deliveries
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
