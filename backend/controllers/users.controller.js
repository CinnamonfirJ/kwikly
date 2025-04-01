import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

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

const rankData = [
  {
    rank: "🥚 Egghead",
    minXP: 0,
    maxXP: 99,
    description:
      "Every genius starts somewhere... and you’re just cracking the shell!",
  },
  {
    rank: "🐣 Curious Chick",
    minXP: 100,
    maxXP: 299,
    description:
      "You’ve taken your first steps into quiz greatness. Peep peep!",
  },
  {
    rank: "📖 Page Turner",
    minXP: 300,
    maxXP: 599,
    description:
      "Reading through quizzes like it’s your favorite book. Keep flipping!",
  },
  {
    rank: "🧠 Brain Sprout",
    minXP: 600,
    maxXP: 999,
    description:
      "Your knowledge is growing like a smart little plant in the sun.",
  },
  {
    rank: "💡 Idea Machine",
    minXP: 1000,
    maxXP: 1499,
    description:
      "You’re bursting with ideas! Now, can you turn them into quiz victories?",
  },
  {
    rank: "🎩 Trivia Apprentice",
    minXP: 1500,
    maxXP: 2499,
    description:
      "You’re picking up tricks of the quiz trade. The hat suits you!",
  },
  {
    rank: "🔬 Quiz Scientist",
    minXP: 2500,
    maxXP: 3999,
    description: "Mixing curiosity and knowledge like a true scientist!",
  },
  {
    rank: "🎭 Riddle Master",
    minXP: 4000,
    maxXP: 5999,
    description: "Your brain twists and turns like a good mystery novel.",
  },
  {
    rank: "📜 Fact Collector",
    minXP: 6000,
    maxXP: 7999,
    description:
      "Your mind is a library of trivia. Just don’t forget the Dewey Decimal System!",
  },
  {
    rank: "🌌 Knowledge Voyager",
    minXP: 8000,
    maxXP: 9999,
    description: "Sailing through the cosmos of knowledge at warp speed!",
  },
  {
    rank: "⚡ Lightning Thinker",
    minXP: 10000,
    maxXP: 12999,
    description: "Your answers come at the speed of light! Are you even human?",
  },
  {
    rank: "🏛️ Trivia Titan",
    minXP: 13000,
    maxXP: 15999,
    description: "Legends speak of a wise being… it’s YOU!",
  },
  {
    rank: "👑 Quiz Royalty",
    minXP: 16000,
    maxXP: 19999,
    description: "Bow down, commoners! The quiz kingdom belongs to you.",
  },
  {
    rank: "🚀 Grandmaster of Knowledge",
    minXP: 20000,
    maxXP: Infinity,
    description:
      "You’ve reached the pinnacle of quiz-dom. The universe seeks YOUR wisdom!",
  },
];

const calculateRank = (xp) => {
  for (let i = 0; i < rankData.length; i++) {
    if (xp >= rankData[i].minXP && xp <= rankData[i].maxXP) {
      return rankData[i].rank;
    }
  }
  return "🚀 Grandmaster of Knowledge"; // Return highest rank by default
};

export const updateUserProfile = async (req, res) => {
  const { name, email, currentPassword, newPassword, favouriteTopic, xp } =
    req.body;
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
    if (xp !== undefined) {
      user.xp = xp;
      user.rank = calculateRank(xp); // Calculate the rank based on the XP
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.favouriteTopic = favouriteTopic || user.favouriteTopic;
    user.profilePicture = profilePicture || user.profilePicture;
    user.xp = xp || user.xp;

    user = await user.save();

    user.password = null;
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in Update User Profile Controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};
