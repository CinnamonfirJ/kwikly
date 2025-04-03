import express from "express";
import {
  deleteUserQuizProgress,
  getAllUsers,
  getTopUsers,
  getUserProfile,
  getUserQuizProgress,
  saveQuizResult,
  saveUserQuizProgress,
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

// Quiz progress routes
router.get("/:userId/progress/:quizId", getUserQuizProgress);
router.post("/:userId/progress", saveUserQuizProgress);
router.delete("/:userId/progress/:quizId", deleteUserQuizProgress);

router.post("/save", protectedRoute, saveQuizResult);

// Export routes
export default router;
