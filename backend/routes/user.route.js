import express from "express";
import {
  getAllUsers,
  getTopUsers,
  getUserProfile,
  saveQuizResult,
  updateUserProfile,
} from "../controllers/users.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

// Create a Router
const router = express.Router();

// Define Routes
router.get("/", getAllUsers);
router.get("/leaderboard", getTopUsers);
router.get("/profile/:name", protectedRoute, getUserProfile);
router.put("/update", protectedRoute, updateUserProfile);

router.post("/save", protectedRoute, saveQuizResult);

// Export routes
export default router;
