// cart-controllers.js
import mongoose from "mongoose";
import Cart from "../models/cart-model.js";
import Book from "../models/book-model.js";

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId })
      .populate('items.book', 'title author cover_image price stock')
      .lean();

    if (!cart) {
      cart = {
        user: userId,
        items: [],
        total_price: 0
      };
    }

    // Check stock availability for each item
    const updatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const book = await Book.findById(item.book._id);
        const availableStock = book?.stock || 0;
        const actualQuantity = Math.min(item.quantity, availableStock);
        
        return {
          ...item,
          quantity: actualQuantity,
          max_available: availableStock,
          is_available: availableStock > 0
        };
      })
    );

    // Recalculate total price
    const total_price = updatedItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        ...cart,
        items: updatedItems,
        total_price
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!bookId || !mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({
        success: false,
        message: "Valid book ID is required"
      });
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number"
      });
    }

    // Check if book exists and is available
    const book = await Book.findOne({ _id: bookId, is_active: true });
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found or unavailable"
      });
    }

    if (book.stock < quantityNum) {
      return res.status(400).json({
        success: false,
        message: `Only ${book.stock} items available in stock`
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        total_price: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.book.toString() === bookId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantityNum;
      
      if (newQuantity > book.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${book.stock})`
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        book: bookId,
        title: book.title,
        price: book.price,
        quantity: quantityNum
      });
    }

    // Recalculate total price
    cart.total_price = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();

    // Populate the cart with book details
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.book', 'title author cover_image price stock');

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: populatedCart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    // Validate input
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a non-negative number"
      });
    }

    if (quantityNum === 0) {
      // If quantity is 0, remove the item
      return removeFromCart(req, res);
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    // Check stock availability
    const book = await Book.findById(cart.items[itemIndex].book);
    if (!book || book.stock < quantityNum) {
      return res.status(400).json({
        success: false,
        message: `Only ${book?.stock || 0} items available in stock`
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantityNum;

    // Recalculate total price
    cart.total_price = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.book', 'title author cover_image price stock');

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: populatedCart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating cart item",
      error: error
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    // Recalculate total price
    cart.total_price = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.book', 'title author cover_image price stock');

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: populatedCart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing item from cart",
      error: error.message
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    cart.items = [];
    cart.total_price = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message
    });
  }
};

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private
export const getCartItemCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    const itemCount = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

    res.status(200).json({
      success: true,
      data: {
        item_count: itemCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting cart item count",
      error: error.message
    });
  }
};