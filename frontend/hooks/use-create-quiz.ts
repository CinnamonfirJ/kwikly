"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { quizApi } from "@/lib/api"
import { useRouter } from "next/navigation";

import axios from "axios";
import { useToastContext } from "@/providers/toast-provider";

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

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const toast = useToastContext();

  // Create an axios instance with default config
  const api = axios.create({
    baseURL: "/api", // Adjust this to match your API base URL
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, // Important for sending cookies with requests
  });

  // Quiz API functions
  const quizApi = {
    createQuiz: async (quizData: QuizData) => {
      const response = await api.post("/quiz/create", quizData);
      return response.data;
    },
  };

  return useMutation({
    mutationFn: (quizData: QuizData) => {
      // Format the data as expected by the backend
      const formattedData = {
        ...quizData,
        // Format questions to match backend expectations
        questions: quizData.questions.map((q, index) => ({
          id: index + 1, // Ensure sequential IDs
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
        })),
      };

      return quizApi.createQuiz(formattedData);
    },

    onSuccess: () => {
      // Invalidate and refetch quizzes list to update it
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });

      // Show success message
      toast.success("Quiz created successfully!");

      // Redirect to my quizzes page
      router.push("/my-quizzes");
    },

    onError: (error) => {
      // Handle error
      const errorMessage = error?.message || "Failed to create quiz";
      toast.error(errorMessage);
    },
  });
}
