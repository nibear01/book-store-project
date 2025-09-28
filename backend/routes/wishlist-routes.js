import express from "express";
import { protect } from "../middlewares/auth-middleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistCount,
} from "../controllers/wishlist-controllers.js";

const router = express.Router();

router.use(protect);

router.get("/", getWishlist); // GET /api/wishlist
router.get("/count", getWishlistCount); // GET /api/wishlist/count
router.post("/items", addToWishlist); // POST /api/wishlist/items
router.delete("/items/:bookId", removeFromWishlist); // DELETE /api/wishlist/items/:bookId
router.delete("/", clearWishlist); // DELETE /api/wishlist

export default router;
