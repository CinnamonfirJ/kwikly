import mongoose from "mongoose";

// Define Quiz Progress Schema
const QuizProgressSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  currentQuestion: {
    type: Number,
    default: 0,
  },
  selectedAnswers: {
    type: Map,
    of: String,
  },
  timeLeft: {
    type: Number,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Define the QuizResult schema
const QuizResultSchema = new mongoose.Schema({
  quizId: {
    type: String,
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
  title: {
    type: String,
    required: true,
  },
  passingScore: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
    require: true,
  },
  maxScore: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  selectedAnswers: {
    type: Map,
    of: String,
  },
  timeLeft: {
    type: Number,
  },
  updatedAt: {
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
    default: "",
  },
  rank: {
    type: String,
    default: "🥚 Brainy Beginnings",
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
  progress: [QuizProgressSchema],
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
