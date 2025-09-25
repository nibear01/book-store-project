import express from "express";
import {
    registerUser,
    loginUser,
    loginUserByPhone,
    getMe,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserRole,
    changeUserStatus,
    changeUserPasswordAdmin,
    forgotPassword,
    resetPassword
} from "../controllers/user-controllers.js";
import { getAllowedRoles } from "../controllers/user-controllers.js";
import { protect, authorize } from "../middlewares/auth-middleware.js";
import {
    isAdmin,
    canManageUser,
    canDeleteUser,
    canChangeRole,
    canChangeStatus,
    validateAdminAction
} from "../middlewares/admin-middleware.js";
import { upload } from "../middlewares/upload-middleware.js"; // added

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/login-phone", loginUserByPhone);
router.get("/roles", protect, isAdmin, getAllowedRoles);

// Public password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", protect, getMe);                                    // GET /api/users/me
router.get("/", protect, isAdmin, getAllUsers);                       // GET /api/users (Admin only)
router.get("/:id", protect, canManageUser, getUserById);              // GET /api/users/:id
router.put("/:id", protect, canManageUser, upload.single("profile_image"), updateUser); // PUT /api/users/:id (with image) - modified
router.delete("/:id", protect, canDeleteUser, deleteUser);            // DELETE /api/users/:id (Admin only)

// Admin only routes
router.put("/:id/role", protect, canChangeRole, validateAdminAction, changeUserRole);     // PUT /api/users/:id/role
router.put("/:id/status", protect, canChangeStatus, validateAdminAction, changeUserStatus); // PUT /api/users/:id/status
router.put("/:id/password", protect, isAdmin, changeUserPasswordAdmin); // PUT /api/users/:id/password

export default router;
