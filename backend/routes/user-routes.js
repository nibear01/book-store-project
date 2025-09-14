import express from "express";
import {
    registerUser,
    loginUser,
    getMe,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserRole,
    changeUserStatus
} from "../controllers/user-controllers.js";
import { protect, authorize } from "../middlewares/auth-middleware.js";
import {
    isAdmin,
    canManageUser,
    canDeleteUser,
    canChangeRole,
    canChangeStatus,
    validateAdminAction
} from "../middlewares/admin-middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", protect, getMe);                                    // GET /api/users/me
router.get("/", protect, isAdmin, getAllUsers);                       // GET /api/users (Admin only)
router.get("/:id", protect, canManageUser, getUserById);              // GET /api/users/:id
router.put("/:id", protect, canManageUser, updateUser);               // PUT /api/users/:id
router.delete("/:id", protect, canDeleteUser, deleteUser);            // DELETE /api/users/:id (Admin only)

// Admin only routes
router.put("/:id/role", protect, canChangeRole, validateAdminAction, changeUserRole);     // PUT /api/users/:id/role
router.put("/:id/status", protect, canChangeStatus, validateAdminAction, changeUserStatus); // PUT /api/users/:id/status

export default router;
