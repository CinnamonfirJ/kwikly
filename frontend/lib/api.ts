import axios from "axios";

// Define the Question type
export type QuizQuestion = {
  id: string | number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
};

// Define the Quiz type
export type QuizData = {
  title: string;
  instruction: string;
  passingScore: number;
  maxScore: number;
  xpReward: number;
  subject: string;
  topic: string;
  duration: string;
  isPublic: boolean;
  questions: QuizQuestion[];
};

// Create an axios instance with default config
const api = axios.create({
  baseURL: "/api", // Adjust this to match your API base URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for sending cookies with requests
});

// Quiz API functions
export const quizApi = {
  createQuiz: async (quizData: QuizData) => {
    const response = await api.post("/quiz/create", quizData);
    return response.data;
  },

  // Add other quiz-related API functions here as needed
  getQuizzes: async () => {
    const response = await api.get("/quiz");
    return response.data;
  },

  getQuizById: async (id: string) => {
    const response = await api.get(`/quiz/${id}`);
    return response.data;
  },

  updateQuiz: async (id: string, quizData: QuizData) => {
    const response = await api.put(`/quiz/${id}`, quizData);
    return response.data;
  },
};

export default api;
