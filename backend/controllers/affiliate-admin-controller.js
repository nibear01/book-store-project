import Affiliate from "../models/affiliate-model.js";
import { escapeRegex } from "../utils/escape-regex.js";
import AffiliateCommission from "../models/affiliate-commission-model.js";
import AffiliateWithdrawal from "../models/affiliate-withdrawal-model.js";

// @desc    Get all affiliates (Admin)
// @route   GET /api/admin/affiliates
// @access  Private/Admin
export const getAllAffiliates = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, q, sort = "-created_at" } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    
    // Search by name, email, or promo code
    if (q && q.trim()) {
      const regex = new RegExp(escapeRegex(q.trim()), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { promo_code: regex },
      ];
    }

    const affiliates = await Affiliate.find(filter)
      .select("-password")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("approved_by", "name email");

    const count = await Affiliate.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: affiliates,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching affiliates",
      error: error.message,
    });
  }
};

// @desc    Get affiliate by ID (Admin)
// @route   GET /api/admin/affiliates/:id
// @access  Private/Admin
export const getAffiliateById = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id)
      .select("-password")
      .populate("approved_by", "name email");

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    // Get additional stats
    const commissions = await AffiliateCommission.find({ affiliate: req.params.id });
    const withdrawals = await AffiliateWithdrawal.find({ affiliate: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        ...affiliate.toObject(),
        commissions_count: commissions.length,
        withdrawals_count: withdrawals.length,
        pending_withdrawals: withdrawals.filter(w => w.status === "pending").length,
      },
    });
  } catch (error) {
    console.error("Error fetching affiliate:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching affiliate",
      error: error.message,
    });
  }
};

// @desc    Approve affiliate (Admin)
// @route   PUT /api/admin/affiliates/:id/approve
// @access  Private/Admin
export const approveAffiliate = async (req, res) => {
  try {
    const { commission_rate, admin_notes } = req.body;

    const affiliate = await Affiliate.findById(req.params.id);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    if (affiliate.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Affiliate is already approved",
      });
    }

    affiliate.status = "active";
    affiliate.approved_by = req.user._id;
    affiliate.approved_at = new Date();
    
    if (commission_rate !== undefined) {
      affiliate.commission_rate = commission_rate;
    }
    
    if (admin_notes) {
      affiliate.admin_notes = admin_notes;
    }

    await affiliate.save();

    res.status(200).json({
      success: true,
      message: "Affiliate approved successfully",
      data: affiliate,
    });
  } catch (error) {
    console.error("Error approving affiliate:", error);
    res.status(500).json({
      success: false,
      message: "Error approving affiliate",
      error: error.message,
    });
  }
};

// @desc    Reject affiliate (Admin)
// @route   PUT /api/admin/affiliates/:id/reject
// @access  Private/Admin
export const rejectAffiliate = async (req, res) => {
  try {
    const { rejection_reason } = req.body;

    const affiliate = await Affiliate.findById(req.params.id);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    affiliate.status = "rejected";
    affiliate.rejected_at = new Date();
    affiliate.rejection_reason = rejection_reason;

    await affiliate.save();

    res.status(200).json({
      success: true,
      message: "Affiliate rejected",
      data: affiliate,
    });
  } catch (error) {
    console.error("Error rejecting affiliate:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting affiliate",
      error: error.message,
    });
  }
};

// @desc    Suspend affiliate (Admin)
// @route   PUT /api/admin/affiliates/:id/suspend
// @access  Private/Admin
export const suspendAffiliate = async (req, res) => {
  try {
    const { admin_notes } = req.body;

    const affiliate = await Affiliate.findById(req.params.id);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    affiliate.status = "suspended";
    if (admin_notes) {
      affiliate.admin_notes = admin_notes;
    }

    await affiliate.save();

    res.status(200).json({
      success: true,
      message: "Affiliate suspended",
      data: affiliate,
    });
  } catch (error) {
    console.error("Error suspending affiliate:", error);
    res.status(500).json({
      success: false,
      message: "Error suspending affiliate",
      error: error.message,
    });
  }
};

// @desc    Update affiliate commission rate (Admin)
// @route   PUT /api/admin/affiliates/:id/commission-rate
// @access  Private/Admin
export const updateCommissionRate = async (req, res) => {
  try {
    const { commission_rate } = req.body;

    if (commission_rate === undefined || commission_rate < 0 || commission_rate > 100) {
      return res.status(400).json({
        success: false,
        message: "Valid commission rate (0-100) is required",
      });
    }

    const affiliate = await Affiliate.findById(req.params.id);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    affiliate.commission_rate = commission_rate;
    await affiliate.save();

    res.status(200).json({
      success: true,
      message: "Commission rate updated successfully",
      data: affiliate,
    });
  } catch (error) {
    console.error("Error updating commission rate:", error);
    res.status(500).json({
      success: false,
      message: "Error updating commission rate",
      error: error.message,
    });
  }
};

