"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

// Mock current user - in a real app, this would come from your auth system
const currentUser = {
  id: "user123",
  name: "Sarah Johnson",
  email: "sarah@example.com",
  profilePicture: "/images/placeholder.png?height=100&width=100",
};

// Mock user's quizzes - in a real app, these would be fetched from your API
const userQuizzes = [
  {
    id: 1,
    code: "STAT101",
    title: "Statistics Fundamentals Quiz",
    subject: "Mathematics",
    topic: "Statistics",
    duration: "30 minutes",
    xpReward: 50,
    questions: 4,
    createdBy: "user123",
    creatorName: "Sarah Johnson",
    isPublic: true,
    createdAt: "2023-04-15T10:30:00Z",
  },
  {
    id: 2,
    code: "PROB202",
    title: "Probability Quiz",
    subject: "Mathematics",
    topic: "Probability",
    duration: "2 minutes",
    xpReward: 40,
    questions: 5,
    createdBy: "user123",
    creatorName: "Sarah Johnson",
    isPublic: false,
    createdAt: "2023-04-10T14:20:00Z",
  },
  {
    id: 3,
    code: "ENG303",
    title: "Proper Nouns Quiz",
    subject: "English",
    topic: "Proper Nouns",
    duration: "20 minutes",
    xpReward: 45,
    questions: 4,
    createdBy: "user123",
    creatorName: "Sarah Johnson",
    isPublic: true,
    createdAt: "2023-04-05T09:15:00Z",
  },
];

export default function MyQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState(userQuizzes);
  const [copiedCode, setCopiedCode] = useState("");

  // In a real app, you would fetch the user's quizzes from your API
  // useEffect(() => {
  //   const fetchUserQuizzes = async () => {
  //     const response = await fetch('/api/quizzes/my-quizzes');
  //     const data = await response.json();
  //     setQuizzes(data);
  //   };
  //   fetchUserQuizzes();
  // }, []);

  // Copy quiz code to clipboard
  const copyCodeToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  // Toggle quiz visibility (public/private)
  const toggleQuizVisibility = (id) => {
    setQuizzes(
      quizzes.map((quiz) =>
        quiz.id === id ? { ...quiz, isPublic: !quiz.isPublic } : quiz
      )
    );

    // In a real app, you would update the quiz in your database
    // fetch(`/api/quizzes/${id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ isPublic: !quiz.isPublic })
    // });
  };

  // Delete quiz
  const deleteQuiz = (id) => {
    if (
      confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    ) {
      setQuizzes(quizzes.filter((quiz) => quiz.id !== id));

      // In a real app, you would delete the quiz from your database
      // fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
    }
  };

  // Format date
  const formatDate = (dateString) => {
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
            You haven't created any quizzes yet. Create your first quiz to get
            started!
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
              key={quiz.id}
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
                        <Clock className='mr-1 w-4 h-4' /> {quiz.duration}
                      </div>
                      <div className='flex items-center'>
                        <Award className='mr-1 w-4 h-4 text-pink-500' />{" "}
                        {quiz.xpReward} XP
                      </div>
                      <div>{quiz.questions} questions</div>
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
                    href={`/edit-quiz/${quiz.id}`}
                    className='inline-flex justify-center items-center bg-white hover:bg-gray-50 px-4 py-2 border border-gray-200 rounded-full font-medium text-gray-700 transition-colors'
                  >
                    <Edit className='mr-1 w-4 h-4' /> Edit
                  </Link>
                  <button
                    onClick={() => toggleQuizVisibility(quiz.id)}
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
                    onClick={() => deleteQuiz(quiz.id)}
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
    </div>
  );
}
