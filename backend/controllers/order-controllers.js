import mongoose from "mongoose";
import Order from "../models/order-model.js";
import Book from "../models/book-model.js";
import Cart from "../models/cart-model.js";

// Helper: Generate order summary
const generateOrderSummary = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const shipping_cost = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const total_amount = subtotal + tax + shipping_cost;
  
  return { subtotal, tax, shipping_cost, total_amount };
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shipping_address, payment_method } = req.body;

    // Validate required fields
    if (!shipping_address || !payment_method) {
      return res.status(400).json({
        success: false,
        message: "Shipping address and payment method are required"
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.book');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // Check stock availability and prepare order items
    const orderItems = [];
    for (const item of cart.items) {
      const book = await Book.findById(item.book._id);
      
      if (!book || !book.is_active) {
        return res.status(400).json({
          success: false,
          message: `Book "${item.title}" is no longer available`
        });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.title}". Only ${book.stock} available`
        });
      }

      orderItems.push({
        book: item.book._id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        cover_image: item.book.cover_image?.[0] || null
      });
    }

    // Calculate order totals
    const { subtotal, tax, shipping_cost, total_amount } = generateOrderSummary(orderItems);

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      subtotal,
      tax,
      shipping_cost,
      total_amount,
      shipping_address,
      payment_method
    });

    // Update book stock
    for (const item of orderItems) {
      await Book.findByIdAndUpdate(
        item.book,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], total_price: 0 }
    );

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.book', 'title author');

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const p = Math.max(1, parseInt(page));
    const l = Math.min(50, Math.max(1, parseInt(limit)));

    // Build filter
    const filter = { user: userId };
    if (status && ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      filter.order_status = status;
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('items.book', 'title author cover_image')
      .sort({ created_at: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean();

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: p,
        pages: Math.ceil(total / l),
        limit: l
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.book', 'title author description cover_image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this order"
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      payment_status, 
      start_date, 
      end_date 
    } = req.query;

    const p = Math.max(1, parseInt(page));
    const l = Math.min(100, Math.max(1, parseInt(limit)));

    // Build filter
    const filter = {};
    if (status) filter.order_status = status;
    if (payment_status) filter.payment_status = payment_status;
    
    // Date range filter
    if (start_date || end_date) {
      filter.created_at = {};
      if (start_date) filter.created_at.$gte = new Date(start_date);
      if (end_date) {
        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);
        filter.created_at.$lte = end;
      }
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ created_at: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean();

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: p,
        pages: Math.ceil(total / l),
        limit: l
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, tracking_number, carrier, cancellation_reason } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!order_status || !validStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: "Valid order status is required"
      });
    }

    const updateData = { order_status };
    const now = new Date();

    // Handle special status updates
    if (order_status === 'cancelled') {
      updateData.cancelled_at = now;
      if (cancellation_reason) updateData.cancellation_reason = cancellation_reason;
      
      // Restore stock if order is cancelled
      const order = await Order.findById(id);
      for (const item of order.items) {
        await Book.findByIdAndUpdate(
          item.book,
          { $inc: { stock: item.quantity } }
        );
      }
    } else if (order_status === 'delivered') {
      updateData.delivered_at = now;
    }

    if (tracking_number) updateData.tracking_number = tracking_number;
    if (carrier) updateData.carrier = carrier;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!payment_status || !validStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: "Valid payment status is required"
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { payment_status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message
    });
  }
};

// @desc    Get sales statistics (Admin only)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
export const getSalesStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    // Total sales
    const totalSales = await Order.aggregate([
      {
        $match: {
          created_at: { $gte: startDate },
          payment_status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_amount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total_amount' }
        }
      }
    ]);
    
    // Sales by status
    const salesByStatus = await Order.aggregate([
      {
        $match: {
          created_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$order_status',
          count: { $sum: 1 },
          revenue: { $sum: '$total_amount' }
        }
      }
    ]);
    
    // Recent orders
    const recentOrders = await Order.find({ 
      created_at: { $gte: startDate } 
    })
      .populate('user', 'name')
      .sort({ created_at: -1 })
      .limit(5)
      .lean();
    
    res.status(200).json({
      success: true,
      data: {
        period,
        startDate,
        stats: totalSales[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
        byStatus: salesByStatus,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sales statistics",
      error: error.message
    });
  }
};