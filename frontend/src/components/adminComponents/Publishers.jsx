import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Building2, Edit, Trash2, BookOpen } from "lucide-react";
import { toast } from "react-toastify";
import * as publisherApi from "../../api/publisher-api";
import PublisherModal from "./publishers/PublisherModal";
import PublisherDetailsModal from "./publishers/PublisherDetailsModal";
import DeleteConfirmModal from "./books/DeleteConfirmModal";
import Pagination from "./common/Pagination";

const API_BASE =
  import.meta.env.VITE_BACKEND_URL || "http://192.168.0.104:5000";

// Loading Skeleton Component
const PublisherCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="flex items-start gap-3">
      {/* Logo skeleton */}
      <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded-md"></div>

      {/* Content skeleton */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="flex items-center gap-2">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  </div>
);

// Publisher Card Component (Memoized)
const PublisherCard = React.memo(
  ({ publisher, onViewDetails, onEdit, onDelete, getLogoUrl }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
          {publisher.logo ? (
            <img
              src={getLogoUrl(publisher.logo)}
              alt={publisher.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {publisher.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                ID: {publisher.publisher_id}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                publisher.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {publisher.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          {publisher.country && (
            <p className="text-sm text-gray-600 mt-1">📍 {publisher.country}</p>
          )}

          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
            <BookOpen className="w-4 h-4" />
            <span>{publisher.books?.length || 0} books</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onViewDetails(publisher)}
              className="text-sm text-black hover:text-gray-700 font-medium cursor-pointer transition-colors"
            >
              View Details
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => onEdit(publisher)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Edit publisher"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(publisher)}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
              aria-label="Delete publisher"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

PublisherCard.displayName = "PublisherCard";

const Publishers = () => {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    limit: 10,
  });

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [detailsPublisher, setDetailsPublisher] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });

  const pageSize = 10;

  // Fetch publishers with useCallback for optimization
  const fetchPublishers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
      };
      if (search.trim()) params.q = search.trim();

      const response = await publisherApi.getPublishers(params);
      setPublishers(response.data || []);
      setPagination(response.pagination || { total: 0, pages: 1, limit: 10 });
    } catch (error) {
      console.error("Failed to fetch publishers:", error);
      toast.error("Failed to load publishers");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, search]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchPublishers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  // Debounce search and reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchPublishers();
      } else {
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleAdd = useCallback(() => {
    setSelectedForEdit(null);
    setShowAddModal(true);
  }, []);

  const handleEdit = useCallback((publisher) => {
    setSelectedForEdit(publisher);
    setShowAddModal(true);
  }, []);

  const handleDelete = useCallback((publisher) => {
    setConfirm({
      open: true,
      id: publisher._id,
      name: publisher.name,
    });
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      await publisherApi.deletePublisher(confirm.id, false);
      toast.success("Publisher deactivated successfully");
      fetchPublishers();
      setConfirm({ open: false, id: null, name: "" });
    } catch (error) {
      console.error("Failed to delete publisher:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete publisher"
      );
    }
  }, [confirm.id, fetchPublishers]);

  const handleSuccess = useCallback(() => {
    fetchPublishers();
    setShowAddModal(false);
    setSelectedForEdit(null);
  }, [fetchPublishers]);

  const handleViewDetails = useCallback((publisher) => {
    setDetailsPublisher(publisher);
  }, []);

  const getLogoUrl = useCallback((logo) => {
    if (!logo) return null;
    if (logo.startsWith("http")) return logo;
    return `${API_BASE}/${logo}`;
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Publishers</h2>
            <p className="text-gray-600 text-sm mt-1">Manage book publishers</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Publisher</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search publishers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      {!loading && publishers.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {publishers.length} of {pagination.total} publishers
        </div>
      )}

      {/* Loading State with Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[...Array(6)].map((_, idx) => (
            <PublisherCardSkeleton key={idx} />
          ))}
        </div>
      ) : publishers.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No publishers found</p>
        </div>
      ) : (
        <>
          {/* Publishers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {publishers.map((publisher) => (
              <PublisherCard
                key={publisher._id}
                publisher={publisher}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getLogoUrl={getLogoUrl}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <PublisherModal
          open={showAddModal}
          initialPublisher={selectedForEdit}
          onClose={() => {
            setShowAddModal(false);
            setSelectedForEdit(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {detailsPublisher && (
        <PublisherDetailsModal
          open={!!detailsPublisher}
          publisher={detailsPublisher}
          onClose={() => setDetailsPublisher(null)}
          onEdit={() => {
            handleEdit(detailsPublisher);
            setDetailsPublisher(null);
          }}
          onRefresh={fetchPublishers}
        />
      )}

      {confirm.open && (
        <DeleteConfirmModal
          open={confirm.open}
          itemName={confirm.name}
          itemType="publisher"
          onConfirm={confirmDelete}
          onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        />
      )}
    </div>
  );
};

export default Publishers;
