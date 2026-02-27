import Order from "../models/order-model.js";
import Book from "../models/book-model.js"; // Import Book model
import Setting from "../models/setting-model.js";
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

// Utility: compute discount based on subtotal & itemCount (mirrors frontend rules)
const computeDiscount = (subtotal, itemCount) => {
  let amount = 0;
  let label = "";
  if (subtotal >= 10000) {
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

// Helper function to create affiliate commission when order is placed
const createAffiliateCommission = async (order, promoCode) => {
  try {
    if (!promoCode) return null;

    // Find affiliate by promo code
    const affiliate = await Affiliate.findOne({
      promo_code: promoCode.toUpperCase(),
      status: "active",
    });

    if (!affiliate) return null;

    // Calculate commission and discount
    const commissionAmount = (order.grand_total * affiliate.commission_rate) / 100;
    const discountAmount = (order.subtotal_amount * 5) / 100; // 5% discount for customer

    // Create commission record
    const commission = await AffiliateCommission.create({
      affiliate: affiliate._id,
      order: order._id,
      user: order.user,
      promo_code_used: promoCode.toUpperCase(),
      order_number: order.order_number,
      order_amount: order.grand_total,
      commission_rate: affiliate.commission_rate,
      commission_amount: commissionAmount,
      discount_percentage: 5,
      discount_amount: discountAmount,
      status: "pending",
    });

    // Update affiliate statistics
    affiliate.total_referrals += 1;
    affiliate.total_orders += 1;
    affiliate.total_sales_value += order.grand_total;
    affiliate.total_earnings += commissionAmount;
    affiliate.available_balance += commissionAmount;
    
    await affiliate.save();

    return commission;
  } catch (error) {
    console.error("Error creating affiliate commission:", error);
    // Don't throw error, just log it so order creation continues
    return null;
  }
};

// -------- Print Pricing Helpers --------
const PRINT_DEFAULTS = Object.freeze({
  basePerPage: 0.05,
  contentFee: 0,
  multipliers: {
    quality: { economy: 1.0, standard: 1.15, premium: 1.3 },
    side: { single: 1.0, double: 0.92 },
    size: { A5: 0.85, A4: 1.0, A3: 1.25 },
    color: { bw: 1.0, color: 1.4 },
  },
  margin: { type: "percent", value: 10 },
  mode: "derived",
});

async function getPrintConfigFast() {
  try {
    const setting = await Setting.findOne({ key: "printPricingConfig" }).lean();
    if (!setting || !setting.value) return PRINT_DEFAULTS;
    const v = setting.value;
    return {
      basePerPage: Number(v.basePerPage) >= 0 ? Number(v.basePerPage) : PRINT_DEFAULTS.basePerPage,
      contentFee: Number(v.contentFee) >= 0 ? Number(v.contentFee) : PRINT_DEFAULTS.contentFee,
      multipliers: {
        quality: {
          economy: Number(v?.multipliers?.quality?.economy) || PRINT_DEFAULTS.multipliers.quality.economy,
          standard: Number(v?.multipliers?.quality?.standard) || PRINT_DEFAULTS.multipliers.quality.standard,
          premium: Number(v?.multipliers?.quality?.premium) || PRINT_DEFAULTS.multipliers.quality.premium,
        },
        side: {
          single: Number(v?.multipliers?.side?.single) || PRINT_DEFAULTS.multipliers.side.single,
          double: Number(v?.multipliers?.side?.double) || PRINT_DEFAULTS.multipliers.side.double,
        },
        size: {
          A5: Number(v?.multipliers?.size?.A5) || PRINT_DEFAULTS.multipliers.size.A5,
          A4: Number(v?.multipliers?.size?.A4) || PRINT_DEFAULTS.multipliers.size.A4,
          A3: Number(v?.multipliers?.size?.A3) || PRINT_DEFAULTS.multipliers.size.A3,
        },
        color: {
          bw: Number(v?.multipliers?.color?.bw) || PRINT_DEFAULTS.multipliers.color.bw,
          color: Number(v?.multipliers?.color?.color) || PRINT_DEFAULTS.multipliers.color.color,
        },
      },
      margin: {
        type: v?.margin?.type === "flat" ? "flat" : "percent",
        value: Number(v?.margin?.value) || PRINT_DEFAULTS.margin.value,
      },
      mode: v?.mode === "relative" ? "relative" : "derived",
    };
  } catch {
    return PRINT_DEFAULTS;
  }
}

function computeDerivedPriceForBook({ pages = 0, cfg, variant = {} }) {
  const p = Math.max(0, Number(pages) || 0);
  const base = p * (Number(cfg.basePerPage) || 0);
  const qKey = String(variant.paperQuality || "standard").toLowerCase();
  const sKey = String(variant.printSide || "single").toLowerCase();
  const szKey = String(variant.paperSize || "a4").toUpperCase();
  const cKey = String(variant.colorMode || "bw").toLowerCase();
  const multQ = Number(cfg?.multipliers?.quality?.[qKey]) || 1;
  const multS = Number(cfg?.multipliers?.side?.[sKey]) || 1;
  const multSz = Number(cfg?.multipliers?.size?.[szKey]) || 1;
  const multC = Number(cfg?.multipliers?.color?.[cKey]) || 1;
  const printCost = base * multQ * multS * multSz * multC;
  const contentPrice = Number(cfg.contentFee) || 0;
  const baseCost = printCost + contentPrice;
  const finalPrice = cfg.margin?.type === "flat"
    ? baseCost + (Number(cfg.margin?.value) || 0)
    : baseCost * (1 + (Number(cfg.margin?.value) || 0) / 100);
  const roundedFinal = Math.max(0, Math.round(finalPrice * 100) / 100);
  const marginAmount = Math.max(0, Math.round((roundedFinal - baseCost) * 100) / 100);
  return { contentPrice, printCost, baseCost, finalPrice: roundedFinal, marginAmount };
}

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
export const createOrder = async (req, res) => {
  try {
    if (!Array.isArray(req.body.items) || !req.body.items.length) {
      return res
        .status(400)
        .json({ success: false, message: "No order items provided" });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)
      .toUpperCase()}`;

    // Load global print config once
    const printCfg = await getPrintConfigFast();

    // Fetch book snapshots and, when in derived mode, compute pricing
    const itemsWithSnapshots = await Promise.all(
      req.body.items.map(async (item) => {
        try {
          const book = await Book.findById(item.book).lean();
          let computed = null;
          if (printCfg.mode === "derived") {
            computed = computeDerivedPriceForBook({
              pages: book?.pages || 0,
              cfg: printCfg,
              variant: item.variant || {},
            });
            // Sale override: if book is on sale and sale_price < computed final, use sale_price
            const bookSale = Number(book?.sale_price);
            const bookOnSale = !!book?.is_on_sale && Number.isFinite(bookSale) && bookSale >= 0 && bookSale < (computed?.finalPrice ?? Infinity);
            if (bookOnSale) {
              computed.finalPrice = bookSale;
            }
          }
          return {
            book: item.book,
            book_title: book ? book.title : "Unknown Book",
            book_cover:
              Array.isArray(book?.cover_image) && book.cover_image.length
                ? book.cover_image[0]
                : null,
            quantity: item.quantity,
            price: printCfg.mode === "derived" ? (computed?.finalPrice ?? item.price) : item.price,
            configured: printCfg.mode === "derived" ? true : !!item.configured,
            variant: item.variant && typeof item.variant === 'object' ? {
              paperQuality: item.variant.paperQuality || null,
              printSide: item.variant.printSide || null,
              paperSize: item.variant.paperSize || null,
              colorMode: item.variant.colorMode || null,
            } : undefined,
            pricing: printCfg.mode === "derived"
              ? {
                  contentPrice: computed?.contentPrice ?? null,
                  printCost: computed?.printCost ?? null,
                  margin: computed?.marginAmount ?? null,
                  baseCost: computed?.baseCost ?? null,
                  finalPrice: computed?.finalPrice ?? null,
                }
              : (item.pricing && typeof item.pricing === 'object'
                ? {
                    contentPrice: Number(item.pricing.contentPrice ?? null),
                    printCost: Number(item.pricing.printCost ?? null),
                    margin: Number(item.pricing.margin ?? null),
                    baseCost: Number(item.pricing.baseCost ?? null),
                    finalPrice: Number(item.pricing.finalPrice ?? null),
                  }
                : undefined),
          };
        } catch (err) {
          return {
            book: item.book,
            book_title: "Error Loading Book Title",
            book_cover: null,
            quantity: item.quantity,
            price: item.price,
            configured: !!item.configured,
            variant: item.variant && typeof item.variant === 'object' ? {
              paperQuality: item.variant.paperQuality || null,
              printSide: item.variant.printSide || null,
              paperSize: item.variant.paperSize || null,
              colorMode: item.variant.colorMode || null,
            } : undefined,
            pricing: item.pricing && typeof item.pricing === 'object' ? {
              contentPrice: Number(item.pricing.contentPrice ?? null),
              printCost: Number(item.pricing.printCost ?? null),
              margin: Number(item.pricing.margin ?? null),
              baseCost: Number(item.pricing.baseCost ?? null),
              finalPrice: Number(item.pricing.finalPrice ?? null),
            } : undefined,
          };
        }
      })
    );

    const subtotal = itemsWithSnapshots.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const itemCount = itemsWithSnapshots.reduce(
      (sum, i) => sum + i.quantity,
      0
    );
    const { discountAmount, discountLabel } = computeDiscount(
      subtotal,
      itemCount
    );
    const providedShipping = Number(req.body.shipping_amount);
    const shipping =
      Number.isFinite(providedShipping) && providedShipping >= 0
        ? providedShipping
        : 0;
    const grand = Math.max(
      0,
      Number((subtotal - discountAmount + shipping).toFixed(2))
    );

    const order = await Order.create({
      order_number: orderNumber,
      user: req.user._id,
      items: itemsWithSnapshots,
      subtotal_amount: Number(subtotal.toFixed(2)),
      discount_amount: discountAmount,
      discount_label: discountLabel,
      shipping_amount: shipping,
      grand_total: grand,
      total_amount: grand, // maintain old field
      shipping_address: req.body.shipping_address || {},
      payment_info: req.body.payment_info || {
        method: "Unknown",
        status: "pending",
      },
    });

    // Create affiliate commission if promo code was used
    if (req.body.promo_code) {
      await createAffiliateCommission(order, req.body.promo_code);
    }

    res.status(201).json({ success: true, data: order });
    try {
      orderEvents.emit("order.created", {
        orderId: order._id,
        userId: req.user._id,
      });
    } catch {}
  } catch (error) {
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
      query.order_number = { $regex: search, $options: "i" };
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

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { order_status: req.body.status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
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
    if (search) criteria.order_number = { $regex: search, $options: "i" };
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
export const importOrdersFromCSV = async (req, res) => {
  try {
    if (!req.files || !req.files.file || !req.files.file[0]) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV file",
      });
    }

    const file = req.files.file[0];
    const results = [];

    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          // NEW: Add book titles to imported orders
          const ordersWithTitles = await Promise.all(
            results.map(async (orderData) => {
              if (orderData.items && Array.isArray(orderData.items)) {
                const itemsWithTitles = await Promise.all(
                  orderData.items.map(async (item) => {
                    try {
                      const book = await Book.findById(item.book);
                      return {
                        ...item,
                        book_title: book ? book.title : "Unknown Book",
                      };
                    } catch (error) {
                      return {
                        ...item,
                        book_title: "Error Loading Book Title",
                      };
                    }
                  })
                );
                return {
                  ...orderData,
                  items: itemsWithTitles,
                };
              }
              return orderData;
            })
          );

          const orders = await Order.insertMany(ordersWithTitles);
          fs.unlinkSync(file.path); // Clean up uploaded file
          res.status(201).json({
            success: true,
            message: `${orders.length} orders imported successfully`,
          });
        } catch (error) {
          fs.unlinkSync(file.path); // Clean up on error
          res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      })
      .on("error", (error) => {
        fs.unlinkSync(file.path); // Clean up on error
        res.status(400).json({
          success: false,
          message: error.message,
        });
      });
  } catch (error) {
    if (req.files?.file?.[0]?.path) {
      fs.unlinkSync(req.files.file[0].path); // Clean up on error
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
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
