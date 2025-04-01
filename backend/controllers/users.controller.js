import User from "../models/user.model.js";
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
    let user = await User.findById(userId);
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

    user = await user.save();

    user.password = null;
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in Update User Profile Controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};
