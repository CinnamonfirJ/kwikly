"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  // Brain,
  User,
  Award,
  ChevronLeft,
  ListTodo,
  ChevronRight,
  Share2,
  Sparkles,
  Target,
  Zap,
  Hash,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  rank: string;
  level: number;
  xp: number;
  //   quizResults: QuizResult[]; // Replace with a proper type if needed
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

export default function QuizDetailsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const unwrappedParams = use(params); // Unwrap the params Promise
  const { code } = unwrappedParams;
  const [copiedCode, setCopiedCode] = useState("");

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
    return quizzes.find((quiz) => quiz?.code === code);
  };

  const quiz = findQuizByCode(code);

  //   // Copy quiz code to clipboard
  //   const copyCodeToClipboard = (code: string) => {
  //     navigator.clipboard.writeText(code);
  //     setCopiedCode(code);
  //     setTimeout(() => setCopiedCode(""), 2000);
  //   };

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

      <div className='relative mx-auto px-4 md:px-6 py-10 container'>
        {/* Back Button */}
        <Link
          href='/quizzes'
          className='group inline-flex items-center mb-8 font-medium text-pink-600 hover:text-pink-700 transition-all duration-200'
        >
          <div className='bg-gradient-to-r from-pink-100 to-purple-100 mr-2 p-2 rounded-lg group-hover:scale-105 transition-transform duration-200'>
            <ChevronLeft className='w-4 h-4' />
          </div>
          Back to quizzes
        </Link>

        <div className='gap-8 grid lg:grid-cols-3'>
          {/* Main Quiz Details */}
          <div className='group relative lg:col-span-2'>
            <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-300 blur'></div>
            <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-8 border border-pink-100/50 rounded-2xl'>
              {/* Header */}
              <div className='flex flex-wrap justify-between items-start gap-4 mb-6'>
                <div
                  className={`inline-flex items-center bg-gradient-to-r ${getSubjectColor(
                    quiz?.subject
                  )} px-4 py-2 rounded-full font-semibold text-white shadow-lg`}
                >
                  <Sparkles className='mr-2 w-4 h-4' />
                  {quiz?.subject}
                </div>
                <div className='flex items-center bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 border border-blue-200/50 rounded-full'>
                  <Clock className='mr-2 w-4 h-4 text-blue-500' />
                  <span className='font-medium text-blue-700'>
                    {quiz?.duration}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className='mb-6 font-bold text-gray-900 text-3xl md:text-4xl leading-tight'>
                {quiz?.title}
              </h1>

              {/* Quiz Details Grid */}
              <div className='gap-4 grid grid-cols-1 md:grid-cols-2 mb-8'>
                <div className='flex items-center bg-gradient-to-r from-pink-50 to-purple-50 p-4 border border-pink-200/50 rounded-xl'>
                  <Target className='mr-3 w-5 h-5 text-pink-500' />
                  <div>
                    <p className='text-gray-600 text-sm'>Topic</p>
                    <p className='font-semibold text-gray-900'>{quiz?.topic}</p>
                  </div>
                </div>
                <div className='flex items-center bg-gradient-to-r from-purple-50 to-blue-50 p-4 border border-purple-200/50 rounded-xl'>
                  <ListTodo className='mr-3 w-5 h-5 text-purple-500' />
                  <div>
                    <p className='text-gray-600 text-sm'>Questions</p>
                    <p className='font-semibold text-gray-900'>
                      {quiz?.questions.length} Questions
                    </p>
                  </div>
                </div>
              </div>

              {/* XP Reward */}
              <div className='bg-gradient-to-r from-amber-50 to-yellow-50 mb-8 p-6 border border-amber-200/50 rounded-xl'>
                <div className='flex items-center'>
                  <div className='bg-gradient-to-r from-amber-100 to-yellow-100 mr-4 p-3 rounded-xl'>
                    <Award className='w-6 h-6 text-amber-600' />
                  </div>
                  <div>
                    <p className='font-medium text-amber-600 text-sm'>Reward</p>
                    <p className='font-bold text-amber-800 text-lg'>
                      Earn {quiz?.xpReward} XP upon completion
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-4'>
                <Link
                  href={`/quiz-session/${quiz?.code}`}
                  className='group inline-flex relative flex-1 justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-8 py-4 rounded-xl overflow-hidden font-bold text-white hover:scale-105 transition-all duration-300 transform'
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                  <Zap className='mr-2 w-5 h-5' />
                  Take Quiz
                  <ChevronRight className='ml-2 w-4 h-4 transition-transform group-hover:translate-x-1' />
                </Link>
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/quiz-session/${quiz?.code}`;
                    if (navigator.share) {
                      navigator.share({
                        title: quiz?.title,
                        text: `Try this quiz: ${quiz?.title}`,
                        url: shareUrl,
                      });
                    } else {
                      navigator.clipboard.writeText(shareUrl);
                      setCopiedCode(`share-${quiz?.code}`);
                      setTimeout(() => setCopiedCode(""), 2000);
                    }
                  }}
                  className='group inline-flex relative justify-center items-center bg-white/80 hover:bg-white hover:shadow-lg backdrop-blur-sm px-6 py-4 border border-pink-200 hover:border-pink-300 rounded-xl overflow-hidden font-semibold text-pink-600 transition-all duration-300'
                  title='Share quiz'
                >
                  {copiedCode === `share-${quiz?.code}` ? (
                    <span className='font-semibold text-green-500'>
                      Copied!
                    </span>
                  ) : (
                    <>
                      <Share2 className='mr-2 w-4 h-4' />
                      Share
                    </>
                  )}
                </button>
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

            {/* Quiz Code */}
            <div className='group relative'>
              <div className='absolute -inset-1 bg-gradient-to-r from-purple-300 to-pink-300 opacity-0 group-hover:opacity-20 rounded-2xl transition duration-300 blur'></div>
              <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-purple-100/50 rounded-2xl'>
                <div className='flex justify-between items-center mb-3'>
                  <div className='flex items-center'>
                    <Hash className='mr-2 w-5 h-5 text-purple-500' />
                    <span className='font-medium text-gray-600'>
                      Quiz Code:
                    </span>
                  </div>
                </div>
                <div className='bg-gradient-to-r from-purple-50 to-pink-50 p-4 border border-purple-200/50 rounded-xl'>
                  <span className='font-mono font-bold text-purple-700 text-lg tracking-wider'>
                    {quiz?.code}
                  </span>
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
      </div>
    </div>
  );
}
