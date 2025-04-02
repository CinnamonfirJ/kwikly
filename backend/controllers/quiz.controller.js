import { generateUniqueQuizCode } from "../lib/utils/generateUniqueQuizCode.js";
import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js"; // Import User model

export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate({
        path: "createdBy",
        select: "-password",
      }); // Populate creator details

    res.status(200).json({
      message: "All public quizzes retrieved successfully!",
      quizzes,
    });
  } catch (error) {
    console.error("Error in Get All Quizzes Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getAllQuizzesWithSecret = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).populate({
      path: "createdBy",
      select: "-password",
    }); // Populate creator details

    res.status(200).json({
      message: "All public quizzes retrieved successfully!",
      quizzes,
    });
  } catch (error) {
    console.error("Error in Get All Quizzes Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getQuizById = async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId).sort({ createdAt: -1 }).populate({
      path: "createdBy",
      select: "-password",
    }); // Populate creator details

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found!" });
    }

    res.status(200).json({
      message: "Quiz retrieved successfully!",
      quiz,
    });
  } catch (error) {
    console.error("Error in Get Quiz By ID Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getQuizzesByUser = async (req, res) => {
  const userId = req.user._id; // Get authenticated user's ID

  try {
    const quizzes = await Quiz.find({ createdBy: userId })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "createdBy",
        select: "-password",
      }); // Populate creator details

    res.status(200).json({
      message: "User's quizzes retrieved successfully!",
      quizzes,
    });
  } catch (error) {
    console.error("Error in Get Quizzes By User Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const createQuiz = async (req, res) => {
  const createdBy = req.user._id;
  console.log("Created By:", createdBy);

  try {
    const {
      title,
      instruction,
      passingScore,
      maxScore,
      xpReward,
      subject,
      topic,
      duration,
      isPublic,
      questions,
    } = req.body;

    if (
      !title ||
      !instruction ||
      !passingScore ||
      !maxScore ||
      !xpReward ||
      !subject ||
      !topic ||
      !duration ||
      !createdBy ||
      !questions
    ) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "Quiz must have at least one question!" });
    }

    // // Fetch user details to get the name
    // const user = await User.findById(createdBy).select("name");

    // if (!user) {
    //   return res.status(400).json({ message: "Creator user not found!" });
    // }

    const code = await generateUniqueQuizCode(); // Generate a unique quiz code
    console.log("Code:", code);
    const newQuiz = new Quiz({
      title,
      instruction,
      passingScore,
      maxScore,
      xpReward,
      subject,
      topic,
      duration,
      code,
      createdBy,
      // creatorName: user.name, // Use user's name as creatorName
      isPublic: isPublic ?? true,
      questions,
    });

    console.log("New Quiz:", newQuiz);

    await newQuiz.save();

    res.status(201).json({
      message: "Quiz created successfully!",
      quiz: newQuiz,
    });
  } catch (error) {
    console.error("Error in Create Quiz Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const updateQuiz = async (req, res) => {
  const { quizId } = req.params; // Get quiz ID from the request params
  const userId = req.user._id; // Authenticated user

  try {
    let quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found!" });
    }

    // Check if the authenticated user is the creator
    if (quiz.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this quiz!" });
    }

    const {
      title,
      instruction,
      passingScore,
      maxScore,
      xpReward,
      subject,
      topic,
      duration,
      isPublic,
      questions,
    } = req.body;

    // Update fields if provided
    if (title) quiz.title = title;
    if (instruction) quiz.instruction = instruction;
    if (passingScore) quiz.passingScore = passingScore;
    if (maxScore) quiz.maxScore = maxScore;
    if (xpReward) quiz.xpReward = xpReward;
    if (subject) quiz.subject = subject;
    if (topic) quiz.topic = topic;
    if (duration) quiz.duration = duration;
    if (typeof isPublic === "boolean") quiz.isPublic = isPublic;
    if (Array.isArray(questions) && questions.length > 0)
      quiz.questions = questions;

    quiz.updatedAt = Date.now(); // Update timestamp

    await quiz.save();

    res.status(200).json({
      message: "Quiz updated successfully!",
      quiz,
    });
  } catch (error) {
    console.error("Error in Update Quiz Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const deleteQuiz = async (req, res) => {
  const { quizId } = req.params; // Get quiz ID from params
  const userId = req.user._id; // Authenticated user

  try {
    let quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found!" });
    }

    // Ensure only the creator can delete the quiz
    if (quiz.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this quiz!" });
    }

    await Quiz.findByIdAndDelete(quizId);

    res.status(200).json({ message: "Quiz deleted successfully!" });
  } catch (error) {
    console.error("Error in Delete Quiz Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

// Update Quiz isPublic Controller
export const updateQuizIsPublic = async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user._id;
  const { isPublic } = req.body;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found!" });
    }

    // Ensure only the creator can update the quiz's public status
    if (quiz.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this quiz!" });
    }

    // Validate that isPublic is a boolean value
    if (typeof isPublic !== "boolean") {
      return res
        .status(400)
        .json({ message: "isPublic must be a boolean value!" });
    }

    quiz.isPublic = isPublic;
    quiz.updatedAt = Date.now();

    await quiz.save();

    res.status(200).json({
      message: "Quiz visibility updated successfully!",
      quiz,
    });
  } catch (error) {
    console.error("Error in Update Quiz isPublic Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};
