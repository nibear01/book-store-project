// server/services/orderService.js
import Order from '../models/Order.js';
import * as csv from '../utils/csvParser.js'; // Assume a utility function
import fs from 'fs/promises'; // For file cleanup

export const createOrder = async (orderData) => {
  // Add validation logic here if needed (e.g., check book stock)
  const order = new Order(orderData);
  await order.save();
  // Populate references before returning if needed
  return await Order.findById(order._id).populate('items.bookId userId');
};

export const getOrders = async (filters, page, limit) => {
  const query = Order.find(filters).populate('userId', 'name email').populate('items.bookId');
  const total = await Order.countDocuments(filters);
  const list = await query
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    list,
    total,
    page: parseInt(page, 10),
    pages: Math.ceil(total / limit),
  };
};

export const updateOrderStatus = async (id, status, trackingNumber, carrier) => {
  const updateData = {};
  if (status) updateData.status = status;
  if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber; // Allow setting to null/empty
  if (carrier !== undefined) updateData.carrier = carrier;

  // Optional: Add logic for status transitions (e.g., can't go from delivered to pending)
  // if (status && !isValidTransition(currentStatus, status)) { throw new Error(...) }

  return await Order.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true } // Return updated doc, run schema validation
  ).populate('userId', 'name email').populate('items.bookId');
};

export const importOrdersFromCSV = async (filePath) => {
  try {
    const ordersData = await csv.parseCSV(filePath); // Implement this utility
    const results = {
      success: 0,
      errors: [],
    };

    for (const orderData of ordersData) {
      try {
        // Validate and transform CSV data to match Order schema
        // Example transformation (adjust based on your CSV structure):
        // orderData.items = orderData.items.split(',').map(itemStr => {
        //   const [bookId, quantity] = itemStr.split(':');
        //   return { bookId, quantity: parseInt(quantity) };
        // });
        // orderData.totalAmount = parseFloat(orderData.totalAmount);
        // orderData.shippingAddress = JSON.parse(orderData.shippingAddress); // If stored as JSON string

        const order = new Order(orderData);
        await order.save(); // This will trigger the pre-save hook for orderNumber
        results.success++;
      } catch (err) {
        results.errors.push({ data: orderData, error: err.message });
      }
    }

    // Clean up the temporary file
    await fs.unlink(filePath);

    return results;
  } catch (error) {
    // Ensure file cleanup happens even on general errors
    try { await fs.unlink(filePath); } catch (unlinkErr) { /* Ignore unlink errors */ }
    throw error; // Re-throw the original error
  }
};
