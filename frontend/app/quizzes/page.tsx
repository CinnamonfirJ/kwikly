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
  Sparkles,
  TrendingUp,
  Star,
  Hash,
  Zap,
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

  // Get subject color based on subject name
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
      "Network Technology III": "from-slate-500 to-slate-600",
      "Network Technology I & II": "from-lime-500 to-lime-600",
      "COEN 348": "from-fuchsia-500 to-fuchsia-600",
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

      <div className='relative mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
        {/* Enhanced Header */}
        <div className='flex md:flex-row flex-col justify-between items-start md:items-center mb-12'>
          <div className='space-y-4'>
            <div className='inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 border border-pink-200/50 rounded-full font-medium text-pink-600 text-sm'>
              <TrendingUp className='mr-2 w-4 h-4' />
              Discover & Learn
            </div>
            <h1 className='bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 font-bold text-transparent text-4xl md:text-5xl tracking-tight'>
              Browse Quizzes
            </h1>
            <p className='max-w-2xl text-gray-600 text-lg leading-relaxed'>
              Discover engaging quizzes across various subjects or enter a quiz
              code to join a specific challenge.
            </p>
          </div>
          <Link
            href='/my-quizzes'
            className='group inline-flex relative justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl mt-6 md:mt-0 px-6 py-3 rounded-full overflow-hidden font-semibold text-white hover:scale-105 transition-all duration-300 transform'
          >
            <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
            <Star className='mr-2 w-4 h-4' />
            My Quizzes
          </Link>
        </div>

        {/* Enhanced Search & Filter */}
        <div className='flex md:flex-row flex-col gap-4 mb-12'>
          <div className='group relative flex-1'>
            <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-300 blur'></div>
            <div className='relative bg-white/80 shadow-lg backdrop-blur-sm border border-pink-200/50 rounded-2xl overflow-hidden'>
              <div className='left-0 absolute inset-y-0 flex items-center pl-4 pointer-events-none'>
                <Search className='w-5 h-5 text-pink-400' />
              </div>
              <input
                type='text'
                className='bg-transparent py-4 pr-4 pl-12 focus:outline-none w-full text-gray-900 placeholder-gray-500'
                placeholder='Search by title, creator, or enter quiz code...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className='group relative w-full md:w-64'>
            <div className='absolute -inset-1 bg-gradient-to-r from-purple-300 to-blue-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-300 blur'></div>
            <div className='relative bg-white/80 shadow-lg backdrop-blur-sm border border-purple-200/50 rounded-2xl overflow-hidden'>
              <div className='left-0 absolute inset-y-0 flex items-center pl-4 pointer-events-none'>
                <Filter className='w-5 h-5 text-purple-400' />
              </div>
              <select
                className='bg-transparent py-4 pr-4 pl-12 focus:outline-none w-full text-gray-900 appearance-none'
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
        </div>

        {/* Results */}
        {quizzes.length === 0 ? (
          <div className='group relative'>
            <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-20 rounded-3xl blur'></div>
            <div className='relative bg-white/70 shadow-xl backdrop-blur-sm py-16 border border-pink-200/50 rounded-3xl text-center'>
              <div className='inline-flex justify-center items-center bg-gradient-to-r from-pink-100 to-purple-100 mb-6 rounded-2xl w-16 h-16'>
                <Search className='w-8 h-8 text-pink-500' />
              </div>
              <h3 className='mb-3 font-bold text-gray-900 text-2xl'>
                No quizzes found
              </h3>
              <p className='mx-auto mb-6 max-w-md text-gray-600 text-lg'>
                Try searching with a different term or browse all available
                quizzes.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubject("");
                }}
                className='group inline-flex justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-full font-semibold text-white hover:scale-105 transition-all duration-300 transform'
              >
                <Sparkles className='mr-2 w-4 h-4 group-hover:rotate-12 transition-transform' />
                View All Quizzes
              </button>
            </div>
          </div>
        ) : (
          <div className='gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
            {quizzes.map((quiz, index) => (
              <div
                key={quiz?._id}
                className='group relative h-full animate-in duration-500 fade-in-0'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-500 blur'></div>
                <div className='relative flex flex-col bg-white/80 shadow-lg hover:shadow-2xl backdrop-blur-sm border border-pink-100/50 rounded-2xl h-full overflow-hidden transition-all hover:-translate-y-2 duration-500'>
                  <div className='flex flex-col p-6 h-full'>
                    {/* Header */}
                    <div className='flex justify-between items-start mb-4'>
                      <div
                        className={`inline-flex items-center bg-gradient-to-r ${getSubjectColor(
                          quiz?.subject
                        )} px-3 py-1 rounded-full font-medium text-white text-xs shadow-lg`}
                      >
                        <Sparkles className='mr-1 w-3 h-3' />
                        {quiz?.subject}
                      </div>
                      <div className='flex items-center bg-gray-100/80 px-2 py-1 rounded-lg text-gray-500 text-sm'>
                        <Clock className='mr-1 w-3 h-3' />
                        {quiz.duration}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className='mb-4 min-h-[3.5rem] font-bold text-gray-900 group-hover:text-pink-600 text-xl line-clamp-2 transition-colors'>
                      {quiz.title}
                    </h3>

                    {/* Meta Info */}
                    <div className='flex-grow space-y-2 mb-4'>
                      <div className='flex items-center text-gray-600 text-sm'>
                        <Brain className='mr-2 w-4 h-4 text-pink-500' />
                        <span className='font-medium'>{quiz.topic}</span>
                        <span className='mx-2'>•</span>
                        <span>{quiz?.questions.length} questions</span>
                      </div>
                      <div className='flex items-center text-gray-600 text-sm'>
                        <User className='mr-2 w-4 h-4 text-purple-500' />
                        Created by{" "}
                        <span className='ml-1 font-medium'>
                          {quiz.createdBy?.name}
                        </span>
                      </div>
                    </div>

                    {/* XP Reward */}
                    <div className='flex items-center bg-gradient-to-r from-amber-50 to-yellow-50 mb-4 p-3 border border-amber-200/50 rounded-xl'>
                      <Award className='mr-2 w-5 h-5 text-amber-500' />
                      <span className='font-semibold text-amber-700 text-sm'>
                        Earn {quiz.xpReward} XP upon completion
                      </span>
                    </div>

                    {/* Quiz Code */}
                    <div className='flex justify-between items-center bg-pink-50/80 mb-4 p-3 border border-pink-200/50 rounded-xl'>
                      <div className='flex items-center'>
                        <Hash className='mr-2 w-4 h-4 text-pink-500' />
                        <span className='mr-2 text-gray-600 text-sm'>
                          Code:
                        </span>
                        <span className='bg-white/80 px-3 py-1 border border-pink-200 rounded-lg font-mono font-bold text-pink-600 text-sm'>
                          {quiz.code}
                        </span>
                      </div>
                      <button
                        onClick={() => copyCodeToClipboard(quiz.code)}
                        className='hover:bg-pink-100 p-2 rounded-lg text-pink-400 hover:text-pink-600 transition-all duration-200'
                        title='Copy quiz code'
                      >
                        {copiedCode === quiz.code ? (
                          <span className='font-semibold text-green-500 text-xs'>
                            Copied!
                          </span>
                        ) : (
                          <Copy className='w-4 h-4' />
                        )}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-3 mt-auto'>
                      <Link
                        href={`/quiz-details/${quiz.code}`}
                        className='group inline-flex relative flex-1 justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-4 py-3 rounded-xl overflow-hidden font-semibold text-white transition-all duration-300'
                      >
                        <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                        <Zap className='mr-2 w-4 h-4' />
                        Take Quiz
                        <ChevronRight className='ml-1 w-4 h-4 transition-transform group-hover:translate-x-1' />
                      </Link>
                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/quiz-details/${quiz.code}`;
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
                        className='inline-flex justify-center items-center bg-white/80 hover:bg-white hover:shadow-lg backdrop-blur-sm px-3 py-3 border border-pink-200 hover:border-pink-300 rounded-xl font-medium text-pink-600 transition-all duration-300'
                        title='Share quiz'
                      >
                        {copiedCode === `share-${quiz.code}` ? (
                          <span className='font-semibold text-green-500 text-xs'>
                            Copied!
                          </span>
                        ) : (
                          <Share2 className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
