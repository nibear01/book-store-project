// cart-controllers.js
import mongoose from "mongoose";
import Cart from "../models/cart-model.js";
import Book from "../models/book-model.js";
import {
  getPrintPricingConfig,
  buildFinalUnitPrice,
  sanitizeVariant,
  sameVariant,
  DEFAULT_VARIANT,
} from "../utils/print-pricing.js";

// "?variant=economy|single|A4|bw" identifies one line when a book is in the cart with several print options
function variantFromQuery(raw) {
  if (typeof raw !== "string" || !raw) return null;
  const [paperQuality, printSide, paperSize, colorMode] = raw.split("|");
  return { paperQuality, printSide, paperSize, colorMode };
}

const matchesLine = (item, bookId, variant) =>
  item.book.toString() === bookId && (!variant || sameVariant(item.variant, variant));

function toPlainBook(bookDoc) {
  // Support both Mongoose document and plain object
  return typeof bookDoc?.toObject === "function" ? bookDoc.toObject() : bookDoc;
}

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId })
      .populate(
        "items.book",
        "title author cover_image price stock pages is_on_sale sale_price is_deal_of_the_week"
      )
      .lean();

    if (!cart) {
      cart = { user: userId, items: [], total_price: 0 };
    }

    // Books deleted since they were added populate as null: drop them from the cart
    const liveItems = cart.items.filter((item) => item.book);
    if (cart._id && liveItems.length !== cart.items.length) {
      await Cart.updateOne(
        { _id: cart._id },
        { $pull: { items: { book: { $nin: liveItems.map((i) => i.book._id) } } } }
      );
    }

    const cfg = await getPrintPricingConfig();
    const updatedItems = await Promise.all(
      liveItems.map(async (item) => {
        const book = item.book;
        const availableStock = book?.stock || 0;
        const actualQuantity = Math.min(item.quantity, availableStock);

        const safeVariant = sanitizeVariant(item.variant) || DEFAULT_VARIANT;
        const { unitPrice, breakdown } = buildFinalUnitPrice({ book, variant: safeVariant, cfg });

        return {
          ...item,
          price: unitPrice,
          pricing: breakdown,
          quantity: actualQuantity,
          max_available: availableStock,
          is_available: availableStock > 0,
        };
      })
    );

    const total_price = updatedItems.reduce((total, item) => total + item.price * item.quantity, 0);

    res.status(200).json({
      success: true,
      data: { ...cart, items: updatedItems, total_price },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message,
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1, variant } = req.body;
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
    const safeVariant = sanitizeVariant(variant);
    const existingItemIndex = cart.items.findIndex(
      item => item.book.toString() === bookId && sameVariant(item.variant, safeVariant)
    );

    // Stock is shared by every print variant of the same book
    const alreadyInCart = cart.items
      .filter((item) => item.book.toString() === bookId)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (alreadyInCart + quantityNum > book.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more than available stock (${book.stock})`
      });
    }

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantityNum;
    } else {
      // Compute price consistently with server-side pricing rules
      const cfg = await getPrintPricingConfig();
      const { unitPrice, breakdown } = buildFinalUnitPrice({ book, variant: safeVariant || DEFAULT_VARIANT, cfg });

      cart.items.push({
        book: bookId,
        title: book.title,
        price: unitPrice,
        quantity: quantityNum,
        configured: !!safeVariant,
        variant: safeVariant,
        pricing: breakdown,
      });
    }

    // Recalculate total price
    cart.total_price = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();

    // Populate the cart with book details
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.book', 'title author cover_image price stock pages is_on_sale sale_price is_deal_of_the_week');

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

    // Find the line by book ID (and print variant, when the book has several lines)
    const variant = variantFromQuery(req.query.variant);
    const itemIndex = cart.items.findIndex((item) => matchesLine(item, itemId, variant));

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    // Check stock availability
    const book = await Book.findById(cart.items[itemIndex].book);
    const otherLines = cart.items
      .filter((item, i) => i !== itemIndex && item.book.toString() === itemId)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (!book || book.stock < quantityNum + otherLines) {
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
      error: error.message
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
    // Remove by book ID: just one line when a variant is given, otherwise every line of that book
    const variant = variantFromQuery(req.query.variant);
    cart.items = cart.items.filter((item) => !matchesLine(item, itemId, variant));

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