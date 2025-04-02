"use client";

import type React from "react";

import { createContext, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/app/components/toast-container";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ToastType = "success" | "error" | "info";

interface ToastContextType {
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toasts, removeToast, success, error, info } = useToast();

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}
