import Order from "../models/order-model.js";
import { escapeRegex } from "../utils/escape-regex.js";
import Book from "../models/book-model.js"; // Import Book model
import Affiliate from "../models/affiliate-model.js";
import AffiliateCommission from "../models/affiliate-commission-model.js";
import {
  WORKFLOW_TRANSITIONS,
  canTransition,
  nextStages as nextStageHelper,
  stageVisibleToRoles,
  TERMINAL_STAGES,
  ROLE_STAGE_SCOPE,
} from "../utils/order-workflow.js";
import { orderEvents } from "../events/order-events.js";
import csv from "csv-parser";
import fs from "fs";
import mongoose from "mongoose";
import {
  getPrintPricingConfig,
  buildFinalUnitPrice,
  sanitizeVariant,
  DEFAULT_VARIANT,
} from "../utils/print-pricing.js";
import { getDeliveryCostConfig } from "./setting-controllers.js";

export const AFFILIATE_DISCOUNT_PERCENT = 5;

// Utility: compute discount based on subtotal & itemCount (mirrors frontend rules).
// A valid affiliate promo code replaces the tiered discount, as shown at checkout.
const computeDiscount = (subtotal, itemCount, promoCode = null) => {
  let amount = 0;
  let label = "";
  if (promoCode) {
    amount = subtotal * (AFFILIATE_DISCOUNT_PERCENT / 100);
    label = `${AFFILIATE_DISCOUNT_PERCENT}% off (Promo: ${promoCode})`;
  } else if (subtotal >= 10000) {
    amount = subtotal * 0.15;
    label = "15% off orders ৳10,000+";
  } else if (subtotal >= 5000) {
    amount = subtotal * 0.1;
    label = "10% off orders ৳5,000+";
  } else if (itemCount >= 5) {
    amount = subtotal * 0.05;
    label = "5% multi-item discount (5+ items)";
  }
  return { discountAmount: Number(amount.toFixed(2)), discountLabel: label };
};

// Helper: record a pending affiliate commission for a new order.
// The affiliate's balance is only credited once the order is completed (see settleAffiliateCommission).
const createAffiliateCommission = async (order, affiliate, customer) => {
  try {
    if (!affiliate) return null;

    const commissionAmount = Number(((order.grand_total * affiliate.commission_rate) / 100).toFixed(2));

    const commission = await AffiliateCommission.create({
      affiliate: affiliate._id,
      order: order._id,
      user: customer._id,
      promo_code_used: affiliate.promo_code,
      order_number: order.order_number,
      order_amount: order.grand_total,
      commission_rate: affiliate.commission_rate,
      commission_amount: commissionAmount,
      discount_percentage: AFFILIATE_DISCOUNT_PERCENT,
      discount_amount: order.discount_amount,
      status: "pending",
    });

    await Affiliate.updateOne(
      { _id: affiliate._id },
      { $inc: { total_referrals: 1, total_orders: 1, total_sales_value: order.grand_total } }
    );

    return commission;
  } catch (error) {
    console.error("Error creating affiliate commission:", error);
    // Don't throw error, just log it so order creation continues
    return null;
  }
};

// Helper: when an order reaches a terminal stage, approve (and credit) or cancel its commission.
// The status filter makes this idempotent, so a commission is never credited twice.
const settleAffiliateCommission = async (order) => {
  try {
    if (order.internal_stage === "OM_COMPLETED") {
      const commission = await AffiliateCommission.findOneAndUpdate(
        { order: order._id, status: "pending" },
        { $set: { status: "approved" } },
        { new: true }
      );
      if (commission) {
        await Affiliate.updateOne(
          { _id: commission.affiliate },
          { $inc: { total_earnings: commission.commission_amount, available_balance: commission.commission_amount } }
        );
      }
    } else if (TERMINAL_STAGES.includes(order.internal_stage)) {
      await AffiliateCommission.updateOne(
        { order: order._id, status: "pending" },
        { $set: { status: "cancelled" } }
      );
    }
  } catch (error) {
    console.error("Error settling affiliate commission:", error);
  }
};

// Helper: give stock back for every item of a cancelled order
const restockOrder = async (order) => {
  for (const item of order.items || []) {
    await Book.updateOne({ _id: item.book }, { $inc: { stock: item.quantity } });
  }
};

const CANCELLED_STAGES = ["TERMINATED_OM", "CANCELLED_CSM", "CANCELLED_FM", "FM_REJECTED"];

// Helper: normalize roles consistently (lowercase, trimmed, unique)
function normalizeRoles(user) {
  const base = Array.isArray(user?.roles)
    ? user.roles
    : [user?.role].filter(Boolean);
  return base
    .filter(Boolean)
    .map((r) => String(r).trim().toLowerCase())
    .filter((r, i, arr) => arr.indexOf(r) === i);
}

