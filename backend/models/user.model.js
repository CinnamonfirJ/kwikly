import mongoose from "mongoose";

// Define the QuizResult schema
const QuizResultSchema = new mongoose.Schema({
  quizId: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  passed: {
    type: Boolean,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

// Define the User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "/placeholder.png?height=100&width=100",
  },
  rank: {
    type: String,
    default: "🥚 Egghead",
  },
  favouriteTopic: {
    type: String,
    default: "",
  },
  level: {
    type: Number,
    default: 1,
  },
  xp: {
    type: Number,
    default: 0,
  },
  quizResults: [QuizResultSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the User model
const User = mongoose.model("User", UserSchema);
export default User;
