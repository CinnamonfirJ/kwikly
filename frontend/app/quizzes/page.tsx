"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Brain,
  Clock,
  Award,
  ChevronRight,
  Share2,
  Copy,
  User,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Mock current user - in a real app, this would come from your auth system
const currentUser = {
  id: "user123",
  name: "Sarah Johnson",
  email: "sarah@example.com",
  profilePicture: "/images/placeholder.png?height=100&width=100",
};

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  rank: string;
  level: number;
  xp: number;
  // quizResults: any[]; // Replace with a proper type if needed
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

export default function QuizzesPage() {
  // const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");

  const [searchTerm, setSearchTerm] = useState(codeParam || "");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [copiedCode, setCopiedCode] = useState("");

  const { data: quizData } = useQuery({
    queryKey: ["quiz"],
    queryFn: async () => {
      const res = await fetch("/api/quiz");
      const data = await res.json();
      console.log(data.quizzes);
      return data.quizzes;
    },
  });

  useEffect(() => {
    if (quizData) {
      setQuizzes(quizData);
    }
  }, [quizData]);

  // Filter quizzes based on search term and selected subject
  useEffect(() => {
    if (!quizData) return;

    // Only show public quizzes or quizzes created by the current user
    let filtered = quizData.filter(
      (quiz: Quiz) => quiz.isPublic || quiz.createdBy._id === currentUser.id
    );

    if (searchTerm) {
      // Check if the search term matches a quiz code exactly
      const quizByCode = filtered.find(
        (quiz: Quiz) => quiz.code.toLowerCase() === searchTerm.toLowerCase()
      );

      if (quizByCode) {
        filtered = [quizByCode];
      } else {
        // Otherwise filter by title, subject, or topic
        filtered = filtered.filter(
          (quiz: Quiz) =>
            quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }

    if (selectedSubject) {
      filtered = filtered.filter(
        (quiz: Quiz) => quiz.subject === selectedSubject
      );
    }

    setQuizzes(filtered);
  }, [searchTerm, selectedSubject, quizData]);

  // Get unique subjects for filter dropdown
  const subjects: string[] = quizData
    ? [
        ...new Set(
          (quizData as { subject: string }[]).map((quiz) => quiz.subject)
        ),
      ]
    : [];

  // Copy quiz code to clipboard
  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  return (
    <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
      <div className='flex md:flex-row flex-col justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='mb-2 font-bold text-3xl'>Browse Quizzes</h1>
          <p className='text-gray-500'>
            Find quizzes by searching or enter a quiz code to join a specific
            quiz.
          </p>
        </div>
        <Link
          href='/my-quizzes'
          className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 mt-4 md:mt-0 px-4 py-2 rounded-full font-medium text-white transition-colors'
        >
          My Quizzes
        </Link>
      </div>

      <div className='flex md:flex-row flex-col gap-4 mb-8'>
        <div className='relative flex-1'>
          <div className='left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none'>
            <Search className='w-5 h-5 text-gray-400' />
          </div>
          <input
            type='text'
            className='py-2 pr-4 pl-10 border border-pink-100 focus:border-pink-500 rounded-full focus:outline-none focus:ring-pink-500 w-full'
            placeholder='Search by title, creator, or enter quiz code...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className='relative w-full md:w-64'>
          <div className='left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none'>
            <Filter className='w-5 h-5 text-gray-400' />
          </div>
          <select
            className='py-2 pr-4 pl-10 border border-pink-100 focus:border-pink-500 rounded-full focus:outline-none focus:ring-pink-500 w-full appearance-none'
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value=''>All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className='bg-pink-50 py-12 rounded-xl text-center'>
          <div className='inline-flex justify-center items-center bg-pink-100 mb-4 rounded-full w-12 h-12'>
            <Search className='w-6 h-6 text-pink-500' />
          </div>
          <h3 className='mb-2 font-semibold text-xl'>No quizzes found</h3>
          <p className='mb-4 text-gray-500'>
            Try searching with a different term or browse all quizzes.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedSubject("");
            }}
            className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
          >
            View All Quizzes
          </button>
        </div>
      ) : (
        <div className='gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {quizzes.map((quiz) => (
            <div
              key={quiz?._id}
              className='bg-white shadow-sm hover:shadow-md border border-pink-100 rounded-xl overflow-hidden transition-all'
            >
              <div className='p-6'>
                <div className='flex justify-between items-center mb-3'>
                  <span className='inline-block bg-pink-100 px-3 py-1 rounded-full font-medium text-pink-600 text-xs'>
                    {quiz?.subject}
                  </span>
                  <div className='flex items-center text-gray-500 text-sm'>
                    <Clock className='mr-1 w-3 h-3' />
                    {quiz.duration}
                  </div>
                </div>
                <h3 className='mb-2 font-semibold text-lg line-clamp-1'>
                  {quiz.title}
                </h3>
                <div className='flex items-center mb-2 text-gray-500 text-sm'>
                  <Brain className='mr-1 w-3 h-3' /> {quiz.topic} •{" "}
                  {quiz?.questions.length} questions
                </div>
                <div className='flex items-center mb-2 text-gray-500 text-sm'>
                  <User className='mr-1 w-3 h-3' /> Created by{" "}
                  {quiz.createdBy?.name}
                </div>
                <div className='flex items-center mb-4 text-gray-500 text-sm'>
                  <Award className='mr-1 w-4 h-4 text-pink-500' />
                  <span>Earn {quiz.xpReward} XP upon completion</span>
                </div>

                <div className='flex justify-between items-center mb-4'>
                  <div className='flex items-center'>
                    <span className='mr-2 text-gray-500 text-xs'>
                      Quiz Code:
                    </span>
                    <span className='bg-pink-50 px-2 py-1 rounded-md font-medium text-pink-600 text-xs'>
                      {quiz.code}
                    </span>
                  </div>
                  <button
                    onClick={() => copyCodeToClipboard(quiz.code)}
                    className='p-1 text-gray-400 hover:text-pink-500 transition-colors'
                    title='Copy quiz code'
                  >
                    {copiedCode === quiz.code ? (
                      <span className='text-green-500 text-xs'>Copied!</span>
                    ) : (
                      <Copy className='w-4 h-4' />
                    )}
                  </button>
                </div>

                <div className='flex gap-2'>
                  <Link
                    href={`/quiz-details/${quiz.code}`}
                    className='inline-flex flex-1 justify-center items-center bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
                  >
                    See Quiz <ChevronRight className='ml-1 w-4 h-4' />
                  </Link>
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/quiz-session/${quiz.code}`;
                      if (navigator.share) {
                        navigator.share({
                          title: quiz.title,
                          text: `Try this quiz: ${quiz.title}`,
                          url: shareUrl,
                        });
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        setCopiedCode(`share-${quiz.code}`);
                        setTimeout(() => setCopiedCode(""), 2000);
                      }
                    }}
                    className='inline-flex justify-center items-center bg-white hover:bg-pink-50 px-3 py-2 border border-pink-200 rounded-full font-medium text-pink-500 transition-colors'
                    title='Share quiz'
                  >
                    {copiedCode === `share-${quiz.code}` ? (
                      <span className='text-green-500 text-xs'>Copied!</span>
                    ) : (
                      <Share2 className='w-4 h-4' />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
