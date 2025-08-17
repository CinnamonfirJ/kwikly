"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  Plus,
  Save,
  Globe,
  Lock,
  Sparkles,
  BookOpen,
  Target,
  Clock,
  FileText,
  Zap,
} from "lucide-react";
import SortableQuestion from "@/app/components/sortable-question";
import { useCreateQuiz, type QuizData } from "@/hooks/use-create-quiz";
import { useToastContext } from "@/providers/toast-provider";
import FileImportButton from "@/app/components/file-import-button";

// Define the question type
type Question = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
};

export default function CreateQuiz() {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizInstructions, setQuizInstructions] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [duration, setDuration] = useState("15 minutes");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Use the create quiz mutation
  const createQuizMutation = useCreateQuiz();
  // Use toast context for notifications
  const toast = useToastContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Increase the activation constraint threshold for better touch control
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
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
      points: 1, // Default to 1 point
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

    if (active.id !== over?.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

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

  const saveQuiz = () => {
    // Validate the form
    const validationError = validateForm();
    if (validationError) {
      // Use toast instead of alert
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
    const quizData: QuizData = {
      title: quizTitle,
      instruction: quizInstructions,
      passingScore,
      maxScore,
      xpReward,
      subject,
      topic,
      duration,
      isPublic,
      questions: questions.map((q, index) => ({
        id: index + 1,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
      })),
    };

    // Show a toast notification when starting the submission
    toast.info("Saving quiz...");

    // Submit the quiz using the mutation
    createQuizMutation.mutate(quizData);
  };

  interface ImportedQuizData {
    title?: string;
    subject?: string;
    topic?: string;
    instruction?: string;
    passingScore?: number | string;
    duration?: string;
    questions?: {
      questionText?: string;
      options?: string[];
      correctAnswer?: string;
      points?: number;
    }[];
  }

  // Handle imported quiz data
  const handleImportedQuiz = (data: ImportedQuizData) => {
    setIsLoading(true);
    // Set basic quiz info
    if (data.title) setQuizTitle(data.title);
    if (data.subject) setSubject(data.subject);
    if (data.topic) setTopic(data.topic);
    if (data.instruction) setQuizInstructions(data.instruction);
    if (data.passingScore) setPassingScore(Number(data.passingScore));
    if (data.duration) {
      // Extract just the number from duration if it contains "minutes"
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
      setIsLoading(false);

      // Switch to questions tab if questions were imported
      if (importedQuestions.length > 0) {
        setActiveTab("questions");
      }
    }
  };

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

  if (isLoading) {
    return (
      <div className='bg-gradient-to-br from-slate-50 via-white to-pink-50/30 min-h-screen'>
        <div className='absolute inset-0 opacity-5 pointer-events-none'>
          <div
            className='top-0 left-0 absolute w-full h-full'
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #ec4899 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
        <div className='relative flex justify-center items-center min-h-screen'>
          <div className='bg-white/80 shadow-lg backdrop-blur-sm p-8 border border-pink-100/50 rounded-2xl'>
            <div className='mx-auto border-pink-500 border-t-2 border-b-2 rounded-full w-12 h-12 animate-spin'></div>
            <p className='mt-4 font-medium text-gray-600'>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className='relative'>
          <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-25 rounded-3xl transition duration-300 blur'></div>
          <div className='relative bg-white/80 shadow-2xl backdrop-blur-sm border border-pink-100/50 rounded-3xl overflow-hidden'>
            {/* Header */}
            <div className='bg-gradient-to-r from-pink-50/50 to-purple-50/50 p-8 border-pink-100/50 border-b'>
              <div className='flex md:flex-row flex-col justify-between md:items-center gap-6'>
                <div>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='bg-gradient-to-r from-pink-100 to-purple-100 p-3 rounded-xl'>
                      <Sparkles className='w-6 h-6 text-pink-600' />
                    </div>
                    <h2 className='font-bold text-gray-900 text-3xl'>
                      Create a New Quiz
                    </h2>
                  </div>
                  <p className='text-gray-600 leading-relaxed'>
                    Design your quiz with intuitive drag-and-drop functionality.
                    Create engaging questions and customize every detail.
                  </p>
                </div>

                <div className='flex sm:flex-row flex-col items-center gap-4'>
                  <div className='group relative'>
                    <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-20 rounded-2xl transition duration-300 blur'></div>
                    <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-2 border border-pink-100/50 rounded-2xl'>
                      <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`group inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold transition-all duration-300 transform hover:scale-105 ${
                          isPublic
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                            : "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg"
                        }`}
                      >
                        {isPublic ? (
                          <>
                            <Globe className='mr-2 w-5 h-5' />
                            <span>Public Quiz</span>
                          </>
                        ) : (
                          <>
                            <Lock className='mr-2 w-5 h-5' />
                            <span>Private Quiz</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className='flex bg-gradient-to-r from-white/50 to-pink-50/50 border-pink-100/50 border-b'>
              <button
                className={`group relative flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === "basic"
                    ? "text-pink-600"
                    : "text-gray-500 hover:text-pink-500"
                }`}
                onClick={() => setActiveTab("basic")}
              >
                <div className='flex justify-center items-center gap-2'>
                  <FileText className='w-5 h-5' />
                  <span>Basic Information</span>
                </div>
                {activeTab === "basic" && (
                  <div className='right-0 bottom-0 left-0 absolute bg-gradient-to-r from-pink-500 to-purple-600 rounded-t-full h-1'></div>
                )}
              </button>
              <button
                className={`group relative flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === "questions"
                    ? "text-pink-600"
                    : "text-gray-500 hover:text-pink-500"
                }`}
                onClick={() => setActiveTab("questions")}
              >
                <div className='flex justify-center items-center gap-2'>
                  <Target className='w-5 h-5' />
                  <span>Questions & Content</span>
                </div>
                {activeTab === "questions" && (
                  <div className='right-0 bottom-0 left-0 absolute bg-gradient-to-r from-pink-500 to-purple-600 rounded-t-full h-1'></div>
                )}
              </button>
            </div>

            {/* Content */}
            <div className='p-8'>
              {activeTab === "basic" ? (
                <div className='space-y-8'>
                  {/* Quiz Title & Passing Score */}
                  <div className='gap-6 grid md:grid-cols-2'>
                    <div className='group relative'>
                      <div className='absolute -inset-1 bg-gradient-to-r from-blue-300 to-blue-400 opacity-0 group-hover:opacity-20 rounded-2xl transition duration-300 blur'></div>
                      <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-blue-100/50 rounded-2xl'>
                        <label className='flex items-center gap-2 mb-3 font-semibold text-gray-800'>
                          <BookOpen className='w-5 h-5 text-blue-500' />
                          Quiz Title
                        </label>
                        <input
                          type='text'
                          className='p-4 border border-gray-200 focus:border-pink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 w-full font-medium transition-all duration-200'
                          value={quizTitle}
                          onChange={(e) => setQuizTitle(e.target.value)}
                          placeholder='Enter an engaging quiz title'
                        />
                      </div>
                    </div>

                    <div className='group relative'>
                      <div className='absolute -inset-1 bg-gradient-to-r from-purple-300 to-purple-400 opacity-0 group-hover:opacity-20 rounded-2xl transition duration-300 blur'></div>
                      <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-purple-100/50 rounded-2xl'>
                        <label className='flex items-center gap-2 mb-3 font-semibold text-gray-800'>
                          <Target className='w-5 h-5 text-purple-500' />
                          Passing Score (%)
                        </label>
                        <input
                          type='number'
                          className='p-4 border border-gray-200 focus:border-pink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 w-full font-medium transition-all duration-200'
                          value={passingScore}
                          onChange={(e) =>
                            setPassingScore(Number.parseInt(e.target.value))
                          }
                          placeholder='70'
                          min='0'
                          max='100'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subject & Topic */}
                  <div className='gap-6 grid md:grid-cols-2'>
                    <div className='group relative'>
                      <div className='absolute -inset-1 bg-gradient-to-r from-emerald-300 to-emerald-400 opacity-0 group-hover:opacity-20 rounded-2xl transition duration-300 blur'></div>
                      <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-emerald-100/50 rounded-2xl'>
                        <label className='flex items-center gap-2 mb-3 font-semibold text-gray-800'>
                          <Sparkles className='w-5 h-5 text-emerald-500' />
                          Subject
                        </label>
                        <input
                          type='text'
                          className='p-4 border border-gray-200 focus:border-pink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 w-full font-medium transition-all duration-200'
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder='e.g., Mathematics, Science, History'
                        />
                        {subject && (
                          <div className='mt-3'>
                            <div
                              className={`inline-flex items-center bg-gradient-to-r ${getSubjectColor(
                                subject
                              )} px-3 py-1 rounded-full font-medium text-white text-sm shadow-sm`}
                            >
                              <Sparkles className='mr-1 w-3 h-3' />
                              {subject}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='group relative'>
                      <div className='absolute -inset-1 bg-gradient-to-r from-amber-300 to-amber-400 opacity-0 group-hover:opacity-20 rounded-2xl transition duration-300 blur'></div>
                      <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-amber-100/50 rounded-2xl'>
                        <label className='flex items-center gap-2 mb-3 font-semibold text-gray-800'>
                          <Target className='w-5 h-5 text-amber-500' />
                          Topic
                        </label>
                        <input
                          type='text'
                          className='p-4 border border-gray-200 focus:border-pink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 w-full font-medium transition-all duration-200'
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder='e.g., Algebra, Biology, World War II'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className='gap-6 grid md:grid-cols-2'>
                    <div className='group relative'>
                      <div className='absolute -inset-1 bg-gradient-to-r from-indigo-300 to-indigo-400 opacity-0 group-hover:opacity-20 rounded-2xl transition duration-300 blur'></div>
                      <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-indigo-100/50 rounded-2xl'>
                        <label className='flex items-center gap-2 mb-3 font-semibold text-gray-800'>
                          <Clock className='w-5 h-5 text-indigo-500' />
                          Duration
                        </label>
                        <select
                          className='p-4 border border-gray-200 focus:border-pink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 w-full font-medium transition-all duration-200'
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        >
                          <option value='10 minutes'>10 minutes</option>
                          <option value='15 minutes'>15 minutes</option>
                          <option value='20 minutes'>20 minutes</option>
                          <option value='30 minutes'>30 minutes</option>
                          <option value='45 minutes'>45 minutes</option>
                          <option value='60 minutes'>60 minutes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className='group relative'>
                    <div className='absolute -inset-1 bg-gradient-to-r from-rose-300 to-rose-400 opacity-0 group-hover:opacity-20 rounded-2xl transition duration-300 blur'></div>
                    <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-rose-100/50 rounded-2xl'>
                      <label className='flex items-center gap-2 mb-3 font-semibold text-gray-800'>
                        <BookOpen className='w-5 h-5 text-rose-500' />
                        Quiz Instructions
                      </label>
                      <textarea
                        className='p-4 border border-gray-200 focus:border-pink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 w-full font-medium transition-all duration-200 resize-none'
                        value={quizInstructions}
                        onChange={(e) => setQuizInstructions(e.target.value)}
                        placeholder='Provide clear instructions for quiz takers. Include any special requirements, time limits, or guidelines.'
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className='flex justify-end'>
                    <button
                      onClick={() => setActiveTab("questions")}
                      className='group inline-flex items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-8 py-4 rounded-xl overflow-hidden font-semibold text-white hover:scale-105 transition-all duration-300 transform'
                    >
                      <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                      <Zap className='mr-2 w-5 h-5' />
                      Next: Add Questions
                    </button>
                  </div>
                </div>
              ) : (
                <div className='space-y-8'>
                  {/* Questions Header */}
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-3'>
                      <div className='bg-gradient-to-r from-pink-100 to-purple-100 p-3 rounded-xl'>
                        <Target className='w-6 h-6 text-pink-600' />
                      </div>
                      <div>
                        <h3 className='font-bold text-gray-900 text-xl'>
                          Questions
                        </h3>
                        <p className='text-gray-600 text-sm'>
                          Create and organize your quiz questions
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={saveQuiz}
                        disabled={createQuizMutation.isPending}
                        className={`group inline-flex items-center bg-gradient-to-r from-green-500 hover:from-green-600 to-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl overflow-hidden font-semibold text-white transition-all duration-300 transform ${
                          createQuizMutation.isPending
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:scale-105"
                        }`}
                      >
                        {createQuizMutation.isPending ? (
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
                            Saving...
                          </>
                        ) : (
                          <>
                            <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                            <Save className='mr-2 w-4 h-4' />
                            Save Quiz
                          </>
                        )}
                      </button>
                      <button
                        onClick={addQuestion}
                        className='group inline-flex items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl overflow-hidden font-semibold text-white hover:scale-105 transition-all duration-300 transform'
                      >
                        <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                        <Plus className='mr-2 w-4 h-4' />
                        Add Question
                      </button>
                    </div>
                  </div>

                  {/* Questions List */}
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
                      <div className='space-y-4'>
                        {questions.map((question) => (
                          <SortableQuestion
                            key={question.id}
                            question={question}
                            onDelete={deleteQuestion}
                            onEdit={editQuestion}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Empty State */}
                  {questions.length === 0 && (
                    <div className='group relative'>
                      <div className='absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-300 opacity-20 rounded-3xl transition duration-300 blur'></div>
                      <div className='relative bg-white/60 backdrop-blur-sm p-12 border-2 border-gray-300 border-dashed rounded-3xl text-center'>
                        <div className='bg-gradient-to-r from-gray-100 to-gray-200 mx-auto mb-4 p-4 rounded-full w-16 h-16'>
                          <Target className='mx-auto w-8 h-8 text-gray-500' />
                        </div>
                        <p className='mb-4 font-medium text-gray-600 text-lg'>
                          No questions added yet
                        </p>
                        <p className='mb-6 text-gray-500'>
                          Click &#34;Add Question&#34; to start building your
                          quiz content
                        </p>
                        <button
                          onClick={addQuestion}
                          className='group inline-flex items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl overflow-hidden font-semibold text-white hover:scale-105 transition-all duration-300 transform'
                        >
                          <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                          <Plus className='mr-2 w-4 h-4' />
                          Add Your First Question
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom Actions */}
                  <div className='flex justify-end'>
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={saveQuiz}
                        disabled={createQuizMutation.isPending}
                        className={`group inline-flex items-center bg-gradient-to-r from-green-500 hover:from-green-600 to-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl px-8 py-4 rounded-xl overflow-hidden font-semibold text-white transition-all duration-300 transform ${
                          createQuizMutation.isPending
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:scale-105"
                        }`}
                      >
                        {createQuizMutation.isPending ? (
                          <>
                            <svg
                              className='mr-2 -ml-1 w-5 h-5 text-white animate-spin'
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
                            Creating Quiz...
                          </>
                        ) : (
                          <>
                            <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                            <Save className='mr-2 w-5 h-5' />
                            Save & Publish Quiz
                          </>
                        )}
                      </button>
                      <button
                        onClick={addQuestion}
                        className='group inline-flex items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl overflow-hidden font-semibold text-white hover:scale-105 transition-all duration-300 transform'
                      >
                        <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                        <Plus className='mr-2 w-4 h-4' />
                        Add Question
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* File Import */}
              <div className='mt-8 pt-8 border-gray-200/50 border-t'>
                <FileImportButton onImport={handleImportedQuiz} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
