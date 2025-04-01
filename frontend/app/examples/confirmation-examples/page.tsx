"use client";

import { useState } from "react";
import ConfirmationModal, {
  type ModalType,
} from "@/app/components/confirmation-modal";

export default function ConfirmationExamplesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("confirm");
  const [isLoading, setIsLoading] = useState(false);

  const openModal = (type: ModalType) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    // Simulate an async operation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setModalOpen(false);
  };

  const getModalConfig = (type: ModalType) => {
    switch (type) {
      case "delete":
        return {
          title: "Delete Item",
          description:
            "Are you sure you want to delete this item? This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
        };
      case "warning":
        return {
          title: "Warning",
          description:
            "This action might have consequences. Are you sure you want to proceed?",
          confirmText: "Proceed",
          cancelText: "Go Back",
        };
      case "success":
        return {
          title: "Success",
          description:
            "Your action was completed successfully! Would you like to continue?",
          confirmText: "Continue",
          cancelText: "Close",
        };
      case "info":
        return {
          title: "Information",
          description:
            "This is an informational message. Please review the details before proceeding.",
          confirmText: "Got it",
          cancelText: "Close",
        };
      default:
        return {
          title: "Confirm Action",
          description: "Are you sure you want to perform this action?",
          confirmText: "Confirm",
          cancelText: "Cancel",
        };
    }
  };

  const config = getModalConfig(modalType);

  return (
    <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
      <div className='mb-8'>
        <h1 className='mb-2 font-bold text-3xl'>Confirmation Modal Examples</h1>
        <p className='text-gray-500'>
          Click on the buttons below to see different types of confirmation
          modals.
        </p>
      </div>

      <div className='gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        <div className='bg-white shadow-sm p-6 border border-pink-100 rounded-xl'>
          <h2 className='mb-4 font-semibold text-lg'>Delete Confirmation</h2>
          <p className='mb-4 text-gray-500'>
            Used for confirming destructive actions like deleting items.
          </p>
          <button
            onClick={() => openModal("delete")}
            className='inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
          >
            Show Delete Modal
          </button>
        </div>

        <div className='bg-white shadow-sm p-6 border border-pink-100 rounded-xl'>
          <h2 className='mb-4 font-semibold text-lg'>Warning Confirmation</h2>
          <p className='mb-4 text-gray-500'>
            Used for actions that might have consequences but aren&#39;t
            destructive.
          </p>
          <button
            onClick={() => openModal("warning")}
            className='inline-flex justify-center items-center bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
          >
            Show Warning Modal
          </button>
        </div>

        <div className='bg-white shadow-sm p-6 border border-pink-100 rounded-xl'>
          <h2 className='mb-4 font-semibold text-lg'>Success Confirmation</h2>
          <p className='mb-4 text-gray-500'>
            Used for confirming successful actions and next steps.
          </p>
          <button
            onClick={() => openModal("success")}
            className='inline-flex justify-center items-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
          >
            Show Success Modal
          </button>
        </div>

        <div className='bg-white shadow-sm p-6 border border-pink-100 rounded-xl'>
          <h2 className='mb-4 font-semibold text-lg'>Information Modal</h2>
          <p className='mb-4 text-gray-500'>
            Used for providing information before proceeding with an action.
          </p>
          <button
            onClick={() => openModal("info")}
            className='inline-flex justify-center items-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
          >
            Show Info Modal
          </button>
        </div>

        <div className='bg-white shadow-sm p-6 border border-pink-100 rounded-xl'>
          <h2 className='mb-4 font-semibold text-lg'>Standard Confirmation</h2>
          <p className='mb-4 text-gray-500'>
            Default confirmation modal for general actions.
          </p>
          <button
            onClick={() => openModal("confirm")}
            className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full font-medium text-white transition-colors'
          >
            Show Confirm Modal
          </button>
        </div>
      </div>

      {/* The modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        title={config.title}
        description={config.description}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        type={modalType}
        isLoading={isLoading}
      />
    </div>
  );
}
