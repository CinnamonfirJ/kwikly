"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AlertTriangle, Info, HelpCircle, CheckCircle, X } from "lucide-react";

export type ModalType = "delete" | "warning" | "info" | "success" | "confirm";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  component?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ModalType;
  customImage?: string;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  component,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "confirm",
  customImage,
  isLoading = false,
}: ConfirmationModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle mounting/unmounting
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Handle visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        document.body.style.overflow = "";
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  // Get the appropriate icon and colors based on the modal type
  const getModalConfig = (type: ModalType) => {
    switch (type) {
      case "delete":
        return {
          icon: <AlertTriangle className='w-12 h-12 text-pink-500' />,
          confirmButtonClass:
            "bg-pink-500 hover:bg-pink-600 focus:ring-pink-500",
          iconBgClass: "bg-pink-50",
          image: "/placeholder.svg?height=200&width=200",
          imageAlt: "Delete confirmation illustration",
        };
      case "warning":
        return {
          icon: <AlertTriangle className='w-12 h-12 text-amber-500' />,
          confirmButtonClass:
            "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500",
          iconBgClass: "bg-amber-50",
          image: "/placeholder.svg?height=200&width=200",
          imageAlt: "Warning illustration",
        };
      case "success":
        return {
          icon: <CheckCircle className='w-12 h-12 text-green-500' />,
          confirmButtonClass:
            "bg-green-500 hover:bg-green-600 focus:ring-green-500",
          iconBgClass: "bg-green-50",
          image: "/placeholder.svg?height=200&width=200",
          imageAlt: "Success illustration",
        };
      case "info":
        return {
          icon: <Info className='w-12 h-12 text-blue-500' />,
          confirmButtonClass:
            "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500",
          iconBgClass: "bg-blue-50",
          image: "/placeholder.svg?height=200&width=200",
          imageAlt: "Information illustration",
        };
      default:
        return {
          icon: <HelpCircle className='w-12 h-12 text-pink-500' />,
          confirmButtonClass:
            "bg-pink-500 hover:bg-pink-600 focus:ring-pink-500",
          iconBgClass: "bg-pink-50",
          image: "/placeholder.svg?height=200&width=200",
          imageAlt: "Confirmation illustration",
        };
    }
  };

  const config = getModalConfig(type);

  if (!isMounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      } transition-opacity duration-300`}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm ${
          isVisible ? "bg-opacity-60" : "bg-opacity-0"
        } transition-opacity duration-300`}
        aria-hidden='true'
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative bg-white rounded-xl shadow-lg max-w-xl w-full mx-auto ${
          isVisible ? "translate-y-0" : "translate-y-4"
        } transition-transform duration-300 overflow-hidden`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className='top-4 right-4 absolute hover:bg-gray-100 p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-400 hover:text-gray-500 transition-colors'
          aria-label='Close'
        >
          <X className='w-5 h-5' />
        </button>

        {/* Content */}
        <div className='p-8'>
          <div className='flex flex-col items-center text-center'>
            {customImage ? (
              <div className='relative mb-6 w-48 h-48'>
                <Image
                  src={customImage || "/placeholder.svg"}
                  alt={`${title} illustration`}
                  fill
                  className='object-contain'
                />
              </div>
            ) : (
              <div className='mb-6'>
                <div
                  className={`flex justify-center items-center mx-auto rounded-full w-28 h-28 ${config.iconBgClass} shadow-sm`}
                >
                  {config.icon}
                </div>
              </div>
            )}
            <h2
              id='modal-title'
              className='mb-3 font-bold text-gray-800 text-2xl'
            >
              {title}
            </h2>
            <p className='mx-auto mb-8 max-w-sm text-gray-600'>{description}</p>
            <div>{component}</div>
          </div>

          {/* Buttons */}
          <div className='flex sm:flex-row flex-col justify-center gap-3 sm:gap-4'>
            <button
              type='button'
              onClick={onClose}
              className='inline-flex justify-center bg-white hover:bg-gray-50 shadow-sm px-6 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 font-medium text-gray-700 text-sm transition-colors'
            >
              {cancelText}
            </button>
            <button
              type='button'
              onClick={handleConfirm}
              disabled={isLoading}
              className={`inline-flex justify-center px-6 py-2.5 rounded-full text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                config.confirmButtonClass
              } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
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
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