// Create new order
// Prices, discount, shipping and payment status are all computed here on the server;
// the client only chooses books, quantities, print options, delivery location and payment method.
export const createOrder = async (req, res) => {
  if (!Array.isArray(req.body.items) || !req.body.items.length) {
    return res
      .status(400)
      .json({ success: false, message: "No order items provided" });
  }

  // Validate items
  const requested = [];
  for (const item of req.body.items) {
    const quantity = Number(item?.quantity);
    if (!mongoose.isValidObjectId(item?.book)) {
      return res.status(400).json({ success: false, message: "Invalid book id in order items" });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be a positive whole number" });
    }
    requested.push({ bookId: String(item.book), quantity, variant: sanitizeVariant(item.variant) });
  }

  // Delivery location decides shipping cost
  const location = req.body.shipping_address?.shippingLocation;
  if (!["insideDhaka", "outsideDhaka"].includes(location)) {
    return res.status(400).json({ success: false, message: "Please select a delivery location" });
  }

  const reserved = []; // stock taken so far, returned if anything fails
  const releaseStock = async () => {
    for (const r of reserved.splice(0)) {
      await Book.updateOne({ _id: r.bookId }, { $inc: { stock: r.quantity } });
    }
  };

  try {
    const ids = [...new Set(requested.map((r) => r.bookId))];
    const books = await Book.find({ _id: { $in: ids }, is_active: true }).lean();
    const bookById = new Map(books.map((b) => [String(b._id), b]));
    if (ids.some((id) => !bookById.has(id))) {
      return res.status(400).json({ success: false, message: "One or more books are unavailable" });
    }

    // Reserve stock atomically (per book, summing quantities across variants)
    const qtyByBook = new Map();
    for (const r of requested) qtyByBook.set(r.bookId, (qtyByBook.get(r.bookId) || 0) + r.quantity);
    for (const [bookId, quantity] of qtyByBook) {
      const result = await Book.updateOne(
        { _id: bookId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } }
      );
      if (result.modifiedCount !== 1) {
        await releaseStock();
        const b = bookById.get(bookId);
        return res.status(400).json({
          success: false,
          message: `Only ${b?.stock ?? 0} copies of "${b?.title}" are available`,
        });
      }
      reserved.push({ bookId, quantity });
    }

    const cfg = await getPrintPricingConfig();
    const items = requested.map((r) => {
      const book = bookById.get(r.bookId);
      const { unitPrice, breakdown } = buildFinalUnitPrice({ book, variant: r.variant || DEFAULT_VARIANT, cfg });
      return {
        book: book._id,
        book_title: book.title,
        book_cover: Array.isArray(book.cover_image) && book.cover_image.length ? book.cover_image[0] : null,
        quantity: r.quantity,
        price: unitPrice,
        configured: !!r.variant,
        variant: r.variant || undefined,
        pricing: {
          contentPrice: breakdown.contentPrice ?? null,
          printCost: breakdown.printCost ?? null,
          margin: breakdown.margin ?? null,
          baseCost: breakdown.baseCost ?? null,
          finalPrice: breakdown.finalPrice ?? null,
        },
      };
    });

    // Affiliate promo code (ignored if invalid, or if the affiliate is the customer)
    let affiliate = null;
    if (typeof req.body.promo_code === "string" && req.body.promo_code.trim()) {
      affiliate = await Affiliate.findOne({
        promo_code: req.body.promo_code.trim().toUpperCase(),
        status: "active",
      });
      if (affiliate && affiliate.email === req.user.email) affiliate = null;
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const { discountAmount, discountLabel } = computeDiscount(subtotal, itemCount, affiliate?.promo_code);
    const shipping = (await getDeliveryCostConfig())[location];
    const grand = Math.max(0, Number((subtotal - discountAmount + shipping).toFixed(2)));

    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)
      .toUpperCase()}`;

    const method = req.body.payment_info?.method;
    const order = await Order.create({
      order_number: orderNumber,
      user: req.user._id,
      items,
      subtotal_amount: Number(subtotal.toFixed(2)),
      discount_amount: discountAmount,
      discount_label: discountLabel,
      shipping_amount: shipping,
      grand_total: grand,
      total_amount: grand, // maintain old field
      shipping_address: req.body.shipping_address || {},
      payment_info: {
        method: typeof method === "string" && method.trim() ? method.trim() : "Unknown",
        status: "pending",
      },
    });

    if (affiliate) {
      await createAffiliateCommission(order, affiliate, req.user);
    }

    res.status(201).json({ success: true, data: order });
    try {
      orderEvents.emit("order.created", {
        orderId: order._id,
        userId: req.user._id,
      });
    } catch {}
  } catch (error) {
    await releaseStock();
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "user",
      "name email phone"
    );
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const userRoles = normalizeRoles(req.user);
    const {
      page = 1,
      limit = 20,
      status,
      internal_stage,
      handler,
      search,
    } = req.query;
    const numericPage = Math.max(1, parseInt(page));
    const numericLimit = Math.min(100, Math.max(1, parseInt(limit)));
    const query = {};
    if (status) query.order_status = status;
    if (internal_stage) query.internal_stage = internal_stage;
    if (handler) query.current_handler_role = handler;
    if (search) {
      query.order_number = { $regex: escapeRegex(search), $options: "i" };
    }
    const baseCursor = Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    const total = await Order.countDocuments(query);
    const raw = await baseCursor
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .lean();
    const filtered = (userRoles.includes("admin") || userRoles.includes("order_manager"))
      ? raw
      : raw.filter((o) => stageVisibleToRoles(o.internal_stage, userRoles));
    res.status(200).json({
      success: true,
      data: filtered,
      meta: {
        page: numericPage,
        limit: numericLimit,
        total,
        returned: filtered.length,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone"
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    const userRoles = normalizeRoles(req.user);
    const isOwner =
      order.user && order.user._id.toString() === req.user._id.toString();
    if (!isOwner && !stageVisibleToRoles(order.internal_stage, userRoles)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not permitted to view order in this stage",
        });
    }
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Public status -> internal workflow stage used when an admin sets the status directly
const STATUS_TO_STAGE = {
  pending: "OM_INTAKE",
  processing: "FM_APPROVED",
  shipped: "DM_OUT_FOR_DELIVERY",
  delivered: "DM_DELIVERED",
  cancelled: "TERMINATED_OM",
};

// Update order status
// Moves the internal stage too (with an audit entry), so order_status and internal_stage never disagree.
export const updateOrderStatus = async (req, res) => {
  try {
    const status = req.body.status === "cancel" ? "cancelled" : req.body.status;
    const targetStage = STATUS_TO_STAGE[status];
    if (!targetStage) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${Object.keys(STATUS_TO_STAGE).join(", ")}`,
      });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    if (TERMINAL_STAGES.includes(order.internal_stage)) {
      return res.status(400).json({
        success: false,
        message: "Order is already closed and cannot change status",
      });
    }
    if (order.internal_stage !== targetStage) {
      const roles = normalizeRoles(req.user);
      order.advance(targetStage, {
        userId: req.user._id,
        role: roles.find((r) => r !== "admin") || "admin",
        remarks: req.body.remarks || `Status set to ${status} by staff`,
        nextHandlerRole: status === "cancelled" ? order.current_handler_role : undefined,
      });
      if (status === "cancelled") order.cancellation_reason = req.body.remarks || "Cancelled by staff";
      await order.save();
      if (status === "cancelled") await restockOrder(order);
      await settleAffiliateCommission(order);
    }
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== Internal Workflow Specific Controllers =====

