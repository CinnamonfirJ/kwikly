"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Award,
  Star,
  Settings,
  Sparkles,
  Trophy,
  Target,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  rank: string;
  favouriteTopic: string;
  level: number;
  xp: number;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);

  const { data: userData } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      const data = await res.json();
      return data;
    },
  });

  useEffect(() => {
    if (userData) setUser(userData);
  }, [userData]);

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

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

      <div className='relative mx-auto px-4 py-8 md:py-12 max-w-4xl'>
        {/* Header */}
        <div className='mb-12'>
          <div className='inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 mb-4 px-4 py-2 border border-pink-200/50 rounded-full font-medium text-pink-600 text-sm'>
            <User className='mr-2 w-4 h-4' />
            User Profile
          </div>
          <h1 className='bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-2 font-bold text-transparent text-4xl md:text-5xl tracking-tight'>
            Profile
          </h1>
          <p className='text-gray-600 text-lg'>
            View and manage your account information.
          </p>
        </div>

        {/* Profile Card */}
        <div className='group relative'>
          <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-300 blur'></div>
          <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-8 border border-pink-100/50 rounded-2xl'>
            {/* Main Profile Section */}
            <div className='flex lg:flex-row flex-col items-center lg:items-start gap-8 mb-8'>
              {/* Profile Picture */}
              <div className='group/avatar relative'>
                <div className='absolute -inset-3 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover/avatar:opacity-20 rounded-full transition duration-300 blur'></div>
                <div className='relative shadow-xl border-4 border-white rounded-full w-32 h-32 overflow-hidden group-hover/avatar:scale-105 transition-transform duration-300'>
                  {user?.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt='Profile Picture'
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='flex justify-center items-center bg-gradient-to-br from-pink-100 to-purple-100 w-full h-full font-bold text-pink-600 text-3xl'>
                      {getInitials(user?.name || "")}
                    </div>
                  )}
                </div>
              </div>

              {/* User Information */}
              <div className='flex-1 space-y-4 lg:text-left text-center'>
                <div>
                  <h2 className='mb-2 font-bold text-gray-900 text-3xl'>
                    {user?.name}
                  </h2>
                  <p className='mb-3 text-gray-600 text-lg'>{user?.email}</p>

                  {/* Rank Badge */}
                  <div className='inline-flex items-center bg-gradient-to-r from-amber-100 to-yellow-100 shadow-sm px-4 py-2 border border-amber-200/50 rounded-full'>
                    <Trophy className='mr-2 w-5 h-5 text-amber-600' />
                    <span className='font-bold text-amber-700'>
                      {user?.rank}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className='gap-4 grid grid-cols-1 md:grid-cols-2 mt-6'>
                  <div className='group/stat relative'>
                    <div className='absolute -inset-1 bg-gradient-to-r from-blue-300 to-blue-400 opacity-0 group-hover/stat:opacity-20 rounded-xl transition duration-300 blur'></div>
                    <div className='relative bg-gradient-to-r from-blue-50 to-blue-100 p-4 border border-blue-200/50 rounded-xl'>
                      <div className='flex justify-between items-center'>
                        <div>
                          <p className='mb-1 font-medium text-blue-600 text-sm'>
                            Level
                          </p>
                          <p className='font-bold text-blue-800 text-2xl'>
                            {user?.level}
                          </p>
                        </div>
                        <div className='bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-xl'>
                          <Star className='w-6 h-6 text-blue-600' />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='group/stat relative'>
                    <div className='absolute -inset-1 bg-gradient-to-r from-purple-300 to-purple-400 opacity-0 group-hover/stat:opacity-20 rounded-xl transition duration-300 blur'></div>
                    <div className='relative bg-gradient-to-r from-purple-50 to-purple-100 p-4 border border-purple-200/50 rounded-xl'>
                      <div className='flex justify-between items-center'>
                        <div>
                          <p className='mb-1 font-medium text-purple-600 text-sm'>
                            Experience Points
                          </p>
                          <p className='font-bold text-purple-800 text-2xl'>
                            {user?.xp} XP
                          </p>
                        </div>
                        <div className='bg-gradient-to-r from-purple-100 to-purple-200 p-3 rounded-xl'>
                          <Award className='w-6 h-6 text-purple-600' />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className='space-y-6'>
              {/* Favorite Topic */}
              <div className='group/info relative'>
                <div className='absolute -inset-1 bg-gradient-to-r from-emerald-300 to-emerald-400 opacity-0 group-hover/info:opacity-20 rounded-xl transition duration-300 blur'></div>
                <div className='relative bg-gradient-to-r from-emerald-50 to-emerald-100 p-6 border border-emerald-200/50 rounded-xl'>
                  <div className='flex items-center'>
                    <div className='bg-gradient-to-r from-emerald-100 to-emerald-200 mr-4 p-3 rounded-xl'>
                      <Target className='w-6 h-6 text-emerald-600' />
                    </div>
                    <div>
                      <p className='mb-1 font-semibold text-emerald-600 text-sm'>
                        Favorite Topic
                      </p>
                      <p className='font-bold text-emerald-800 text-lg'>
                        {user?.favouriteTopic || "Not Set"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className='flex justify-center lg:justify-start pt-6'>
                <Link
                  href={`/dashboard/settings/${user?.name}`}
                  className='group inline-flex relative justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-8 py-4 rounded-xl overflow-hidden font-semibold text-white hover:scale-105 transition-all duration-300 transform'
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                  <Settings className='mr-2 w-5 h-5' />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Quick Stats */}
        <div className='gap-6 grid grid-cols-1 md:grid-cols-3 mt-8'>
          <div className='group relative'>
            <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-pink-400 opacity-0 group-hover:opacity-20 rounded-xl transition duration-300 blur'></div>
            <div className='relative bg-white/70 backdrop-blur-sm p-6 border border-pink-200/50 rounded-xl text-center'>
              <div className='bg-gradient-to-r from-pink-100 to-pink-200 mx-auto mb-3 p-3 rounded-xl w-fit'>
                <Sparkles className='w-6 h-6 text-pink-600' />
              </div>
              <h3 className='mb-2 font-bold text-gray-900 text-lg'>
                Account Status
              </h3>
              <p className='font-semibold text-pink-600'>Active Learner</p>
              <p className='mt-1 text-gray-600 text-sm'>Engaged and growing</p>
            </div>
          </div>

          <div className='group relative'>
            <div className='absolute -inset-1 bg-gradient-to-r from-amber-300 to-amber-400 opacity-0 group-hover:opacity-20 rounded-xl transition duration-300 blur'></div>
            <div className='relative bg-white/70 backdrop-blur-sm p-6 border border-amber-200/50 rounded-xl text-center'>
              <div className='bg-gradient-to-r from-amber-100 to-amber-200 mx-auto mb-3 p-3 rounded-xl w-fit'>
                <Trophy className='w-6 h-6 text-amber-600' />
              </div>
              <h3 className='mb-2 font-bold text-gray-900 text-lg'>
                Achievements
              </h3>
              <p className='font-semibold text-amber-600'>Coming Soon</p>
              <p className='mt-1 text-gray-600 text-sm'>Unlock rewards</p>
            </div>
          </div>

          <div className='group relative'>
            <div className='absolute -inset-1 bg-gradient-to-r from-blue-300 to-blue-400 opacity-0 group-hover:opacity-20 rounded-xl transition duration-300 blur'></div>
            <div className='relative bg-white/70 backdrop-blur-sm p-6 border border-blue-200/50 rounded-xl text-center'>
              <div className='bg-gradient-to-r from-blue-100 to-blue-200 mx-auto mb-3 p-3 rounded-xl w-fit'>
                <Star className='w-6 h-6 text-blue-600' />
              </div>
              <h3 className='mb-2 font-bold text-gray-900 text-lg'>Progress</h3>
              <p className='font-semibold text-blue-600'>Level {user?.level}</p>
              <p className='mt-1 text-gray-600 text-sm'>
                {user?.xp} total XP earned
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
