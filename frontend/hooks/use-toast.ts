"use client";

import { useState } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (
    message: string,
    type: ToastType = "info",
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message: string, duration?: number) => {
    return addToast(message, "success", duration);
  };

  const error = (message: string, duration?: number) => {
    return addToast(message, "error", duration);
  };

  const info = (message: string, duration?: number) => {
    return addToast(message, "info", duration);
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
  };
}
