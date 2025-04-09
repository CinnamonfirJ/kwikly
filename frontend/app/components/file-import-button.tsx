"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToastContext } from "@/providers/toast-provider";
import ConfirmationModal from "./confirmation-modal";

interface FileImportButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onImport: (data: any) => void; // Ignore type for now
}

export default function FileImportButton({ onImport }: FileImportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const toast = useToastContext();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleOpenFileImportExample = () => {
    setFormatModalOpen(false);
    window.open("/import-example", "_blank", "noopener,noreferrer");
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n");
    if (lines.length < 2) {
      throw new Error(
        "CSV file must contain at least a header row and one data row"
      );
    }

    const headers = lines[0].split(",").map((h) => h.trim());

    // Check if the CSV has the expected format
    const requiredHeaders = ["title", "subject", "topic", "instruction"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      throw new Error(
        `CSV is missing required headers: ${missingHeaders.join(", ")}`
      );
    }

    // Parse the quiz basic info from the first data row
    const quizInfoRow = lines[1].split(",").map((cell) => cell.trim());
    const quizInfo: Record<string, string> = {};

    headers.forEach((header, index) => {
      if (index < quizInfoRow.length) {
        quizInfo[header] = quizInfoRow[index];
      }
    });

    // Parse questions if they exist in the CSV
    const questions = [];

    // Check if we have question headers
    const questionHeaders = [
      "questionText",
      "options",
      "correctAnswer",
      "points",
    ];
    const hasQuestionHeaders = questionHeaders.every((h) =>
      headers.includes(h)
    );

    if (hasQuestionHeaders) {
      // Start from row 2 (index 1) as row 1 contains quiz info
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const cells = lines[i].split(",").map((cell) => cell.trim());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const question: Record<string, any> = {};

        headers.forEach((header, index) => {
          if (index < cells.length) {
            if (header === "options") {
              // Options should be a JSON array string like "['Option 1', 'Option 2']"
              try {
                question[header] = JSON.parse(cells[index].replace(/'/g, '"'));
              } catch (e) {
                toast.error(String(e));
                question[header] = [cells[index]];
              }
            } else if (header === "points") {
              question[header] = Number.parseInt(cells[index]) || 1;
            } else {
              question[header] = cells[index];
            }
          }
        });

        if (question.questionText) {
          questions.push(question);
        }
      }
    }

    return {
      ...quizInfo,
      questions: questions.length > 0 ? questions : undefined,
    };
  };

  const parseJSON = (text: string) => {
    const data = JSON.parse(text);

    // Validate the JSON structure
    if (!data.title || !data.subject || !data.topic || !data.instruction) {
      throw new Error(
        "JSON must contain title, subject, topic, and instruction fields"
      );
    }

    return data;
  };

  const parsePlainText = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 4) {
      throw new Error(
        "Text file must contain at least title, subject, topic, and instruction"
      );
    }

    // Basic parsing - assume first 4 lines are title, subject, topic, instruction
    const quizInfo = {
      title: lines[0].trim(),
      subject: lines[1].trim(),
      topic: lines[2].trim(),
      instruction: lines[3].trim(),
    };

    // Check if there are questions in the format "Q: question text, A: option1, B: option2, C: option3, Correct: A"
    const questions = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentQuestion: any = null;

    for (let i = 4; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("Q:") || line.startsWith(`Q${i}:`)) {
        // Save previous question if exists
        if (currentQuestion) {
          questions.push(currentQuestion);
        }

        // Start new question
        currentQuestion = {
          questionText: line.substring(2).trim(),
          options: [],
          correctAnswer: "",
          points: 1,
        };
      } else if (line.startsWith("Correct:") && currentQuestion) {
        const correctLetter = line.substring(8).trim();
        const index = correctLetter.charCodeAt(0) - 65; // Convert A to 0, B to 1, etc.

        if (index >= 0 && index < currentQuestion.options.length) {
          currentQuestion.correctAnswer = currentQuestion.options[index];
        }
      } else if (line.match(/^[A-Z]:/) && currentQuestion) {
        // This is an option like "A: option text"
        const option = line.substring(2).trim();
        currentQuestion.options.push(option);
      } else if (line.startsWith("Points:") && currentQuestion) {
        currentQuestion.points = Number.parseInt(line.substring(7).trim()) || 1;
      }
    }

    // Add the last question
    if (currentQuestion && currentQuestion.options.length > 0) {
      questions.push(currentQuestion);
    }

    return {
      ...quizInfo,
      questions: questions.length > 0 ? questions : undefined,
    };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const text = await file.text();
      let data;

      // Parse based on file type
      if (file.name.endsWith(".csv")) {
        data = parseCSV(text);
      } else if (file.name.endsWith(".json")) {
        data = parseJSON(text);
      } else {
        // Assume plain text
        data = parsePlainText(text);
      }

      onImport(data);
      toast.success(`Successfully imported quiz from ${file.name}`);
    } catch (error: unknown) {
      console.error("Error parsing file:", error);
      toast.error(
        `Error importing file: ${String(error) || "Invalid file format"}`
      );
    } finally {
      setIsLoading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className='mt-4'>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileChange}
        accept='.csv,.json,.txt'
        className='hidden'
      />
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className='inline-flex justify-center items-center bg-white hover:bg-pink-50 px-4 py-2 border border-pink-200 rounded-full font-medium text-pink-500 transition-colors'
      >
        {isLoading ? (
          <>
            <div className='flex justify-center items-center'>
              <div className='border-amber-50 border-t-2 border-b-2 rounded-full w-5 h-5 animate-spin'></div>
            </div>
            Importing...
          </>
        ) : (
          <>
            <Upload className='mr-2 w-4 h-4' />
            Import Quiz
          </>
        )}
      </button>

      <div className='flex items-start gap-1 mt-2 text-gray-500 text-xs'>
        <FileText className='flex-shrink-0 mt-0.5 w-3 h-3' />
        <span>Supported formats: CSV, JSON, TXT</span>
      </div>

      <div className='bg-blue-50 mt-4 p-4 sm:p-3 border border-blue-200 rounded-lg text-blue-800 text-sm'>
        <div className='flex sm:flex-row flex-col sm:items-start sm:gap-3'>
          <AlertCircle
            onClick={() => setFormatModalOpen(true)}
            className='flex-shrink-0 bg-blue-100 sm:mt-0.5 mb-2 sm:mb-0 p-1 rounded-full w-6 h-6 text-blue-500 cursor-pointer pulse-soft'
          />

          <div className='text-sm break-words whitespace-normal'>
            <p className='mb-2 font-medium'>Import Format Tips:</p>
            <ul className='space-y-2 ml-4 text-sm list-disc list-inside'>
              <li>
                <strong>CSV:</strong> First row should be headers (
                <span className='break-all'>
                  title,subject,topic,instruction,questionText,options,correctAnswer,points
                </span>
                )
              </li>
              <li>
                <strong>JSON:</strong> Must include <code>title</code>,{" "}
                <code>subject</code>, <code>topic</code>,
                <code>instruction</code> fields and optional{" "}
                <code>questions</code> array
              </li>
              <li>
                <strong>Text:</strong> First 4 lines should be title, subject,
                topic, and instruction. Questions format: <br />
                Q: question, A: option1, B: option2, C: option3, D: option4,
                Correct: A, Points: 1
              </li>
            </ul>
          </div>

          <ConfirmationModal
            isOpen={formatModalOpen}
            onClose={() => setFormatModalOpen(false)}
            onConfirm={handleOpenFileImportExample}
            title='Import Example'
            description="Guess what? You can magically import your quizzes with just a CSV, JSON, or text file! ✨ No manual typing needed—just format it right, and boom, you're all set! Want to see some examples? Click below to check them out!"
            confirmText='See Examples'
            cancelText='Cancel'
            type='info'
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
