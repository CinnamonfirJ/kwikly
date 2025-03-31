import { CheckCircle, XCircle, Clock } from "lucide-react";

// This would normally come from your MongoDB database
const quizHistory = [
  {
    id: 1,
    title: "Statistics Fundamentals Quiz",
    date: "2023-04-15",
    score: 75,
    passingScore: 70,
    maxScore: 100,
    subject: "Mathematics",
    topic: "Statistics",
    duration: "30 minutes",
    passed: true,
  },
  {
    id: 2,
    title: "Probability Quiz",
    date: "2023-04-10",
    score: 80,
    passingScore: 60,
    maxScore: 100,
    subject: "Mathematics",
    topic: "Probability",
    duration: "30 minutes",
    passed: true,
  },
  {
    id: 3,
    title: "Proper Nouns Quiz",
    date: "2023-04-05",
    score: 60,
    passingScore: 80,
    maxScore: 100,
    subject: "English",
    topic: "Proper Nouns",
    duration: "20 minutes",
    passed: false,
  },
];

export default function QuizHistory() {
  return (
    <div className='space-y-4'>
      {quizHistory.map((quiz) => (
        <div
          key={quiz.id}
          className='bg-white shadow-sm p-4 border border-pink-100 rounded-lg'
        >
          <div className='pb-2'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <h3 className='font-semibold text-base'>{quiz.title}</h3>
                {quiz.passed ? (
                  <span className='inline-block bg-green-100 px-2 py-0.5 rounded-full font-medium text-green-600 text-xs'>
                    Passed
                  </span>
                ) : (
                  <span className='inline-block bg-red-100 px-2 py-0.5 rounded-full font-medium text-red-600 text-xs'>
                    Failed
                  </span>
                )}
              </div>
              <div className='text-gray-500 text-xs'>
                {new Date(quiz.date).toLocaleDateString()}
              </div>
            </div>
            <div className='flex items-center gap-2 mt-1 text-gray-500 text-xs'>
              <span>
                {quiz.subject} • {quiz.topic}
              </span>
              <span className='flex items-center'>
                <Clock className='mr-1 w-3 h-3' />
                {quiz.duration}
              </span>
            </div>
          </div>
          <div className='flex justify-between items-center mt-2'>
            <div className='flex items-center gap-1'>
              <span className='font-medium text-sm'>
                Score: {quiz.score}/{quiz.maxScore}
              </span>
              {quiz.passed ? (
                <CheckCircle className='w-4 h-4 text-green-500' />
              ) : (
                <XCircle className='w-4 h-4 text-red-500' />
              )}
            </div>
            <div className='text-gray-500 text-xs'>
              Passing score: {quiz.passingScore}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
