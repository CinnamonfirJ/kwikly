"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, BookOpen } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        router.push(callbackUrl);
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex md:flex-row flex-col min-h-screen'>
      {/* Left side - Form */}
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

          {error && (
            <div className='bg-red-50 mb-6 p-4 border border-red-200 rounded-lg text-red-600'>
              {error}
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
              disabled={isLoading}
              className='flex justify-center items-center bg-pink-500 hover:bg-pink-600 disabled:opacity-70 px-4 py-3 rounded-lg w-full font-medium text-white transition-colors disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <span className='flex items-center'>
                  <svg
                    className='mr-2 -ml-1 w-4 h-4 text-white animate-spin'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
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
              Don't have an account?{" "}
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

      {/* Right side - Illustration */}
      <div className='hidden md:flex flex-1 justify-center items-center bg-pink-50 p-12'>
        <div className='max-w-md'>
          <div className='relative w-full h-80'>
            <Image
              src='/placeholder.svg?height=400&width=400'
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
