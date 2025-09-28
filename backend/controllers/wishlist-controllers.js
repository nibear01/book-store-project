import mongoose from "mongoose";
import Wishlist from "../models/wishlist-model.js";
import Book from "../models/book-model.js";

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    let wishlist = await Wishlist.findOne({ user: userId })
      .populate("items.book", "title author cover_image price stock slug")
      .lean();

    if (!wishlist) {
      wishlist = { user: userId, items: [] };
    }

    return res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error fetching wishlist", error: error.message });
  }
};

// @desc    Add a book to wishlist
// @route   POST /api/wishlist/items
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    if (!bookId || !mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ success: false, message: "Valid book ID is required" });
    }

    const book = await Book.findOne({ _id: bookId, is_active: true });
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found or inactive" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    const exists = wishlist.items.some((i) => i.book.toString() === bookId);
    if (!exists) {
      wishlist.items.push({ book: bookId, title: book.title, price: book.price });
    }

    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id)
      .populate("items.book", "title author cover_image price stock slug");

    return res.status(200).json({ success: true, message: "Added to wishlist", data: populated });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error adding to wishlist", error: error.message });
  }
};

// @desc    Remove a book from wishlist (by bookId)
// @route   DELETE /api/wishlist/items/:bookId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ success: false, message: "Invalid book ID" });
    }

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    const initial = wishlist.items.length;
    wishlist.items = wishlist.items.filter((i) => i.book.toString() !== bookId);

    if (wishlist.items.length === initial) {
      return res.status(404).json({ success: false, message: "Item not found in wishlist" });
    }

    await wishlist.save();
    const populated = await Wishlist.findById(wishlist._id)
      .populate("items.book", "title author cover_image price stock slug");

    return res.status(200).json({ success: true, message: "Removed from wishlist", data: populated });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error removing from wishlist", error: error.message });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }
    wishlist.items = [];
    await wishlist.save();
    return res.status(200).json({ success: true, message: "Wishlist cleared", data: wishlist });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error clearing wishlist", error: error.message });
  }
};

// @desc    Get wishlist item count
// @route   GET /api/wishlist/count
// @access  Private
export const getWishlistCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const wishlist = await Wishlist.findOne({ user: userId }).lean();
    const count = wishlist ? (wishlist.items?.length || 0) : 0;
    return res.status(200).json({ success: true, data: { item_count: count } });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error getting wishlist count", error: error.message });
  }
};
