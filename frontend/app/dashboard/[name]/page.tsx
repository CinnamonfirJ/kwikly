"use client";

import { Award, BookOpen, Trophy, User, TrendingUp, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import QuizHistory from "@/app/components/quiz-history";
import Leaderboard from "../../components/leaderboard";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRank } from "@/context/RankContext";
import { useParams } from "next/navigation";

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

  const { name } = useParams();

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
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center bg-gradient-to-br from-slate-50 via-white to-pink-50/30 min-h-screen'>
        <div className='relative'>
          <div className='absolute -inset-4 bg-gradient-to-r from-pink-300 to-purple-300 opacity-20 rounded-full blur'></div>
          <div className='relative bg-white/80 shadow-xl backdrop-blur-sm p-8 border border-pink-200/50 rounded-2xl'>
            <div className='flex items-center space-x-3'>
              <div className='relative'>
                <div className='border-pink-500 border-t-4 border-r-4 rounded-full w-8 h-8 animate-spin'></div>
                <div className='absolute inset-0 border-2 border-pink-200 rounded-full'></div>
              </div>
              <span className='font-medium text-gray-700'>
                Loading your dashboard...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gradient-to-br from-slate-50 via-white to-pink-50/30 min-h-screen'>
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-5 pointer-events-none'>
        <div
          className='top-0 left-0 absolute w-full h-full'
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #ec4899 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className='relative mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
        {/* Welcome Header */}
        <div className='mb-12'>
          <div className='inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 mb-4 px-4 py-2 border border-pink-200/50 rounded-full font-medium text-pink-600 text-sm'>
            <Star className='mr-2 w-4 h-4' />
            Welcome back, {user?.name?.split(" ")[0]}!
          </div>
          <h1 className='bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-2 font-bold text-transparent text-4xl md:text-5xl tracking-tight'>
            Your Learning Dashboard
          </h1>
          <p className='text-gray-600 text-lg'>
            Track your progress, compete with others, and continue your learning
            journey.
          </p>
        </div>

        <div className='gap-8 grid lg:grid-cols-3'>
          <div className='lg:col-span-1'>
            <div className='relative'>
              <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-300 blur'></div>
              <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-8 border border-pink-100/50 rounded-2xl'>
                {/* Profile Image and Name */}
                <div className='flex lg:flex-row flex-col items-center gap-4 pb-6'>
                  <div className='relative'>
                    <div className='absolute -inset-2 bg-gradient-to-r from-pink-400 to-purple-400 opacity-20 rounded-full blur'></div>
                    <div className='relative shadow-lg border-4 border-white rounded-full w-20 h-20 overflow-hidden'>
                      {user?.profilePicture ? (
                        <Image
                          src={
                            user?.profilePicture || "/images/placeholder.png"
                          }
                          alt={user?.name}
                          fill
                          className='object-cover'
                        />
                      ) : (
                        <div className='flex justify-center items-center bg-gradient-to-br from-pink-100 to-purple-100 w-full h-full font-bold text-pink-600 text-xl'>
                          {getInitials(user?.name || "")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='lg:text-left text-center'>
                    <h2 className='font-bold text-gray-900 text-2xl'>
                      {user?.name}
                    </h2>
                    <div className='inline-flex items-center bg-gradient-to-r from-amber-100 to-yellow-100 mt-1 px-3 py-1 border border-amber-200/50 rounded-full'>
                      <Trophy className='mr-1 w-4 h-4 text-amber-600' />
                      <span className='font-semibold text-amber-700 text-sm'>
                        {user?.rank}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='space-y-6'>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center'>
                        <Award className='mr-2 w-5 h-5 text-pink-500' />
                        <span className='font-bold text-gray-900 text-lg'>
                          Level {user?.level}
                        </span>
                      </div>
                      <span className='font-medium text-gray-600 text-sm'>
                        {user?.xp}/{calculateNextLevelXP(user?.xp ?? 0)} XP
                      </span>
                    </div>
                    <div className='relative bg-gray-200 rounded-full w-full h-3 overflow-hidden'>
                      <div
                        className='absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500'
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
                      <div className='absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full'></div>
                    </div>
                  </div>

                  <div className='gap-4 grid grid-cols-2 pt-4'>
                    <div className='group relative'>
                      <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-pink-400 opacity-0 group-hover:opacity-20 rounded-xl transition duration-300 blur'></div>
                      <div className='relative flex flex-col justify-center items-center bg-gradient-to-br from-pink-50 to-pink-100 p-2 border border-pink-200/50 rounded-xl'>
                        <BookOpen className='mb-2 w-6 h-6 text-pink-500' />
                        <span className='font-bold text-gray-900 text-xl'>
                          {user?.quizResults.length}
                        </span>
                        <span className='text-gray-600 text-xs text-center'>
                          Quizzes Completed
                        </span>
                      </div>
                    </div>
                    <div className='group relative'>
                      <div className='absolute -inset-1 bg-gradient-to-r from-purple-300 to-purple-400 opacity-0 group-hover:opacity-20 rounded-xl transition duration-300 blur'></div>
                      <div className='relative flex flex-col justify-center items-center bg-gradient-to-br from-purple-50 to-purple-100 p-2 border border-purple-200/50 rounded-xl'>
                        <Trophy className='mb-2 w-6 h-6 text-purple-500' />
                        <span className='font-bold text-gray-900 text-xl'>
                          {Math.round(
                            ((user?.quizResults.filter((r) => r.passed)
                              .length || 0) /
                              (user?.quizResults.length || 1)) *
                              100
                          )}
                          %
                        </span>
                        <span className='text-gray-600 text-xs text-center'>
                          Success Rate
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='pt-6'>
                    <Link
                      href={`/dashboard/settings/${user?.name}`}
                      className='group inline-flex relative justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl w-full overflow-hidden font-semibold text-white transition-all duration-300'
                    >
                      <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                      <User className='mr-2 w-4 h-4' />
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='lg:col-span-2'>
            <div className='relative'>
              <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-300 blur'></div>
              <div className='relative bg-white/80 shadow-lg backdrop-blur-sm border border-pink-100/50 rounded-2xl overflow-hidden'>
                <div className='flex bg-gradient-to-r from-pink-50/50 to-purple-50/50 border-pink-100/50 border-b'>
                  {/* Quiz History Button */}
                  <button
                    onClick={() => setActiveTab("quizHistory")}
                    className={`group flex-1 px-6 py-4 border-b-2 font-semibold text-center transition-all duration-300 ${
                      activeTab === "quizHistory"
                        ? "text-pink-600 border-pink-500 bg-white/50"
                        : "text-gray-500 border-transparent hover:text-pink-500 hover:bg-white/30"
                    }`}
                  >
                    <div className='flex justify-center items-center'>
                      <BookOpen className='mr-2 w-4 h-4' />
                      Quiz History
                    </div>
                  </button>

                  {/* Leaderboard Button */}
                  <button
                    onClick={() => setActiveTab("leaderboard")}
                    className={`group flex-1 px-6 py-4 border-b-2 font-semibold text-center transition-all duration-300 ${
                      activeTab === "leaderboard"
                        ? "text-pink-600 border-pink-500 bg-white/50"
                        : "text-gray-500 border-transparent hover:text-pink-500 hover:bg-white/30"
                    }`}
                  >
                    <div className='flex justify-center items-center'>
                      <TrendingUp className='mr-2 w-4 h-4' />
                      Leaderboard
                    </div>
                  </button>
                </div>

                {/* Conditional rendering based on active tab */}
                {activeTab === "quizHistory" && (
                  <div className='p-6 animate-in duration-500 fade-in-0'>
                    <QuizHistory />
                  </div>
                )}

                {activeTab === "leaderboard" && (
                  <div className='p-6 animate-in duration-500 fade-in-0'>
                    <Leaderboard />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
