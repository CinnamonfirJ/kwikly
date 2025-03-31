import express from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  getUser,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

// Create a Router
const router = express.Router();

// Define Routes
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/user", protectedRoute, getUser);

// Export routes
export default router;
