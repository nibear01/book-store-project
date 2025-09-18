// server/controllers/orderController.js
import Order from '../models/Order.js';
import * as orderService from '../services/orderService.js'; // Import service functions
import { AppError } from '../utils/errorUtils.js'; // Assume you have an error utility

// Create a new order (User)
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming user ID is attached by auth middleware
    const orderData = { ...req.body, userId }; // Include userId from request

    const newOrder = await orderService.createOrder(orderData); // Delegate to service
    res.status(201).json(newOrder);
  } catch (error) {
    next(error); // Pass errors to centralized error handler
  }
};

// Get orders for the authenticated user
export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).populate('items.bookId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// Get all orders (Admin) with filtering and pagination
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, orderNumber, startDate, endDate } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (orderNumber) filters.orderNumber = { $regex: orderNumber, $options: 'i' };
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    const result = await orderService.getOrders(filters, page, limit); // Delegate to service
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get a single order by ID (User or Admin)
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('userId', 'name email')
      .populate('items.bookId');

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check ownership or admin rights
    if (order.userId._id.toString() !== req.user.id && !req.user.isAdmin) {
      return next(new AppError('Access denied', 403));
    }

    res.json(order);
  } catch (error) {
    if (error.name === 'CastError') { // Handle invalid ObjectId
       return next(new AppError('Invalid order ID', 400));
    }
    next(error);
  }
};

// Update order status (Admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier } = req.body; // Accept status, tracking, carrier

    const updatedOrder = await orderService.updateOrderStatus(id, status, trackingNumber, carrier); // Delegate
    if (!updatedOrder) {
      return next(new AppError('Order not found', 404));
    }
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// Import orders from CSV (Admin)
export const importOrdersFromCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No CSV file uploaded', 400));
    }

    const filePath = req.file.path;
    const results = await orderService.importOrdersFromCSV(filePath); // Delegate to service
    res.status(201).json({ message: 'Orders imported successfully', results });
  } catch (error) {
    next(error);
  }
};
