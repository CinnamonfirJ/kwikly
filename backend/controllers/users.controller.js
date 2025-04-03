import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-password");

    res.status(200).json({
      message: "All public users retrieved successfully!",
      users,
    });
  } catch (error) {
    console.error("Error in Get All Users Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getTopUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ xp: -1 })
      .limit(5)
      .select("-password");

    res.status(200).json({
      message: "All public users retrieved successfully!",
      users,
    });
  } catch (error) {
    console.error("Error in Get All Users Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getUserProfile = async (req, res) => {
  const { name } = req.params;

  try {
    const user = await User.findOne({ name }).select("-password");

    if (!user) return res.status(400).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in Get User Profile Controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const {
    name,
    email,
    currentPassword,
    newPassword,
    favouriteTopic,
    xp,
    rank,
    level,
  } = req.body;
  let { profilePicture } = req.body;

  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      return res
        .status(400)
        .json({ message: "Provide both new and current password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });

      // Validate Password
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long!" });
      }

      // Hash Password
      const salt = await bcrypt.genSalt(10); // Generate a salt
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profilePicture) {
      if (user.profilePicture) {
        await cloudinary.uploader.destroy(
          user.profilePicture.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profilePicture);
      profilePicture = uploadedResponse.secure_url;
    }

    // Update XP and rank
    user.xp = xp || user.xp;
    user.rank = rank || user.rank;
    user.level = level || user.level;

    user.name = name || user.name;
    user.email = email || user.email;
    user.favouriteTopic = favouriteTopic || user.favouriteTopic;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();

    user.password = null;
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in Update User Profile Controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const saveQuizResult = async (req, res) => {
  try {
    const {
      userId,
      quizId,
      score,
      passed,
      title,
      passingScore,
      maxScore,
      subject,
      topic,
      duration,
    } = req.body;

    // Validate request data
    if (
      !userId ||
      !quizId ||
      score === undefined ||
      passed === undefined ||
      !title ||
      passingScore === undefined ||
      maxScore === undefined ||
      !subject ||
      !topic ||
      !duration
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the quiz was already completed
    const existingQuiz = user.quizResults.find(
      (result) => result.quizId === quizId
    );

    if (existingQuiz) {
      console.log(
        "User has already completed this quiz before. Updating score if needed..."
      );

      // Optionally update the score if it's higher
      if (score > existingQuiz.score) {
        existingQuiz.score = score;
        existingQuiz.passed = passed;
        existingQuiz.completedAt = new Date();
      }

      await user.save();
      return res.status(200).json({
        message: "Quiz result updated, quizzesCompleted remains unchanged.",
      });
    }

    // If the quiz is new, push the quiz result to the quizResults array
    user.quizResults.push({
      quizId,
      score,
      passed,
      title,
      passingScore,
      maxScore,
      subject,
      topic,
      duration,
    });

    // Optionally increase quizzesCompleted if you need to track it
    user.quizzesCompleted += 1;

    await user.save();
    return res
      .status(201)
      .json({ message: "Quiz result saved successfully.", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserQuizProgress = async (req, res) => {
  const { userId, quizId } = req.params;

  // Validate required parameters
  if (!userId || !quizId) {
    return res
      .status(400)
      .json({ message: "Missing required parameters: userId or quizId!" });
  }

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Find the progress for the specific quiz
    const progress = user.progress.find((p) => p.quizId === quizId);

    if (!progress) {
      return res
        .status(404)
        .json({ message: "No progress found for this quiz!" });
    }

    // Respond with the progress
    res.status(200).json({
      message: "Quiz progress retrieved successfully!",
      progress,
    });
  } catch (error) {
    console.error("Error in Get User Quiz Progress Controller:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error!", error: error.message });
  }
};

export const saveUserQuizProgress = async (req, res) => {
  const { userId } = req.params; // Extract userId from the request parameters
  const { quizId, currentQuestion, selectedAnswers, timeLeft } = req.body; // Extract progress data from the request body

  // Validate required fields
  if (!quizId || currentQuestion === undefined || !timeLeft) {
    return res.status(400).json({ message: "Missing required fields!" });
  }

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Check if progress for the quiz already exists
    const progressIndex = user.progress.findIndex((p) => p.quizId === quizId);

    if (progressIndex !== -1) {
      // Update existing progress
      user.progress[progressIndex].currentQuestion = currentQuestion;
      user.progress[progressIndex].selectedAnswers = selectedAnswers;
      user.progress[progressIndex].timeLeft = timeLeft;
      user.progress[progressIndex].updatedAt = new Date();
    } else {
      // Add new progress if it doesn't exist
      user.progress.push({
        quizId,
        userId,
        currentQuestion,
        selectedAnswers,
        timeLeft,
        updatedAt: new Date(),
      });
    }

    // Save the updated user document
    await user.save();

    // Respond with the updated progress
    res.status(200).json({
      message: "Progress saved successfully!",
      progress:
        progressIndex !== -1
          ? user.progress[progressIndex]
          : user.progress[user.progress.length - 1],
    });
  } catch (error) {
    console.error(
      "Error in Save User Quiz Progress Controller:",
      error.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const deleteUserQuizProgress = async (req, res) => {
  const { userId, quizId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Find the progress index
    const progressIndex = user.progress.findIndex((p) => p.quizId === quizId);

    if (progressIndex === -1) {
      return res
        .status(404)
        .json({ message: "No progress found for this quiz!" });
    }

    // Remove the progress
    user.progress.splice(progressIndex, 1);
    await user.save();

    res.status(200).json({
      message: "Progress deleted successfully!",
    });
  } catch (error) {
    console.error(
      "Error in Delete User Quiz Progress Controller:",
      error.message
    );
    res.status(500).json({ message: "Internal Server Error!" });
  }
};
