import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BACKEND_URL } from "../api/apiBase";

const AffiliateAdminContext = createContext();

export const useAffiliateAdmin = () => {
  const context = useContext(AffiliateAdminContext);
  if (!context) {
    throw new Error("useAffiliateAdmin must be used within AffiliateAdminProvider");
  }
  return context;
};

export const AffiliateAdminProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const API_URL = BACKEND_URL + "/api/admin/affiliates";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  // Get statistics
  const getStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch statistics");
      return null;
    }
  };

  // Get all affiliates with pagination and filters
  const getAffiliates = async (page = 1, limit = 10, status = "", search = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append("status", status);
      if (search) params.append("q", search);

      const response = await axios.get(`${API_URL}?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.data.success) {
        return {
          data: response.data.data,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
          total: response.data.total,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching affiliates:", error);
      toast.error("Failed to fetch affiliates");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get affiliate by ID
  const getAffiliateById = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching affiliate:", error);
      toast.error("Failed to fetch affiliate details");
      return null;
    }
  };

  // Approve affiliate
  const approveAffiliate = async (id, commissionRate, notes = "") => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/${id}/approve`,
        { commission_rate: commissionRate, admin_notes: notes },
        { headers: getAuthHeaders() }
      );
      if (response.data.success) {
        toast.success("Affiliate approved successfully");
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error approving affiliate:", error);
      toast.error(error.response?.data?.message || "Failed to approve affiliate");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Reject affiliate
  const rejectAffiliate = async (id, reason) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/${id}/reject`,
        { rejection_reason: reason },
        { headers: getAuthHeaders() }
      );
      if (response.data.success) {
        toast.success("Affiliate rejected");
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error rejecting affiliate:", error);
      toast.error(error.response?.data?.message || "Failed to reject affiliate");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Suspend affiliate
  const suspendAffiliate = async (id, notes = "") => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/${id}/suspend`,
        { admin_notes: notes },
        { headers: getAuthHeaders() }
      );
      if (response.data.success) {
        toast.success("Affiliate suspended");
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error suspending affiliate:", error);
      toast.error(error.response?.data?.message || "Failed to suspend affiliate");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update commission rate
  const updateCommissionRate = async (id, commissionRate) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/${id}/commission-rate`,
        { commission_rate: commissionRate },
        { headers: getAuthHeaders() }
      );
      if (response.data.success) {
        toast.success("Commission rate updated successfully");
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error updating commission rate:", error);
      toast.error(error.response?.data?.message || "Failed to update commission rate");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get all withdrawals
  const getWithdrawals = async (page = 1, limit = 10, status = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append("status", status);

      const response = await axios.get(`${API_URL}/withdrawals?${params}`, {
        headers: getAuthHeaders(),
      });

    //   console.log(response);
      
      if (response.data.success) {
        return {
          data: response.data.data,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
          total: response.data.total,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Failed to fetch withdrawals");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Process withdrawal
  const processWithdrawal = async (id, action, notes = "") => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/withdrawals/${id}/process`,
        { status: action === "approve" ? "completed" : "rejected", admin_note: notes },
        { headers: getAuthHeaders() }
      );
      if (response.data.success) {
        toast.success(`Withdrawal ${action === "approve" ? "approved" : "rejected"} successfully`);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast.error(error.response?.data?.message || "Failed to process withdrawal");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get all commissions
  const getCommissions = async (page = 1, limit = 10, status = "", affiliateId = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append("status", status);
      if (affiliateId) params.append("affiliateId", affiliateId);

      const response = await axios.get(`${API_URL}/commissions?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.data.success) {
        return {
          data: response.data.data,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
          total: response.data.total,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching commissions:", error);
      toast.error("Failed to fetch commissions");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    getStats,
    getAffiliates,
    getAffiliateById,
    approveAffiliate,
    rejectAffiliate,
    suspendAffiliate,
    updateCommissionRate,
    getWithdrawals,
    processWithdrawal,
    getCommissions,
  };

  return (
    <AffiliateAdminContext.Provider value={value}>
      {children}
    </AffiliateAdminContext.Provider>
  );
};
