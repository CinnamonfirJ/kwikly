"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// Define types for Rank and XP
interface RankData {
  rank: string;
  minXP: number;
  maxXP: number;
  description: string;
}

interface RankContextType {
  xp: number;
  rank: string;
  level: number;
  updateXPAndRank: (earnedXp: number) => void;
  calculateNextLevelXP: (xp: number) => number;
}

// Rank data with levels assigned by order
const rankData: RankData[] = [
  {
    rank: "🥚 Brainy Beginnings",
    minXP: 0,
    maxXP: 99,
    description:
      "Every great mind starts small… you’re just cracking the shell!",
  },
  {
    rank: "🐣 Curious Chick",
    minXP: 100,
    maxXP: 299,
    description:
      "You’re peeping into the world of knowledge — and it's looking bright!",
  },
  {
    rank: "📚 Page Peeker",
    minXP: 300,
    maxXP: 599,
    description:
      "Skimming through concepts, one quiz at a time. You're warming up!",
  },
  {
    rank: "🌱 Brain Sprout",
    minXP: 600,
    maxXP: 999,
    description: "Look at you grow! Learning is starting to click and stick.",
  },
  {
    rank: "💡 Spark Finder",
    minXP: 1000,
    maxXP: 1499,
    description:
      "You’re connecting the dots and lighting up ideas. Keep going!",
  },
  {
    rank: "🧪 Learning Explorer",
    minXP: 1500,
    maxXP: 2499,
    description: "You're mixing memory, focus, and curiosity like a pro!",
  },
  {
    rank: "🎮 Focus Fighter",
    minXP: 2500,
    maxXP: 3999,
    description:
      "You're battling distractions and scoring big wins. Epic combo!",
  },
  {
    rank: "🧠 Recall Ranger",
    minXP: 4000,
    maxXP: 5999,
    description:
      "You're mastering active recall. Your brain is leveling up fast!",
  },
  {
    rank: "📜 Wisdom Seeker",
    minXP: 6000,
    maxXP: 7999,
    description:
      "Your quiz log is packed with XP. You're becoming a memory master.",
  },
  {
    rank: "🚀 Knowledge Voyager",
    minXP: 8000,
    maxXP: 9999,
    description:
      "You’re traveling across subjects like a rocket-fueled learner!",
  },
  {
    rank: "⚡ Brainstorm Ace",
    minXP: 10000,
    maxXP: 12999,
    description:
      "Fast, sharp, and insightful. You zap through quizzes like lightning!",
  },
  {
    rank: "🏛️ Quiz Sage",
    minXP: 13000,
    maxXP: 15999,
    description:
      "Your strategies are wise, your answers on point. A true scholar!",
  },
  {
    rank: "👑 Mind Monarch",
    minXP: 16000,
    maxXP: 19999,
    description:
      "You've ruled the quiz realms with brilliance and consistency.",
  },
  {
    rank: "🌌 Kwikly Grandmaster",
    minXP: 20000,
    maxXP: Infinity,
    description:
      "You've reached the peak! Your mind is a galaxy of glowing genius!",
  },
];

// Calculate rank and corresponding level based on XP
const calculateRankAndLevel = (xp: number): { rank: string; level: number } => {
  for (let i = 0; i < rankData.length; i++) {
    if (xp >= rankData[i].minXP && xp <= rankData[i].maxXP) {
      return { rank: rankData[i].rank, level: i + 1 }; // Level is based on rank index +1
    }
  }
  return { rank: "🚀 Grandmaster of Knowledge", level: rankData.length }; // Highest rank & level
};

// Calculate XP needed to reach the next level
const calculateNextLevelXP = (xp: number): number => {
  for (let i = 0; i < rankData.length; i++) {
    if (xp >= rankData[i].minXP && xp <= rankData[i].maxXP) {
      if (i + 1 < rankData.length) {
        return rankData[i + 1].minXP - xp;
      }
    }
  }
  return 0;
};

// Create the context
const RankContext = createContext<RankContextType | undefined>(undefined);

// Provider component
interface RankProviderProps {
  children: ReactNode;
}

export const RankProvider = ({ children }: RankProviderProps) => {
  const [xp, setXp] = useState<number>(0);
  const [currentRank, setCurrentRank] = useState<string>("");
  const [currentLevel, setCurrentLevel] = useState<number>(1);

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      const data = await res.json();
      return data;
    },
  });

  // Initialize XP, rank, and level from user data
  useEffect(() => {
    if (userData && userData.xp !== undefined) {
      const { rank, level } = calculateRankAndLevel(userData.xp);
      setXp(userData.xp);
      setCurrentRank(rank);
      setCurrentLevel(level);
    }
  }, [userData]);

  const updateXPAndRank = (earnedXp: number): void => {
    const newXP = xp + earnedXp;
    const { rank: newRank, level: newLevel } = calculateRankAndLevel(newXP);

    setXp(newXP);
    setCurrentRank(newRank);
    setCurrentLevel(newLevel);

    // Send updated XP, rank, and level to the backend
    axios
      .put("/api/user/update", {
        xp: newXP,
        rank: newRank,
        level: newLevel,
      })
      .then(() => console.log("User profile updated"))
      .catch((error) => console.error("Error updating profile:", error));
  };

  return (
    <RankContext.Provider
      value={{
        xp,
        rank: currentRank,
        level: currentLevel,
        updateXPAndRank,
        calculateNextLevelXP,
      }}
    >
      {children}
    </RankContext.Provider>
  );
};

// Custom hook to use the context
export const useRank = (): RankContextType => {
  const context = useContext(RankContext);
  if (!context) {
    throw new Error("useRank must be used within a RankProvider");
  }
  return context;
};
