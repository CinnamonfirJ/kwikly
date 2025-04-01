"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, UserPlus, BookOpen } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalError, setinternalError] = useState("");

  const { signup, error, isError, isPending, isAuthenticated } =
    useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams?.get("callbackUrl") || "/dashboard/:username";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setinternalError("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      setinternalError(
        "Please agree to the Terms of Service and Privacy Policy"
      );
      return;
    }

    const formData = {
      name,
      email,
      password,
    };

    signup(formData);
  };

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: "" };

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;

    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    let text = "";
    let color = "";

    if (strength === 0) {
      text = "";
      color = "";
    } else if (strength <= 2) {
      text = "Weak";
      color = "bg-red-500";
    } else if (strength <= 4) {
      text = "Medium";
      color = "bg-yellow-500";
    } else {
      text = "Strong";
      color = "bg-green-500";
    }

    return { strength: Math.min(strength, 5), text, color };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className='flex md:flex-row flex-col min-h-screen'>
      {/* Left side - Illustration */}
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
              Create and Share Quizzes
            </h2>
            <p className='mt-2 text-gray-600'>
              Join our community and create your own quizzes to share with
              friends and colleagues
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
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
            <h1 className='font-bold text-gray-800 text-2xl'>
              Create an account
            </h1>
            <p className='mt-2 text-gray-500'>
              Join Kwikly to start your learning journey
            </p>
          </div>

          {internalError && (
            <div className='bg-red-50 mb-6 p-4 border border-red-200 rounded-lg text-red-600'>
              {internalError}
            </div>
          )}
          {isError && (
            <div className='bg-red-50 mb-6 p-4 border border-red-200 rounded-lg text-red-600'>
              {error?.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <label
                htmlFor='name'
                className='block font-medium text-gray-700 text-sm'
              >
                Full Name
              </label>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-full'
                placeholder='Enter your full name'
                required
              />
            </div>

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
              <label
                htmlFor='password'
                className='block font-medium text-gray-700 text-sm'
              >
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-full'
                  placeholder='Create a password'
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

              {password && (
                <div className='mt-2'>
                  <div className='flex justify-between items-center mb-1'>
                    <div className='flex flex-1 space-x-1'>
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            i < passwordStrength.strength
                              ? passwordStrength.color
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className='ml-2 text-gray-500 text-xs'>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className='text-gray-500 text-xs'>
                    Use 8+ characters with a mix of letters, numbers & symbols
                  </div>
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <label
                htmlFor='confirm-password'
                className='block font-medium text-gray-700 text-sm'
              >
                Confirm Password
              </label>
              <input
                id='confirm-password'
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder='Confirm your password'
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className='mt-1 text-red-500 text-sm'>
                  Passwords do not match
                </p>
              )}
            </div>

            <div className='flex items-start'>
              <div className='flex items-center h-5'>
                <input
                  id='terms'
                  type='checkbox'
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className='border-gray-300 rounded focus:ring-pink-500 w-4 h-4 text-pink-500'
                />
              </div>
              <div className='ml-3 text-sm'>
                <label htmlFor='terms' className='text-gray-600'>
                  I agree to the{" "}
                  <Link
                    href='/terms'
                    className='text-pink-500 hover:text-pink-600'
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href='/privacy'
                    className='text-pink-500 hover:text-pink-600'
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            <button
              type='submit'
              disabled={isPending}
              className='flex justify-center items-center bg-pink-500 hover:bg-pink-600 disabled:opacity-70 px-4 py-3 rounded-lg w-full font-medium text-white transition-colors disabled:cursor-not-allowed'
            >
              {isPending ? (
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
                  Creating account...
                </span>
              ) : (
                <span className='flex items-center'>
                  <UserPlus className='mr-2 w-5 h-5' />
                  Sign Up
                </span>
              )}
            </button>
          </form>

          <div className='mt-8 text-center'>
            <p className='text-gray-600'>
              Already have an account?{" "}
              <Link
                href='/auth/login'
                className='font-medium text-pink-500 hover:text-pink-600'
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
