import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/users.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

// Create a Router
const router = express.Router();

// Define Routes
router.get("/profile/:name", protectedRoute, getUserProfile);
router.post("/update", protectedRoute, updateUserProfile);

// Export routes
export default router;
