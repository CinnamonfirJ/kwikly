"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToastContext } from "@/providers/toast-provider";
import { QuizData } from "./use-create-quiz";

export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const toast = useToastContext();

  // Create an axios instance with default config
  const api = axios.create({
    baseURL: "/api",
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // Quiz API functions
  const quizApi = {
    updateQuiz: async (quizId: string, quizData: QuizData) => {
      const response = await api.put(`/quiz/update/${quizId}`, quizData);
      return response.data;
    },
  };

  return useMutation({
    mutationFn: ({
      quizId,
      quizData,
    }: {
      quizId: string;
      quizData: QuizData;
    }) => {
      // Format the data to match backend expectations
      const formattedData = {
        ...quizData,
        questions: quizData.questions.map((q, index) => ({
          id: index + 1, // Ensure sequential IDs
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
        })),
      };

      return quizApi.updateQuiz(quizId, formattedData);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });

      toast.success("Quiz updated successfully!");

      router.push("/my-quizzes");
    },

    onError: (error) => {
      const errorMessage = error?.message || "Failed to update quiz";
      toast.error(errorMessage);
    },
  });
}
