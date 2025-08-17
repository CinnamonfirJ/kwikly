"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Share2,
  Copy,
  Clock,
  Brain,
  Award,
  Lock,
  Globe,
  Calendar,
  Hash,
  Sparkles,
  // Zap,
  Star,
  BarChart3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ConfirmationModal from "../components/confirmation-modal";

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

export default function MyQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [copiedCode, setCopiedCode] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: quizData } = useQuery({
    queryKey: ["quiz"],
    queryFn: async () => {
      const res = await fetch("/api/quiz/user/me");
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

  // Copy quiz code to clipboard
  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const toggleQuizVisibility = async (id: string) => {
    const quizToToggle = quizzes.find((quiz) => quiz._id === id);
    if (!quizToToggle) return;

    const newVisibility = !quizToToggle.isPublic;

    setQuizzes(
      quizzes.map((quiz) =>
        quiz._id === id ? { ...quiz, isPublic: newVisibility } : quiz
      )
    );

    try {
      const response = await fetch(`/api/quiz/${id}/isPublic`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: newVisibility }),
      });

      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }
    } catch (error) {
      setQuizzes(
        quizzes.map((quiz) =>
          quiz._id === id ? { ...quiz, isPublic: !newVisibility } : quiz
        )
      );
      console.error("Error updating quiz visibility:", error);
    }
  };

  const openDeleteModal = (id: string) => {
    setQuizToDelete(id);
    setDeleteModalOpen(true);
  };

  const deleteQuiz = async () => {
    if (!quizToDelete) return;

    const originalQuizzes = [...quizzes];
    setIsDeleting(true);

    setQuizzes(quizzes.filter((quiz) => quiz._id !== quizToDelete));

    try {
      const response = await fetch(`/api/quiz/${quizToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete quiz");
      }
    } catch (error) {
      setQuizzes(originalQuizzes);
      console.error("Error deleting quiz:", error);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setQuizToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
    };
    return (
      colors[subject as keyof typeof colors] || "from-pink-500 to-pink-600"
    );
  };

  // Calculate stats
  const totalQuizzes = quizzes.length;
  const publicQuizzes = quizzes.filter((quiz) => quiz.isPublic).length;
  const totalQuestions = quizzes.reduce(
    (sum, quiz) => sum + quiz.questions.length,
    0
  );

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
              <Star className='mr-2 w-4 h-4' />
              Creator Dashboard
            </div>
            <h1 className='bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 font-bold text-transparent text-4xl md:text-5xl tracking-tight'>
              My Quizzes
            </h1>
            <p className='max-w-2xl text-gray-600 text-lg leading-relaxed'>
              Manage your quiz creations, track engagement, and share your
              knowledge with the world.
            </p>
          </div>
          <Link
            href='/create-quiz'
            className='group inline-flex relative justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl mt-6 md:mt-0 px-6 py-3 rounded-full overflow-hidden font-semibold text-white hover:scale-105 transition-all duration-300 transform'
          >
            <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
            <Plus className='mr-2 w-4 h-4' />
            Create New Quiz
          </Link>
        </div>

        {/* Stats Cards */}
        {quizzes.length > 0 && (
          <div className='gap-6 grid grid-cols-1 md:grid-cols-3 mb-12'>
            <div className='group relative'>
              <div className='absolute -inset-1 bg-gradient-to-r from-blue-300 to-blue-400 opacity-20 group-hover:opacity-30 rounded-2xl transition duration-300 blur'></div>
              <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-blue-200/50 rounded-2xl'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='mb-1 font-medium text-blue-600 text-sm'>
                      Total Quizzes
                    </p>
                    <p className='font-bold text-gray-900 text-2xl'>
                      {totalQuizzes}
                    </p>
                  </div>
                  <div className='bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-xl'>
                    <BarChart3 className='w-6 h-6 text-blue-600' />
                  </div>
                </div>
              </div>
            </div>

            <div className='group relative'>
              <div className='absolute -inset-1 bg-gradient-to-r from-green-300 to-green-400 opacity-20 group-hover:opacity-30 rounded-2xl transition duration-300 blur'></div>
              <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-green-200/50 rounded-2xl'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='mb-1 font-medium text-green-600 text-sm'>
                      Public Quizzes
                    </p>
                    <p className='font-bold text-gray-900 text-2xl'>
                      {publicQuizzes}
                    </p>
                  </div>
                  <div className='bg-gradient-to-r from-green-100 to-green-200 p-3 rounded-xl'>
                    <Globe className='w-6 h-6 text-green-600' />
                  </div>
                </div>
              </div>
            </div>

            <div className='group relative'>
              <div className='absolute -inset-1 bg-gradient-to-r from-purple-300 to-purple-400 opacity-20 group-hover:opacity-30 rounded-2xl transition duration-300 blur'></div>
              <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-purple-200/50 rounded-2xl'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='mb-1 font-medium text-purple-600 text-sm'>
                      Total Questions
                    </p>
                    <p className='font-bold text-gray-900 text-2xl'>
                      {totalQuestions}
                    </p>
                  </div>
                  <div className='bg-gradient-to-r from-purple-100 to-purple-200 p-3 rounded-xl'>
                    <Brain className='w-6 h-6 text-purple-600' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <div className='group relative'>
            <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-20 rounded-3xl blur'></div>
            <div className='relative bg-white/70 shadow-xl backdrop-blur-sm py-16 border border-pink-200/50 rounded-3xl text-center'>
              <div className='inline-flex justify-center items-center bg-gradient-to-r from-pink-100 to-purple-100 mb-6 rounded-2xl w-16 h-16'>
                <Plus className='w-8 h-8 text-pink-500' />
              </div>
              <h3 className='mb-3 font-bold text-gray-900 text-2xl'>
                No quizzes yet
              </h3>
              <p className='mx-auto mb-6 max-w-md text-gray-600 text-lg'>
                You haven&apos;t created any quizzes yet. Start building your
                first quiz to share your knowledge with others!
              </p>
              <Link
                href='/create-quiz'
                className='group inline-flex justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-full font-semibold text-white hover:scale-105 transition-all duration-300 transform'
              >
                <Sparkles className='mr-2 w-4 h-4 group-hover:rotate-12 transition-transform' />
                Create Your First Quiz
              </Link>
            </div>
          </div>
        ) : (
          <div className='space-y-8'>
            {quizzes.map((quiz, index) => (
              <div
                key={quiz._id}
                className='group relative animate-in duration-500 fade-in-0'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-500 blur'></div>
                <div className='relative bg-white/80 shadow-lg hover:shadow-2xl backdrop-blur-sm border border-pink-100/50 rounded-2xl overflow-hidden transition-all duration-500'>
                  <div className='p-8'>
                    {/* Header Section */}
                    <div className='flex md:flex-row flex-col justify-between md:items-start mb-6'>
                      <div className='flex-1 space-y-4'>
                        {/* Badges Row */}
                        <div className='flex flex-wrap items-center gap-3'>
                          <div
                            className={`inline-flex items-center bg-gradient-to-r ${getSubjectColor(
                              quiz.subject
                            )} px-3 py-1 rounded-full font-medium text-white text-sm shadow-lg`}
                          >
                            <Sparkles className='mr-1 w-3 h-3' />
                            {quiz.subject}
                          </div>
                          <div className='flex items-center bg-gray-100/80 px-3 py-1 rounded-full text-gray-600 text-sm'>
                            <Calendar className='mr-1 w-3 h-3' />
                            {formatDate(quiz.createdAt)}
                          </div>
                          {quiz.isPublic ? (
                            <div className='inline-flex items-center bg-gradient-to-r from-green-100 to-green-200 px-3 py-1 border border-green-300/50 rounded-full font-medium text-green-700 text-sm'>
                              <Globe className='mr-1 w-3 h-3' />
                              Public
                            </div>
                          ) : (
                            <div className='inline-flex items-center bg-gradient-to-r from-orange-100 to-orange-200 px-3 py-1 border border-orange-300/50 rounded-full font-medium text-orange-700 text-sm'>
                              <Lock className='mr-1 w-3 h-3' />
                              Private
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className='font-bold text-gray-900 group-hover:text-pink-600 text-2xl transition-colors'>
                          {quiz.title}
                        </h3>

                        {/* Meta Information */}
                        <div className='gap-4 grid grid-cols-2 md:grid-cols-4'>
                          <div className='flex items-center text-gray-600'>
                            <Brain className='mr-2 w-4 h-4 text-pink-500' />
                            <span className='text-sm'>{quiz.topic}</span>
                          </div>
                          <div className='flex items-center text-gray-600'>
                            <Clock className='mr-2 w-4 h-4 text-blue-500' />
                            <span className='text-sm'>{quiz.duration}</span>
                          </div>
                          <div className='flex items-center text-gray-600'>
                            <Award className='mr-2 w-4 h-4 text-amber-500' />
                            <span className='text-sm'>{quiz.xpReward} XP</span>
                          </div>
                          <div className='flex items-center text-gray-600'>
                            <BarChart3 className='mr-2 w-4 h-4 text-purple-500' />
                            <span className='text-sm'>
                              {quiz.questions.length} questions
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quiz Code Section */}
                    <div className='flex justify-between items-center bg-gradient-to-r from-pink-50 to-purple-50 mb-6 p-4 border border-pink-200/50 rounded-xl'>
                      <div className='flex items-center'>
                        <Hash className='mr-2 w-5 h-5 text-pink-500' />
                        <span className='mr-3 text-gray-600 text-sm'>
                          Quiz Code:
                        </span>
                        <span className='bg-white/80 shadow-sm px-4 py-2 border border-pink-200 rounded-lg font-mono font-bold text-pink-600'>
                          {quiz.code}
                        </span>
                      </div>
                      <button
                        onClick={() => copyCodeToClipboard(quiz.code)}
                        className='hover:bg-pink-100 p-2 rounded-lg text-pink-400 hover:text-pink-600 transition-all duration-200'
                        title='Copy quiz code'
                      >
                        {copiedCode === quiz.code ? (
                          <span className='font-semibold text-green-500 text-sm'>
                            Copied!
                          </span>
                        ) : (
                          <Copy className='w-4 h-4' />
                        )}
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-wrap gap-3'>
                      <Link
                        href={`/quiz-details/${quiz.code}`}
                        className='group inline-flex relative justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl overflow-hidden font-semibold text-white transition-all duration-300'
                      >
                        <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                        <Eye className='mr-2 w-4 h-4' />
                        View Quiz
                      </Link>

                      <Link
                        href={`/edit-quiz/${quiz._id}`}
                        className='inline-flex justify-center items-center bg-white/80 hover:bg-white hover:shadow-lg backdrop-blur-sm px-6 py-3 border border-gray-300 hover:border-gray-400 rounded-xl font-semibold text-gray-700 transition-all duration-300'
                      >
                        <Edit className='mr-2 w-4 h-4' />
                        Edit
                      </Link>

                      <button
                        onClick={() => toggleQuizVisibility(quiz._id)}
                        className='inline-flex justify-center items-center bg-white/80 hover:bg-white hover:shadow-lg backdrop-blur-sm px-6 py-3 border border-blue-300 hover:border-blue-400 rounded-xl font-semibold text-blue-600 transition-all duration-300'
                      >
                        {quiz.isPublic ? (
                          <>
                            <Lock className='mr-2 w-4 h-4' />
                            Make Private
                          </>
                        ) : (
                          <>
                            <Globe className='mr-2 w-4 h-4' />
                            Make Public
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/quiz-details/${quiz.code}`;
                          if (navigator.share) {
                            navigator.share({
                              title: quiz.title,
                              text: `Try my quiz: ${quiz.title}`,
                              url: shareUrl,
                            });
                          } else {
                            navigator.clipboard.writeText(shareUrl);
                            setCopiedCode(`share-${quiz.code}`);
                            setTimeout(() => setCopiedCode(""), 2000);
                          }
                        }}
                        className='inline-flex justify-center items-center bg-white/80 hover:bg-white hover:shadow-lg backdrop-blur-sm px-6 py-3 border border-green-300 hover:border-green-400 rounded-xl font-semibold text-green-600 transition-all duration-300'
                      >
                        {copiedCode === `share-${quiz.code}` ? (
                          <span className='font-semibold text-green-500 text-sm'>
                            Link Copied!
                          </span>
                        ) : (
                          <>
                            <Share2 className='mr-2 w-4 h-4' />
                            Share
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => openDeleteModal(quiz._id)}
                        className='inline-flex justify-center items-center bg-white/80 hover:bg-red-50 hover:shadow-lg backdrop-blur-sm px-6 py-3 border border-red-300 hover:border-red-400 rounded-xl font-semibold text-red-600 transition-all duration-300'
                      >
                        <Trash2 className='mr-2 w-4 h-4' />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={deleteQuiz}
          title='Delete Quiz'
          description='Are you sure you want to delete this quiz? This action cannot be undone and all quiz data will be permanently lost.'
          confirmText='Delete Quiz'
          cancelText='Cancel'
          type='delete'
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
