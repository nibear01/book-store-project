import User from "../models/user-model.js";
import { generateToken } from "../middlewares/auth-middleware.js";

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
            isAdmin: false // Default to customer
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
                message: "Invalid email or password"
            });
        }

        // Check password (simple comparison since no bcrypt)
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
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

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, isAdmin } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (isAdmin !== undefined) filter.isAdmin = isAdmin === 'true';

        const users = await User.find(filter)
            .select('-password')
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

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
    try {
        const { name, email, address, status } = req.body;
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

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, address, status },
            { new: true, runValidators: true }
        ).select('-password');

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

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
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
        const { isAdmin } = req.body;
        const userId = req.params.id;

        const user = await User.findByIdAndUpdate(
            userId,
            { isAdmin },
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
            message: `User role changed to ${isAdmin ? 'Admin' : 'Customer'}`,
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

        if (!password || typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password is required and must be at least 6 characters"
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
