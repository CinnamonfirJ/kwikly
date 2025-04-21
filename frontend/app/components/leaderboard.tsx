import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Trophy, Medal } from "lucide-react";
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
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  return (
    <div className='bg-white shadow-sm rounded-xl'>
      <div className='p-4 border-pink-100 border-b'>
        <h3 className='flex items-center font-semibold text-gray-800 text-lg'>
          <Trophy className='mr-2 w-5 h-5 text-pink-500' />
          Top Kwiklys
        </h3>
      </div>

      <div className='p-4'>
        <div className='space-y-4'>
          {users.map((user, index) => (
            <div
              key={user._id}
              className='flex sm:flex-row flex-col justify-between sm:items-center gap-2 sm:gap-4'
            >
              {/* Left Section: Rank + Avatar + Name */}
              <div className='flex items-center gap-3'>
                {/* Rank */}
                <div className='flex justify-center items-center bg-pink-100 rounded-full w-8 h-8 text-pink-500'>
                  {index === 0 ? (
                    <Trophy className='w-4 h-4' />
                  ) : index === 1 ? (
                    <Medal className='w-4 h-4' />
                  ) : index === 2 ? (
                    <Award className='w-4 h-4' />
                  ) : (
                    <span className='font-bold text-sm'>{index + 1}</span>
                  )}
                </div>

                {/* Avatar + Name */}
                <div className='flex items-center gap-2'>
                  <div className='relative rounded-full w-10 h-10 overflow-hidden'>
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture || "/images/placeholder.png"}
                        alt={user.name}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='flex justify-center items-center bg-pink-50 w-full h-full font-medium text-pink-500 text-sm'>
                        {getInitials(user.name)}
                      </div>
                    )}
                  </div>

                  <div className='flex flex-col'>
                    <span className='font-medium text-gray-700 text-sm sm:text-base'>
                      {user.name}
                    </span>
                    {/* Me Tag */}
                    {authUser?.name === user.name && (
                      <span className='bg-pink-50 mt-0.5 px-2 py-0.5 rounded-2xl w-fit text-pink-500 text-xs'>
                        Me
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section: Level and XP */}
              <div className='flex sm:items-center gap-3 ml-11 sm:ml-0 text-gray-600 text-sm'>
                <div className='flex items-center text-pink-500'>
                  <Award className='mr-1 w-4 h-4' />
                  <span className='font-medium'>Lvl {user.level}</span>
                </div>
                <span className='text-gray-500'>{user.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
