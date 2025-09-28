import Order from "../models/order-model.js";
import Book from "../models/book-model.js"; // Import Book model
import csv from "csv-parser";
import fs from "fs";

// Utility: compute discount based on subtotal & itemCount (mirrors frontend rules)
const computeDiscount = (subtotal, itemCount) => {
  let amount = 0;
  let label = "";
  if (subtotal >= 200) {
    amount = subtotal * 0.15;
    label = "15% off orders $200+";
  } else if (subtotal >= 100) {
    amount = subtotal * 0.1;
    label = "10% off orders $100+";
  } else if (itemCount >= 5) {
    amount = subtotal * 0.05;
    label = "5% multi-item discount (5+ items)";
  }
  return { discountAmount: Number(amount.toFixed(2)), discountLabel: label };
};

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
      .substr(2, 9)
      .toUpperCase()}`;

    // Fetch book snapshots
    const itemsWithSnapshots = await Promise.all(
      req.body.items.map(async (item) => {
        try {
          const book = await Book.findById(item.book).lean();
          return {
            book: item.book,
            book_title: book ? book.title : "Unknown Book",
            book_cover:
              Array.isArray(book?.cover_image) && book.cover_image.length
                ? book.cover_image[0]
                : null,
            quantity: item.quantity,
            price: item.price,
          };
        } catch (err) {
          return {
            book: item.book,
            book_title: "Error Loading Book Title",
            book_cover: null,
            quantity: item.quantity,
            price: item.price,
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

    res.status(201).json({ success: true, data: order });
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
    const orders = await Order.find().populate("user", "name email phone");
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
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch stats",
        error: error.message,
      });
  }
};
