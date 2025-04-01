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
    // Find the quiz to update
    const quizToToggle = quizzes.find((quiz) => quiz._id === id);
    if (!quizToToggle) return;

    // Determine the new visibility
    const newVisibility = !quizToToggle.isPublic;

    // Optimistically update the UI
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
      // Revert the UI update if the API call fails
      setQuizzes(
        quizzes.map((quiz) =>
          quiz._id === id ? { ...quiz, isPublic: !newVisibility } : quiz
        )
      );
      console.error("Error updating quiz visibility:", error);
    }
  };

  // Function to open the delete confirmation modal
  const openDeleteModal = (id: string) => {
    setQuizToDelete(id);
    setDeleteModalOpen(true);
  };

  // Delete quiz function (called when user confirms in the modal)
  const deleteQuiz = async () => {
    if (!quizToDelete) return;

    // Save the current state to revert in case of an error
    const originalQuizzes = [...quizzes];
    setIsDeleting(true);

    // Optimistically update the UI
    setQuizzes(quizzes.filter((quiz) => quiz._id !== quizToDelete));

    try {
      const response = await fetch(`/api/quiz/${quizToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete quiz");
      }
    } catch (error) {
      // If deletion fails, revert the UI update
      setQuizzes(originalQuizzes);
      console.error("Error deleting quiz:", error);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setQuizToDelete(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
      <div className='flex md:flex-row flex-col justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='mb-2 font-bold text-3xl'>My Quizzes</h1>
          <p className='text-gray-500'>
            Manage the quizzes you&apos;ve created and share them with others.
          </p>
        </div>
        <Link
          href='/create-quiz'
          className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 mt-4 md:mt-0 px-4 py-2 rounded-full font-medium text-white transition-colors'
        >
          <Plus className='mr-1 w-4 h-4' /> Create New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className='bg-pink-50 py-12 rounded-xl text-center'>
          <div className='inline-flex justify-center items-center bg-pink-100 mb-4 rounded-full w-12 h-12'>
            <Plus className='w-6 h-6 text-pink-500' />
          </div>
          <h3 className='mb-2 font-semibold text-xl'>No quizzes yet</h3>
          <p className='mb-4 text-gray-500'>
            You haven&#39;t created any quizzes yet. Create your first quiz to
            get started!
          </p>
          <Link
            href='/create-quiz'
            className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
          >
            <Plus className='mr-1 w-4 h-4' /> Create Quiz
          </Link>
        </div>
      ) : (
        <div className='space-y-6'>
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className='bg-white shadow-sm hover:shadow-md border border-pink-100 rounded-xl overflow-hidden transition-all'
            >
              <div className='p-6'>
                <div className='flex md:flex-row flex-col justify-between md:items-center mb-4'>
                  <div>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='inline-block bg-pink-100 px-3 py-1 rounded-full font-medium text-pink-600 text-xs'>
                        {quiz.subject}
                      </span>
                      <span className='text-gray-500 text-xs'>
                        Created on {formatDate(quiz.createdAt)}
                      </span>
                      {quiz.isPublic ? (
                        <span className='inline-flex items-center font-medium text-green-600 text-xs'>
                          <Globe className='mr-1 w-3 h-3' /> Public
                        </span>
                      ) : (
                        <span className='inline-flex items-center font-medium text-orange-600 text-xs'>
                          <Lock className='mr-1 w-3 h-3' /> Private
                        </span>
                      )}
                    </div>
                    <h3 className='mb-2 font-semibold text-xl'>{quiz.title}</h3>
                    <div className='flex flex-wrap gap-4 text-gray-500 text-sm'>
                      <div className='flex items-center'>
                        <Brain className='mr-1 w-4 h-4' /> {quiz.topic}
                      </div>
                      <div className='flex items-center'>
                        <Clock className='mr-1 w-4 h-4' /> {quiz.duration}{" "}
                        minutes
                      </div>
                      <div className='flex items-center'>
                        <Award className='mr-1 w-4 h-4 text-pink-500' />{" "}
                        {quiz.xpReward} XP
                      </div>
                      <div>{quiz.questions.length} questions</div>
                    </div>
                  </div>
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

                <div className='flex flex-wrap gap-2'>
                  <Link
                    href={`/quiz-session/${quiz.code}`}
                    className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
                  >
                    <Eye className='mr-1 w-4 h-4' /> Take Quiz
                  </Link>
                  <Link
                    href={`/edit-quiz/${quiz._id}`}
                    className='inline-flex justify-center items-center bg-white hover:bg-gray-50 px-4 py-2 border border-gray-200 rounded-full font-medium text-gray-700 transition-colors'
                  >
                    <Edit className='mr-1 w-4 h-4' /> Edit
                  </Link>
                  <button
                    onClick={() => toggleQuizVisibility(quiz._id)}
                    className='inline-flex justify-center items-center bg-white hover:bg-gray-50 px-4 py-2 border border-gray-200 rounded-full font-medium text-gray-700 transition-colors'
                  >
                    {quiz.isPublic ? (
                      <>
                        <Lock className='mr-1 w-4 h-4' /> Make Private
                      </>
                    ) : (
                      <>
                        <Globe className='mr-1 w-4 h-4' /> Make Public
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/quiz-session/${quiz.code}`;
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
                    className='inline-flex justify-center items-center bg-white hover:bg-pink-50 px-4 py-2 border border-pink-200 rounded-full font-medium text-pink-500 transition-colors'
                  >
                    {copiedCode === `share-${quiz.code}` ? (
                      <span className='text-green-500 text-xs'>
                        Link Copied!
                      </span>
                    ) : (
                      <>
                        <Share2 className='mr-1 w-4 h-4' /> Share
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openDeleteModal(quiz._id)}
                    className='inline-flex justify-center items-center bg-white hover:bg-red-50 px-4 py-2 border border-red-200 rounded-full font-medium text-red-500 transition-colors'
                  >
                    <Trash2 className='mr-1 w-4 h-4' /> Delete
                  </button>
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
  );
}
