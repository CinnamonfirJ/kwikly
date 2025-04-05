"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, ChevronLeft, Clock, XCircle } from "lucide-react";
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

// Helper function to convert duration string to seconds
const durationToSeconds = (duration: string): number => {
  const parts = duration.split(" ");
  if (parts.length === 2) {
    const value = Number.parseInt(parts[0]);
    const unit = parts[1].toLowerCase();

    if (unit.includes("minute")) {
      return value * 60; // Convert minutes to seconds
    } else if (unit.includes("hour")) {
      return value * 60 * 60; // Convert hours to seconds
    }
  }

  // Default to 30 minutes if parsing fails
  return 30 * 60;
};

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

  const quiz = findQuizByCode(code);
  const questions = quiz?.questions || [];
  const selectedQuizAnswers = quizHistory
    .map((result) => result.selectedAnswers)
    .find((answer) => answer !== undefined);
  console.log("The HISTORY", selectedQuizAnswers);

  // Check if current user is the creator
  const isCreator = quiz?.createdBy.name === quiz?.createdBy.name;

  // Set initial time based on quiz duration
  const [timeLeft, setTimeLeft] = useState(1800); // Default to 30 minutes

  useEffect(() => {
    if (quiz?.duration) {
      setTimeLeft(durationToSeconds(quiz?.duration || ""));
    }
  }, [quiz?.duration]); // Runs when quiz.duration updates

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
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  // If quiz not found
  if (!quiz) {
    return (
      <div className='flex flex-col justify-center items-center min-h-[70vh]'>
        <div className='text-center'>
          <h2 className='mb-4 font-bold text-2xl'>Quiz Not Found</h2>
          <p className='mb-6 text-gray-500'>
            The quiz with code &#34;{code}&#34; could not be found.
          </p>
          <Link
            href='/quizzes'
            className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-full font-medium text-white transition-colors'
          >
            Browse Quizzes
          </Link>
        </div>
      </div>
    );
  }

  // If quiz is private and user is not the creator
  if (!quiz.isPublic && !isCreator) {
    return (
      <div className='flex flex-col justify-center items-center min-h-[70vh]'>
        <div className='text-center'>
          <h2 className='mb-4 font-bold text-2xl'>Private Quiz</h2>
          <p className='mb-6 text-gray-500'>
            This quiz is private and can only be accessed by its creator.
          </p>
          <Link
            href='/quizzes'
            className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-full font-medium text-white transition-colors'
          >
            Browse Quizzes
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
        <div className='flex justify-center items-center h-64'>
          <div className='border-pink-500 border-t-2 border-b-2 rounded-full w-12 h-12 animate-spin'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='gap-8 grid md:grid-cols-3'>
      {/* Results Section */}
      <div className='md:col-span-2 bg-white shadow-md border border-pink-100 rounded-xl overflow-hidden'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-pink-100 border-b'>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => router.back()}
              className='hover:bg-pink-50 p-2 rounded-full transition-colors'
            >
              <ChevronLeft className='w-5 h-5 text-gray-500' />
            </button>
            <h1 className='font-bold text-xl'>{quiz.title}</h1>
          </div>
          <div className='flex items-center gap-2 bg-pink-50 px-3 py-1 rounded-full'>
            <Clock className='w-4 h-4 text-pink-500' />
            <span className='font-medium text-pink-500'>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {quizHistory.map((quiz, index) => {
          if (index == quizHistory.length - 1)
            return (
              <div
                key={quiz.id}
                className='flex justify-between items-center mt-2 p-6'
              >
                <div className='flex items-center gap-1'>
                  <span className='font-medium text-sm'>
                    Score: {quiz.score}/{quiz.maxScore}
                  </span>
                  {quiz.passed ? (
                    <CheckCircle className='w-4 h-4 text-green-500' />
                  ) : (
                    <XCircle className='w-4 h-4 text-red-500' />
                  )}
                </div>
                <div className='text-gray-500 text-xs'>
                  Passing score: {quiz.passingScore}
                </div>
              </div>
            );
        })}

        <div className='space-y-10 p-6'>
          {questions.map((question, qIndex) => {
            // We'll extract the selected answer from quizHistory for this question
            const selected = selectedQuizAnswers?.[question.id]; // selectedAnswers is from the specific quiz result

            // const selected = selectedAnswers[question.id]; // selectedAnswers is from the specific quiz result
            const isCorrect = selected === question.correctAnswer;
            console.log("Selected:", selected);

            return (
              <div key={question.id} className='pb-8 border-b'>
                <h2 className='mb-4 font-semibold text-lg'>
                  Question {qIndex + 1}: {question.questionText}
                </h2>

                {/* Options */}
                <div className='space-y-3 mb-4'>
                  {question.options.map((option, index) => {
                    const selectedAnswer = selected;
                    const isSelected = selectedAnswer === option;
                    const isAnswer = option === question.correctAnswer;
                    console.log("Is Selected:", option);
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border transition-colors
                          ${
                            isSelected
                              ? isCorrect
                                ? "bg-green-100 border-green-500 text-green-700"
                                : !isCorrect && !isAnswer
                                ? "bg-red-100 border-red-500 text-red-700"
                                : "bg-green-100 border-green-500 text-green-700"
                              : "border-gray-200"
                          }
                          ${
                            isAnswer && !isSelected
                              ? "bg-green-50 border-green-300"
                              : ""
                          }
                        `}
                      >
                        {option}
                        {isAnswer && (
                          <span className='ml-2 font-medium text-green-500'>
                            (Correct Answer)
                          </span>
                        )}
                        {isSelected && !isCorrect && !isAnswer && (
                          <span className='ml-2 font-medium text-red-500'>
                            (Your Answer)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Points Info */}
                <div className='text-gray-500 text-sm'>
                  Points: {question.points}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Info / Creator Info */}
      <div className='md:col-span-1'>
        <div className='bg-white shadow-sm p-6 border border-pink-100 rounded-xl'>
          {/* Instructions */}
          <div className='bg-pink-50 mb-6 p-4 rounded-lg'>
            <h2 className='font-bold text-xl'>Instructions</h2>
            <p className='text-gray-700'>{quiz.instruction}</p>
          </div>

          {/* Quiz Creator Info */}
          <div className='mb-6 p-4 border border-pink-100 rounded-lg'>
            <h3 className='mb-2 font-bold text-lg'>Quiz Creator</h3>
            <div className='flex items-center gap-3'>
              <div className='relative border-4 border-pink-100 rounded-full w-16 h-16 overflow-hidden'>
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
                  <div className='flex justify-center items-center bg-pink-50 w-full h-full font-medium text-pink-500 text-xl'>
                    {getInitials(quiz.createdBy?.name || "")}
                  </div>
                )}
              </div>
              <div>
                <p className='font-medium text-xl'>{quiz.createdBy.name}</p>
                <p className='text-gray-500 text-sm'>
                  {quiz.createdBy.favouriteTopic} • {quiz.createdBy.rank}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
