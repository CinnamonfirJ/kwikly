"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  LogIn,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

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

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthContext();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null); // Initialize with `null`

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      const data = await res.json();
      return data;
    },
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  if (pathname?.startsWith("/auth/")) return null;

  const handleLogout = () => {
    setDropdownOpen(!dropdownOpen);
    logout();
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  return (
    <header className='top-0 z-50 sticky bg-white border-pink-100 border-b w-full'>
      <div className='flex justify-between items-center mx-auto px-4 md:px-6 h-16 container'>
        <Link
          href='/'
          className='flex items-center gap-2 font-bold text-pink-500 text-xl'
        >
          <BookOpen className='w-6 h-6' />
          <span>Kwikly</span>
        </Link>

        <nav className='hidden md:flex items-center gap-6'>
          <Link
            href='/quizzes'
            className='font-medium text-gray-600 hover:text-pink-500 text-sm transition-colors'
          >
            Browse Quizzes
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href='/my-quizzes'
                className='font-medium text-gray-600 hover:text-pink-500 text-sm transition-colors'
              >
                My Quizzes
              </Link>
              <Link
                href='/dashboard/:username'
                className='font-medium text-gray-600 hover:text-pink-500 text-sm transition-colors'
              >
                Dashboard
              </Link>
            </>
          )}
        </nav>

        <div className='relative flex items-center gap-2'>
          {isAuthenticated ? (
            <>
              <Link
                href='/create-quiz'
                className='hidden md:inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
              >
                <Plus className='mr-1 w-4 h-4' />
                Create Quiz
              </Link>

              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className='relative border-2 border-pink-100 hover:border-pink-200 rounded-full focus:outline-none w-9 h-9 overflow-hidden transition-all'
              >
                {user?.profilePicture ? (
                  <Image
                    src={user?.profilePicture || "/images/placeholder.png"}
                    alt={user?.name}
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='flex justify-center items-center bg-pink-50 w-full h-full font-medium text-pink-500 text-sm'>
                    {getInitials(user?.name || "")}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className='top-0 right-10 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-lg w-56'>
                  <div className='p-3'>
                    <p className='font-medium text-sm'>{user?.name}</p>
                    <p className='text-gray-500 text-xs'>{user?.email}</p>
                  </div>
                  <hr className='border-gray-200' />
                  <ul className='py-2'>
                    <li>
                      <Link
                        href='/dashboard'
                        className='block hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm'
                      >
                        <LayoutDashboard className='inline-block mr-2 w-4 h-4' />{" "}
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='/dashboard/profile'
                        className='block hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm'
                      >
                        <User className='inline-block mr-2 w-4 h-4' /> Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='/dashboard/settings'
                        className='block hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm'
                      >
                        <Settings className='inline-block mr-2 w-4 h-4' />{" "}
                        Settings
                      </Link>
                    </li>
                  </ul>
                  <hr className='border-gray-200' />
                  <button
                    onClick={handleLogout}
                    className='hover:bg-red-50 px-4 py-2 w-full text-red-500 text-sm text-left'
                  >
                    <LogOut className='inline-block mr-2 w-4 h-4' /> Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              href='/auth/login'
              className='inline-flex justify-center items-center bg-white hover:bg-pink-50 px-4 py-2 border border-pink-200 rounded-full font-medium text-pink-500 transition-colors'
            >
              <LogIn className='mr-1 w-4 h-4' />
              <span className='hidden md:inline'>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
