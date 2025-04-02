"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <div className='mx-auto px-4 py-8 max-w-3xl'>
      <h1 className='mb-6 font-bold text-2xl'>Profile</h1>

      <div className='bg-white shadow-sm p-6 border border-gray-200 rounded-lg'>
        <div className='flex items-center gap-4'>
          <div className='border border-pink-300 rounded-full w-24 h-24 overflow-hidden'>
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt='Profile Picture'
                width={96}
                height={96}
                className='object-cover'
              />
            ) : (
              <div className='flex justify-center items-center bg-pink-50 w-full h-full font-medium text-pink-500 text-xl'>
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className='font-semibold text-xl'>{user?.name}</h2>
            <p className='text-gray-500'>{user?.email}</p>
            <p className='mt-1 text-gray-600 text-sm'>
              <span className='font-medium'>Rank:</span> {user?.rank}
            </p>
            <p className='text-gray-600 text-sm'>
              <span className='font-medium'>Level:</span> {user?.level}
            </p>
          </div>
        </div>

        <div className='mt-6'>
          <p className='text-gray-600 text-sm'>
            <span className='font-medium'>Favorite Topic:</span>{" "}
            {user?.favouriteTopic || "Not Set"}
          </p>
        </div>

        <div className='mt-6'>
          <Link
            href='/dashboard/settings'
            className='bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-md text-white text-sm'
          >
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