// List orders visible to the actor for a given stage or handler role (optional filters)
export const listWorkflowOrders = async (req, res) => {
  try {
    const userRoles = normalizeRoles(req.user);
    const {
      stage,
      handler,
      page = 1,
      limit = 20,
      from,
      to,
      order_status,
      search,
    } = req.query;
    const criteria = {};
    if (stage) criteria.internal_stage = stage;
    if (handler) criteria.current_handler_role = handler;
    if (order_status) criteria.order_status = order_status;
    if (from || to) {
      criteria.createdAt = {};
      if (from) criteria.createdAt.$gte = new Date(from);
      if (to) criteria.createdAt.$lte = new Date(to);
    }
    if (search) criteria.order_number = { $regex: escapeRegex(search), $options: "i" };
    const numericPage = Math.max(1, parseInt(page));
    const numericLimit = Math.min(100, Math.max(1, parseInt(limit)));
    const total = await Order.countDocuments(criteria);
    const raw = await Order.find(criteria)
      .select("-workflow_history")
      .sort({ createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .lean();
    const visible = (userRoles.includes("admin") || userRoles.includes("order_manager"))
      ? raw
      : raw.filter((o) => stageVisibleToRoles(o.internal_stage, userRoles));
    res.json({
      success: true,
      data: visible,
      meta: {
        page: numericPage,
        limit: numericLimit,
        total,
        returned: visible.length,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Get workflow detail (includes history)
export const getWorkflowOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    const userRoles = normalizeRoles(req.user);
    if (!stageVisibleToRoles(order.internal_stage, userRoles)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not permitted to view order in this stage",
        });
    }
    res.json({ success: true, data: order });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Advance internal stage
export const advanceWorkflowStage = async (req, res) => {
  try {
    const { targetStage, remarks } = req.body;
    if (!targetStage)
      return res
        .status(400)
        .json({ success: false, message: "targetStage required" });
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    const userRoles = normalizeRoles(req.user);
    // Visibility + authority check: user must see AND be allowed to move
    if (!stageVisibleToRoles(order.internal_stage, userRoles)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not permitted to operate on this order",
        });
    }
    if (
      !canTransition({
        current: order.internal_stage,
        target: targetStage,
        userRoles,
      })
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Transition not allowed" });
    }
    // Determine next handler role (owner of target stage)
    let nextHandlerRole = order.current_handler_role; // fallback
    if (!TERMINAL_STAGES.includes(targetStage)) {
      for (const [role, stages] of Object.entries(ROLE_STAGE_SCOPE)) {
        if (role === "admin") continue;
        if (stages.includes(targetStage)) {
          nextHandlerRole = role;
          break;
        }
      }
    }
    // If entering a cancellation stage, attach cancellation_reason
    if (
      [
        "TERMINATED_OM",
        "CANCELLED_CSM",
        "CANCELLED_FM",
        "FM_REJECTED",
      ].includes(targetStage) &&
      !remarks
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Remarks required for terminal/cancellation stage",
        });
    }
    if (
      [
        "TERMINATED_OM",
        "CANCELLED_CSM",
        "CANCELLED_FM",
        "FM_REJECTED",
      ].includes(targetStage)
    ) {
      order.cancellation_reason = remarks;
    }
    order.advance(targetStage, {
      userId: req.user._id,
      role: userRoles.find((r) => r !== "admin") || "admin",
      remarks,
      nextHandlerRole,
    });
    await order.save();
    if (CANCELLED_STAGES.includes(targetStage)) await restockOrder(order);
    await settleAffiliateCommission(order);
    try {
      orderEvents.emit("order.stage.changed", {
        orderId: order._id,
        from: order.workflow_history.at(-1)?.from,
        to: targetStage,
      });
    } catch {}
    res.json({ success: true, data: order });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Get next allowed stages for UI
export const getNextWorkflowStages = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select("internal_stage");
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    const userRoles = normalizeRoles(req.user);
    if (!stageVisibleToRoles(order.internal_stage, userRoles)) {
      return res.status(403).json({ success: false, message: "Not permitted" });
    }
    const stages = nextStageHelper(order.internal_stage, userRoles);
    res.json({ success: true, data: stages });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Import orders from CSV
// One row per order line. Columns (header names, case-insensitive):
//   user_email (required), book_id or isbn (required), quantity (default 1),
//   order_ref (rows sharing it become one order; default: one order per row),
//   payment_method, full_name, phone, street, city, state, zip_code, country,
//   shipping_location (insideDhaka | outsideDhaka, default insideDhaka)
// Prices, discount and shipping are computed exactly like checkout. Stock is not changed.
export const importOrdersFromCSV = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      success: false,
      message: "Please upload a CSV file",
    });
  }

  const cleanup = () => fs.promises.unlink(file.path).catch(() => {});

  try {
    const rows = await new Promise((resolve, reject) => {
      const out = [];
      fs.createReadStream(file.path)
        .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
        .on("data", (row) => out.push(row))
        .on("end", () => resolve(out))
        .on("error", reject);
    });
    if (!rows.length) {
      return res.status(400).json({ success: false, message: "CSV file has no rows" });
    }

    // Group rows into orders
    const groups = new Map();
    rows.forEach((row, i) => {
      const key = row.order_ref?.trim() || `row-${i}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ row, line: i + 2 }); // +2: header is line 1
    });

    const cfg = await getPrintPricingConfig();
    const deliveryCost = await getDeliveryCostConfig();
    const User = (await import("../models/user-model.js")).default;

    const orders = [];
    const errors = [];
    for (const [ref, lines] of groups) {
      try {
        const first = lines[0].row;
        const email = String(first.user_email || "").trim().toLowerCase();
        const user = email ? await User.findOne({ email }) : null;
        if (!user) throw new Error(`line ${lines[0].line}: unknown user_email "${email}"`);

        const items = [];
        for (const { row, line } of lines) {
          const bookId = String(row.book_id || "").trim();
          const isbn = String(row.isbn || "").trim();
          const book = mongoose.isValidObjectId(bookId)
            ? await Book.findById(bookId).lean()
            : isbn ? await Book.findOne({ isbn }).lean() : null;
          if (!book) throw new Error(`line ${line}: book not found`);
          const quantity = row.quantity ? Number(row.quantity) : 1;
          if (!Number.isInteger(quantity) || quantity < 1) throw new Error(`line ${line}: invalid quantity`);
          const { unitPrice, breakdown } = buildFinalUnitPrice({ book, variant: DEFAULT_VARIANT, cfg });
          items.push({
            book: book._id,
            book_title: book.title,
            book_cover: Array.isArray(book.cover_image) && book.cover_image.length ? book.cover_image[0] : null,
            quantity,
            price: unitPrice,
            pricing: breakdown,
          });
        }

        const location = first.shipping_location === "outsideDhaka" ? "outsideDhaka" : "insideDhaka";
        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
        const { discountAmount, discountLabel } = computeDiscount(subtotal, itemCount);
        const shipping = deliveryCost[location];
        const grand = Math.max(0, Number((subtotal - discountAmount + shipping).toFixed(2)));

        orders.push({
          order_number: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
          user: user._id,
          items,
          subtotal_amount: Number(subtotal.toFixed(2)),
          discount_amount: discountAmount,
          discount_label: discountLabel,
          shipping_amount: shipping,
          grand_total: grand,
          total_amount: grand,
          shipping_address: {
            fullName: first.full_name || user.name,
            email: user.email,
            phone: first.phone || user.phone,
            street: first.street,
            city: first.city,
            state: first.state,
            zipCode: first.zip_code,
            country: first.country || "Bangladesh",
            shippingLocation: location,
          },
          payment_info: { method: first.payment_method || "Unknown", status: "pending" },
        });
      } catch (e) {
        errors.push(ref.startsWith("row-") ? e.message : `order_ref ${ref}: ${e.message}`);
      }
    }

    // All-or-nothing: report every problem instead of importing half a file
    if (errors.length) {
      return res.status(400).json({ success: false, message: "CSV has errors; nothing was imported", errors });
    }

    const created = await Order.insertMany(orders);
    return res.status(201).json({
      success: true,
      message: `${created.length} orders imported successfully`,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  } finally {
    await cleanup();
  }
};

// In your order-controllers.js, add this function:

// @desc    Delete order (Admin only)
// @route   DELETE /api/orders/admin/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting order",
      error: error.message,
    });
  }
};

// GET /api/orders/admin/stats
// Returns aggregated metrics for dashboard
export const getOrderStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Parallel queries (add topBooks pipeline)
    const [
      orders,
      countsByStatus,
      revenueByMonth,
      recentOrders,
      totalActiveBooks,
      totalUsers,
      topBooksAgg,
    ] = await Promise.all([
      Order.find({}, "order_status grand_total createdAt").lean(),
      Order.aggregate([
        { $group: { _id: "$order_status", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfYear } } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: "$grand_total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("order_number grand_total order_status createdAt")
        .lean(),
      (
        await import("../models/book-model.js")
      ).default.countDocuments({ is_active: true }),
      (await import("../models/user-model.js")).default.countDocuments({}),
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: { book: "$items.book", title: "$items.book_title" },
            qty: { $sum: "$items.quantity" },
            revenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
          },
        },
        { $sort: { qty: -1 } },
        { $limit: 3 },
        {
          $project: {
            _id: 0,
            book: "$_id.book",
            title: "$_id.title",
            quantity: "$qty",
            revenue: { $round: ["$revenue", 2] },
          },
        },
      ]),
    ]);

    const ordersInProgress = orders.filter((o) =>
      ["pending", "processing", "shipped"].includes(o.order_status)
    ).length;
    const ordersByStatus = countsByStatus.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const salesOverTime = revenueByMonth.map((r) => ({
      month: monthNames[r._id - 1],
      sales: Number(r.total.toFixed(2)),
    }));

    // Placeholder / future metrics
    const activePromotions = 0; // requires promotions model
    const refundRequests = 0; // requires refunds feature
    const pendingManuscripts = 0; // requires manuscript workflow

    const activities = recentOrders.map((ro) => ({
      id: ro._id,
      type: "Order",
      detail: `Order ${ro.order_number} - ${ro.order_status}`,
      date: ro.createdAt.toISOString(),
    }));

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalBooks: totalActiveBooks,
        ordersInProgress,
        activePromotions,
        refundRequests,
        pendingManuscripts,
        ordersByStatus,
        salesOverTime,
        activities,
        topBooks: topBooksAgg.map((tb) => ({
          id: tb.book,
          name: tb.title,
          sales: tb.quantity,
          revenue: tb.revenue,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};
