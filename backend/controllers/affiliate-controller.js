import Affiliate from "../models/affiliate-model.js";
import AffiliateCommission from "../models/affiliate-commission-model.js";
import AffiliateWithdrawal from "../models/affiliate-withdrawal-model.js";
import { generateToken } from "../middlewares/auth-middleware.js";
import bcrypt from "bcrypt";

// Helper function to generate unique promo code
const generatePromoCode = async (name) => {
  const baseCode = name.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Check if code exists
  const existingCode = await Affiliate.findOne({ promo_code: baseCode });
  if (existingCode) {
    // Add random suffix if exists
    return baseCode + Math.random().toString(36).substring(2, 4).toUpperCase();
  }
  
  return baseCode;
};

// @desc    Register new affiliate
// @route   POST /api/affiliates/register
// @access  Public
export const registerAffiliate = async (req, res) => {
  try {
    const { name, email, password, phone, address, bio } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and phone are required",
      });
    }

    // Check if affiliate already exists by email
    const existingAffiliateByEmail = await Affiliate.findOne({ email });
    if (existingAffiliateByEmail) {
      return res.status(400).json({
        success: false,
        message: "Affiliate with this email already exists",
      });
    }

    // Check if affiliate already exists by phone
    const existingAffiliateByPhone = await Affiliate.findOne({ phone });
    if (existingAffiliateByPhone) {
      return res.status(400).json({
        success: false,
        message: "Affiliate with this phone number already exists",
      });
    }

    // Generate unique promo code
    const promoCode = await generatePromoCode(name);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new affiliate
    const affiliate = await Affiliate.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      bio,
      promo_code: promoCode,
      status: "pending", // Admin needs to approve
    });

    res.status(201).json({
      success: true,
      message: "Affiliate registration successful! Please wait for admin approval.",
      data: {
        _id: affiliate._id,
        name: affiliate.name,
        email: affiliate.email,
        phone: affiliate.phone,
        promo_code: affiliate.promo_code,
        status: affiliate.status,
      },
    });
  } catch (error) {
    console.error("Error registering affiliate:", error);
    res.status(500).json({
      success: false,
      message: "Error registering affiliate",
      error: error.message,
    });
  }
};

// @desc    Login affiliate
// @route   POST /api/affiliates/login
// @access  Public
export const loginAffiliate = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find affiliate by email
    const affiliate = await Affiliate.findOne({ email }).select('+password');
    if (!affiliate) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password — supports both bcrypt hashes and legacy plain text
    const isBcrypt = affiliate.password && affiliate.password.startsWith('$2');
    let isMatch = false;
    if (isBcrypt) {
        isMatch = await bcrypt.compare(password, affiliate.password);
    } else {
        isMatch = affiliate.password === password;
    }
    // Auto-migrate plain-text password to bcrypt hash (use updateOne to skip full validation)
    if (isMatch && !isBcrypt) {
        const hashed = await bcrypt.hash(password, 10);
        await Affiliate.updateOne({ _id: affiliate._id }, { $set: { password: hashed } });
    }
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if affiliate is approved
    if (affiliate.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your affiliate account is pending approval. Please wait for admin approval.",
      });
    }

    if (affiliate.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your affiliate account has been suspended. Please contact support.",
      });
    }

    if (affiliate.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your affiliate application was rejected.",
      });
    }

    // Generate JWT token
    const token = generateToken(affiliate._id);

    // Exclude password from response
    const { password: _, ...affiliateData } = affiliate.toObject();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: affiliateData,
    });
  } catch (error) {
    console.error("Error logging in affiliate:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// @desc    Get affiliate profile (current logged in affiliate)
// @route   GET /api/affiliates/me
// @access  Private/Affiliate
export const getAffiliateProfile = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliateId).select("-password");
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    res.status(200).json({
      success: true,
      data: affiliate,
    });
  } catch (error) {
    console.error("Error fetching affiliate profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// @desc    Update affiliate profile
// @route   PUT /api/affiliates/profile
// @access  Private/Affiliate
export const updateAffiliateProfile = async (req, res) => {
  try {
    const { name, phone, address, bio, payment_method, payment_details } = req.body;

    const affiliate = await Affiliate.findById(req.affiliateId);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    // Update fields
    if (name) affiliate.name = name;
    if (phone) affiliate.phone = phone;
    if (address) affiliate.address = address;
    if (bio) affiliate.bio = bio;
    if (payment_method) affiliate.payment_method = payment_method;
    if (payment_details) affiliate.payment_details = { ...affiliate.payment_details, ...payment_details };

    await affiliate.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: affiliate,
    });
  } catch (error) {
    console.error("Error updating affiliate profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// @desc    Get affiliate dashboard stats
// @route   GET /api/affiliates/dashboard
// @access  Private/Affiliate
export const getAffiliateDashboard = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliateId);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    // Get commission statistics
    const commissions = await AffiliateCommission.find({ affiliate: req.affiliateId });
    
    const stats = {
      total_earnings: affiliate.total_earnings,
      available_balance: affiliate.available_balance,
      withdrawn_amount: affiliate.withdrawn_amount,
      total_referrals: affiliate.total_referrals,
      total_orders: affiliate.total_orders,
      total_sales_value: affiliate.total_sales_value,
      commission_rate: affiliate.commission_rate,
      promo_code: affiliate.promo_code,
      
      // Commission breakdown
      pending_commissions: commissions.filter(c => c.status === "pending").length,
      approved_commissions: commissions.filter(c => c.status === "approved").length,
      paid_commissions: commissions.filter(c => c.status === "paid").length,
      
      // Recent activity
      recent_commissions: await AffiliateCommission.find({ affiliate: req.affiliateId })
        .sort({ created_at: -1 })
        .limit(10)
        .populate("order", "order_number order_status")
        .populate("user", "name email"),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard",
      error: error.message,
    });
  }
};

