import jwt from "jsonwebtoken";
import Affiliate from "../models/affiliate-model.js";

// Middleware to protect affiliate routes
export const protectAffiliate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

      // Get affiliate from token (token contains userId field)
      const affiliate = await Affiliate.findById(decoded.userId).select("-password");

      if (!affiliate) {
        return res.status(401).json({
          success: false,
          message: "Affiliate not found",
        });
      }

      // Check if affiliate is active
      if (affiliate.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Affiliate account is not active",
        });
      }

      // Attach affiliate to request
      req.affiliateId = affiliate._id;
      req.affiliate = affiliate;

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  } catch (error) {
    console.error("Error in protectAffiliate middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
      error: error.message,
    });
  }
};

// Middleware to check if affiliate is active
export const checkAffiliateStatus = async (req, res, next) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliateId);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found 2",
      });
    }

    if (affiliate.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended",
      });
    }

    if (affiliate.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your application was rejected",
      });
    }

    if (affiliate.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending approval",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking affiliate status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
