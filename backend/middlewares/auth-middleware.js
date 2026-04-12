import jwt from "jsonwebtoken";
import User from "../models/user-model.js";
import { resolvePolicy } from "../utils/policy-builder.js";

// Generate JWT Token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No user found with this token",
      });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "User account is inactive or suspended",
      });
    }

    req.user = user;
    req.policy = resolvePolicy({ user });
    next();
  } catch (error) {
    // Distinguish between JWT errors and other errors
    const isJWTError = error instanceof jwt.JsonWebTokenError;
    return res.status(isJWTError ? 401 : 500).json({
      success: false,
      message: isJWTError
        ? "Not authorized to access this route"
        : "Error in authentication",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }
    if (roles.length === 0) return next();
    const userRoles = Array.isArray(req.user.roles)
      ? req.user.roles
      : req.user.role
        ? [req.user.role]
        : [];
    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: "User role is not authorized to access this route",
      });
    }
    return next();
  };
};

// Allow any non-"user" role (e.g., admin, managers, author) to proceed
export const requireAnyAdminRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
  const userRoles = Array.isArray(req.user.roles)
    ? req.user.roles
    : req.user.role
      ? [req.user.role]
      : [];
  const hasAnyAdminRole = userRoles.some((r) => r && r !== "user");
  if (!hasAnyAdminRole) {
    return res.status(403).json({
      success: false,
      message: "Admin or manager role required",
    });
  }
  return next();
};
