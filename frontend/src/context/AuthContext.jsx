/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { userAPI } from "../api/user-api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [loading, setLoading] = useState(false); // renamed for consistency
  const [error, setError] = useState(null);

  // Generic fetch wrapper
  const fetchData = useCallback(async (apiCall, onSuccess) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall();
      if (onSuccess) onSuccess(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is logged in on app load
  useEffect(() => {
    fetchData(async () => {
      if (userAPI.isAuthenticated()) {
        return await userAPI.getMe();
      }
      return null;
    }, (userData) => {
      if (userData) {
        setUser(userData.data);
        setIsAuthenticated(true);
      }
    });
  }, [fetchData]);

  // Login function
  const login = (credentials) =>
    fetchData(
      async () => {
        await userAPI.login(credentials);
        return await userAPI.getMe();
      },
      (userData) => {
        setUser(userData.data);
        setIsAuthenticated(true);
      }
    );

  // Register function
  const register = (userData) =>
    fetchData(
      async () => {
        await userAPI.register(userData);
        return await userAPI.getMe();
      },
      (profile) => {
        setUser(profile.data);
        setIsAuthenticated(true);
      }
    );

  // Logout function
  const logout = () => {
    userAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
