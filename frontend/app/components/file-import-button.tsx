"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload, FileText, Sparkles, Info, Download } from "lucide-react";
import { useToastContext } from "@/providers/toast-provider";
import ConfirmationModal from "./confirmation-modal";
import * as mammoth from "mammoth"; // Use browser version

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

      if (line.startsWith("Q:") || line.match(/^Q\d+:$/)) {
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

  // const extractTextFromPDF = async (file: File) => {
  //   const arrayBuffer = await file.arrayBuffer();

  //   // Load the PDF using pdf.js
  //   const pdfDoc = await getDocument(arrayBuffer).promise;
  //   let fullText = "";

  //   // Loop through each page of the PDF and extract text
  //   for (let i = 0; i < pdfDoc.numPages; i++) {
  //     const page = await pdfDoc.getPage(i + 1);
  //     const textContent = await page.getTextContent();
  //     const textItems = textContent.items
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       .map((item: any) => item.str)
  //       .join(" ");
  //     fullText += textItems + " ";
  //   }

  //   return fullText.trim();
  // };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
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
        // } else if (file.name.endsWith(".pdf")) {
        //   const pdfText = await extractTextFromPDF(file);
        //   data = parsePlainText(pdfText);
        // } else if (file.name.endsWith(".docx")) {
        const docxText = await extractTextFromDocx(file);
        data = parsePlainText(docxText);
      } else {
        data = parsePlainText(text);
      }

      // Parse based on file type
      // if (file.name.endsWith(".csv")) {
      //   data = parseCSV(text);
      // } else if (file.name.endsWith(".json")) {
      //   data = parseJSON(text);
      // } else {
      //   // Assume plain text
      //   data = parsePlainText(text);
      // }

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
    <div className='group relative'>
      <div className='absolute -inset-1 bg-gradient-to-r from-blue-300 to-indigo-400 opacity-0 group-hover:opacity-20 rounded-3xl transition duration-300 blur'></div>
      <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-blue-100/50 rounded-2xl'>
        {/* Header */}
        <div className='flex items-center gap-3 mb-4'>
          <div className='bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-xl'>
            <Upload className='w-5 h-5 text-blue-600' />
          </div>
          <div>
            <h3 className='font-bold text-gray-900 text-lg'>Import Quiz</h3>
            <p className='text-gray-600 text-sm'>
              Upload your quiz from a file
            </p>
          </div>
        </div>

        {/* File Input */}
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          accept='.csv,.json,.txt,.docx'
          className='hidden'
        />

        {/* Import Button */}
        <button
          onClick={handleButtonClick}
          disabled={isLoading}
          className={`group inline-flex items-center bg-gradient-to-r from-blue-500 hover:from-blue-600 to-indigo-600 hover:to-indigo-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl overflow-hidden font-semibold text-white transition-all duration-300 transform ${
            isLoading ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
          }`}
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
              Importing Quiz...
            </>
          ) : (
            <>
              <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
              <Upload className='mr-2 w-4 h-4' />
              Choose File to Import
            </>
          )}
        </button>

        {/* Supported Formats */}
        <div className='flex items-center gap-2 mt-4'>
          <FileText className='w-4 h-4 text-gray-500' />
          <span className='text-gray-600 text-sm'>
            Supported formats:{" "}
            <span className='font-medium'>CSV, JSON, TXT, DOCX</span>
          </span>
        </div>

        {/* Format Guide */}
        <div className='group relative mt-6'>
          <div className='absolute -inset-1 bg-gradient-to-r from-emerald-200 to-blue-200 opacity-20 rounded-2xl transition duration-300 blur'></div>
          <div className='relative bg-gradient-to-r from-emerald-50/80 to-blue-50/80 backdrop-blur-sm p-5 border border-emerald-100/50 rounded-2xl'>
            <div className='flex items-start gap-3'>
              <button
                onClick={() => setFormatModalOpen(true)}
                className='group flex-shrink-0 bg-gradient-to-r from-emerald-100 hover:from-emerald-200 to-blue-100 hover:to-blue-200 mt-1 p-2 rounded-full hover:scale-110 transition-all duration-200 transform'
              >
                <Info className='w-4 h-4 text-emerald-600' />
              </button>

              <div>
                <div className='flex items-center gap-2 mb-3'>
                  <Sparkles className='w-4 h-4 text-emerald-500' />
                  <h4 className='font-semibold text-emerald-800'>
                    Import Format Guide
                  </h4>
                </div>

                <div className='space-y-3 text-sm'>
                  {/* CSV Format */}
                  <div className='bg-white/60 backdrop-blur-sm p-3 border border-emerald-200/50 rounded-xl'>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='bg-green-100 px-2 py-1 rounded-md font-mono text-green-700 text-xs'>
                        CSV
                      </div>
                      <span className='font-medium text-gray-700'>
                        Comma Separated Values
                      </span>
                    </div>
                    <p className='text-gray-600 text-xs leading-relaxed'>
                      Headers:{" "}
                      <code className='bg-gray-100 px-1 rounded text-xs'>
                        title,subject,topic,instruction,questionText,options,correctAnswer,points
                      </code>
                    </p>
                  </div>

                  {/* JSON Format */}
                  <div className='bg-white/60 backdrop-blur-sm p-3 border border-blue-200/50 rounded-xl'>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='bg-blue-100 px-2 py-1 rounded-md font-mono text-blue-700 text-xs'>
                        JSON
                      </div>
                      <span className='font-medium text-gray-700'>
                        JavaScript Object Notation
                      </span>
                    </div>
                    <p className='text-gray-600 text-xs leading-relaxed'>
                      Required fields:{" "}
                      <code className='bg-gray-100 px-1 rounded text-xs'>
                        title, subject, topic, instruction
                      </code>{" "}
                      + optional{" "}
                      <code className='bg-gray-100 px-1 rounded text-xs'>
                        questions
                      </code>{" "}
                      array
                    </p>
                  </div>

                  {/* Text Format */}
                  <div className='bg-white/60 backdrop-blur-sm p-3 border border-purple-200/50 rounded-xl'>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='bg-purple-100 px-2 py-1 rounded-md font-mono text-purple-700 text-xs'>
                        TXT
                      </div>
                      <span className='font-medium text-gray-700'>
                        Plain Text Format
                      </span>
                    </div>
                    <p className='text-gray-600 text-xs leading-relaxed'>
                      First 4 lines: title, subject, topic, instruction.
                      Questions format: <br />
                      <code className='bg-gray-100 px-1 rounded text-xs'>
                        Q: question, A: option1, B: option2, Correct: A, Points:
                        1
                      </code>
                    </p>
                  </div>
                </div>

                {/* View Examples Button */}
                <button
                  onClick={() => setFormatModalOpen(true)}
                  className='group inline-flex items-center bg-gradient-to-r from-emerald-500 hover:from-emerald-600 to-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg mt-4 px-4 py-2 rounded-lg overflow-hidden font-medium text-white text-sm hover:scale-105 transition-all duration-300 transform'
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                  <Download className='mr-2 w-3 h-3' />
                  View Format Examples
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={formatModalOpen}
          onClose={() => setFormatModalOpen(false)}
          onConfirm={handleOpenFileImportExample}
          title='Import Format Examples'
          description="Ready to import your quiz like a pro? ✨ We've got you covered with detailed examples for CSV, JSON, and text formats! No more guessing—just follow our templates and watch your quiz come to life instantly. Click below to see the magic happen!"
          confirmText='View Examples'
          cancelText='Cancel'
          type='info'
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
