"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Plus,
  LogIn,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuthContext } from "@/context/AuthContext";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

interface QuizResult {
  quizId: number;
  score: number;
  passed: boolean;
  completedAt: Date;
}

interface UserData {
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: userData, isLoading: isUserLoading } = useQuery<UserData>({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const user = userData;

  if (pathname?.startsWith("/auth/")) return null;

  const handleLogout = () => {
    setMobileOpen(false);
    setDropdownOpen(false);
    logout();
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  const showLoadingState = isUserLoading && isAuthenticated;

  return (
    <header className='top-0 z-50 sticky bg-white border-pink-100 border-b w-full'>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className='z-40 fixed inset-0 bg-black bg-opacity-50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              className='top-0 right-0 z-50 fixed flex flex-col gap-6 bg-white shadow-lg p-6 w-64 h-full'
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween" }}
            >
              <button
                className='top-4 right-4 absolute text-gray-500 hover:text-gray-700'
                onClick={() => setMobileOpen(false)}
              >
                <X className='w-6 h-6' />
              </button>

              <Link
                href='/quizzes'
                className='font-medium text-pink-500'
                onClick={() => setMobileOpen(false)}
              >
                Browse Quizzes
              </Link>

              {isAuthenticated && user ? (
                <>
                  <Link
                    href='/my-quizzes'
                    className='font-medium text-pink-500'
                    onClick={() => setMobileOpen(false)}
                  >
                    My Quizzes
                  </Link>
                  <Link
                    href={`/dashboard/${user.name}`}
                    className='font-medium text-pink-500'
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href='/create-quiz'
                    className='bg-pink-500 px-4 py-2 rounded-full text-white text-sm text-center'
                    onClick={() => setMobileOpen(false)}
                  >
                    Create Quiz
                  </Link>
                  <button
                    onClick={handleLogout}
                    className='text-red-500 text-sm text-left'
                  >
                    <LogOut className='inline-block mr-2 w-4 h-4' />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href='/auth/login'
                  className='font-medium text-pink-500'
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
          {isAuthenticated && user && (
            <>
              <Link
                href='/my-quizzes'
                className='font-medium text-gray-600 hover:text-pink-500 text-sm transition-colors'
              >
                My Quizzes
              </Link>
              <Link
                href={`/dashboard/${user.name}`}
                className='font-medium text-gray-600 hover:text-pink-500 text-sm transition-colors'
              >
                Dashboard
              </Link>
            </>
          )}
        </nav>

        <div className='relative flex items-center gap-2'>
          {showLoadingState ? (
            <div className='flex items-center'>
              <div className='mr-2 border-pink-500 border-t-2 border-b-2 rounded-full w-5 h-5 animate-spin'></div>
              <span className='text-gray-700 text-sm'>Loading...</span>
            </div>
          ) : isAuthenticated && user ? (
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
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.name}
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='flex justify-center items-center bg-pink-50 w-full h-full font-medium text-pink-500 text-sm'>
                    {getInitials(user.name)}
                  </div>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className='md:hidden z-50 hover:bg-pink-50 p-2 border border-pink-100 rounded-full text-pink-500 transition'
              >
                {mobileOpen ? (
                  <X className='w-5 h-5' />
                ) : (
                  <Menu className='w-5 h-5' />
                )}
              </button>

              {dropdownOpen && (
                <div className='top-full right-0 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-lg w-56'>
                  <div className='p-3'>
                    <p className='font-medium text-sm'>{user.name}</p>
                    <p className='text-gray-500 text-xs'>{user.email}</p>
                  </div>
                  <hr className='border-gray-200' />
                  <ul className='py-2'>
                    <li>
                      <Link
                        href={`/dashboard/${user.name}`}
                        onClick={() => setDropdownOpen(false)}
                        className='block hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm'
                      >
                        <LayoutDashboard className='inline-block mr-2 w-4 h-4' />{" "}
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={`/dashboard/profile/${user.name}`}
                        onClick={() => setDropdownOpen(false)}
                        className='block hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm'
                      >
                        <User className='inline-block mr-2 w-4 h-4' /> Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={`/dashboard/settings/${user.name}`}
                        onClick={() => setDropdownOpen(false)}
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
