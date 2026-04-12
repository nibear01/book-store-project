import User from "../models/user-model.js";
import { RolesBuilder, allowedRoles } from "../utils/roles-builder.js";
import Cart from "../models/cart-model.js";
import Wishlist from "../models/wishlist-model.js";
import { generateToken } from "../middlewares/auth-middleware.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import path from "path";
import mongoose from "mongoose"; 
import Review from "../models/review-model.js";
import Book from "../models/book-model.js";
import { getPasswordResetTemplate } from "../utils/email-templates.js";
import bcrypt from "bcrypt";

// @desc    Get allowed roles (Admin only)
// @route   GET /api/users/roles
// @access  Private/Admin
export const getAllowedRoles = async (req, res) => {
    try {
        return res.status(200).json({ success: true, data: allowedRoles });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching roles", error: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        // Check if user already exists by email
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Check if user already exists by phone
        const existingUserByPhone = await User.findOne({ phone });
        if (existingUserByPhone) {
            return res.status(400).json({
                success: false,
                message: "User with this phone number already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const roles = new RolesBuilder().set("user").enforce().build();
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            roles,
        });

        // Generate JWT token
        const token = generateToken(user._id);

        // Exclude password from response
        const { password: _, ...userData } = user.toObject();

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            data: userData
        });
    } catch (error) {
        // Return Mongoose validation errors as 400 instead of 500
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. '),
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: "Error registering user",
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email does not exist. Please check your email address or sign up for a new account."
            });
        }

        // Check password — supports both bcrypt hashes and legacy plain text
        const isBcrypt = user.password && user.password.startsWith('$2');
        let isMatch = false;
        if (isBcrypt) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Legacy plain-text password
            isMatch = user.password === password;
        }
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password. Please check your password and try again."
            });
        }

        // Auto-migrate plain-text password to bcrypt hash (use updateOne to skip full validation)
        if (!isBcrypt) {
            const hashed = await bcrypt.hash(password, 10);
            await User.updateOne({ _id: user._id }, { $set: { password: hashed } });
        }

        // Check if user is active
        if (user.status !== "active") {
            return res.status(401).json({
                success: false,
                message: "Account is inactive or suspended"
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Exclude password from response
        const { password: _, ...userData } = user.toObject();

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: userData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error logging in",
            error: error.message
        });
    }
};

// @desc    Login user by phone
// @route   POST /api/users/login-phone
// @access  Public
export const loginUserByPhone = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ success: false, message: "Phone and password are required" });
        }

        // Find user by phone
        const user = await User.findOne({ phone }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Phone number does not exist. Please check your phone or sign up."
            });
        }

        // Check password — supports both bcrypt hashes and legacy plain text
        const isBcrypt = user.password && user.password.startsWith('$2');
        let isMatch = false;
        if (isBcrypt) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = user.password === password;
        }
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password. Please check your password and try again."
            });
        }

        // Auto-migrate plain-text password to bcrypt hash (use updateOne to skip full validation)
        if (!isBcrypt) {
            const hashed = await bcrypt.hash(password, 10);
            await User.updateOne({ _id: user._id }, { $set: { password: hashed } });
        }

        // Check if user is active
        if (user.status !== "active") {
            return res.status(401).json({
                success: false,
                message: "Account is inactive or suspended"
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Exclude password from response
        const { password: _, ...userData } = user.toObject();

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: userData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error logging in with phone",
            error: error.message
        });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, role, roles, q, sort } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (roles) filter.roles = { $in: Array.isArray(roles) ? roles : [roles] };
        if (role) filter.roles = role; // backward compat

        // Text search on name/email (case-insensitive)
        if (q && typeof q === 'string' && q.trim()) {
            const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'i');
            filter.$or = [
                { name: regex },
                { email: regex },
            ];
        }

        // Sort handling: supports '-createdAt'|'createdAt' or '-created_at'|'created_at'
        let sortSpec = { created_at: -1 };
        if (typeof sort === 'string' && sort.length) {
            const s = sort.trim();
            const desc = s.startsWith('-');
            const field = s.replace(/^-/, '');
            // Map frontend createdAt to schema created_at
            const mapped = field === 'createdAt' ? 'created_at' : field === 'updatedAt' ? 'updated_at' : field;
            sortSpec = { [mapped]: desc ? -1 : 1 };
        }

        const users = await User.find(filter)
            .select('-password')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort(sortSpec);

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalUsers: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user profile",
            error: error.message
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
};

