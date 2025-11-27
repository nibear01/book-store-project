import express from "express";
import {
	subscribe,
	listSubscribers,
	removeSubscriber,
	notifyAllSubscribers,
	notifySubscriber,
} from "../controllers/subscriber-controllers.js";
import { protect } from "../middlewares/auth-middleware.js";
import { isAdmin } from "../middlewares/admin-middleware.js";

const router = express.Router();

// Public subscribe endpoint
router.post("/", subscribe);

// Admin endpoints
router.get("/", protect, isAdmin, listSubscribers);
router.delete("/:id", protect, isAdmin, removeSubscriber);
router.post("/notify", protect, isAdmin, notifyAllSubscribers);
router.post("/:id/notify", protect, isAdmin, notifySubscriber);

export default router;
