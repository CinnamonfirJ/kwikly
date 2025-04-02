"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Start entry animation after mount
  useEffect(() => {
    const entryTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(entryTimer);
  }, []);

  // Handle exit animation and cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Allow time for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      case "error":
        return <AlertTriangle className='w-5 h-5 text-red-500' />;
      case "info":
        return <Info className='w-5 h-5 text-blue-500' />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          icon: "bg-green-100",
          text: "text-green-800",
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "bg-red-100",
          text: "text-red-800",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: "bg-blue-100",
          text: "text-blue-800",
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`transform transition-all duration-500 ease-in-out max-w-md pointer-events-auto
        ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-8 opacity-0 scale-95"
        }
      `}
    >
      <div
        className={`flex items-center justify-between p-4 rounded-2xl shadow-lg border-2 ${styles.bg} ${styles.border} ${styles.text}
          backdrop-blur-sm backdrop-saturate-150 overflow-hidden
        `}
        style={{
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          animation: isVisible ? "wiggle 1s ease-in-out" : "none",
        }}
      >
        <div className='flex items-center'>
          <div className={`p-2 rounded-full ${styles.icon} mr-3 flex-shrink-0`}>
            {getIcon()}
          </div>
          <span className='font-medium'>{message}</span>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 500);
          }}
          className='flex-shrink-0 hover:bg-white/30 ml-4 p-1.5 rounded-full focus:outline-none transition-colors'
        >
          <X className='w-4 h-4' />
        </button>
      </div>

      <style jsx global>{`
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          2% {
            transform: rotate(2deg);
          }
          4% {
            transform: rotate(-2deg);
          }
          6% {
            transform: rotate(1deg);
          }
          8% {
            transform: rotate(-1deg);
          }
          10% {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
