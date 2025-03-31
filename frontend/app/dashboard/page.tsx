import { Award, BookOpen, Trophy, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import QuizHistory from "@/app/components/quiz-history";
import Leaderboard from "../components/leaderboard";

export default function Dashboard() {
  // This would normally come from your MongoDB database
  const user = {
    name: "Sarah Johnson",
    level: 5,
    xp: 340,
    xpToNextLevel: 500,
    completedQuizzes: 12,
    profilePicture: "/images/placeholder.png?height=100&width=100",
  };

  return (
    <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
      <div className='gap-8 grid md:grid-cols-3'>
        <div className='md:col-span-1'>
          <div className='bg-white shadow-sm p-6 border border-pink-100 rounded-xl'>
            <div className='flex flex-row items-center gap-4 pb-4'>
              <div className='relative border-4 border-pink-100 rounded-full w-16 h-16 overflow-hidden'>
                <Image
                  src={user.profilePicture || "/placeholder.svg"}
                  alt={user.name}
                  fill
                  className='object-cover'
                />
              </div>
              <div>
                <h2 className='font-bold text-xl'>{user.name}</h2>
                <p className='text-gray-500 text-sm'>Quiz Enthusiast</p>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center'>
                    <Award className='mr-2 w-5 h-5 text-pink-500' />
                    <span className='font-medium'>Level {user.level}</span>
                  </div>
                  <span className='text-gray-500 text-sm'>
                    {user.xp}/{user.xpToNextLevel} XP
                  </span>
                </div>
                <div className='bg-pink-100 rounded-full w-full h-2 overflow-hidden'>
                  <div
                    className='bg-pink-500 rounded-full h-full'
                    style={{
                      width: `${(user.xp / user.xpToNextLevel) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className='gap-4 grid grid-cols-2 pt-4'>
                <div className='flex flex-col justify-center items-center bg-pink-50 p-4 rounded-lg'>
                  <BookOpen className='mb-2 w-6 h-6 text-pink-500' />
                  <span className='font-bold text-xl'>
                    {user.completedQuizzes}
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
                  href='/dashboard/profile'
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
              <button className='flex-1 px-4 py-3 border-pink-500 border-b-2 font-medium text-pink-500 text-center'>
                Quiz History
              </button>
              <button className='flex-1 px-4 py-3 font-medium text-gray-500 hover:text-pink-500 text-center transition-colors'>
                Leaderboard
              </button>
            </div>
            <div className='p-4'>
              <QuizHistory />
            </div>
            <div className='p-4'>
              <Leaderboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
