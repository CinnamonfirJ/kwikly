"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, BookOpen } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

import LoginIllustation from "../../public/loginForm.png";

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function LoginPageForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, error, isAuthenticated, isError, isPending, user } =
    useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  useQuery<User | null>({
    queryKey: ["userProfile", user?.name],
    queryFn: async () => {
      if (!user?.name) return null;
      const res = await fetch(`/api/user/profile/${user.name}`);
      if (res.status === 404) return null;
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
      return data.user;
    },
    enabled: !!user?.name,
    staleTime: 1000 * 60 * 10,
  });

  const callbackUrl =
    searchParams?.get("callbackUrl") || `/dashboard/${user?.name || ""}`;

  useEffect(() => {
    if (isAuthenticated && !isPending) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, isPending, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  if (isPending && !isAuthenticated) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='flex justify-center items-center'>
          <div className='border-pink-500 border-t-2 border-b-2 rounded-full w-8 h-8 animate-spin'></div>
          <span className='ml-3 text-gray-700 text-lg'>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex md:flex-row flex-col min-h-screen'>
      <div className='flex flex-col flex-1 justify-center items-center p-8 md:p-12'>
        <div className='w-full max-w-md'>
          <div className='mb-8 text-center'>
            <Link
              href='/'
              className='inline-flex items-center gap-2 mb-2 font-bold text-pink-500 text-2xl'
            >
              <BookOpen className='w-8 h-8' />
              <span>Kwikly</span>
            </Link>
            <h1 className='font-bold text-gray-800 text-2xl'>Welcome back!</h1>
            <p className='mt-2 text-gray-500'>
              Log in to your account to continue your learning journey
            </p>
          </div>

          {isError && (
            <div className='bg-red-50 mb-6 p-4 border border-red-200 rounded-lg text-red-600'>
              {error?.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <label
                htmlFor='email'
                className='block font-medium text-gray-700 text-sm'
              >
                Email
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-full'
                placeholder='Enter your email'
                required
              />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between'>
                <label
                  htmlFor='password'
                  className='block font-medium text-gray-700 text-sm'
                >
                  Password
                </label>
                <Link
                  href='/auth/forgot-password'
                  className='text-pink-500 hover:text-pink-600 text-sm'
                >
                  Forgot password?
                </Link>
              </div>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-full'
                  placeholder='Enter your password'
                  required
                />
                <button
                  type='button'
                  className='top-1/2 right-3 absolute text-gray-500 hover:text-gray-700 -translate-y-1/2 transform'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className='flex items-center'>
              <input
                id='remember-me'
                type='checkbox'
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className='border-gray-300 rounded focus:ring-pink-500 w-4 h-4 text-pink-500'
              />
              <label
                htmlFor='remember-me'
                className='block ml-2 text-gray-700 text-sm'
              >
                Remember me
              </label>
            </div>

            <button
              type='submit'
              disabled={isPending}
              className='flex justify-center items-center bg-pink-500 hover:bg-pink-600 disabled:opacity-70 px-4 py-3 rounded-lg w-full font-medium text-white transition-colors disabled:cursor-not-allowed'
            >
              {isPending ? (
                <span className='flex items-center gap-3'>
                  <div className='flex justify-center items-center'>
                    <div className='border-amber-50 border-t-2 border-b-2 rounded-full w-5 h-5 animate-spin'></div>
                  </div>
                  Logging in...
                </span>
              ) : (
                <span className='flex items-center'>
                  <LogIn className='mr-2 w-5 h-5' />
                  Log In
                </span>
              )}
            </button>
          </form>

          <div className='mt-8 text-center'>
            <p className='text-gray-600'>
              Don&#39;t have an account?{" "}
              <Link
                href='/auth/signup'
                className='font-medium text-pink-500 hover:text-pink-600'
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className='hidden md:flex flex-1 justify-center items-center bg-pink-50 p-12'>
        <div className='max-w-md'>
          <div className='relative rounded-lg w-full h-80 overflow-hidden'>
            <Image
              src={LoginIllustation}
              alt='Quiz illustration'
              fill
              className='object-contain'
            />
          </div>
          <div className='mt-8 text-center'>
            <h2 className='font-bold text-gray-800 text-2xl'>
              Test Your Knowledge
            </h2>
            <p className='mt-2 text-gray-600'>
              Join thousands of learners expanding their knowledge through
              interactive quizzes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
