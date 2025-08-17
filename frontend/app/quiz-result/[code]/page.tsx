"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  ChevronLeft,
  Clock,
  XCircle,
  Award,
  Target,
  BookOpen,
  User,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";

interface QuizResult {
  quizId: string;
  score: number;
  passed: boolean;
  completedAt: Date;
  title: string;
  passingScore: number;
  maxScore: number;
  subject: string;
  topic: string;
  duration: string;
  selectedAnswers: Record<number, string>;
  timeLeft: number;
}

interface QuizHistory {
  id: string;
  score: number;
  passed: boolean;
  title: string;
  passingScore: number;
  maxScore: number;
  subject: string;
  topic: string;
  duration: string;
  selectedAnswers: Record<number, string>;
  timeLeft: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  rank: string;
  level: number;
  xp: number;
  quizResults: QuizResult[]; // Replace with a proper type if needed
  createdAt: string;
  updatedAt: string;
  __v: number;
  favouriteTopic: string;
}

interface Question {
  _id: string;
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface Quiz {
  _id: string;
  title: string;
  instruction: string;
  passingScore: number;
  maxScore: number;
  xpReward: number;
  subject: string;
  topic: string;
  duration: string;
  code: string;
  createdBy: User;
  isPublic: boolean;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const QuizResults = ({ params }: { params: Promise<{ code: string }> }) => {
  const router = useRouter();
  const unwrappedParams = use(params); // Unwrap the params Promise
  const { code } = unwrappedParams;
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  // Getting authenticated Users Results
  const authUserResults = queryClient.getQueryData<Quiz>(["userResults"]);
  const authUser = queryClient.getQueryData<User>(["authUser"]);
  const [user, setUser] = useState<User | null>(null); // Initialize with `null`

  const { data: quizData } = useQuery({
    queryKey: ["quiz"],
    queryFn: async () => {
      setIsLoading(true);

      const res = await fetch("/api/quiz/test");
      const data = await res.json();
      console.log("New Quiz ", data.quizzes);

      if (authUserResults) {
        console.log("Authenticated User Results", authUserResults._id);
        console.log("Authenticated User", authUser?._id);
      } else {
        console.log("No quiz data available");
      }

      setIsLoading(false);
      return data.quizzes;
    },
  });

  useEffect(() => {
    if (quizData) {
      setQuizzes(quizData);
    }
  }, [quizData]);

  const { data: userData } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch(`/api/user/profile/${authUser?.name}`);
      const data = await res.json();
      return data;
    },
  });

  useEffect(() => {
    setIsLoading(true);
    if (userData) {
      setUser(userData);
      setIsLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (user?.quizResults) {
      setQuizHistory(
        user.quizResults
          .slice()
          .reverse()
          .map((result) => ({
            id: result.quizId,
            title: result.title,
            date: new Date(result.completedAt).toISOString(), // Convert each date to a string
            score: result.score, // Ensure each score is a number
            passingScore: result.passingScore,
            maxScore: result.maxScore,
            subject: result.subject,
            topic: result.topic,
            duration: result.duration,
            passed: result.passed, // Ensure each passed value is a boolean
            selectedAnswers: result?.selectedAnswers,
            timeLeft: result.timeLeft,
          }))
      );
    }
  }, [user]);

  // Helper function to find a quiz by code
  const findQuizByCode = (code: string) => {
    return quizzes.find((quiz) => quiz.code === code);
  };

  const findQuizHistoryByCode = (id: string) => {
    if (quiz?._id === id) {
      return quizHistory.find((quiz) => quiz.id === id);
    }
  };

  const quiz = findQuizByCode(code);
  const retrivedQuizHistory = findQuizHistoryByCode(quiz?._id || "");
  const questions = quiz?.questions || [];
  const selectedQuizAnswers = quizHistory
    .map((result) => result.selectedAnswers)
    .find((answer) => answer !== undefined);

  // Check if current user is the creator
  const isCreator = quiz?.createdBy.name === quiz?.createdBy.name;

  // console.log("Checking Quiz History", retrivedQuizHistory);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  const calculatePercentage = () => {
    if (!retrivedQuizHistory) return 0;
    return Math.round(
      (retrivedQuizHistory.score / retrivedQuizHistory.maxScore) * 100
    );
  };

  // If quiz not found
  if (!quiz) {
    return (
      <div className='flex justify-center items-center bg-gradient-to-br from-slate-50 via-white to-pink-50/30 min-h-screen'>
        <div className='group relative'>
          <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-20 rounded-2xl blur'></div>
          <div className='relative bg-white/80 shadow-xl backdrop-blur-sm p-12 border border-pink-200/50 rounded-2xl text-center'>
            <h2 className='mb-4 font-bold text-gray-900 text-2xl'>
              Quiz Not Found
            </h2>
            <p className='mb-6 text-gray-600'>
              The quiz with code &#34;{code}&#34; could not be found.
            </p>
            <Link
              href='/quizzes'
              className='inline-flex justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-full font-semibold text-white transition-all duration-300'
            >
              Browse Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If quiz is private and user is not the creator
  if (!quiz.isPublic && !isCreator) {
    return (
      <div className='flex justify-center items-center bg-gradient-to-br from-slate-50 via-white to-pink-50/30 min-h-screen'>
        <div className='group relative'>
          <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-20 rounded-2xl blur'></div>
          <div className='relative bg-white/80 shadow-xl backdrop-blur-sm p-12 border border-pink-200/50 rounded-2xl text-center'>
            <h2 className='mb-4 font-bold text-gray-900 text-2xl'>
              Private Quiz
            </h2>
            <p className='mb-6 text-gray-600'>
              This quiz is private and can only be accessed by its creator.
            </p>
            <Link
              href='/quizzes'
              className='inline-flex justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-full font-semibold text-white transition-all duration-300'
            >
              Browse Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center bg-gradient-to-br from-slate-50 via-white to-pink-50/30 min-h-screen'>
        <div className='relative'>
          <div className='absolute -inset-4 bg-gradient-to-r from-pink-300 to-purple-300 opacity-20 rounded-full blur'></div>
          <div className='relative bg-white/80 shadow-xl backdrop-blur-sm p-8 border border-pink-200/50 rounded-2xl'>
            <div className='flex items-center space-x-3'>
              <div className='relative'>
                <div className='border-pink-500 border-t-4 border-r-4 rounded-full w-8 h-8 animate-spin'></div>
                <div className='absolute inset-0 border-2 border-pink-200 rounded-full'></div>
              </div>
              <span className='font-medium text-gray-700'>
                Loading results...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      <div className='relative gap-8 grid lg:grid-cols-3 mx-auto px-4 py-8 container'>
        {/* Results Section */}
        <div className='group relative lg:col-span-2'>
          <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-300 blur'></div>
          <div className='relative bg-white/80 shadow-xl backdrop-blur-sm border border-pink-100/50 rounded-2xl overflow-hidden'>
            {/* Header */}
            <div className='bg-gradient-to-r from-pink-50 to-purple-50 p-6 border-pink-100/50 border-b'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => router.back()}
                    className='group relative bg-white/80 hover:bg-white shadow-md hover:shadow-lg p-3 rounded-xl overflow-hidden transition-all duration-200'
                  >
                    <ChevronLeft className='w-5 h-5 text-pink-600' />
                  </button>
                  <div>
                    <h1 className='font-bold text-gray-900 text-2xl'>
                      {quiz.title}
                    </h1>
                    <p className='text-gray-600 text-sm'>Quiz Results</p>
                  </div>
                </div>
                <div className='flex items-center gap-3 bg-white/80 px-4 py-2 border border-blue-200/50 rounded-xl'>
                  <Clock className='w-4 h-4 text-blue-500' />
                  <span className='font-medium text-blue-700'>
                    {formatTime(retrivedQuizHistory?.timeLeft || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Summary */}
            <div className='bg-gradient-to-r from-white/50 to-pink-50/50 p-6'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-4'>
                  <div
                    className={`p-4 rounded-2xl ${
                      retrivedQuizHistory?.passed
                        ? "bg-gradient-to-r from-green-100 to-green-200"
                        : "bg-gradient-to-r from-red-100 to-red-200"
                    }`}
                  >
                    {retrivedQuizHistory?.passed ? (
                      <CheckCircle className='w-8 h-8 text-green-600' />
                    ) : (
                      <XCircle className='w-8 h-8 text-red-600' />
                    )}
                  </div>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='font-bold text-gray-900 text-3xl'>
                        {retrivedQuizHistory?.score}/
                        {retrivedQuizHistory?.maxScore}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          retrivedQuizHistory?.passed
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {calculatePercentage()}%
                      </span>
                    </div>
                    <p className='text-gray-600'>
                      Passing score: {retrivedQuizHistory?.passingScore}%
                    </p>
                  </div>
                </div>
                <div
                  className={`px-6 py-3 rounded-xl font-bold text-lg ${
                    retrivedQuizHistory?.passed
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  }`}
                >
                  {retrivedQuizHistory?.passed ? "PASSED" : "FAILED"}
                </div>
              </div>
            </div>

            {/* Questions and Answers */}
            <div className='p-6'>
              <h2 className='flex items-center mb-6 font-bold text-gray-900 text-xl'>
                <Target className='mr-2 w-5 h-5 text-pink-500' />
                Question Review
              </h2>

              <div className='space-y-8'>
                {questions.map((question, qIndex) => {
                  const selected = selectedQuizAnswers?.[question.id];
                  const isCorrect = selected === question.correctAnswer;

                  return (
                    <div key={question.id} className='group relative'>
                      <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-15 rounded-xl transition duration-300 blur'></div>
                      <div className='relative bg-white/70 backdrop-blur-sm p-6 border border-pink-100/50 rounded-xl'>
                        <div className='flex items-start gap-3 mb-4'>
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                              isCorrect
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {qIndex + 1}
                          </div>
                          <div className='flex-1'>
                            <h3 className='mb-4 font-semibold text-gray-900 text-lg'>
                              {question.questionText}
                            </h3>

                            <div className='space-y-3'>
                              {question.options.map((option, index) => {
                                const isSelected = selected === option;
                                const isAnswer =
                                  option === question.correctAnswer;

                                let className =
                                  "p-4 rounded-lg border transition-all duration-200 ";

                                if (isSelected && isCorrect) {
                                  className +=
                                    "bg-green-100 border-green-500 text-green-800";
                                } else if (isSelected && !isCorrect) {
                                  className +=
                                    "bg-red-100 border-red-500 text-red-800";
                                } else if (isAnswer) {
                                  className +=
                                    "bg-green-50 border-green-300 text-green-700";
                                } else {
                                  className +=
                                    "bg-gray-50 border-gray-200 text-gray-700";
                                }

                                return (
                                  <div key={index} className={className}>
                                    <div className='flex justify-between items-center'>
                                      <span>{option}</span>
                                      <div className='flex items-center gap-2'>
                                        {isAnswer && (
                                          <span className='bg-green-200 px-2 py-1 rounded-full font-semibold text-green-800 text-xs'>
                                            Correct
                                          </span>
                                        )}
                                        {isSelected && !isAnswer && (
                                          <span className='bg-red-200 px-2 py-1 rounded-full font-semibold text-red-800 text-xs'>
                                            Your Answer
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className='flex justify-between items-center mt-4 pt-4 border-gray-200 border-t'>
                              <div className='flex items-center'>
                                <Award className='mr-2 w-4 h-4 text-amber-500' />
                                <span className='text-gray-600 text-sm'>
                                  Points: {question.points}
                                </span>
                              </div>
                              {isCorrect ? (
                                <div className='flex items-center text-green-600'>
                                  <CheckCircle className='mr-1 w-4 h-4' />
                                  <span className='font-medium text-sm'>
                                    Correct
                                  </span>
                                </div>
                              ) : (
                                <div className='flex items-center text-red-600'>
                                  <XCircle className='mr-1 w-4 h-4' />
                                  <span className='font-medium text-sm'>
                                    Incorrect
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-6 lg:col-span-1'>
          {/* Instructions */}
          <div className='group relative'>
            <div className='absolute -inset-1 bg-gradient-to-r from-blue-300 to-blue-400 opacity-0 group-hover:opacity-20 rounded-2xl transition duration-300 blur'></div>
            <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-blue-100/50 rounded-2xl'>
              <div className='flex items-center mb-4'>
                <div className='bg-gradient-to-r from-blue-100 to-blue-200 mr-3 p-3 rounded-xl'>
                  <BookOpen className='w-5 h-5 text-blue-600' />
                </div>
                <h2 className='font-bold text-gray-900 text-xl'>
                  Instructions
                </h2>
              </div>
              <p className='text-gray-700 leading-relaxed'>
                {quiz.instruction}
              </p>
            </div>
          </div>

          {/* Quiz Creator */}
          <div className='group relative'>
            <div className='absolute -inset-1 bg-gradient-to-r from-emerald-300 to-emerald-400 opacity-0 group-hover:opacity-20 rounded-2xl transition duration-300 blur'></div>
            <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-emerald-100/50 rounded-2xl'>
              <div className='flex items-center mb-4'>
                <div className='bg-gradient-to-r from-emerald-100 to-emerald-200 mr-3 p-3 rounded-xl'>
                  <User className='w-5 h-5 text-emerald-600' />
                </div>
                <h3 className='font-bold text-gray-900 text-xl'>
                  Quiz Creator
                </h3>
              </div>

              <div className='flex items-center gap-4'>
                <div className='relative'>
                  <div className='absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-20 rounded-full blur'></div>
                  <div className='relative shadow-lg border-4 border-white rounded-full w-16 h-16 overflow-hidden'>
                    {quiz.createdBy?.profilePicture ? (
                      <Image
                        src={
                          quiz.createdBy?.profilePicture ||
                          "/images/placeholder.png"
                        }
                        alt={quiz.createdBy?.name}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='flex justify-center items-center bg-gradient-to-br from-emerald-100 to-emerald-200 w-full h-full font-bold text-emerald-700 text-lg'>
                        {getInitials(quiz.createdBy?.name || "")}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className='font-bold text-gray-900 text-lg'>
                    {quiz.createdBy.name}
                  </p>
                  <p className='font-medium text-emerald-600 text-sm'>
                    {quiz.createdBy.favouriteTopic}
                  </p>
                  <div className='flex items-center mt-1'>
                    <Trophy className='mr-1 w-3 h-3 text-amber-500' />
                    <span className='font-medium text-amber-600 text-sm'>
                      {quiz.createdBy.rank}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
