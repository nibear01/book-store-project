import Order from '../models/order-model.js';
import csv from 'csv-parser';
import fs from 'fs';

// Create new order
export const createOrder = async (req, res) => {
    try {
        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const order = await Order.create({
            ...req.body,
            order_number: orderNumber,
            user: req.user._id
        });
        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.book', 'title image price');
        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email');
        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.book', 'title image price');
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
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
                message: 'Order not found'
            });
        }
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Import orders from CSV
export const importOrdersFromCSV = async (req, res) => {
    try {
        if (!req.files || !req.files.file || !req.files.file[0]) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a CSV file'
            });
        }

        const file = req.files.file[0];
        const results = [];

        fs.createReadStream(file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    const orders = await Order.insertMany(results);
                    fs.unlinkSync(file.path); // Clean up uploaded file
                    res.status(201).json({
                        success: true,
                        message: `${orders.length} orders imported successfully`
                    });
                } catch (error) {
                    fs.unlinkSync(file.path); // Clean up on error
                    res.status(400).json({
                        success: false,
                        message: error.message
                    });
                }
            })
            .on('error', (error) => {
                fs.unlinkSync(file.path); // Clean up on error
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            });
    } catch (error) {
        if (req.files?.file?.[0]?.path) {
            fs.unlinkSync(req.files.file[0].path); // Clean up on error
        }
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
