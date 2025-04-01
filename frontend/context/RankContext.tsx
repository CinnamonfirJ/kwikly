"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import axios from "axios";

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
  updateXPAndRank: (earnedXp: number) => void;
  calculateNextLevelXP: (xp: number) => number;
}

// Rank data with types
const rankData: RankData[] = [
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

// Calculate rank based on XP
const calculateRank = (xp: number): string => {
  for (let i = 0; i < rankData.length; i++) {
    if (xp >= rankData[i].minXP && xp <= rankData[i].maxXP) {
      return rankData[i].rank;
    }
  }
  return "🚀 Grandmaster of Knowledge"; // Return highest rank by default
};

// Calculate XP needed to reach the next level
const calculateNextLevelXP = (xp: number): number => {
  for (let i = 0; i < rankData.length; i++) {
    if (xp >= rankData[i].minXP && xp <= rankData[i].maxXP) {
      if (i + 1 < rankData.length) {
        return rankData[i + 1].minXP - xp; // XP needed to reach the next level
      }
    }
  }
  return 0; // Return 0 if user is at the highest rank
};

// Create the context
const RankContext = createContext<RankContextType | undefined>(undefined);

// Provider component
interface RankProviderProps {
  children: ReactNode;
}

export const RankProvider = ({ children }: RankProviderProps) => {
  const [xp, setXp] = useState<number>(0);
  const [rank, setRank] = useState<string>(calculateRank(xp));

  const updateXPAndRank = (earnedXp: number): void => {
    const newXP = xp + earnedXp;
    setXp(newXP);
    setRank(calculateRank(newXP));

    // Send updated XP and rank to the backend
    axios
      .put("/api/user/updateProfile", {
        xp: newXP,
        rank: calculateRank(newXP),
      })
      .then(() => console.log("User profile updated"))
      .catch((error) => console.error("Error updating profile:", error));
  };

  return (
    <RankContext.Provider
      value={{ xp, rank, updateXPAndRank, calculateNextLevelXP }}
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
