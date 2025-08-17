"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  User,
  Target,
  Award,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRank } from "@/context/RankContext";
import axios from "axios";
import { useToastContext } from "@/providers/toast-provider";

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
  code: string;
  maxScore: number;
  subject: string;
  topic: string;
  duration: string;
  selectedAnswers: Record<number, string>;
  timeLeft: number;
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
  const toast = useToastContext();

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
  const [timeLeft, setTimeLeft] = useState(0); // Default to 30 minutes

  useEffect(() => {
    if (quiz?.duration) {
      setTimeLeft(durationToSeconds(quiz?.duration || ""));
    }
  }, [quiz?.duration]); // Runs when quiz.duration updates

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

  const authUser = queryClient.getQueryData<User>(["authUser"]);

  // Refs to store the latest state values
  const currentQuestionRef = useRef(currentQuestion);
  const selectedAnswersRef = useRef(selectedAnswers);

  const timeLeftRef = useRef(durationToSeconds(quiz?.duration || ""));

  // Update refs whenever the state changes
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Save progress to localStorage
  const saveProgressToLocal = () => {
    const progress = {
      currentQuestion: currentQuestionRef.current,
      selectedAnswers: selectedAnswersRef.current,
      timeLeft: timeLeftRef.current,
    };
    localStorage.setItem(`quizProgress-${quiz?._id}`, JSON.stringify(progress));
  };

  // Restore progress from localStorage
  const restoreProgressFromLocal = () => {
    const savedProgress = localStorage.getItem(`quizProgress-${quiz?._id}`);
    if (!savedProgress) {
      console.log("No saved progress found in localStorage.");
      return;
    }

    try {
      const { currentQuestion, selectedAnswers, timeLeft } =
        JSON.parse(savedProgress);
      setCurrentQuestion(currentQuestion || 0);
      setSelectedAnswers(selectedAnswers || {});
      setTimeLeft(timeLeft || durationToSeconds(quiz?.duration || ""));
      console.log("Restored progress from localStorage:", {
        currentQuestion,
        selectedAnswers,
        timeLeft,
      });
    } catch (error) {
      console.error("Failed to parse saved progress from localStorage:", error);
    }
  };

  // Save progress to backend
  const saveProgressToBackend = async () => {
    console.log("User ID:", authUser?._id);
    try {
      const progress = {
        quizId: quiz?._id,
        userId: authUser?._id,
        currentQuestion: currentQuestionRef.current,
        selectedAnswers: selectedAnswersRef.current,
        timeLeft: timeLeftRef.current,
      };
      await axios.post(`/api/user/${authUser?._id}/progress`, progress);
      console.log("Progress saved to backend successfully.");
    } catch (error) {
      console.error("Failed to save progress to backend:", error);
    }
  };

  // Restore progress from backend
  const restoreProgressFromBackend = async () => {
    if (!authUser?._id || !quiz?._id) {
      console.log(
        "Cannot restore progress from backend: Missing authUser or quiz data."
      );
      return;
    }

    try {
      const res = await axios.get(
        `/api/user/${authUser?._id}/progress/${quiz?._id}`
      );
      if (!res.data || !res.data.progress) {
        console.log("No saved progress found on the backend.");
        return;
      }

      const { currentQuestion, selectedAnswers, timeLeft } = res.data.progress;
      setCurrentQuestion(currentQuestion || 0);
      setSelectedAnswers(selectedAnswers || {});
      setTimeLeft(timeLeft || durationToSeconds(quiz?.duration || ""));
      console.log("Restored progress from backend:", {
        currentQuestion,
        selectedAnswers,
        timeLeft,
      });
    } catch (error) {
      console.error("Failed to restore progress from backend:", error);
    }
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save progress periodically
  useEffect(() => {
    if (!authUser?._id || !quiz?._id) {
      console.log("Skipping periodic saving: Missing authUser or quiz data.");
      return;
    }

    console.log("Setting up interval for saving progress...");
    intervalRef.current = setInterval(() => {
      console.log("Saving progress...");
      saveProgressToLocal();
      saveProgressToBackend();
    }, 30000); // Save every 30 seconds

    return () => {
      if (intervalRef.current) {
        console.log("Clearing interval for saving progress...");
        clearInterval(intervalRef.current);
      }
    };
  }, [authUser?._id, quiz?._id]);

  // Restore progress on page load
  useEffect(() => {
    if (authUser?._id && quiz?._id) {
      console.log("Restoring progress from localStorage and backend...");
      saveProgressToLocal();
      saveProgressToBackend();
      restoreProgressFromLocal();
      restoreProgressFromBackend();
    } else {
      console.log("authUser or quiz is not available yet. Skipping restore.");
    }
  }, [authUser, quiz]);

  // Refs to store authUser and quiz
  const authUserRef = useRef(authUser);
  const quizRef = useRef(quiz);

  // Update refs whenever authUser or quiz changes
  useEffect(() => {
    authUserRef.current = authUser;
  }, [authUser]);

  useEffect(() => {
    quizRef.current = quiz;
  }, [quiz]);

  const deleteProgressFromLocal = (quizId: string) => {
    if (!quizId) {
      console.log("Cannot delete progress locally: Missing quiz ID.");
      return;
    }

    localStorage.removeItem(`quizProgress-${quizId}`);
    console.log("Progress deleted from localStorage successfully.");
  };

  const deleteProgressFromBackend = async (userId: string, quizId: string) => {
    try {
      await axios.delete(`/api/user/${userId}/progress/${quizId}`);
      console.log("Progress deleted from backend successfully.");
    } catch (error) {
      console.error("Failed to delete progress from backend:", error);
    }
  };

  useEffect(() => {
    return () => {
      console.log("User is leaving the quiz session. Deleting progress...");

      const currentAuthUser = authUserRef.current;
      const currentQuiz = quizRef.current;

      if (!currentAuthUser?._id || !currentQuiz?._id) {
        console.log("Cannot delete progress: Missing authUser or quiz data.");
        return;
      }

      deleteProgressFromLocal(currentQuiz._id);

      deleteProgressFromBackend(currentAuthUser._id, currentQuiz._id);
    };
  }, []);

  const saveQuizResult = async ({
    userId,
    quizId,
    score,
    passed,
    title,
    passingScore,
    code,
    maxScore,
    subject,
    topic,
    duration,
    selectedAnswers,
    timeLeft,
  }: SaveQuizResultRequest) => {
    try {
      const res = await axios.post("/api/user/save", {
        userId,
        quizId,
        score,
        passed,
        title,
        passingScore,
        code,
        maxScore,
        subject,
        topic,
        duration,
        selectedAnswers,
        timeLeft,
      });

      const data = res.data;
      if (!data) {
        throw new Error(data.message || "Failed to save results");
      }
      return data;
    } catch (error) {
      toast.error(String(error) || "No");
      throw error;
    }
  };

  const { mutate: saveQuizMutate } = useMutation({
    mutationFn: saveQuizResult,
    onSuccess: () => {
      setQuizCompleted(true);
      // Delete progress after submission
      deleteProgressFromLocal(quiz?._id || "");
      deleteProgressFromBackend(authUser?._id || "", quiz?._id || "");
      console.log("Quiz submitted. Progress deleted.");
      toast.success("Quiz results saved successfully!");
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
    let savedScore = 0;
    questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        totalPoints += question.points;
        savedScore = totalPoints;
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
        score: savedScore,
        passed: true,
        title: quiz.title,
        passingScore: quiz.passingScore,
        code: quiz.code,
        maxScore: quiz.maxScore,
        subject: quiz.subject,
        topic: quiz.topic,
        duration: quiz.duration,
        selectedAnswers: selectedAnswersRef.current,
        timeLeft: timeLeft,
      };
      saveQuizMutate(scoreData);
      updateXPAndRank(quiz.xpReward);
    }
    if (
      percentage >= quiz.passingScore * 0.3 &&
      percentage < quiz.passingScore
    ) {
      const calculatedScore = Math.floor(quiz.xpReward * 0.25);
      console.log("User failed. Awarding partial XP:", calculatedScore);
      const scoreData = {
        userId,
        quizId,
        score: savedScore,
        passed: false,
        title: quiz.title,
        passingScore: quiz.passingScore,
        code: quiz.code,
        maxScore: quiz.maxScore,
        subject: quiz.subject,
        topic: quiz.topic,
        duration: quiz.duration,
        selectedAnswers: selectedAnswersRef.current,
        timeLeft: timeLeft,
      };
      saveQuizMutate(scoreData);
      updateXPAndRank(calculatedScore);
    }
    if (percentage < quiz.passingScore * 0.3) {
      // Use `percentage` instead of `score`
      console.log("User passed. Awarding full XP:", quiz.xpReward);
      const scoreData = {
        userId,
        quizId,
        score: savedScore,
        passed: true,
        title: quiz.title,
        passingScore: quiz.passingScore,
        code: quiz.code,
        maxScore: quiz.maxScore,
        subject: quiz.subject,
        topic: quiz.topic,
        duration: quiz.duration,
        selectedAnswers: selectedAnswersRef.current,
        timeLeft: timeLeft,
      };
      saveQuizMutate(scoreData);
      updateXPAndRank(0);
    }
  };

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  const getSubjectColor = (subject?: string) => {
    const colors = {
      Mathematics: "from-blue-500 to-blue-600",
      Science: "from-green-500 to-green-600",
      English: "from-purple-500 to-purple-600",
      History: "from-amber-500 to-amber-600",
      Geography: "from-emerald-500 to-emerald-600",
      Technology: "from-indigo-500 to-indigo-600",
      "Computer Science": "from-cyan-500 to-cyan-600",
      "Network Technology": "from-violet-500 to-violet-600",
      "Department of Computer Engineering": "from-rose-500 to-rose-600",
      "Human-Computer Interaction": "from-teal-500 to-teal-600",
      "Computer Engineering": "from-orange-500 to-orange-600",
    };
    return (
      colors[subject as keyof typeof colors] || "from-pink-500 to-pink-600"
    );
  };

  // If quiz not found
  if (!quiz) {
    return (
      <div className='bg-gradient-to-br from-slate-50 via-white to-pink-50/30 min-h-screen'>
        <div className='absolute inset-0 opacity-5 pointer-events-none'>
          <div
            className='top-0 left-0 absolute w-full h-full'
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #ec4899 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
        <div className='relative flex flex-col justify-center items-center min-h-screen'>
          <div className='bg-white/80 shadow-lg backdrop-blur-sm p-8 border border-pink-100/50 rounded-2xl text-center'>
            <h2 className='mb-4 font-bold text-gray-900 text-2xl'>
              Quiz Not Found
            </h2>
            <p className='mb-6 text-gray-600'>
              The quiz with code &#34;{code}&#34; could not be found.
            </p>
            <Link
              href='/quizzes'
              className='group inline-flex justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl overflow-hidden font-medium text-white hover:scale-105 transition-all duration-300 transform'
            >
              <ChevronLeft className='mr-2 w-4 h-4' />
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
      <div className='bg-gradient-to-br from-slate-50 via-white to-pink-50/30 min-h-screen'>
        <div className='absolute inset-0 opacity-5 pointer-events-none'>
          <div
            className='top-0 left-0 absolute w-full h-full'
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #ec4899 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
        <div className='relative flex flex-col justify-center items-center min-h-screen'>
          <div className='bg-white/80 shadow-lg backdrop-blur-sm p-8 border border-pink-100/50 rounded-2xl text-center'>
            <h2 className='mb-4 font-bold text-gray-900 text-2xl'>
              Private Quiz
            </h2>
            <p className='mb-6 text-gray-600'>
              This quiz is private and can only be accessed by its creator.
            </p>
            <Link
              href='/quizzes'
              className='group inline-flex justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl overflow-hidden font-medium text-white hover:scale-105 transition-all duration-300 transform'
            >
              <ChevronLeft className='mr-2 w-4 h-4' />
              Browse Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Current question
  const question = questions[currentQuestion];

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

      <div className='relative mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl container'>
        {!quizCompleted ? (
          // Quiz in progress
          <div className='gap-8 grid lg:grid-cols-3'>
            {/* Main Quiz */}
            <div className='group relative lg:col-span-2'>
              <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-300 blur'></div>
              <div className='relative bg-white/80 shadow-lg backdrop-blur-sm border border-pink-100/50 rounded-2xl overflow-hidden'>
                {/* Header */}
                <div className='flex justify-between items-center bg-gradient-to-r from-white/50 to-pink-50/50 p-6 border-pink-100/50 border-b'>
                  <div className='flex items-center gap-3'>
                    <button
                      onClick={() => router.back()}
                      className='group bg-gradient-to-r from-pink-100 hover:from-pink-200 to-purple-100 hover:to-purple-200 p-2 rounded-lg transition-all duration-200'
                    >
                      <ChevronLeft className='w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform' />
                    </button>
                    <div>
                      <h1 className='font-bold text-gray-900 text-xl'>
                        {quiz.title}
                      </h1>
                      <div
                        className={`inline-flex items-center bg-gradient-to-r ${getSubjectColor(
                          quiz?.subject
                        )} px-3 py-1 rounded-full font-medium text-white text-xs shadow-sm`}
                      >
                        <Sparkles className='mr-1 w-3 h-3' />
                        {quiz?.subject}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm px-4 py-2 border border-blue-200/50 rounded-full'>
                    <Clock className='w-4 h-4 text-blue-500' />
                    <span className='font-bold text-blue-700'>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                <div className='p-6'>
                  {/* Progress */}
                  <div className='mb-6'>
                    <div className='bg-gradient-to-r from-gray-100 to-gray-200 shadow-inner rounded-full w-full h-3'>
                      <div
                        className='bg-gradient-to-r from-pink-500 to-purple-600 shadow-sm rounded-full h-full transition-all duration-500 ease-out'
                        style={{
                          width: `${
                            ((currentQuestion + 1) / questions.length) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <div className='flex justify-between items-center mt-2'>
                      <span className='font-medium text-gray-600 text-sm'>
                        Question {currentQuestion + 1} of {questions.length}
                      </span>
                      <span className='font-bold text-pink-600 text-sm'>
                        {Math.round(
                          ((currentQuestion + 1) / questions.length) * 100
                        )}
                        % Complete
                      </span>
                    </div>
                  </div>

                  {/* Question */}
                  {question && (
                    <div>
                      <div className='bg-gradient-to-r from-purple-50 to-pink-50 mb-6 p-6 border border-purple-200/50 rounded-xl'>
                        <h2 className='font-bold text-gray-900 text-lg md:text-xl leading-relaxed'>
                          {question.questionText}
                        </h2>
                        <div className='flex items-center gap-2 mt-3'>
                          <Target className='w-4 h-4 text-purple-500' />
                          <span className='font-medium text-purple-600 text-sm'>
                            Points: {question.points}
                          </span>
                        </div>
                      </div>

                      {/* Options */}
                      <div className='space-y-3 mb-6'>
                        {question.options.map((option, index) => (
                          <div
                            key={index}
                            className={`group border rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                              selectedAnswers[question.id] === option
                                ? "bg-gradient-to-r from-pink-500 to-purple-600 border-pink-500 text-white shadow-lg"
                                : "border-gray-200 hover:border-pink-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 bg-white/80 backdrop-blur-sm"
                            }`}
                            onClick={() => selectAnswer(question.id, option)}
                          >
                            <div className='flex items-center gap-3'>
                              <div
                                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                                  selectedAnswers[question.id] === option
                                    ? "border-white bg-white"
                                    : "border-gray-300 group-hover:border-pink-400"
                                }`}
                              >
                                {selectedAnswers[question.id] === option && (
                                  <div className='bg-pink-500 rounded-full w-full h-full scale-50 transform'></div>
                                )}
                              </div>
                              <span className='flex-1 font-medium'>
                                {option}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Navigation Buttons */}
                      <div className='flex justify-between gap-4'>
                        <button
                          className={`group inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                            currentQuestion === 0
                              ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                              : "border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transform hover:scale-105"
                          }`}
                          onClick={prevQuestion}
                          disabled={currentQuestion === 0}
                        >
                          <ChevronLeft className='mr-2 w-4 h-4' />
                          Previous
                        </button>

                        {currentQuestion < questions.length - 1 ? (
                          <button
                            className='group inline-flex items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl overflow-hidden font-medium text-white hover:scale-105 transition-all duration-300 transform'
                            onClick={nextQuestion}
                          >
                            Next
                            <ChevronRight className='ml-2 w-4 h-4 transition-transform group-hover:translate-x-1' />
                          </button>
                        ) : (
                          <button
                            className='group inline-flex items-center bg-gradient-to-r from-green-500 hover:from-green-600 to-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl overflow-hidden font-medium text-white hover:scale-105 transition-all duration-300 transform'
                            onClick={submitQuiz}
                          >
                            <CheckCircle className='mr-2 w-4 h-4' />
                            Submit Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className='space-y-6 lg:col-span-1'>
              {/* Instructions */}
              {quiz?.instruction && (
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
                      {quiz?.instruction}
                    </p>
                  </div>
                </div>
              )}

              {/* Quiz Info */}
              <div className='group relative'>
                <div className='absolute -inset-1 bg-gradient-to-r from-purple-300 to-pink-300 opacity-0 group-hover:opacity-20 rounded-2xl transition duration-300 blur'></div>
                <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-purple-100/50 rounded-2xl'>
                  <h3 className='flex items-center mb-4 font-bold text-gray-900 text-xl'>
                    <div className='bg-gradient-to-r from-purple-100 to-purple-200 mr-3 p-3 rounded-xl'>
                      <Target className='w-5 h-5 text-purple-600' />
                    </div>
                    Quiz Details
                  </h3>

                  <div className='space-y-4'>
                    <div className='flex items-center bg-gradient-to-r from-pink-50 to-purple-50 p-3 border border-pink-200/50 rounded-xl'>
                      <span className='font-medium text-gray-600 text-sm'>
                        Topic:
                      </span>
                      <span className='ml-2 font-semibold text-gray-900'>
                        {quiz?.topic}
                      </span>
                    </div>

                    <div className='flex items-center bg-gradient-to-r from-purple-50 to-blue-50 p-3 border border-purple-200/50 rounded-xl'>
                      <span className='font-medium text-gray-600 text-sm'>
                        Questions:
                      </span>
                      <span className='ml-2 font-semibold text-gray-900'>
                        {quiz?.questions.length} Questions
                      </span>
                    </div>

                    <div className='bg-gradient-to-r from-amber-50 to-yellow-50 p-4 border border-amber-200/50 rounded-xl'>
                      <div className='flex items-center'>
                        <Award className='mr-2 w-5 h-5 text-amber-600' />
                        <div>
                          <p className='font-medium text-amber-600 text-sm'>
                            XP Reward
                          </p>
                          <p className='font-bold text-amber-800'>
                            {quiz?.xpReward} XP
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                        {quiz?.createdBy?.profilePicture ? (
                          <Image
                            src={
                              quiz?.createdBy?.profilePicture ||
                              "/images/placeholder.png"
                            }
                            alt={quiz?.createdBy?.name}
                            fill
                            className='object-cover'
                          />
                        ) : (
                          <div className='flex justify-center items-center bg-gradient-to-br from-emerald-100 to-emerald-200 w-full h-full font-bold text-emerald-700 text-lg'>
                            {getInitials(quiz?.createdBy?.name || "")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className='font-bold text-gray-900 text-lg'>
                        {quiz?.createdBy.name}
                      </p>
                      <p className='font-medium text-emerald-600 text-sm'>
                        {quiz?.createdBy.favouriteTopic}
                      </p>
                      <div className='flex items-center mt-1'>
                        <Sparkles className='mr-1 w-3 h-3 text-amber-500' />
                        <span className='font-medium text-amber-600 text-sm'>
                          {quiz?.createdBy.rank}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Quiz completed - show results
          <div className='group relative mx-auto max-w-4xl'>
            <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-25 rounded-3xl transition duration-300 blur'></div>
            <div className='relative bg-white/90 shadow-2xl backdrop-blur-sm border border-pink-100/50 rounded-3xl overflow-hidden'>
              <div className='bg-gradient-to-r from-pink-50/50 to-purple-50/50 p-8 md:p-12 text-center'>
                <div className='bg-gradient-to-r from-pink-100 to-purple-100 mx-auto mb-6 p-4 rounded-full w-20 h-20'>
                  {score >= quiz.passingScore ? (
                    <CheckCircle className='mx-auto w-12 h-12 text-green-500' />
                  ) : (
                    <XCircle className='mx-auto w-12 h-12 text-red-500' />
                  )}
                </div>

                <h2 className='mb-4 font-bold text-gray-900 text-3xl'>
                  Quiz Completed!
                </h2>

                <div className='bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-6 font-bold text-transparent text-6xl md:text-7xl'>
                  {score}%
                </div>

                {score >= quiz.passingScore ? (
                  <div className='bg-gradient-to-r from-green-50 to-emerald-50 mb-6 p-6 border border-green-200/50 rounded-2xl'>
                    <div className='flex justify-center items-center gap-3 mb-2'>
                      <CheckCircle className='w-6 h-6 text-green-500' />
                      <p className='font-bold text-green-700 text-lg'>
                        Congratulations! 🎉
                      </p>
                    </div>
                    <p className='font-medium text-green-600'>
                      You passed the quiz and earned {quiz.xpReward} XP!
                    </p>
                  </div>
                ) : (
                  <div className='bg-gradient-to-r from-red-50 to-rose-50 mb-6 p-6 border border-red-200/50 rounded-2xl'>
                    <div className='flex justify-center items-center gap-3 mb-2'>
                      <XCircle className='w-6 h-6 text-red-500' />
                      <p className='font-bold text-red-700 text-lg'>
                        Keep Trying! 💪
                      </p>
                    </div>
                    <p className='font-medium text-red-600'>
                      You didn&apos;t reach the passing score of{" "}
                      {quiz.passingScore}%. Don&apos;t give up!
                    </p>
                  </div>
                )}

                <p className='mb-8 font-medium text-gray-600 text-lg'>
                  You scored {totalScore} out of {quiz.maxScore} points.
                </p>

                <div className='flex sm:flex-row flex-col justify-center gap-4 mb-4'>
                  <Link
                    href={`/quiz-result/${quiz.code}`}
                    className='group inline-flex justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-8 py-4 rounded-xl overflow-hidden font-medium text-white hover:scale-105 transition-all duration-300 transform'
                  >
                    <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                    <Award className='mr-2 w-5 h-5' />
                    View Detailed Results
                  </Link>

                  <button
                    className='group inline-flex justify-center items-center bg-white/80 hover:bg-white hover:shadow-lg backdrop-blur-sm px-8 py-4 border border-pink-200 hover:border-pink-300 rounded-xl overflow-hidden font-medium text-pink-600 transition-all duration-300'
                    onClick={() => {
                      setCurrentQuestion(0);
                      setSelectedAnswers({});
                      setTimeLeft(durationToSeconds(quiz.duration));
                      setQuizCompleted(false);
                    }}
                  >
                    <Clock className='mr-2 w-5 h-5' />
                    Retake Quiz
                  </button>
                </div>

                <div className='flex justify-center'>
                  <Link
                    href='/quizzes'
                    className='group inline-flex items-center font-medium text-pink-600 hover:text-pink-700 transition-all duration-200'
                  >
                    <div className='bg-gradient-to-r from-pink-100 to-purple-100 mr-2 p-2 rounded-lg group-hover:scale-105 transition-transform duration-200'>
                      <ChevronLeft className='w-4 h-4' />
                    </div>
                    Back to All Quizzes
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
