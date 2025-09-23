import Order from '../models/order-model.js';
import Book from '../models/book-model.js'; // Import Book model
import csv from 'csv-parser';
import fs from 'fs';

// Create new order
export const createOrder = async (req, res) => {
    try {
        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // NEW: Fetch book titles for each item
        const itemsWithTitles = await Promise.all(
            req.body.items.map(async (item) => {
                try {
                    const book = await Book.findById(item.book);
                    return {
                        ...item,
                        book_title: book ? book.title : 'Unknown Book'
                    };
                } catch (error) {
                    console.error(`Error fetching book title for ID ${item.book}:`, error);
                    return {
                        ...item,
                        book_title: 'Error Loading Book Title'
                    };
                }
            })
        );

        const order = await Order.create({
            ...req.body,
            items: itemsWithTitles, // Use items with titles
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
            .populate('user', 'name email phone');
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
        const orders = await Order.find().populate('user', 'name email phone');
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
            .populate('user', 'name email phone');
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
                                                book_title: book ? book.title : 'Unknown Book'
                                            };
                                        } catch (error) {
                                            return {
                                                ...item,
                                                book_title: 'Error Loading Book Title'
                                            };
                                        }
                                    })
                                );
                                return {
                                    ...orderData,
                                    items: itemsWithTitles
                                };
                            }
                            return orderData;
                        })
                    );

                    const orders = await Order.insertMany(ordersWithTitles);
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
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting order',
            error: error.message
        });
    }
};