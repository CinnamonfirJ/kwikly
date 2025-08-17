import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy, Medal, Crown, Star, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Types for QuizResult and User
interface QuizResult {
  quizId: number;
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

// Fetch leaderboard data function
const fetchLeaderboardData = async (): Promise<User[]> => {
  const res = await fetch("/api/user/leaderboard");
  const data = await res.json();
  return data.users; // Assuming 'users' contains the leaderboard data
};

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const queryClient = useQueryClient();

  const authUser = queryClient.getQueryData<User>(["authUser"]);

  const { data: leaderboardData } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboardData,
  });

  useEffect(() => {
    if (leaderboardData) {
      setUsers(leaderboardData);
    }
  }, [leaderboardData]);

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className='w-5 h-5 text-yellow-500' />;
      case 1:
        return <Trophy className='w-5 h-5 text-gray-400' />;
      case 2:
        return <Medal className='w-5 h-5 text-amber-600' />;
      default:
        return (
          <span className='font-bold text-gray-600 text-sm'>{index + 1}</span>
        );
    }
  };

  const getRankBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return "from-yellow-400 to-yellow-500";
      case 1:
        return "from-gray-300 to-gray-400";
      case 2:
        return "from-amber-400 to-amber-500";
      default:
        return "from-pink-100 to-purple-100";
    }
  };

  const getCardGlow = (index: number) => {
    switch (index) {
      case 0:
        return "from-yellow-300 to-yellow-400";
      case 1:
        return "from-gray-300 to-gray-400";
      case 2:
        return "from-amber-300 to-amber-400";
      default:
        return "from-pink-300 to-purple-300";
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center'>
          <div className='bg-gradient-to-r from-pink-100 to-purple-100 mr-3 p-3 rounded-xl'>
            <Trophy className='w-6 h-6 text-pink-500' />
          </div>
          <div>
            <h3 className='font-bold text-gray-900 text-xl'>Top Kwiklys</h3>
            <p className='text-gray-600 text-sm'>
              See how you rank against other learners
            </p>
          </div>
        </div>
        <div className='flex items-center bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2 border border-amber-200/50 rounded-xl'>
          <Zap className='mr-2 w-4 h-4 text-amber-500' />
          <span className='font-semibold text-amber-700 text-sm'>
            Live Rankings
          </span>
        </div>
      </div>

      {/* Top 3 Special Display */}
      {users.length >= 3 && (
        <div className='gap-4 grid grid-cols-3 mb-8'>
          {/* 2nd Place */}
          <div className='group relative order-1'>
            <div
              className={`absolute -inset-1 bg-gradient-to-r ${getCardGlow(
                1
              )} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300`}
            ></div>
            <div className='relative bg-white/80 backdrop-blur-sm p-4 border border-gray-200/50 rounded-2xl text-center'>
              <div className='flex justify-center mb-3'>
                <div
                  className={`bg-gradient-to-r ${getRankBadgeColor(
                    1
                  )} p-2 rounded-full`}
                >
                  {getRankIcon(1)}
                </div>
              </div>
              <div className='relative mb-3'>
                <div className='shadow-lg mx-auto border-4 border-white rounded-full w-16 h-16 overflow-hidden'>
                  {users[1]?.profilePicture ? (
                    <Image
                      src={users[1].profilePicture || "/images/placeholder.png"}
                      alt={users[1].name}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='flex justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200 w-full h-full font-bold text-gray-600 text-lg'>
                      {getInitials(users[1]?.name)}
                    </div>
                  )}
                </div>
              </div>
              <h4 className='mb-1 font-bold text-gray-900 text-sm'>
                {users[1]?.name}
              </h4>
              <p className='mb-2 text-gray-600 text-xs'>
                Level {users[1]?.level}
              </p>
              <p className='font-bold text-gray-700 text-sm'>
                {users[1]?.xp} XP
              </p>
            </div>
          </div>

          {/* 1st Place */}
          <div className='group relative order-2'>
            <div
              className={`absolute -inset-1 bg-gradient-to-r ${getCardGlow(
                0
              )} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
            ></div>
            <div className='relative bg-white/90 backdrop-blur-sm p-6 border border-yellow-200/50 rounded-2xl text-center scale-105 transform'>
              <div className='flex justify-center mb-4'>
                <div
                  className={`bg-gradient-to-r ${getRankBadgeColor(
                    0
                  )} p-3 rounded-full shadow-lg`}
                >
                  {getRankIcon(0)}
                </div>
              </div>
              <div className='relative mb-4'>
                <div className='absolute -inset-2 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-20 rounded-full blur'></div>
                <div className='relative shadow-xl mx-auto border-4 border-white rounded-full w-20 h-20 overflow-hidden'>
                  {users[0]?.profilePicture ? (
                    <Image
                      src={users[0].profilePicture || "/images/placeholder.png"}
                      alt={users[0].name}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='flex justify-center items-center bg-gradient-to-br from-yellow-100 to-yellow-200 w-full h-full font-bold text-yellow-700 text-xl'>
                      {getInitials(users[0]?.name)}
                    </div>
                  )}
                </div>
              </div>
              <h4 className='mb-2 font-bold text-gray-900 text-base'>
                {users[0]?.name}
              </h4>
              <p className='mb-3 text-gray-600 text-sm'>
                Level {users[0]?.level}
              </p>
              <p className='font-bold text-yellow-600 text-lg'>
                {users[0]?.xp} XP
              </p>
              {authUser?.name === users[0]?.name && (
                <div className='mt-2'>
                  <span className='bg-gradient-to-r from-yellow-100 to-yellow-200 px-3 py-1 border border-yellow-300/50 rounded-full font-semibold text-yellow-700 text-xs'>
                    👑 You&apos;re #1!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3rd Place */}
          <div className='group relative order-3'>
            <div
              className={`absolute -inset-1 bg-gradient-to-r ${getCardGlow(
                2
              )} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300`}
            ></div>
            <div className='relative bg-white/80 backdrop-blur-sm p-4 border border-amber-200/50 rounded-2xl text-center'>
              <div className='flex justify-center mb-3'>
                <div
                  className={`bg-gradient-to-r ${getRankBadgeColor(
                    2
                  )} p-2 rounded-full`}
                >
                  {getRankIcon(2)}
                </div>
              </div>
              <div className='relative mb-3'>
                <div className='shadow-lg mx-auto border-4 border-white rounded-full w-16 h-16 overflow-hidden'>
                  {users[2]?.profilePicture ? (
                    <Image
                      src={users[2].profilePicture || "/images/placeholder.png"}
                      alt={users[2].name}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='flex justify-center items-center bg-gradient-to-br from-amber-100 to-amber-200 w-full h-full font-bold text-amber-700 text-lg'>
                      {getInitials(users[2]?.name)}
                    </div>
                  )}
                </div>
              </div>
              <h4 className='mb-1 font-bold text-gray-900 text-sm'>
                {users[2]?.name}
              </h4>
              <p className='mb-2 text-gray-600 text-xs'>
                Level {users[2]?.level}
              </p>
              <p className='font-bold text-gray-700 text-sm'>
                {users[2]?.xp} XP
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the Leaderboard */}
      <div className='space-y-3'>
        {users.slice(3).map((user, idx) => {
          const index = idx + 3;
          return (
            <div key={user._id} className='group relative'>
              <div
                className={`absolute -inset-1 bg-gradient-to-r ${getCardGlow(
                  index
                )} rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300`}
              ></div>
              <div
                className={`relative bg-white/70 backdrop-blur-sm border border-pink-100/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
                  authUser?.name === user.name
                    ? "bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200"
                    : ""
                }`}
              >
                <div className='flex justify-between items-center'>
                  {/* Left Section: Rank + Avatar + Name */}
                  <div className='flex items-center gap-4'>
                    {/* Rank Badge */}
                    <div
                      className={`flex justify-center items-center bg-gradient-to-r ${getRankBadgeColor(
                        index
                      )} rounded-full w-10 h-10 shadow-sm`}
                    >
                      {getRankIcon(index)}
                    </div>

                    {/* Avatar + Name */}
                    <div className='flex items-center gap-3'>
                      <div className='relative shadow-md border-2 border-white rounded-full w-12 h-12 overflow-hidden'>
                        {user.profilePicture ? (
                          <Image
                            src={
                              user.profilePicture || "/images/placeholder.png"
                            }
                            alt={user.name}
                            fill
                            className='object-cover'
                          />
                        ) : (
                          <div className='flex justify-center items-center bg-gradient-to-br from-pink-100 to-purple-100 w-full h-full font-bold text-pink-600 text-sm'>
                            {getInitials(user.name)}
                          </div>
                        )}
                      </div>

                      <div className='flex flex-col'>
                        <span className='font-semibold text-gray-900'>
                          {user.name}
                        </span>
                        {authUser?.name === user.name && (
                          <span className='bg-gradient-to-r from-pink-100 to-purple-100 px-2 py-0.5 border border-pink-200/50 rounded-full w-fit font-medium text-pink-600 text-xs'>
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Level and XP */}
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center bg-gradient-to-r from-pink-50 to-purple-50 px-3 py-1 border border-pink-200/50 rounded-lg'>
                      <Star className='mr-1 w-4 h-4 text-pink-500' />
                      <span className='font-semibold text-pink-600 text-sm'>
                        Lvl {user.level}
                      </span>
                    </div>
                    <div className='text-right'>
                      <span className='font-bold text-gray-900'>{user.xp}</span>
                      <span className='ml-1 text-gray-500 text-sm'>XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