// @desc    Get affiliate commissions
// @route   GET /api/affiliates/commissions
// @access  Private/Affiliate
export const getAffiliateCommissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { affiliate: req.affiliateId };
    if (status) filter.status = status;

    const commissions = await AffiliateCommission.find(filter)
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("order", "order_number order_status grand_total")
      .populate("user", "name email");

    const count = await AffiliateCommission.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: commissions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching commissions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching commissions",
      error: error.message,
    });
  }
};

// @desc    Request withdrawal
// @route   POST /api/affiliates/withdrawals
// @access  Private/Affiliate
export const requestWithdrawal = async (req, res) => {
  try {
    const { affiliate_note } = req.body;
    const amount = Number(req.body.amount);

    // Validation
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const affiliate = await Affiliate.findById(req.affiliateId);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    // Check if payment details are set
    if (!affiliate.payment_method || !affiliate.payment_details) {
      return res.status(400).json({
        success: false,
        message: "Please set up your payment details first",
      });
    }

    // Deduct atomically: only succeeds if the balance still covers the amount,
    // so concurrent requests can never overdraw (refunded if rejected)
    const debited = await Affiliate.findOneAndUpdate(
      { _id: req.affiliateId, available_balance: { $gte: amount } },
      { $inc: { available_balance: -amount } },
      { new: true }
    );
    if (!debited) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available balance: ${affiliate.available_balance}`,
      });
    }

    // Create withdrawal request
    let withdrawal;
    try {
      withdrawal = await AffiliateWithdrawal.create({
        affiliate: req.affiliateId,
        amount,
        payment_method: affiliate.payment_method,
        payment_details: affiliate.payment_details,
        affiliate_note,
        status: "pending",
      });
    } catch (err) {
      await Affiliate.updateOne({ _id: req.affiliateId }, { $inc: { available_balance: amount } });
      throw err;
    }

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: withdrawal,
    });
  } catch (error) {
    console.error("Error requesting withdrawal:", error);
    res.status(500).json({
      success: false,
      message: "Error requesting withdrawal",
      error: error.message,
    });
  }
};

// @desc    Get affiliate withdrawals
// @route   GET /api/affiliates/withdrawals
// @access  Private/Affiliate
export const getAffiliateWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { affiliate: req.affiliateId };
    if (status) filter.status = status;

    const withdrawals = await AffiliateWithdrawal.find(filter)
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("processed_by", "name email");

    const count = await AffiliateWithdrawal.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: withdrawals,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching withdrawals",
      error: error.message,
    });
  }
};

// @desc    Validate promo code (public endpoint for checkout)
// @route   POST /api/affiliates/validate-promo
// @access  Public
export const validatePromoCode = async (req, res) => {
  try {
    const { promo_code } = req.body;

    if (!promo_code) {
      return res.status(400).json({
        success: false,
        message: "Promo code is required",
      });
    }

    const affiliate = await Affiliate.findOne({ 
      promo_code: promo_code.toUpperCase(),
      status: "active"
    });

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive promo code",
      });
    }

    res.status(200).json({
      success: true,
      message: "Promo code is valid",
      data: {
        promo_code: affiliate.promo_code,
        discount_percentage: 5, // Fixed 5% discount for customers
        commission_rate: affiliate.commission_rate,
        affiliate_name: affiliate.name,
      },
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    res.status(500).json({
      success: false,
      message: "Error validating promo code",
      error: error.message,
    });
  }
};

export default {
  registerAffiliate,
  loginAffiliate,
  getAffiliateProfile,
  updateAffiliateProfile,
  getAffiliateDashboard,
  getAffiliateCommissions,
  requestWithdrawal,
  getAffiliateWithdrawals,
  validatePromoCode,
};
