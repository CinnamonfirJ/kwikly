"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { ChevronLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRank } from "@/context/RankContext";
import axios from "axios";

// This would normally come from your MongoDB database
// For demo purposes, we're using static data

interface QuizResult {
  quizId: number;
  score: number;
  passed: boolean;
  completedAt: Date;
}

type SaveQuizResultRequest = {
  userId: string;
  quizId: string;
  score: number;
  passed: boolean;
  title: string;
  passingScore: number;
  maxScore: number;
  subject: string;
  topic: string;
  duration: string;
};

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

// Helper function to calculate total points
const calculateTotalPoints = (quiz: Quiz) => {
  return (
    quiz?.questions.reduce((total, question) => total + question.points, 0) || 0
  );
};

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

export default function QuizSession({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = use(params); // Unwrap the params Promise
  const { code } = unwrappedParams;
  const queryClient = useQueryClient();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const { updateXPAndRank } = useRank();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const { data: quizData } = useQuery({
    queryKey: ["quiz"],
    queryFn: async () => {
      const res = await fetch("/api/quiz/test");
      const data = await res.json();
      console.log("New Quiz ", data.quizzes);
      return data.quizzes;
    },
  });

  useEffect(() => {
    if (quizData) {
      setQuizzes(quizData);
    }
  }, [quizData]);

  // Helper function to find a quiz by code
  const findQuizByCode = (code: string) => {
    return quizzes.find((quiz) => quiz.code === code);
  };

  const quiz = findQuizByCode(code);
  const questions = quiz?.questions || [];

  // Check if current user is the creator
  const isCreator = quiz?.createdBy.name === quiz?.createdBy.name;

  // Set initial time based on quiz duration
  const [timeLeft, setTimeLeft] = useState(() => {
    if (quiz) {
      return durationToSeconds(quiz.duration);
    }
    return 1800; // Default to 30 minutes if quiz not found
  });

  // Timer effect
  useEffect(() => {
    if (quizCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizCompleted]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Select an answer
  const selectAnswer = (questionId: number, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const saveQuizResult = async ({
    userId,
    quizId,
    score,
    passed,
    title,
    passingScore,
    maxScore,
    subject,
    topic,
    duration,
  }: SaveQuizResultRequest) => {
    try {
      const res = await axios.post("/api/user/save", {
        userId,
        quizId,
        score,
        passed,
        title,
        passingScore,
        maxScore,
        subject,
        topic,
        duration,
      });

      const data = res.data;
      if (!data) {
        throw new Error(data.message || "Failed to save results");
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const { mutate: saveQuizMutate } = useMutation({
    mutationFn: saveQuizResult,
    // onMutate: () => setIsPending(true),
    // onError: (error: Error) => {
    //   setIsError(true);
    //   setError(error);
    //   setIsPending(false);
    // },
    onSuccess: () => {
      // setIsPending(false);
      // queryClient.invalidateQueries({ queryKey: ["authUser"] });
      console.log("Saved Successful");
    },
  });

  // Submit quiz
  const submitQuiz = () => {
    if (!quiz) return;

    // Get the cached user data
    const authUser = queryClient.getQueryData<User>(["authUser"]);
    console.log("Authenticated User", authUser?._id);
    console.log("Quiz Id", quiz._id);

    if (!authUser?._id) return;

    // Calculate score
    let totalPoints = 0;
    questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        totalPoints += question.points;
      }
    });

    const maxPossiblePoints = calculateTotalPoints(quiz);
    const percentage = Math.round((totalPoints / maxPossiblePoints) * 100);
    setScore(percentage);
    setTotalScore(totalPoints);

    // Debugging logs
    console.log("Percentage:", percentage);
    console.log("Passing Score:", quiz.passingScore);
    console.log("XP Reward:", quiz.xpReward);

    const userId = authUser._id;
    const quizId = quiz._id;

    if (percentage >= quiz.passingScore) {
      // Use `percentage` instead of `score`
      console.log("User passed. Awarding full XP:", quiz.xpReward);
      const scoreData = {
        userId,
        quizId,
        score: percentage,
        passed: true,
        title: quiz.title,
        passingScore: quiz.passingScore,
        maxScore: quiz.maxScore,
        subject: quiz.subject,
        topic: quiz.topic,
        duration: quiz.duration,
      };
      saveQuizMutate(scoreData);
      updateXPAndRank(quiz.xpReward);
    } else {
      const calculatedScore = Math.floor(quiz.xpReward * 0.25);
      console.log("User failed. Awarding partial XP:", calculatedScore);
      const scoreData = {
        userId,
        quizId,
        score: percentage,
        passed: false,
        title: quiz.title,
        passingScore: quiz.passingScore,
        maxScore: quiz.maxScore,
        subject: quiz.subject,
        topic: quiz.topic,
        duration: quiz.duration,
      };
      saveQuizMutate(scoreData);
      updateXPAndRank(calculatedScore);
    }

    setQuizCompleted(true);

    // In a real app, you would save the quiz results to the database here
    // and update the user's XP if they passed
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

  // Current question
  const question = questions[currentQuestion];

  return (
    <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl container'>
      {!quizCompleted ? (
        // Quiz in progress
        <div className='gap-8 grid md:grid-cols-3'>
          {/* Quiz */}
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

            <div className='p-6'>
              {/* Progress */}
              <div className='mb-6'>
                <div className='bg-gray-100 rounded-full w-full h-2'>
                  <div
                    className='bg-pink-500 rounded-full h-full'
                    style={{
                      width: `${
                        ((currentQuestion + 1) / questions.length) * 100
                      }%`,
                    }}
                  />
                </div>
                <div className='mt-2 text-gray-500 text-sm text-right'>
                  Question {currentQuestion + 1} of {questions.length}
                </div>
              </div>

              {/* Question */}
              {question && (
                <div>
                  <h2 className='mb-6 font-medium text-lg'>
                    {question.questionText}
                  </h2>

                  {/* Options */}
                  <div className='space-y-3 mb-6'>
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedAnswers[question.id] === option
                            ? "bg-pink-500 border-pink-500 text-white"
                            : "border-gray-200 hover:border-pink-200 hover:bg-pink-50"
                        }`}
                        onClick={() => selectAnswer(question.id, option)}
                      >
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>

                  {/* Points indicator */}
                  <div className='mb-6 text-gray-500 text-sm'>
                    Points: {question.points}
                  </div>

                  {/* Navigation Buttons */}
                  <div className='flex justify-between'>
                    <button
                      className={`px-6 py-2 rounded-full border ${
                        currentQuestion === 0
                          ? "border-gray-200 text-gray-400 cursor-not-allowed"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={prevQuestion}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </button>

                    {currentQuestion < questions.length - 1 ? (
                      <button
                        className='bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-full text-white transition-colors'
                        onClick={nextQuestion}
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        className='bg-green-500 hover:bg-green-600 px-6 py-2 rounded-full text-white transition-colors'
                        onClick={submitQuiz}
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Student info and quiz creator info */}
          <div className='md:col-span-1'>
            <div className='bg-white shadow-sm p-6 border border-pink-100 rounded-xl'>
              {/* Instructions */}
              <div className='bg-pink-50 mb-6 p-4 rounded-lg'>
                <h2 className='font-bold text-xl'>Instructions</h2>
                <p className='text-gray-700'>{quiz.instruction}</p>
              </div>

              {/* Quiz creator info */}
              <div className='mb-6 p-4 border border-pink-100 rounded-lg'>
                {/* User info */}

                <h3 className='mb-2 font-bold text-lg'>Quiz Creator</h3>
                <div className='flex items-center gap-3'>
                  <div className='relative border-4 border-pink-100 rounded-full w-16 h-16 overflow-hidden'>
                    {/* <Image
                      src={quiz.createdBy.profilePicture || "/placeholder.svg"}
                      alt={quiz.createdBy.name}
                      fill
                      className='object-cover'
                    /> */}
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

              {/* <div className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center'>
                      <Award className='mr-2 w-5 h-5 text-pink-500' />
                      <span className='font-medium'>Level {user.level}</span>
                    </div>
                    <span className='text-gray-500 text-sm'>
                      {user.xp}/{user.xpToNextLevel} XP
                    </span>
                  </div>
                  <div className='bg-pink-100 rounded-full w-full h-2 overflow-hidden'>
                    <div
                      className='bg-pink-500 rounded-full h-full'
                      style={{
                        width: `${(user.xp / user.xpToNextLevel) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className='gap-4 grid grid-cols-2 pt-4'>
                  <div className='flex flex-col justify-center items-center bg-pink-50 p-4 rounded-lg'>
                    <BookOpen className='mb-2 w-6 h-6 text-pink-500' />
                    <span className='font-bold text-xl'>
                      {user.completedQuizzes}
                    </span>
                    <span className='text-gray-500 text-xs'>
                      Quizzes Completed
                    </span>
                  </div>
                  <div className='flex flex-col justify-center items-center bg-pink-50 p-4 rounded-lg'>
                    <Trophy className='mb-2 w-6 h-6 text-pink-500' />
                    <span className='font-bold text-xl'>3</span>
                    <span className='text-gray-500 text-xs'>Achievements</span>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      ) : (
        // Quiz completed - show results
        <div className='bg-white shadow-md border border-pink-100 rounded-xl overflow-hidden'>
          <div className='p-8 text-center'>
            <h2 className='mb-4 font-bold text-2xl'>Quiz Completed!</h2>
            <div className='mb-6 font-bold text-pink-500 text-6xl'>
              {score}%
            </div>

            {score >= quiz.passingScore ? (
              <div className='bg-green-50 mb-6 p-4 border border-green-200 rounded-lg'>
                <div className='flex justify-center items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-500' />
                  <p className='font-medium text-green-700'>
                    Congratulations! You passed the quiz and earned{" "}
                    {quiz.xpReward} XP.
                  </p>
                </div>
              </div>
            ) : (
              <div className='bg-red-50 mb-6 p-4 border border-red-200 rounded-lg'>
                <div className='flex justify-center items-center gap-2'>
                  <XCircle className='w-5 h-5 text-red-500' />
                  <p className='font-medium text-red-700'>
                    You didn&#39;t reach the passing score of{" "}
                    {quiz.passingScore}%. Try again!
                  </p>
                </div>
              </div>
            )}

            <p className='mb-8 text-lg'>
              You scored {totalScore} out of {quiz.maxScore} points.
            </p>

            <div className='flex sm:flex-row flex-col justify-center gap-4'>
              <Link
                href='/quizzes'
                className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-full font-medium text-white transition-colors'
              >
                Back to Quizzes
              </Link>

              <button
                className='inline-flex justify-center items-center bg-white hover:bg-pink-50 px-6 py-3 border border-pink-200 rounded-full font-medium text-pink-500 transition-colors'
                onClick={() => {
                  setCurrentQuestion(0);
                  setSelectedAnswers({});
                  setTimeLeft(durationToSeconds(quiz.duration));
                  setQuizCompleted(false);
                }}
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
