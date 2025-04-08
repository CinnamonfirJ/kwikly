"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Brain,
  User,
  Award,
  ChevronLeft,
  ListTodo,
  ChevronRight,
  Share2,
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
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  return (
    <div className='mx-auto px-4 md:px-6 py-10 container'>
      <Link
        href='/quizzes'
        className='inline-flex items-center mb-6 text-pink-500 hover:underline'
      >
        <ChevronLeft className='mr-1 w-4 h-4' /> Back to quizzes
      </Link>

      <div className='gap-8 grid md:grid-cols-3'>
        <div className='md:col-span-2 bg-white shadow-sm p-6 border border-pink-100 rounded-xl'>
          <div className='flex flex-wrap justify-between items-center gap-2 mb-4'>
            <span className='inline-block bg-pink-100 px-3 py-1 rounded-full font-medium text-pink-600 text-xs'>
              {quiz?.subject}
            </span>
            <div className='flex items-center text-gray-500 text-sm'>
              <Clock className='mr-1 w-4 h-4' />
              {quiz?.duration}
            </div>
          </div>

          <h1 className='mb-2 font-bold text-2xl'>{quiz?.title}</h1>

          <div className='flex items-center mb-2 text-gray-600 text-sm'>
            <Brain className='mr-1 w-4 h-4' /> {quiz?.topic}
          </div>
          <div className='flex items-center mb-2 text-gray-600 text-sm'>
            <ListTodo className='mr-1 w-4 h-4' /> {quiz?.questions.length}{" "}
            Questions
          </div>

          <div className='flex items-center mb-4 text-gray-600 text-sm'>
            <Award className='mr-1 w-4 h-4 text-pink-500' /> Earn{" "}
            {quiz?.xpReward} XP upon completion
          </div>

          <div className='flex gap-2'>
            <Link
              href={`/quiz-session/${quiz?.code}`}
              className='inline-flex flex-1 justify-center items-center bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
            >
              Take Quiz <ChevronRight className='ml-1 w-4 h-4' />
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
              className='inline-flex justify-center items-center bg-white hover:bg-pink-50 px-3 py-2 border border-pink-200 rounded-full font-medium text-pink-500 transition-colors'
              title='Share quiz'
            >
              {copiedCode === `share-${quiz?.code}` ? (
                <span className='text-green-500 text-xs'>Copied!</span>
              ) : (
                <Share2 className='w-4 h-4' />
              )}
            </button>
          </div>
        </div>

        {/* Student info and quiz creator info */}
        <div className='md:col-span-1'>
          <div className='bg-white shadow-sm p-6 border border-pink-100 rounded-xl'>
            {/* Instructions */}
            {quiz?.instruction && (
              <div className='bg-pink-50 mb-6 p-4 border border-pink-100 rounded-lg text-pink-800 text-sm'>
                <h2 className='mb-2 font-semibold text-xl'>Instructions</h2>
                <p>{quiz?.instruction}</p>
              </div>
            )}

            {/* Quiz creator info */}
            <div className='mb-6 p-4 border border-pink-100 rounded-lg'>
              {/* User info */}

              <h3 className='mb-2 font-bold text-lg'>Quiz Creator</h3>
              <div className='flex items-center gap-3'>
                <div className='relative border-4 border-pink-100 rounded-full w-16 h-16 overflow-hidden'>
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
                    <div className='flex justify-center items-center bg-pink-50 w-full h-full font-medium text-pink-500 text-xl'>
                      {getInitials(quiz?.createdBy?.name || "")}
                    </div>
                  )}
                </div>
                <div>
                  <p className='font-medium text-xl'>{quiz?.createdBy.name}</p>
                  <p className='text-gray-500 text-sm'>
                    {quiz?.createdBy.favouriteTopic} • {quiz?.createdBy.rank}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
