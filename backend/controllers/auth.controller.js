import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateTokenAndSetCookies } from "../lib/utils/generateTokenAndSetCookies.js";

// Create Controllers
export const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invaild Email" });
    }

    // Find if Existing User
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists!" });
    }

    // Find if Existing Email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "User already registered with this email!" });
    }

    // Validate Password
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long!" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookies(newUser._id, res);
      await newUser.save();

      res.status(200).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        profilePicture: newUser.profilePicture,
        rank: newUser.rank,
        favouriteTopic: newUser.favouriteTopic,
        level: newUser.level,
        xp: newUser.xp,
        quizResults: newUser.quizResults,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      });
    } else {
      return res.status(400).json({ message: "Invalid User Data" });
    }
  } catch (error) {
    console.log("Error in Sign Up Controller", error.message);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    generateTokenAndSetCookies(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      rank: user.rank,
      favouriteTopic: user.favouriteTopic,
      level: user.level,
      xp: user.xp,
      quizResults: user.quizResults,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.log("Error in Login Controller", error.message);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout Successful!" });
  } catch (error) {
    console.log("Error in LogOut Controller", error.message);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in Get User Controller", error.message);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

// "Boom! Account created, let's see if you can do just as well on the quizzes 🚀",
