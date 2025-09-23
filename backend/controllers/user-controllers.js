import User from "../models/user-model.js";
import Cart from "../models/cart-model.js";
import { generateToken } from "../middlewares/auth-middleware.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import path from "path"; // added

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

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            address,
            role: "user"
        });

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            data: user
        });
    } catch (error) {
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
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email does not exist. Please check your email address or sign up for a new account."
            });
        }

        // Check password (simple comparison since no bcrypt)
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password. Please check your password and try again."
            });
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

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: user
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
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Phone number does not exist. Please check your phone or sign up."
            });
        }

        // Check password (plain text in current implementation)
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password. Please check your password and try again."
            });
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

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: user
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
        const { page = 1, limit = 10, status, role } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (role) filter.role = role;

        const users = await User.find(filter)
            // NOTE: Including password for testing purposes as requested
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ created_at: -1 });

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
        const { name, email, address, status, role } = req.body;
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

        // Build update payload only with provided fields
        const update = {};
        if (name !== undefined) update.name = name;
        if (email !== undefined) update.email = email;
        if (address !== undefined) update.address = address;
        if (status !== undefined) update.status = status;
        if (role !== undefined) update.role = role;
        if (req.body.password !== undefined) update.password = req.body.password;

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

        // Cascade delete: remove the user's cart (if any)
        try {
            await Cart.deleteOne({ user: user._id });
        } catch (e) {
            // Log and continue; do not fail the main delete due to cart cleanup
            console.error("Failed to delete cart for user", user._id, e?.message);
        }

        res.status(200).json({
            success: true,
            message: "User and associated cart deleted successfully"
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
        const { role } = req.body;
        const userId = req.params.id;

        const allowedRoles = ["user", "admin", "book_manager", "order_manager"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
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

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Note: passwords are plain text in current implementation
        user.password = password;
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

        await transporter.sendMail({
            from: process.env.SMTP_FROM || "BookStore <no-reply@bookstore.local>",
            to: email,
            subject: "Password Reset Request",
            html: `<p>You requested a password reset.</p>
             <p>Click the link below to reset your password (valid for 1 hour):</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>
             <p>If you did not request this, please ignore this email.</p>`
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

        user.password = password; // Note: plain text in current app
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({ success: true, message: "Password has been reset" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error resetting password", error: error.message });
    }
};
