/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
  const [activeRole, setActiveRole] = useState("user");
  const [roles, setRoles] = useState([]); // all roles assigned to user

  const [loading, setLoading] = useState(false); // renamed for consistency
  const [isLoading, setIsLoading] = useState(false); // global indicator for top-level UI
  const [error, setError] = useState(null);

  // Generic fetch wrapper
  const fetchData = useCallback(async (apiCall, onSuccess) => {
    setLoading(true);
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, []);

  // Fallback login using env base URL if userAPI.login fails to fetch (network/CORS/baseurl)
  const fallbackLogin = useCallback(async (credentials) => {
    const base = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
    // Same backend routes the primary login uses (phone or email)
    const endpoint = `${base || ""}/api/users/${credentials?.phone ? "login-phone" : "login"}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || "Login failed");
    }
    // Persist token if present so other API clients can use it
    const token =
      data?.token ||
      data?.accessToken ||
      data?.data?.token ||
      data?.data?.accessToken;
    if (token) {
      localStorage.setItem("token", token);
    }
    return data;
  }, []);

  // Check if user is logged in on app load
  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const checkAuth = async () => {
      if (abortController.signal.aborted) return;
      
      setLoading(true);
      setIsLoading(true);
      setError(null);
      
      try {
        if (userAPI.isAuthenticated()) {
          const userData = await userAPI.getMe();
          
          if (mounted && userData && !abortController.signal.aborted) {
            setUser(userData.data);
            setIsAuthenticated(true);
            const rolesArr =
              userData.data?.roles ||
              (userData.data?.role ? [userData.data.role] : []);
            setRoles(rolesArr);
            const stored = localStorage.getItem("activeRole");
            const initial =
              stored && rolesArr.includes(stored)
                ? stored
                : rolesArr.includes("user")
                ? "user"
                : rolesArr[0] || "user";
            setActiveRole(initial);
          }
        }
      } catch (err) {
        // If token is invalid/expired, clear auth state
        if (err?.message?.includes("token") || err?.message?.includes("Unauthorized") || err?.message?.includes("No user found")) {
          if (mounted && !abortController.signal.aborted) {
            localStorage.removeItem("token");
            localStorage.removeItem("activeRole");
            setUser(null);
            setIsAuthenticated(false);
            setRoles([]);
            setActiveRole("user");
          }
        } else if (mounted && !abortController.signal.aborted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  // Login function (stable reference)
  const login = useCallback(
    (credentials) =>
      fetchData(
        async () => {
          try {
            await userAPI.login(credentials);
          } catch (err) {
            if (
              err?.name === "TypeError" ||
              (typeof err?.message === "string" && err.message.toLowerCase().includes("failed to fetch"))
            ) {
              await fallbackLogin(credentials);
            } else {
              throw err;
            }
          }
          return await userAPI.getMe();
        },
        (userData) => {
          setUser(userData.data);
          setIsAuthenticated(true);
          const rolesArr = userData.data?.roles || (userData.data?.role ? [userData.data.role] : []);
          setRoles(rolesArr);
          const initial = rolesArr.includes("user") ? "user" : rolesArr[0] || "user";
          setActiveRole(initial);
          localStorage.setItem("activeRole", initial);
        }
      ),
    [fetchData, fallbackLogin]
  );

  // Register function (stable)
  const register = useCallback(
    (userData) =>
      fetchData(
        async () => {
          await userAPI.register(userData);
          return await userAPI.getMe();
        },
        (profile) => {
          setUser(profile.data);
          setIsAuthenticated(true);
        }
      ),
    [fetchData]
  );

  // Logout function (stable)
  const logout = useCallback(() => {
    userAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    setLoading(false);
    setActiveRole("user");
    setRoles([]);
  }, []);

  // Update user profile (stable)
  const updateUser = useCallback(
    (updatedUser) => {
      setUser(updatedUser);
      const rolesArr = updatedUser?.roles || (updatedUser?.role ? [updatedUser.role] : []);
      setRoles(rolesArr);
      if (!rolesArr.includes(activeRole)) {
        const next = rolesArr.includes("user") ? "user" : rolesArr[0] || "user";
        setActiveRole(next);
        localStorage.setItem("activeRole", next);
      }
    },
    [activeRole]
  );

  const switchRole = useCallback(
    (role) => {
      const rolesArr = roles.length ? roles : (user?.roles || (user?.role ? [user.role] : []));
      if (!rolesArr.includes(role)) return false;
      setActiveRole(role);
      localStorage.setItem("activeRole", role);
      return true;
    },
    [roles, user]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      isLoading,
      setIsLoading,
      error,
      login,
      register,
      logout,
      updateUser,
      activeRole,
      roles,
      switchRole,
    }),
    [user, isAuthenticated, loading, isLoading, error, login, register, logout, updateUser, activeRole, roles, switchRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
