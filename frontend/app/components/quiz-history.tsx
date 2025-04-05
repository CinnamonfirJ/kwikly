import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Clock, BookMarked } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Types for QuizResult and User
interface QuizResult {
  quizId: string;
  score: number;
  passed: boolean;
  completedAt: Date;
  title: string;
  passingScore: number;
  code: string;
  maxScore: number;
  subject: string;
  topic: string;
  duration: string;
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

type Question = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
};

interface Quiz {
  message: string;
  quiz: {
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
  };
}

interface QuizHistory {
  id: string;
  title: string;
  date: string;
  score: number;
  passingScore: number;
  code: string;
  maxScore: number;
  subject: string;
  topic: string;
  duration: string;
  passed: boolean;
}

export default function QuizHistory() {
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null); // Initialize with `null`

  // Get the cached user data
  const authUserResults = queryClient.getQueryData<Quiz>(["userResults"]);
  const authUser = queryClient.getQueryData<User>(["authUser"]);
  if (authUserResults && authUserResults.quiz) {
    console.log("Authenticated User Results", authUserResults.quiz._id);
    console.log("Authenticated User", authUser?._id);
  } else {
    console.log("No quiz data available");
  }

  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);

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
            code: result.code,
            maxScore: result.maxScore,
            subject: result.subject,
            topic: result.topic,
            duration: result.duration,
            passed: result.passed, // Ensure each passed value is a boolean
          }))
      );
    }
  }, [user]);

  console.log("Collected Quiz", quizHistory);

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
    <div className='space-y-4'>
      {quizHistory?.map((quiz) => (
        <div
          key={quiz.id}
          className='bg-white shadow-sm p-4 border border-pink-100 rounded-lg'
        >
          <div className='pb-2'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <h3 className='font-semibold text-base'>{quiz.title}</h3>
                {quiz.passed ? (
                  <span className='inline-block bg-green-100 px-2 py-0.5 rounded-full font-medium text-green-600 text-xs'>
                    Passed
                  </span>
                ) : (
                  <span className='inline-block bg-red-100 px-2 py-0.5 rounded-full font-medium text-red-600 text-xs'>
                    Failed
                  </span>
                )}
              </div>
              <div className='text-gray-500 text-xs'>
                {new Date(quiz.date).toLocaleDateString()}
              </div>
            </div>
            <div className='flex items-center gap-2 mt-1 text-gray-500 text-xs'>
              <span>
                {quiz.subject} • {quiz.topic}
              </span>
              <span className='flex items-center'>
                <Clock className='mr-1 w-3 h-3' />
                {quiz.duration}
              </span>
            </div>
          </div>
          <div className='flex justify-between items-center mt-2'>
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

          <div className='flex justify-between items-center mt-2'>
            <div className='flex items-center gap-1'>
              <Link href={`/quiz-result/${quiz.code}`}>
                <span className='flex justify-center items-center gap-2 font-medium text-sm'>
                  {quiz.code} <BookMarked className='w-4 h-4 text-green-500' />
                </span>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
