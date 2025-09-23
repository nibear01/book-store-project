import User from "../models/user-model.js";

// Check if user is admin
export const isAdmin = async (req, res, next) => {
    try {
        // Check if user exists and is admin
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required. You don't have permission to access this resource."
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking admin status",
            error: error.message
        });
    }
};

// Check if user can manage other users (admin or self)
export const canManageUser = async (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id.toString();

        // Admin can manage any user
        if (req.user.role === "admin") {
            return next();
        }

        // Users can only manage themselves
        if (targetUserId === currentUserId) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "You can only manage your own profile"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking user management permissions",
            error: error.message
        });
    }
};

// Check if user can delete other users (admin only)
export const canDeleteUser = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only administrators can delete users"
            });
        }

        // Prevent admin from deleting themselves
        const targetUserId = req.params.id;
        const currentUserId = req.user._id.toString();

        if (targetUserId === currentUserId) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking delete permissions",
            error: error.message
        });
    }
};

// Check if user can change roles (admin only)
export const canChangeRole = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only administrators can change user roles"
            });
        }

        // Note: Self role changes allowed for this project setup

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking role change permissions",
            error: error.message
        });
    }
};

// Check if user can change status (admin only)
export const canChangeStatus = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only administrators can change user status"
            });
        }

        // Prevent admin from changing their own status
        const targetUserId = req.params.id;
        const currentUserId = req.user._id.toString();

        if (targetUserId === currentUserId) {
            return res.status(400).json({
                success: false,
                message: "You cannot change your own status"
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking status change permissions",
            error: error.message
        });
    }
};

// Validate admin actions
export const validateAdminAction = async (req, res, next) => {
    try {
        const { action } = req.body;

        // Define allowed admin actions
        const allowedActions = ['activate', 'deactivate', 'suspend', 'promote', 'demote'];

        if (action && !allowedActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message: `Invalid action. Allowed actions: ${allowedActions.join(', ')}`
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error validating admin action",
            error: error.message
        });
    }
};