// helper to map absolute file path -> public relative path
const toPublicPath = (file) => {
    if (!file?.path) return undefined;
    const rel = path.relative(process.cwd(), file.path).split(path.sep).join("/");
    return rel.startsWith("/") ? rel : `/${rel}`;
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
    try {
        const { name, email, address, status, role, roles } = req.body;
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }
        }

        // Do not allow role changes through this endpoint
        if (roles !== undefined || role !== undefined) {
            return res.status(403).json({
                success: false,
                message: "Role changes are not allowed here. Use PUT /api/users/:id/role",
            });
        }

        // Build update payload only with provided fields
        const update = {};
        if (name !== undefined) update.name = name;
        if (email !== undefined) update.email = email;
        if (address !== undefined) update.address = address;
        // Only admins can change status
        if (status !== undefined && req.user?.roles?.includes('admin')) update.status = status;
        if (req.body.password !== undefined) {
            update.password = await bcrypt.hash(req.body.password, 10);
        }

        // Handle uploaded profile image
        if (req.file) {
            const publicPath = toPublicPath(req.file);
            if (publicPath) update.profile_image = publicPath;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            update,
            { new: true, runValidators: true }
        ).select("-password");

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Cascade delete: remove the user's cart and wishlist (if any)
        try {
            await Cart.deleteOne({ user: user._id });
        } catch (e) {
            // Log and continue; do not fail the main delete due to cart cleanup
            console.error("Failed to delete cart for user", user._id, e?.message);
        }
        try {
            await Wishlist.deleteOne({ user: user._id });
        } catch (e) {
            console.error("Failed to delete wishlist for user", user._id, e?.message);
        }

        // Cascade: delete reviews by this user and refresh affected books' stats
        try {
            // Find all books this user has reviewed
            const reviewedBookIds = await Review.find({ user: user._id }).distinct("book");
            // Delete all their reviews
            await Review.deleteMany({ user: user._id });
            // Recompute rating and num_reviews for each affected book
            for (const bId of reviewedBookIds) {
                try {
                    const agg = await Review.aggregate([
                        { $match: { book: new mongoose.Types.ObjectId(bId) } },
                        { $group: { _id: "$book", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
                    ]);
                    const avg = agg[0]?.avg || 0;
                    const count = agg[0]?.count || 0;
                    await Book.findByIdAndUpdate(bId, { $set: { rating: Number(avg.toFixed(2)), num_reviews: count } });
                } catch (e) {
                    console.error("Failed to refresh book stats after user review delete", String(bId), e?.message);
                }
            }
        } catch (e) {
            console.error("Failed to delete user reviews", user._id, e?.message);
        }

        res.status(200).json({
            success: true,
            message: "User and associated resources deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};

// @desc    Change user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const changeUserRole = async (req, res) => {
    try {
        const { role, roles } = req.body;
        const userId = req.params.id;

        let nextRoles;
        if (Array.isArray(roles)) {
            nextRoles = roles;
        } else if (role) {
            nextRoles = [role];
        } else {
            return res.status(400).json({ success: false, message: "role(s) required" });
        }

        // Build & enforce with builder
        const target = await User.findById(userId).select("roles");
        if (!target) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let builtRoles;
        try {
            builtRoles = new RolesBuilder()
                .withExisting(target)
                .withActor(req.user?._id)
                .set(nextRoles)
                .enforce()
                .build();
        } catch (e) {
            return res.status(403).json({ success: false, message: e.message || "Invalid role change" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { roles: builtRoles },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `User role changed to ${role}`,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error changing user role",
            error: error.message
        });
    }
};

// @desc    Change user status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
export const changeUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.params.id;

        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be: active, inactive, or suspended"
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { status },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `User status changed to ${status}`,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error changing user status",
            error: error.message
        });
    }
};

// @desc    Change a user's password (Admin only)
// @route   PUT /api/users/:id/password
// @access  Private/Admin
export const changeUserPasswordAdmin = async (req, res) => {
    try {
        const userId = req.params.id;
        const { password } = req.body;

        if (!password || typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password is required and must be at least 8 characters"
            });
        }

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Hash password with bcrypt
        user.password = await bcrypt.hash(password, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "User password updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating user password",
            error: error.message
        });
    }
};

// @desc    Request password reset (send email via Nodemailer)
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) {
            // Do not reveal if user exists
            return res.status(200).json({ success: true, message: "If an account exists, an email has been sent" });
        }

        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        const html = getPasswordResetTemplate({ resetUrl, name: user.name, lang: 'en' });

        await transporter.sendMail({
            from: process.env.SMTP_FROM || "BoiBilash <no-reply@BoiBilash.app>",
            to: email,
            subject: "Reset Your Password - BoiBilash",
            html
        });

        return res.status(200).json({ success: true, message: "Password reset email sent" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error sending reset email", error: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { email, token, password } = req.body;
        if (!email || !token || !password) {
            return res.status(400).json({ success: false, message: "Email, token, and new password are required" });
        }

        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const user = await User.findOne({ email, resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({ success: true, message: "Password has been reset" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error resetting password", error: error.message });
    }
};
