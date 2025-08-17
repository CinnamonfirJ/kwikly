import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  XCircle,
  Clock,
  BookMarked,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  const [showHistory, setShowHistory] = useState(false);

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

  const getSubjectColor = (subject: string) => {
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

  const calculatePercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100);
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-8'>
        <div className='relative'>
          <div className='absolute -inset-2 bg-gradient-to-r from-pink-300 to-purple-300 opacity-20 rounded-full blur'></div>
          <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-4 border border-pink-200/50 rounded-xl'>
            <div className='flex items-center space-x-2'>
              <div className='relative'>
                <div className='border-pink-500 border-t-2 border-r-2 rounded-full w-4 h-4 animate-spin'></div>
              </div>
              <span className='text-gray-700 text-sm'>Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Performance Summary at Top */}
      <div className='group relative'>
        <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-20 rounded-xl transition duration-300 blur'></div>
        <div className='relative bg-gradient-to-r from-pink-50 to-purple-50 p-4 border border-pink-200/50 rounded-xl'>
          <div className='flex justify-between items-center mb-3'>
            <div className='flex items-center'>
              <TrendingUp className='mr-2 w-5 h-5 text-pink-500' />
              <h3 className='font-bold text-gray-900 text-lg'>
                Quiz Performance
              </h3>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className='flex items-center bg-white/80 hover:bg-white px-3 py-2 border border-pink-200/50 rounded-lg text-pink-600 hover:text-pink-700 transition-all duration-200'
            >
              <span className='mr-1 font-medium text-sm'>
                {showHistory ? "Hide History" : "Show History"}
              </span>
              {showHistory ? (
                <ChevronUp className='w-4 h-4' />
              ) : (
                <ChevronDown className='w-4 h-4' />
              )}
            </button>
          </div>

          <div className='gap-3 grid grid-cols-2 md:grid-cols-4'>
            <div className='text-center'>
              <div className='font-bold text-pink-600 text-xl'>
                {quizHistory.length}
              </div>
              <div className='text-gray-600 text-xs'>Total Quizzes</div>
            </div>
            <div className='text-center'>
              <div className='font-bold text-green-600 text-xl'>
                {quizHistory.filter((q) => q.passed).length}
              </div>
              <div className='text-gray-600 text-xs'>Passed</div>
            </div>
            <div className='text-center'>
              <div className='font-bold text-purple-600 text-xl'>
                {quizHistory.length > 0
                  ? Math.round(
                      (quizHistory.filter((q) => q.passed).length /
                        quizHistory.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <div className='text-gray-600 text-xs'>Success Rate</div>
            </div>
            <div className='text-center'>
              <div className='font-bold text-amber-600 text-xl'>
                {quizHistory.length > 0
                  ? Math.round(
                      quizHistory.reduce(
                        (acc, q) =>
                          acc + calculatePercentage(q.score, q.maxScore),
                        0
                      ) / quizHistory.length
                    )
                  : 0}
                %
              </div>
              <div className='text-gray-600 text-xs'>Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Quiz History */}
      {showHistory && (
        <div className='space-y-3 slide-in-from-top-2 animate-in duration-300 fade-in-0'>
          {quizHistory.length === 0 ? (
            <div className='group relative'>
              <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-20 rounded-xl blur'></div>
              <div className='relative bg-white/70 backdrop-blur-sm py-8 border border-pink-200/50 rounded-xl text-center'>
                <div className='inline-flex justify-center items-center bg-gradient-to-r from-pink-100 to-purple-100 mb-3 rounded-xl w-10 h-10'>
                  <BookMarked className='w-5 h-5 text-pink-500' />
                </div>
                <h4 className='mb-1 font-bold text-gray-900 text-lg'>
                  No Quiz History
                </h4>
                <p className='text-gray-600 text-sm'>
                  Start taking quizzes to see your progress here!
                </p>
              </div>
            </div>
          ) : (
            quizHistory.map((quiz, index) => (
              <div
                key={quiz.id}
                className='group relative'
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-15 rounded-lg transition duration-300 blur'></div>
                <div className='relative bg-white/80 hover:shadow-md backdrop-blur-sm p-4 border border-pink-100/50 rounded-lg transition-all duration-300'>
                  <div className='pb-2'>
                    <div className='flex md:flex-row flex-col justify-between md:items-center'>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`inline-flex items-center bg-gradient-to-r ${getSubjectColor(
                            quiz.subject
                          )} px-2 py-1 rounded-full font-medium text-white text-xs`}
                        >
                          {quiz.subject}
                        </div>
                        <h3 className='font-semibold text-base'>
                          {quiz.title}
                        </h3>
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
                    <div className='flex md:flex-row flex-col md:items-center gap-2 mt-1 text-gray-500 text-xs'>
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
                      Passing score: {quiz.passingScore}%
                    </div>
                  </div>

                  <div className='flex justify-between items-center mt-2'>
                    <div className='flex items-center gap-1'>
                      <Link href={`/quiz-result/${quiz.code}`}>
                        <span className='flex justify-center items-center gap-2 font-medium text-sm'>
                          {quiz.code}{" "}
                          <BookMarked className='w-4 h-4 text-green-500' />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
