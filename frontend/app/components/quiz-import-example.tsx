import { FileText } from "lucide-react";

export default function QuizImportExample() {
  const csvExample = `title,subject,topic,instruction,questionText,options,correctAnswer,points
Science Quiz,Science,Biology,"Answer all questions carefully",What is the powerhouse of the cell?,["Mitochondria","Nucleus","Ribosome","Golgi apparatus"],Mitochondria,2
,,,,"Which of the following is NOT a type of blood cell?",["Red blood cell","White blood cell","Platelet","Nephron"],Nephron,1`;

  const jsonExample = `{
  "title": "History Quiz",
  "subject": "History",
  "topic": "World War II",
  "instruction": "Select the best answer for each question",
  "passingScore": 70,
  "questions": [
    {
      "questionText": "In what year did World War II end?",
      "options": ["1943", "1944", "1945", "1946"],
      "correctAnswer": "1945",
      "points": 2
    },
    {
      "questionText": "Who was the Prime Minister of the UK during most of World War II?",
      "options": ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Anthony Eden"],
      "correctAnswer": "Winston Churchill",
      "points": 1
    }
  ]
}`;

  const textExample = `Math Quiz
Mathematics
Algebra
Solve the following algebra problems.
Q: What is the value of x in the equation 2x + 5 = 15?
A: 3
B: 5
C: 7
D: 10
Correct: B
Points: 2
Q: Which of the following is a quadratic equation?
A: y = 2x + 3
B: y = x^2 + 2x + 1
C: y = 3/x
D: y = 2^x
Correct: B
Points: 1`;

  return (
    <div className='space-y-6'>
      <h2 className='font-bold text-xl'>Quiz Import Format Examples</h2>

      <div className='border border-gray-200 rounded-lg overflow-hidden'>
        <div className='flex items-center bg-gray-50 p-3 border-gray-200 border-b'>
          <FileText className='mr-2 w-5 h-5 text-pink-500' />
          <h3 className='font-medium'>Text Example</h3>
        </div>
        <pre className='bg-gray-50 p-4 overflow-x-auto text-gray-800 text-sm'>
          {textExample}
        </pre>
      </div>

      <div className='space-y-4'>
        <div className='border border-gray-200 rounded-lg overflow-hidden'>
          <div className='flex items-center bg-gray-50 p-3 border-gray-200 border-b'>
            <FileText className='mr-2 w-5 h-5 text-pink-500' />
            <h3 className='font-medium'>CSV Example</h3>
          </div>
          <pre className='bg-gray-50 p-4 overflow-x-auto text-gray-800 text-sm'>
            {csvExample}
          </pre>
        </div>

        <div className='border border-gray-200 rounded-lg overflow-hidden'>
          <div className='flex items-center bg-gray-50 p-3 border-gray-200 border-b'>
            <FileText className='mr-2 w-5 h-5 text-pink-500' />
            <h3 className='font-medium'>JSON Example</h3>
          </div>
          <pre className='bg-gray-50 p-4 overflow-x-auto text-gray-800 text-sm'>
            {jsonExample}
          </pre>
        </div>
      </div>

      <div className='bg-blue-50 p-4 border border-blue-200 rounded-lg text-blue-800'>
        <p className='mb-2 font-medium'>Tips for importing:</p>
        <ul className='space-y-1 ml-2 list-disc list-inside'>
          <li>Make sure your CSV has the correct headers</li>
          <li>
            For JSON, ensure it&#39;s valid and contains the required fields
          </li>
          <li>
            In text format, follow the exact structure shown in the example
          </li>
          <li>
            Options in CSV should be formatted as a JSON array: [&#34;Option
            1&#34;, &#34;Option 2&#34;]
          </li>
          <li>After importing, review and edit the quiz before saving</li>
        </ul>
      </div>
    </div>
  );
}
