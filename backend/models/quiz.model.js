import mongoose from "mongoose";

// Define the Question schema
const QuestionSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
});

// Define the Quiz schema
const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  instruction: {
    type: String,
    required: true,
  },
  passingScore: {
    type: Number,
    required: true,
  },
  maxScore: {
    type: Number,
    required: true,
  },
  xpReward: {
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
  code: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  questions: [QuestionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the Quiz model
const Quiz = mongoose.model("Quiz", QuizSchema);
export default Quiz;