// @desc    Get all withdrawal requests (Admin)
// @route   GET /api/admin/affiliates/withdrawals
// @access  Private/Admin
export const getAllWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sort = "-created_at" } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const withdrawals = await AffiliateWithdrawal.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("affiliate", "name email promo_code phone")
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

// @desc    Process withdrawal request (Admin)
// @route   PUT /api/admin/affiliates/withdrawals/:id/process
// @access  Private/Admin
export const processWithdrawal = async (req, res) => {
  try {
    const { status, admin_note, payment_reference, transaction_id } = req.body;

    if (!["completed", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'completed' or 'rejected'",
      });
    }

    const now = new Date();
    const update = {
      status,
      processed_by: req.user._id,
      processed_at: now,
      admin_note,
    };
    if (status === "completed") {
      update.completed_at = now;
      update.payment_reference = payment_reference;
      update.transaction_id = transaction_id;
    } else {
      update.rejected_at = now;
      update.rejection_reason = admin_note;
    }

    // Claim the request atomically so it can only be processed once
    const withdrawal = await AffiliateWithdrawal.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ["pending", "processing"] } },
      { $set: update },
      { new: true }
    );

    if (!withdrawal) {
      const exists = await AffiliateWithdrawal.exists({ _id: req.params.id });
      return res.status(exists ? 400 : 404).json({
        success: false,
        message: exists ? "Withdrawal request has already been processed" : "Withdrawal request not found",
      });
    }

    // Completed: record the payout. Rejected: refund the balance taken at request time.
    await Affiliate.updateOne(
      { _id: withdrawal.affiliate },
      status === "completed"
        ? { $inc: { withdrawn_amount: withdrawal.amount } }
        : { $inc: { available_balance: withdrawal.amount } }
    );

    res.status(200).json({
      success: true,
      message: `Withdrawal ${status} successfully`,
      data: withdrawal,
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).json({
      success: false,
      message: "Error processing withdrawal",
      error: error.message,
    });
  }
};

// @desc    Get all commissions (Admin)
// @route   GET /api/admin/affiliates/commissions
// @access  Private/Admin
export const getAllCommissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, affiliate_id, sort = "-created_at" } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (affiliate_id) filter.affiliate = affiliate_id;

    const commissions = await AffiliateCommission.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("affiliate", "name email promo_code")
      .populate("user", "name email")
      .populate("order", "order_number order_status grand_total");

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

// @desc    Get affiliate statistics (Admin)
// @route   GET /api/admin/affiliates/stats
// @access  Private/Admin
export const getAffiliateStats = async (req, res) => {
  try {
    const totalAffiliates = await Affiliate.countDocuments();
    const activeAffiliates = await Affiliate.countDocuments({ status: "active" });
    const pendingAffiliates = await Affiliate.countDocuments({ status: "pending" });
    const suspendedAffiliates = await Affiliate.countDocuments({ status: "suspended" });

    const totalCommissions = await AffiliateCommission.countDocuments();
    const pendingCommissions = await AffiliateCommission.countDocuments({ status: "pending" });
    const paidCommissions = await AffiliateCommission.countDocuments({ status: "paid" });

    const totalWithdrawals = await AffiliateWithdrawal.countDocuments();
    const pendingWithdrawals = await AffiliateWithdrawal.countDocuments({ status: "pending" });
    const completedWithdrawals = await AffiliateWithdrawal.countDocuments({ status: "completed" });

    // Calculate total earnings
    const affiliates = await Affiliate.find();
    const totalEarnings = affiliates.reduce((sum, aff) => sum + aff.total_earnings, 0);
    const totalWithdrawn = affiliates.reduce((sum, aff) => sum + aff.withdrawn_amount, 0);
    const totalAvailable = affiliates.reduce((sum, aff) => sum + aff.available_balance, 0);

    res.status(200).json({
      success: true,
      data: {
        affiliates: {
          total: totalAffiliates,
          active: activeAffiliates,
          pending: pendingAffiliates,
          suspended: suspendedAffiliates,
        },
        commissions: {
          total: totalCommissions,
          pending: pendingCommissions,
          paid: paidCommissions,
        },
        withdrawals: {
          total: totalWithdrawals,
          pending: pendingWithdrawals,
          completed: completedWithdrawals,
        },
        financials: {
          total_earnings: totalEarnings,
          total_withdrawn: totalWithdrawn,
          total_available: totalAvailable,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching affiliate stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

export default {
  getAllAffiliates,
  getAffiliateById,
  approveAffiliate,
  rejectAffiliate,
  suspendAffiliate,
  updateCommissionRate,
  getAllWithdrawals,
  processWithdrawal,
  getAllCommissions,
  getAffiliateStats,
};
