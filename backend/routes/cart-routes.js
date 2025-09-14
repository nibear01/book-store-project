// cart-routes.js
import express from "express";
import { protect } from "../middlewares/auth-middleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemCount,
} from "../controllers/cart-controllers.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/", getCart);                             // GET /api/cart - Get user's cart
router.post("/items", addToCart);                     // POST /api/cart/items - Add item to cart
router.put("/items/:itemId", updateCartItem);         // PUT /api/cart/items/:itemId - Update cart item quantity
router.delete("/items/:itemId", removeFromCart);      // DELETE /api/cart/items/:itemId - Remove item from cart
router.delete("/", clearCart);                        // DELETE /api/cart - Clear entire cart
router.get("/count", getCartItemCount);               // GET /api/cart/count - Get cart item count

export default router;
