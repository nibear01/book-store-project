import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";

const AffiliateContext = createContext();

export const useAffiliate = () => {
  const context = useContext(AffiliateContext);
  if (!context) {
    throw new Error("useAffiliate must be used within an AffiliateProvider");
  }
  return context;
};

export const AffiliateProvider = ({ children }) => {
  const [affiliate, setAffiliate] = useState(null);
  const [isAffiliateAuthenticated, setIsAffiliateAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [affiliateToken, setAffiliateToken] = useState(
    localStorage.getItem("affiliateToken") || null
  );
  const [skipProfileFetch, setSkipProfileFetch] = useState(false);
  const tokenRef = useRef(affiliateToken);

  // Keep ref in sync with state
  useEffect(() => {
    tokenRef.current = affiliateToken;
  }, [affiliateToken]);

  // Base URL for API
  const API_URL = import.meta.env.VITE_BACKEND_URL + "/api/affiliates";

  // Save token to localStorage when it changes
  useEffect(() => {
    if (affiliateToken) {
      localStorage.setItem("affiliateToken", affiliateToken);
    } else {
      localStorage.removeItem("affiliateToken");
    }
  }, [affiliateToken]);

  // Fetch affiliate profile on mount if token exists
  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const fetchAffiliateProfile = async () => {
      if (!affiliateToken) {
        if (mounted) setIsLoading(false);
        return;
      }

      // Skip fetch if we just logged in and already have the data
      if (skipProfileFetch) {
        setSkipProfileFetch(false);
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${affiliateToken}` },
          signal: abortController.signal,
        });

        if (mounted && response.data.success && !abortController.signal.aborted) {
          setAffiliate(response.data.data);
          setIsAffiliateAuthenticated(true);
        }
      } catch (error) {
        // Ignore aborted requests
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          return;
        }
        // Silently clear invalid/expired token without logging error
        // This is normal behavior when tokens expire or are invalidated
        if (mounted) {
          setAffiliateToken(null);
          setAffiliate(null);
          setIsAffiliateAuthenticated(false);
          localStorage.removeItem("affiliateToken");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAffiliateProfile();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [affiliateToken]);

  // Register affiliate
  const register = useCallback(async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  }, [API_URL]);

  // Login affiliate
  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, data } = response.data;
        setSkipProfileFetch(true); // Skip the profile fetch since we already have the data
        setAffiliate(data);
        setIsAffiliateAuthenticated(true);
        setAffiliateToken(token);
        setIsLoading(false);

        return {
          success: true,
          message: response.data.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  }, [API_URL]);

  // Logout affiliate
  const logout = useCallback(() => {
    setAffiliateToken(null);
    setAffiliate(null);
    setIsAffiliateAuthenticated(false);
    localStorage.removeItem("affiliateToken");
  }, []);

  // Update affiliate profile
  const updateProfile = useCallback(async (formData) => {
    if (!affiliateToken) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    try {
      const response = await axios.put(`${API_URL}/profile`, formData, {
        headers: { Authorization: `Bearer ${affiliateToken}` },
      });

      if (response.data.success) {
        setAffiliate(response.data.data);
        return {
          success: true,
          message: response.data.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Update failed",
      };
    }
  }, [API_URL, affiliateToken]);

  // Get dashboard stats
  const getDashboardStats = useCallback(async () => {
    const currentToken = tokenRef.current;
    if (!currentToken) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    try {
      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }
    } catch (error) {
      // If unauthorized, clear the session
      if (error.response?.status === 401) {
        logout();
      }
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch dashboard",
      };
    }
  }, [API_URL]);

  // Get commissions
  const getCommissions = useCallback(async (page = 1, limit = 10, status = null) => {
    if (!affiliateToken) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    try{
      const params = new URLSearchParams({ page, limit });
      if (status) params.append("status", status);

      const response = await axios.get(`${API_URL}/commissions?${params}`, {
        headers: { Authorization: `Bearer ${affiliateToken}` },
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
          total: response.data.total,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch commissions",
      };
    }
  }, [API_URL, affiliateToken]);

  // Request withdrawal
  const requestWithdrawal = useCallback(async (amount, note) => {
    if (!affiliateToken) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    try {
      const response = await axios.post(
        `${API_URL}/withdrawals`,
        { amount, affiliate_note: note },
        {
          headers: { Authorization: `Bearer ${affiliateToken}` },
        }
      );

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Withdrawal request failed",
      };
    }
  }, [API_URL, affiliateToken]);

  // Get withdrawals
  const getWithdrawals = useCallback(async (page = 1, limit = 10, status = null) => {
    if (!affiliateToken) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append("status", status);

      const response = await axios.get(`${API_URL}/withdrawals?${params}`, {
        headers: { Authorization: `Bearer ${affiliateToken}` },
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
          total: response.data.total,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch withdrawals",
      };
    }
  }, [API_URL, affiliateToken]);

  const value = useMemo(
    () => ({
      affiliate,
      isAffiliateAuthenticated,
      isLoading,
      register,
      login,
      logout,
      updateProfile,
      getDashboardStats,
      getCommissions,
      requestWithdrawal,
      getWithdrawals,
    }),
    [affiliate, isAffiliateAuthenticated, isLoading, register, login, logout, updateProfile, getDashboardStats, getCommissions, requestWithdrawal, getWithdrawals]
  );

  return (
    <AffiliateContext.Provider value={value}>
      {children}
    </AffiliateContext.Provider>
  );
};
