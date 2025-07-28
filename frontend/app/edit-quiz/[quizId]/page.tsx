"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Plus, Save, Globe, Lock, ArrowLeft } from "lucide-react";
import SortableQuestion from "@/app/components/sortable-question";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToastContext } from "@/providers/toast-provider";
import { quizApi } from "@/lib/api";
import FileImportButton from "@/app/components/file-import-button";
import Link from "next/link";
import { QuizData } from "@/hooks/use-create-quiz";

// Define the types
interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  rank: string;
  favouriteTopic: string;
  level: number;
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
  _id?: string;
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

interface ImportedQuizData {
  title?: string;
  subject?: string;
  topic?: string;
  instruction?: string;
  passingScore?: number | string;
  duration?: string;
  questions?: Array<{
    questionText?: string;
    options?: string[];
    correctAnswer?: string;
    points?: number;
  }>;
}

export default function EditQuiz() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const queryClient = useQueryClient();
  const toast = useToastContext();

  // Form state
  const [quizTitle, setQuizTitle] = useState("");
  const [quizInstructions, setQuizInstructions] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [duration, setDuration] = useState("30");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Fetch quiz data if not in cache
  const fetchQuizData = useCallback(async () => {
    try {
      const response = await quizApi.getQuizById(quizId);
      const quiz = response.quiz;

      // Populate form with quiz data
      setQuizTitle(quiz.title);
      setQuizInstructions(quiz.instruction);
      setSubject(quiz.subject);
      setTopic(quiz.topic);
      setPassingScore(quiz.passingScore);
      setDuration(quiz.duration);
      setIsPublic(quiz.isPublic);
      setCode(quiz.code);

      // Transform questions to match the expected format
      const formattedQuestions = quiz.questions.map((q: Question) => ({
        id: q.id.toString(),
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        _id: q._id,
      }));

      setQuestions(formattedQuestions);
    } catch (error: unknown) {
      toast.error("Failed to fetch quiz data");
      console.error("Error fetching quiz:", error);
    } finally {
      setIsLoading(false);
    }
  }, [quizId, toast]);

  // Get quiz data from cache
  useEffect(() => {
    if (!initialized) {
      const quizData = queryClient.getQueryData<Quiz>(["userResults"]);

      if (quizData && quizData.quiz) {
        const quiz = quizData.quiz;

        // Populate form with quiz data
        setQuizTitle(quiz.title);
        setQuizInstructions(quiz.instruction);
        setSubject(quiz.subject);
        setTopic(quiz.topic);
        setPassingScore(quiz.passingScore);
        setDuration(quiz.duration);
        setIsPublic(quiz.isPublic);
        setCode(quiz.code);

        // Transform questions to match the expected format
        const formattedQuestions = quiz.questions.map((q) => ({
          id: q.id.toString(),
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          _id: q._id,
        }));

        setQuestions(formattedQuestions);
        setInitialized(true);
        setIsLoading(false);
      } else {
        // If quiz data is not in cache, fetch it from the API
        fetchQuizData().then(() => setInitialized(true));
      }
    }
  }, [quizId, queryClient, fetchQuizData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      questionText: "New Question",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: "Option 1",
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const editQuestion = (id: string, updatedQuestion: Question) => {
    setQuestions(questions.map((q) => (q.id === id ? updatedQuestion : q)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = [...items];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);

        return newItems;
      });
    }
  };

  const validateForm = () => {
    if (!quizTitle) return "Quiz title is required";
    if (!quizInstructions) return "Quiz instructions are required";
    if (!subject) return "Subject is required";
    if (!topic) return "Topic is required";
    if (passingScore < 0 || passingScore > 100)
      return "Passing score must be between 0 and 100";
    if (questions.length === 0) return "At least one question is required";

    // Check each question
    for (const question of questions) {
      if (!question.questionText) return "All questions must have text";
      if (question.options.length < 2)
        return "All questions must have at least 2 options";
      if (!question.options.includes(question.correctAnswer))
        return "Correct answer must be one of the options";
    }

    return null; // No validation errors
  };

  // Update quiz mutation
  const updateQuizMutation = useMutation({
    mutationFn: (quizData: QuizData) => {
      return quizApi.updateQuiz(quizId, quizData);
    },
    onSuccess: () => {
      toast.success("Quiz updated successfully!");
      queryClient.removeQueries({ queryKey: ["userResults"] });
      // queryClient.invalidateQueries({ queryKey: ["userResults"] });
      router.push("/my-quizzes");
    },
    onError: (error: unknown) => {
      let errorMessage = "Failed to update quiz";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);
    },
  });

  const saveQuiz = () => {
    // Validate the form
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Calculate maxScore and xpReward
    const maxScore = questions.reduce((total, q) => total + q.points, 0);
    let xpReward;
    if (maxScore < 2500) {
      xpReward = Math.floor(maxScore * 1.5);
    } else {
      xpReward = Math.floor(maxScore * 1.5 + 100);
    }
    // const xpReward = Math.floor(maxScore * 1.5);

    // Prepare quiz data for submission
    const quizData = {
      title: quizTitle,
      instruction: quizInstructions,
      passingScore,
      maxScore,
      xpReward,
      subject,
      topic,
      duration,
      isPublic,
      code,
      questions: questions.map((q, index) => ({
        id: index + 1,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        _id: q._id, // Include the original _id if it exists
      })),
    };

    // Show a toast notification when starting the submission
    toast.info("Updating quiz...");

    // Submit the quiz using the mutation
    updateQuizMutation.mutate(quizData);
  };

  // Handle imported quiz data
  const handleImportedQuiz = (data: ImportedQuizData) => {
    // Set basic quiz info
    if (data.title) setQuizTitle(data.title);
    if (data.subject) setSubject(data.subject);
    if (data.topic) setTopic(data.topic);
    if (data.instruction) setQuizInstructions(data.instruction);
    if (data.passingScore) setPassingScore(Number(data.passingScore));
    if (data.duration) {
      const durationMatch = data.duration.match(/(\d+)/);
      if (durationMatch) {
        setDuration(durationMatch[1]);
      } else {
        setDuration(data.duration);
      }
    }

    // Import questions if available
    if (data.questions && Array.isArray(data.questions)) {
      const importedQuestions = data.questions.map((q, index) => ({
        id: `imported-${Date.now()}-${index}`,
        questionText: q.questionText || "Imported Question",
        options: Array.isArray(q.options)
          ? q.options
          : ["Option 1", "Option 2"],
        correctAnswer:
          q.correctAnswer ||
          (Array.isArray(q.options) ? q.options[0] : "Option 1"),
        points: q.points || 1,
      }));

      setQuestions(importedQuestions);

      // Switch to questions tab if questions were imported
      if (importedQuestions.length > 0) {
        setActiveTab("questions");
      }
    }
  };

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
    <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
      <div className='mb-6'>
        <Link
          href='/my-quizzes'
          className='inline-flex items-center text-pink-500 hover:text-pink-600 transition-colors'
        >
          <ArrowLeft className='mr-2 w-4 h-4' />
          Back to My Quizzes
        </Link>
      </div>

      <div className='bg-white shadow-md border border-pink-100 rounded-xl overflow-hidden'>
        <div className='p-6 border-pink-100 border-b'>
          <div className='flex md:flex-row flex-col justify-between md:items-center gap-4'>
            <div>
              <h2 className='font-bold text-gray-800 text-2xl'>Edit Quiz</h2>
              <p className='mt-1 text-gray-500'>
                Update your quiz details and questions.
              </p>
            </div>

            <div className='flex sm:flex-row flex-col items-center gap-3'>
              <div className='bg-pink-50 p-1 rounded-full'>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      isPublic
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    }`}
                  >
                    {isPublic ? (
                      <>
                        <Globe className='mr-1 w-4 h-4' /> Public
                      </>
                    ) : (
                      <>
                        <Lock className='mr-1 w-4 h-4' /> Private
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex border-pink-100 border-b'>
          <button
            className={`flex-1 px-4 py-3 text-center font-medium ${
              activeTab === "basic"
                ? "border-b-2 border-pink-500 text-pink-500"
                : "text-gray-500 hover:text-pink-500"
            } transition-colors`}
            onClick={() => setActiveTab("basic")}
          >
            Basic Info
          </button>
          <button
            className={`flex-1 px-4 py-3 text-center font-medium ${
              activeTab === "questions"
                ? "border-b-2 border-pink-500 text-pink-500"
                : "text-gray-500 hover:text-pink-500"
            } transition-colors`}
            onClick={() => setActiveTab("questions")}
          >
            Questions
          </button>
        </div>

        <div className='p-6'>
          {activeTab === "basic" ? (
            <div className='space-y-6'>
              <div className='gap-4 grid md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='block font-medium text-gray-700 text-sm'>
                    Quiz Title
                  </label>
                  <input
                    type='text'
                    className='p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500 w-full'
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder='Enter quiz title'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='block font-medium text-gray-700 text-sm'>
                    Passing Score (%)
                  </label>
                  <input
                    type='number'
                    className='p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500 w-full'
                    value={passingScore}
                    onChange={(e) =>
                      setPassingScore(Number.parseInt(e.target.value))
                    }
                    placeholder='Enter passing score'
                  />
                </div>
              </div>

              <div className='gap-4 grid md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='block font-medium text-gray-700 text-sm'>
                    Subject
                  </label>
                  <input
                    type='text'
                    className='p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500 w-full'
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder='Enter subject name'
                  />
                  {/* <select
                    className='p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500 w-full'
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value=''>Select subject</option>
                    <option value='Mathematics'>Mathematics</option>
                    <option value='English'>English</option>
                    <option value='Science'>Science</option>
                    <option value='History'>History</option>
                    <option value='Geography'>Geography</option>
                    <option value='Web Development'>Web Development</option>
                    <option value='Programming'>Programming</option>
                  </select> */}
                </div>
                <div className='space-y-2'>
                  <label className='block font-medium text-gray-700 text-sm'>
                    Topic
                  </label>
                  <input
                    type='text'
                    className='p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500 w-full'
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder='Enter topic'
                  />
                </div>
              </div>

              <div className='gap-4 grid md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='block font-medium text-gray-700 text-sm'>
                    Duration
                  </label>
                  <select
                    className='p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500 w-full'
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value='10 minutes'>10 minutes</option>
                    <option value='15 minutes'>15 minutes</option>
                    <option value='20 minutes'>20 minutes</option>
                    <option value='25 minutes'>25 minutes</option>
                    <option value='30 minutes'>30 minutes</option>
                    <option value='45 minutes'>45 minutes</option>
                    <option value='60 minutes'>60 minutes</option>
                  </select>
                </div>
                <div className='space-y-2'>
                  <label className='block font-medium text-gray-700 text-sm'>
                    Quiz Code
                  </label>
                  <input
                    type='text'
                    className='bg-gray-50 p-2 border border-gray-300 rounded-lg w-full'
                    value={code}
                    disabled
                    readOnly
                  />
                  <p className='text-gray-500 text-xs'>
                    Quiz code cannot be changed
                  </p>
                </div>
              </div>

              <div className='space-y-2'>
                <label className='block font-medium text-gray-700 text-sm'>
                  Instructions
                </label>
                <textarea
                  className='p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500 w-full'
                  value={quizInstructions}
                  onChange={(e) => setQuizInstructions(e.target.value)}
                  placeholder='Enter quiz instructions'
                  rows={4}
                />
              </div>

              <div className='flex justify-end'>
                <button
                  onClick={() => setActiveTab("questions")}
                  className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-full font-medium text-white transition-colors'
                >
                  Next: Edit Questions
                </button>
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              <div className='flex justify-between items-center'>
                <h3 className='font-medium text-lg'>Questions</h3>
                <div className='flex items-center-gap-3'>
                  <button
                    onClick={saveQuiz}
                    disabled={updateQuizMutation.isPending}
                    className={`inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-full font-medium text-white transition-colors ${
                      updateQuizMutation.isPending
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {updateQuizMutation.isPending ? (
                      <>
                        <svg
                          className='mr-2 -ml-1 w-4 h-4 text-white animate-spin'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className='mr-1 w-4 h-4' /> Update Quiz
                      </>
                    )}
                  </button>
                  <button
                    onClick={addQuestion}
                    className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
                  >
                    <Plus className='mr-1 w-4 h-4' /> Add Question
                  </button>
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={questions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {questions.map((question) => (
                    <SortableQuestion
                      key={question.id}
                      question={question}
                      onDelete={deleteQuestion}
                      onEdit={editQuestion}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {questions.length === 0 && (
                <div className='py-8 text-center'>
                  <p className='text-gray-500'>
                    No questions added yet. Click &quot;Add Question&quot; to
                    get started.
                  </p>
                </div>
              )}

              <div className='flex justify-end'>
                <div className='flex items-center-gap-3'>
                  <button
                    onClick={saveQuiz}
                    disabled={updateQuizMutation.isPending}
                    className={`inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-full font-medium text-white transition-colors ${
                      updateQuizMutation.isPending
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {updateQuizMutation.isPending ? (
                      <>
                        <svg
                          className='mr-2 -ml-1 w-4 h-4 text-white animate-spin'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className='mr-1 w-4 h-4' /> Update Quiz
                      </>
                    )}
                  </button>
                  <button
                    onClick={addQuestion}
                    className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
                  >
                    <Plus className='mr-1 w-4 h-4' /> Add Question
                  </button>
                </div>
              </div>
            </div>
          )}

          <FileImportButton onImport={handleImportedQuiz} />
        </div>
      </div>
    </div>
  );
}
