import express from "express";

import { protectedRoute } from "../middleware/protectedRoute.js";
import {
  createQuiz,
  deleteQuiz,
  getAllQuizzes,
  getAllQuizzesWithSecret,
  getQuizById,
  getQuizzesByUser,
  updateQuiz,
  updateQuizIsPublic,
} from "../controllers/quiz.controller.js";

// Create a Router
const router = express.Router();

// Define Routes
router.get("/", getAllQuizzes); // Get all public quizzes
router.get("/test", getAllQuizzesWithSecret); // Get all public and private quizzes
router.get("/:quizId", getQuizById); // Get quiz by ID
router.get("/user/me", protectedRoute, getQuizzesByUser); // Get quizzes by the authenticated user

router.post("/create", protectedRoute, createQuiz);
router.put("/:quizId", protectedRoute, updateQuiz); // Update a quiz
router.delete("/:quizId", protectedRoute, deleteQuiz); // Delete a quiz
router.patch("/:quizId/isPublic", protectedRoute, updateQuizIsPublic); // Update a quiz public view

// Export routes
export default router;
