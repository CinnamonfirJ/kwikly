"use client";

import { Award, BookOpen, Trophy, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import QuizHistory from "@/app/components/quiz-history";
import Leaderboard from "../../components/leaderboard";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRank } from "@/context/RankContext";
// import { useParams } from "next/navigation";

// Types for QuizResult and User
interface QuizResult {
  quizId: string;
  score: number;
  passed: boolean;
  completedAt: Date;
}

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  rank: string;
  favouriteTopic: string;
  level: number;
  quizResults: QuizResult[];
  xp: number;
  createdAt: string;
  updatedAt: string;
}

interface Quiz {
  _id: string;
  title: string;
  instruction: string;
  passingScore: number;
  maxScore: number;
  xpReward: number;
  subject: string;
  topic: string;
  duration: string;
  code: string;
  createdBy: User;
  isPublic: boolean;
  // questions: Question[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("quizHistory"); // default tab is 'quizHistory'
  const [user, setUser] = useState<User | null>(null); // Initialize with `null`
  const [quizResults, setQuizResults] = useState<Quiz>();
  const { calculateNextLevelXP } = useRank();

  // const { name } = useParams();

  // console.log("Param name", name);

  const { data: userResults } = useQuery({
    queryKey: ["userResults"],
    queryFn: async () => {
      try {
        // Ensure `user?.quizResults` is an array and map correctly over it
        const quizIds = user?.quizResults?.map((result) => result.quizId);

        // If there are no quiz results, handle it gracefully (perhaps returning empty or null)
        if (!quizIds || quizIds.length === 0) {
          return null; // Or an empty array, depending on your logic
        }

        // Now fetch using the correctly formatted URL
        const res = await fetch(`/api/quiz/${quizIds.join(",")}`); // Use `.join(",")` to pass multiple IDs
        const data = await res.json();
        return data;
      } catch (error) {
        throw error;
      }
    },
  });

  console.log(
    `The Collected /api/quiz/${user?.quizResults
      ?.map((results) => results.quizId)
      .join(",")}`
  );

  const { data: userData } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch(`/api/user/profile/${name}`);
      const data = await res.json();
      return data;
    },
  });

  useEffect(() => {
    setIsLoading(true);
    if (userData) {
      setUser(userData);
      setIsLoading(false);
    }

    if (userResults) {
      setQuizResults(userResults);
    }
  }, [userData, userResults]);

  console.log(quizResults);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  if (isLoading) {
    return (
      <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
        <div className='flex justify-center items-center h-64'>
          <div className='border-pink-500 border-t-2 border-b-2 rounded-full w-12 h-12 animate-spin'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
      <div className='gap-8 grid md:grid-cols-3'>
        <div className='md:col-span-1'>
          <div className='bg-white shadow-sm p-6 border border-pink-100 rounded-xl'>
            <div className='flex flex-row items-center gap-4 pb-4'>
              <div className='relative border-4 border-pink-100 rounded-full w-16 h-16 overflow-hidden'>
                {user?.profilePicture ? (
                  <Image
                    src={user?.profilePicture || "/images/placeholder.png"}
                    alt={user?.name}
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='flex justify-center items-center bg-pink-50 w-full h-full font-medium text-pink-500 text-xl'>
                    {getInitials(user?.name || "")}
                  </div>
                )}
              </div>
              <div>
                <h2 className='font-bold text-xl'>{user?.name}</h2>
                <p className='text-gray-500 text-sm'>{user?.rank}</p>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center'>
                    <Award className='mr-2 w-5 h-5 text-pink-500' />
                    <span className='font-medium'>Level {user?.level}</span>
                  </div>
                  <span className='text-gray-500 text-sm'>
                    {user?.xp}/{calculateNextLevelXP(user?.xp ?? 0)} XP
                  </span>
                </div>
                <div className='bg-pink-100 rounded-full w-full h-2 overflow-hidden'>
                  <div
                    className='bg-pink-500 rounded-full h-full'
                    style={{
                      width: `${
                        user?.xp && calculateNextLevelXP(user?.xp) !== 0
                          ? (user.xp /
                              (calculateNextLevelXP(user.xp) + user.xp)) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className='gap-4 grid grid-cols-2 pt-4'>
                <div className='flex flex-col justify-center items-center bg-pink-50 p-4 rounded-lg'>
                  <BookOpen className='mb-2 w-6 h-6 text-pink-500' />
                  <span className='font-bold text-xl'>
                    {user?.quizResults.length}
                  </span>
                  <span className='text-gray-500 text-xs'>
                    Quizzes Completed
                  </span>
                </div>
                <div className='flex flex-col justify-center items-center bg-pink-50 p-4 rounded-lg'>
                  <Trophy className='mb-2 w-6 h-6 text-pink-500' />
                  <span className='font-bold text-xl'>3</span>
                  <span className='text-gray-500 text-xs'>Achievements</span>
                </div>
              </div>

              <div className='pt-4'>
                <Link
                  href={`/dashboard/settings/${user?.name}`}
                  className='inline-flex items-center font-medium text-pink-500 hover:text-pink-600 text-sm'
                >
                  <User className='mr-1 w-4 h-4' />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className='md:col-span-2'>
          <div className='bg-white shadow-sm border border-pink-100 rounded-xl overflow-hidden'>
            <div className='flex border-pink-100 border-b'>
              {/* Quiz History Button */}
              <button
                onClick={() => setActiveTab("quizHistory")}
                className={`flex-1 px-4 py-3  border-b-2 font-medium text-center ${
                  activeTab === "quizHistory"
                    ? "text-pink-500 border-pink-500"
                    : "text-gray-500 border-transparent"
                } hover:text-pink-500 transition-colors `}
              >
                Quiz History
              </button>

              {/* Leaderboard Button */}
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`flex-1 px-4 py-3  border-b-2 font-medium text-center ${
                  activeTab === "leaderboard"
                    ? "text-pink-500 border-pink-500"
                    : "text-gray-500 border-transparent"
                } hover:text-pink-500 transition-colors `}
              >
                Leaderboard
              </button>
            </div>

            {/* Conditional rendering based on active tab */}
            {activeTab === "quizHistory" && (
              <div className='p-4'>
                <QuizHistory />
              </div>
            )}

            {activeTab === "leaderboard" && (
              <div className='p-4'>
                <Leaderboard />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
