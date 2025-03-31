"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  Plus,
  GripVertical,
  Trash2,
  Save,
  X,
  Check,
  Copy,
  Share2,
  Globe,
  Lock,
} from "lucide-react";

// Mock current user - in a real app, this would come from your auth system
const currentUser = {
  id: "user123",
  name: "Sarah Johnson",
  email: "sarah@example.com",
  profilePicture: "/images/placeholder.png?height=100&width=100",
};

// Define the question type
type Question = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
};

// Function to generate a random quiz code
function generateQuizCode() {
  // Generate a code with 3 letters followed by 3 numbers
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let code = "";

  // Add 3 random letters
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Add 3 random numbers
  for (let i = 0; i < 3; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return code;
}

// Define the SortableQuestion component
function SortableQuestion({
  question,
  onDelete,
  onEdit,
}: {
  question: Question;
  onDelete: (id: string) => void;
  onEdit: (id: string, question: Question) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const handleSave = () => {
    onEdit(question.id, editedQuestion);
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className='mb-4'>
      <div className='bg-white shadow-sm border border-pink-100 rounded-xl overflow-hidden'>
        <div className='p-4 border-pink-100 border-b'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <div {...attributes} {...listeners} className='cursor-grab'>
                <GripVertical className='w-5 h-5 text-gray-400' />
              </div>
              <h3 className='font-semibold text-base'>
                Question {question.id}
              </h3>
            </div>
            <div className='flex items-center gap-2'>
              {isEditing ? (
                <>
                  <button
                    className='p-1 text-gray-500 hover:text-gray-700 transition-colors'
                    onClick={() => setIsEditing(false)}
                  >
                    <X className='w-4 h-4' />
                  </button>
                  <button
                    className='p-1 text-pink-500 hover:text-pink-700 transition-colors'
                    onClick={handleSave}
                  >
                    <Save className='w-4 h-4' />
                  </button>
                </>
              ) : (
                <button
                  className='px-2 py-1 text-gray-500 hover:text-gray-700 text-sm transition-colors'
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
              <button
                className='p-1 text-red-500 hover:text-red-700 transition-colors'
                onClick={() => onDelete(question.id)}
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
        <div>
          <div
            className='hover:bg-pink-50 p-4 transition-colors cursor-pointer'
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isEditing ? "Edit Question" : question.questionText}
          </div>
          {(isExpanded || isEditing) && (
            <div className='p-4 border-pink-100 border-t'>
              {isEditing ? (
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <label className='block font-medium text-gray-700 text-sm'>
                      Question Text
                    </label>
                    <textarea
                      className='p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500 w-full'
                      value={editedQuestion.questionText}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          questionText: e.target.value,
                        })
                      }
                      placeholder='Enter your question'
                      rows={2}
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='block font-medium text-gray-700 text-sm'>
                      Options
                    </label>
                    {editedQuestion.options.map((option, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <input
                          type='text'
                          className='flex-1 p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500'
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                        />
                        <div
                          className={`h-5 w-5 rounded-full border ${
                            editedQuestion.correctAnswer === option
                              ? "bg-pink-500 border-pink-500"
                              : "border-gray-300"
                          } flex items-center justify-center cursor-pointer`}
                          onClick={() =>
                            setEditedQuestion({
                              ...editedQuestion,
                              correctAnswer: option,
                            })
                          }
                        >
                          {editedQuestion.correctAnswer === option && (
                            <Check className='w-3 h-3 text-white' />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='space-y-2'>
                    <label className='block font-medium text-gray-700 text-sm'>
                      Points
                    </label>
                    <input
                      type='number'
                      className='p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500'
                      value={editedQuestion.points}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          points: Number.parseInt(e.target.value),
                        })
                      }
                      placeholder='Points'
                    />
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    {question.options.map((option, index) => (
                      <div key={index} className='flex items-center space-x-2'>
                        <div
                          className={`h-5 w-5 rounded-full border ${
                            option === question.correctAnswer
                              ? "bg-pink-500 border-pink-500"
                              : "border-gray-300"
                          } flex items-center justify-center`}
                        >
                          {option === question.correctAnswer && (
                            <Check className='w-3 h-3 text-white' />
                          )}
                        </div>
                        <label className='text-sm'>{option}</label>
                      </div>
                    ))}
                  </div>
                  <div className='text-gray-500 text-sm'>
                    Points: {question.points}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateQuiz() {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizInstructions, setQuizInstructions] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [duration, setDuration] = useState("30 minutes");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [quizCode, setQuizCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  // Generate a quiz code when the component mounts
  useEffect(() => {
    setQuizCode(generateQuizCode());
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
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
      points: 25,
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const editQuestion = (id: string, updatedQuestion: Question) => {
    setQuestions(questions.map((q) => (q.id === id ? updatedQuestion : q)));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
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

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(quizCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const copyShareUrlToClipboard = () => {
    const shareUrl = `${window.location.origin}/quiz-session/${quizCode}`;
    navigator.clipboard.writeText(shareUrl);
    setShareUrlCopied(true);
    setTimeout(() => setShareUrlCopied(false), 2000);
  };

  const shareQuiz = () => {
    const shareUrl = `${window.location.origin}/quiz-session/${quizCode}`;
    if (navigator.share) {
      navigator.share({
        title: quizTitle || "Join my quiz",
        text: `Join my quiz: ${quizTitle || "New Quiz"}`,
        url: shareUrl,
      });
    } else {
      copyShareUrlToClipboard();
    }
  };

  const saveQuiz = () => {
    // This would normally save to your MongoDB database
    const quiz = {
      title: quizTitle,
      instruction: quizInstructions,
      passingScore: passingScore,
      maxScore: questions.reduce((total, q) => total + q.points, 0),
      xpReward: Math.floor(
        questions.reduce((total, q) => total + q.points, 0) * 0.5
      ),
      subject: subject,
      topic: topic,
      duration: duration,
      code: quizCode,
      createdBy: currentUser.id,
      creatorName: currentUser.name,
      isPublic: isPublic,
      questions: questions.map((q, index) => ({
        id: index + 1,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
      })),
    };

    console.log("Saving quiz:", quiz);
    // Here you would call your API to save to MongoDB
    // saveQuizToDatabase(quiz)

    // Redirect to my quizzes page
    // router.push('/my-quizzes')
  };

  return (
    <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
      <div className='bg-white shadow-md border border-pink-100 rounded-xl overflow-hidden'>
        <div className='p-6 border-pink-100 border-b'>
          <div className='flex md:flex-row flex-col justify-between md:items-center gap-4'>
            <div>
              <h2 className='font-bold text-gray-800 text-2xl'>
                Create a New Quiz
              </h2>
              <p className='mt-1 text-gray-500'>
                Design your quiz with drag and drop functionality to reorder
                questions.
              </p>
            </div>

            <div className='flex sm:flex-row flex-col items-center gap-3 bg-pink-50 p-3 rounded-lg'>
              <div>
                <div className='mb-1 text-gray-500 text-xs'>Quiz Code:</div>
                <div className='flex items-center gap-2'>
                  <span className='bg-white px-3 py-1 border border-pink-200 rounded-md font-medium text-pink-600 text-sm'>
                    {quizCode}
                  </span>
                  <button
                    onClick={copyCodeToClipboard}
                    className='p-1 text-gray-400 hover:text-pink-500 transition-colors'
                    title='Copy quiz code'
                  >
                    {codeCopied ? (
                      <Check className='w-4 h-4 text-green-500' />
                    ) : (
                      <Copy className='w-4 h-4' />
                    )}
                  </button>
                </div>
              </div>

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

                <button
                  onClick={shareQuiz}
                  className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-3 py-1.5 rounded-full font-medium text-white text-sm transition-colors'
                >
                  <Share2 className='mr-1 w-4 h-4' />
                  {shareUrlCopied ? "Copied!" : "Share Quiz"}
                </button>
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
                  <select
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
                  </select>
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
                    <option value='30 minutes'>30 minutes</option>
                    <option value='45 minutes'>45 minutes</option>
                    <option value='60 minutes'>60 minutes</option>
                  </select>
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
                  Next: Add Questions
                </button>
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              <div className='flex justify-between items-center'>
                <h3 className='font-medium text-lg'>Questions</h3>
                <button
                  onClick={addQuestion}
                  className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
                >
                  <Plus className='mr-1 w-4 h-4' /> Add Question
                </button>
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
                    No questions added yet. Click &#34;Add Question&#34; to get
                    started.
                  </p>
                </div>
              )}

              <div className='flex justify-end'>
                <button
                  onClick={saveQuiz}
                  className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-full font-medium text-white transition-colors'
                >
                  <Save className='mr-1 w-4 h-4' /> Save Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
