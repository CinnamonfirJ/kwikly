"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Save, X, Check } from "lucide-react";
import DragIndicator from "./drag-indicator";

// Define the question type
type Question = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
};

// Define the SortableQuestion component
export default function SortableQuestion({
  question,
  onDelete,
  onEdit,
}: {
  question: Question;
  onDelete: (id: string) => void;
  onEdit: (id: string, question: Question) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const handleSave = () => {
    onEdit(question.id, editedQuestion);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, touchAction: "manipulation" }}
      className={`mb-4 ${
        transform ? "opacity-75 scale-105 z-10" : "opacity-100"
      }`}
    >
      <div className='bg-white shadow-sm border border-pink-100 rounded-xl overflow-hidden'>
        <div className='p-4 border-pink-100 border-b'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <div
                {...attributes}
                {...listeners}
                className='touch-manipulation cursor-grab'
                style={{ touchAction: "none" }}
              >
                <DragIndicator />
              </div>
              <h3 className='font-semibold text-base'>
                Question {question.id}
              </h3>
            </div>
            <div className='flex items-center gap-2'>
              {isEditing ? (
                <>
                  <button
                    className='p-1 text-gray-500 hover:text-gray-700 transition-colors'
                    onClick={() => setIsEditing(false)}
                  >
                    <X className='w-4 h-4' />
                  </button>
                  <button
                    className='p-1 text-pink-500 hover:text-pink-700 transition-colors'
                    onClick={handleSave}
                  >
                    <Save className='w-4 h-4' />
                  </button>
                </>
              ) : (
                <button
                  className='px-2 py-1 text-gray-500 hover:text-gray-700 text-sm transition-colors'
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
              <button
                className='p-1 text-red-500 hover:text-red-700 transition-colors'
                onClick={() => onDelete(question.id)}
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
        <div>
          <div
            className='hover:bg-pink-50 p-4 transition-colors cursor-pointer'
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isEditing ? "Edit Question" : question.questionText}
          </div>
          {(isExpanded || isEditing) && (
            <div className='p-4 border-pink-100 border-t'>
              {isEditing ? (
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <label className='block font-medium text-gray-700 text-sm'>
                      Question Text
                    </label>
                    <textarea
                      className='p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500 w-full'
                      value={editedQuestion.questionText}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          questionText: e.target.value,
                        })
                      }
                      placeholder='Enter your question'
                      rows={2}
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='block font-medium text-gray-700 text-sm'>
                      Options
                    </label>
                    {editedQuestion.options.map((option, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <input
                          type='text'
                          className='flex-1 p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500'
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                        />
                        <div
                          className={`h-5 w-5 rounded-full border ${
                            editedQuestion.correctAnswer === option
                              ? "bg-pink-500 border-pink-500"
                              : "border-gray-300"
                          } flex items-center justify-center cursor-pointer`}
                          onClick={() =>
                            setEditedQuestion({
                              ...editedQuestion,
                              correctAnswer: option,
                            })
                          }
                        >
                          {editedQuestion.correctAnswer === option && (
                            <Check className='w-3 h-3 text-white' />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='space-y-2'>
                    <label className='block font-medium text-gray-700 text-sm'>
                      Points
                    </label>
                    <select
                      className='p-2 border border-gray-300 focus:border-pink-500 rounded-lg focus:outline-none focus:ring-pink-500'
                      value={editedQuestion.points}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          points: Number.parseInt(e.target.value),
                        })
                      }
                    >
                      <option value='1'>1 Point</option>
                      <option value='2'>2 Points</option>
                      <option value='3'>3 Points</option>
                      <option value='4'>4 Points</option>
                      <option value='5'>5 Points</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    {question.options.map((option, index) => (
                      <div key={index} className='flex items-center space-x-2'>
                        <div
                          className={`h-5 w-5 rounded-full border ${
                            option === question.correctAnswer
                              ? "bg-pink-500 border-pink-500"
                              : "border-gray-300"
                          } flex items-center justify-center`}
                        >
                          {option === question.correctAnswer && (
                            <Check className='w-3 h-3 text-white' />
                          )}
                        </div>
                        <label className='text-sm'>{option}</label>
                      </div>
                    ))}
                  </div>
                  <div className='text-gray-500 text-sm'>
                    Points: {question.points}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
