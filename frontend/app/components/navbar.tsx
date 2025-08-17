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
  Sparkles,
  Star,
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
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  const showLoadingState = isUserLoading && isAuthenticated;

  return (
    <>
      {/* Background Pattern for navbar */}
      <div className='top-0 left-0 z-0 absolute opacity-5 w-full h-20 pointer-events-none'>
        <div
          className='top-0 left-0 absolute w-full h-full'
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #ec4899 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      <header className='top-0 z-50 sticky bg-white/95 shadow-sm backdrop-blur-sm border-pink-100/50 border-b w-full'>
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className='z-40 fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />

              <motion.div
                className='top-0 right-0 z-50 fixed flex flex-col gap-6 bg-white/95 shadow-2xl backdrop-blur-sm p-6 border-pink-100/50 border-l w-72 h-full'
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween" }}
              >
                <div className='flex justify-between items-center mb-4'>
                  <div className='flex items-center gap-2'>
                    <div className='bg-gradient-to-r from-pink-100 to-purple-100 p-2 rounded-lg'>
                      <BookOpen className='w-5 h-5 text-pink-500' />
                    </div>
                    <span className='font-bold text-pink-500'>Menu</span>
                  </div>
                  <button
                    className='hover:bg-pink-50 p-2 rounded-lg text-gray-500 hover:text-gray-700 transition-all duration-200'
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className='w-5 h-5' />
                  </button>
                </div>

                <div className='space-y-3'>
                  <Link
                    href='/quizzes'
                    className='group flex items-center bg-gradient-to-r from-pink-50 hover:from-pink-100 to-purple-50 hover:to-purple-100 p-3 border border-pink-200/50 rounded-xl font-medium text-pink-600 transition-all duration-200'
                    onClick={() => setMobileOpen(false)}
                  >
                    <BookOpen className='mr-2 w-4 h-4' />
                    Browse Quizzes
                  </Link>

                  {isAuthenticated && user ? (
                    <>
                      <Link
                        href='/my-quizzes'
                        className='group flex items-center bg-gradient-to-r from-pink-50 hover:from-pink-100 to-purple-50 hover:to-purple-100 p-3 border border-pink-200/50 rounded-xl font-medium text-pink-600 transition-all duration-200'
                        onClick={() => setMobileOpen(false)}
                      >
                        <Star className='mr-2 w-4 h-4' />
                        My Quizzes
                      </Link>
                      <Link
                        href={`/dashboard/${user.name}`}
                        className='group flex items-center bg-gradient-to-r from-pink-50 hover:from-pink-100 to-purple-50 hover:to-purple-100 p-3 border border-pink-200/50 rounded-xl font-medium text-pink-600 transition-all duration-200'
                        onClick={() => setMobileOpen(false)}
                      >
                        <LayoutDashboard className='mr-2 w-4 h-4' />
                        Dashboard
                      </Link>
                      <Link
                        href='/create-quiz'
                        className='group relative bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl p-3 rounded-xl overflow-hidden font-semibold text-white text-center transition-all duration-300'
                        onClick={() => setMobileOpen(false)}
                      >
                        <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                        <Plus className='inline mr-2 w-4 h-4' />
                        Create Quiz
                      </Link>
                      <button
                        onClick={handleLogout}
                        className='flex items-center hover:bg-red-50 p-3 rounded-xl w-full text-red-500 hover:text-red-600 text-left transition-all duration-200'
                      >
                        <LogOut className='mr-2 w-4 h-4' />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href='/auth/login'
                      className='group relative bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl p-3 rounded-xl overflow-hidden font-semibold text-white text-center transition-all duration-300'
                      onClick={() => setMobileOpen(false)}
                    >
                      <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                      <LogIn className='inline mr-2 w-4 h-4' />
                      Login
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className='relative flex justify-between items-center mx-auto px-4 md:px-6 h-16 container'>
          <Link href='/' className='group relative flex items-center gap-3'>
            <div className='absolute -inset-2 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 rounded-full transition duration-300 blur'></div>
            <div className='relative bg-gradient-to-r from-pink-100 to-purple-100 p-2 border border-pink-200/50 rounded-xl group-hover:scale-105 transition-transform duration-200'>
              <BookOpen className='w-6 h-6 text-pink-500' />
            </div>
            <span className='bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-transparent text-2xl'>
              Kwikly
            </span>
          </Link>

          <nav className='hidden md:flex items-center gap-8'>
            <Link
              href='/quizzes'
              className='group relative font-medium text-gray-600 hover:text-pink-500 transition-all duration-200'
            >
              <span className='z-10 relative'>Browse Quizzes</span>
              <div className='-bottom-1 left-0 absolute bg-gradient-to-r from-pink-500 to-purple-600 w-0 group-hover:w-full h-0.5 transition-all duration-300'></div>
            </Link>
            {isAuthenticated && user && (
              <>
                <Link
                  href='/my-quizzes'
                  className='group relative font-medium text-gray-600 hover:text-pink-500 transition-all duration-200'
                >
                  <span className='z-10 relative'>My Quizzes</span>
                  <div className='-bottom-1 left-0 absolute bg-gradient-to-r from-pink-500 to-purple-600 w-0 group-hover:w-full h-0.5 transition-all duration-300'></div>
                </Link>
                <Link
                  href={`/dashboard/${user.name}`}
                  className='group relative font-medium text-gray-600 hover:text-pink-500 transition-all duration-200'
                >
                  <span className='z-10 relative'>Dashboard</span>
                  <div className='-bottom-1 left-0 absolute bg-gradient-to-r from-pink-500 to-purple-600 w-0 group-hover:w-full h-0.5 transition-all duration-300'></div>
                </Link>
              </>
            )}
          </nav>

          <div className='relative flex items-center gap-3'>
            {showLoadingState ? (
              <div className='flex items-center bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-2 border border-pink-200/50 rounded-xl'>
                <div className='relative mr-2'>
                  <div className='border-pink-500 border-t-2 border-r-2 rounded-full w-4 h-4 animate-spin'></div>
                  <div className='absolute inset-0 border-2 border-pink-200 rounded-full'></div>
                </div>
                <span className='font-medium text-pink-600 text-sm'>
                  Loading...
                </span>
              </div>
            ) : isAuthenticated && user ? (
              <>
                <Link
                  href='/create-quiz'
                  className='group hidden md:inline-flex relative justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-full overflow-hidden font-semibold text-white hover:scale-105 transition-all duration-300 transform'
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                  <Plus className='mr-2 w-4 h-4' />
                  Create Quiz
                </Link>

                <div className='relative'>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className='group relative shadow-md hover:shadow-lg border-2 border-pink-200/50 hover:border-pink-300 rounded-full focus:outline-none w-10 h-10 overflow-hidden hover:scale-105 transition-all duration-200'
                  >
                    <div className='absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 rounded-full transition duration-300 blur'></div>
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.name}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='flex justify-center items-center bg-gradient-to-br from-pink-100 to-purple-100 w-full h-full font-bold text-pink-600 text-sm'>
                        {getInitials(user.name)}
                      </div>
                    )}
                  </button>

                  {dropdownOpen && (
                    <div className='top-full right-0 absolute bg-white/95 shadow-2xl backdrop-blur-sm mt-3 border border-pink-200/50 rounded-2xl w-64 overflow-hidden'>
                      <div className='bg-gradient-to-r from-pink-50 to-purple-50 p-4'>
                        <div className='flex items-center gap-3'>
                          <div className='relative shadow-md border-2 border-white rounded-full w-12 h-12 overflow-hidden'>
                            {user.profilePicture ? (
                              <Image
                                src={user.profilePicture}
                                alt={user.name}
                                fill
                                className='object-cover'
                              />
                            ) : (
                              <div className='flex justify-center items-center bg-gradient-to-br from-pink-100 to-purple-100 w-full h-full font-bold text-pink-600'>
                                {getInitials(user.name)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className='font-semibold text-gray-900'>
                              {user.name}
                            </p>
                            <p className='text-gray-600 text-xs'>
                              {user.email}
                            </p>
                            <div className='flex items-center mt-1'>
                              <Sparkles className='mr-1 w-3 h-3 text-amber-500' />
                              <span className='font-medium text-amber-600 text-xs'>
                                Level {user.level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='p-2'>
                        <Link
                          href={`/dashboard/${user.name}`}
                          onClick={() => setDropdownOpen(false)}
                          className='group flex items-center hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 px-3 py-2.5 rounded-xl text-gray-700 hover:text-pink-600 transition-all duration-200'
                        >
                          <LayoutDashboard className='mr-3 w-4 h-4 text-pink-500' />
                          Dashboard
                        </Link>
                        <Link
                          href={`/dashboard/profile/${user.name}`}
                          onClick={() => setDropdownOpen(false)}
                          className='group flex items-center hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 px-3 py-2.5 rounded-xl text-gray-700 hover:text-pink-600 transition-all duration-200'
                        >
                          <User className='mr-3 w-4 h-4 text-blue-500' />
                          Profile
                        </Link>
                        <Link
                          href={`/dashboard/settings/${user.name}`}
                          onClick={() => setDropdownOpen(false)}
                          className='group flex items-center hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 px-3 py-2.5 rounded-xl text-gray-700 hover:text-pink-600 transition-all duration-200'
                        >
                          <Settings className='mr-3 w-4 h-4 text-purple-500' />
                          Settings
                        </Link>
                      </div>
                      <div className='p-2 border-pink-200/50 border-t'>
                        <button
                          onClick={handleLogout}
                          className='group flex items-center hover:bg-red-50 px-3 py-2.5 rounded-xl w-full text-red-500 hover:text-red-600 transition-all duration-200'
                        >
                          <LogOut className='mr-3 w-4 h-4' />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className='group md:hidden relative hover:bg-pink-50 p-2 border border-pink-200/50 rounded-xl text-pink-500 hover:scale-105 transition-all duration-200'
                >
                  <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-20 rounded-xl transition duration-300 blur'></div>
                  {mobileOpen ? (
                    <X className='z-10 relative w-5 h-5' />
                  ) : (
                    <Menu className='z-10 relative w-5 h-5' />
                  )}
                </button>
              </>
            ) : (
              <Link
                href='/auth/login'
                className='group inline-flex relative justify-center items-center bg-white/80 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm px-6 py-3 border border-pink-200 hover:border-pink-300 rounded-full overflow-hidden font-semibold text-pink-600 transition-all duration-300'
              >
                <div className='absolute inset-0 bg-gradient-to-r from-pink-50/0 via-pink-50/50 to-pink-50/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                <LogIn className='mr-2 w-4 h-4' />
                <span className='hidden md:inline'>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
