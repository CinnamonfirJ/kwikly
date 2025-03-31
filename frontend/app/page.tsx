import Link from "next/link";
import { BookOpen, Award, Brain, ChevronRight } from "lucide-react";
import FeaturedQuizzes from "@/app/components/featured-quizzes";

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen'>
      <main className='flex-1'>
        <section className='bg-gradient-to-b from-white to-pink-50 py-12 md:py-24 lg:py-32 w-full'>
          <div className='mx-auto px-4 md:px-6 max-w-6xl container'>
            <div className='flex flex-col items-center space-y-4 text-center'>
              <div className='inline-block bg-pink-100 px-3 py-1 rounded-full font-medium text-pink-600 text-sm'>
                Learn and grow with fun quizzes
              </div>
              <h1 className='font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tighter'>
                Test Your Knowledge with{" "}
                <span className='text-pink-500'>Kwikly</span>
              </h1>
              <p className='max-w-[700px] text-gray-500 md:text-xl'>
                Take quizzes on various subjects, earn XP, and climb the
                leaderboard!
              </p>
              <div className='flex sm:flex-row flex-col gap-4'>
                <Link
                  href='/quizzes'
                  className='inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-full font-medium text-white transition-colors'
                >
                  Start a Quiz <ChevronRight className='ml-2 w-4 h-4' />
                </Link>
                <Link
                  href='/auth/signup'
                  className='inline-flex justify-center items-center bg-white hover:bg-pink-50 px-6 py-3 border border-pink-200 rounded-full font-medium text-pink-500 transition-colors'
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className='py-12 md:py-24 lg:py-32 w-full'>
          <div className='mx-auto px-4 md:px-6 max-w-6xl container'>
            <div className='flex flex-col justify-center items-center space-y-4 text-center'>
              <div className='space-y-2'>
                <div className='inline-block bg-pink-100 px-3 py-1 rounded-full font-medium text-pink-600 text-sm'>
                  Features
                </div>
                <h2 className='font-bold text-3xl md:text-4xl tracking-tighter'>
                  Why Choose Kwikly?
                </h2>
                <p className='max-w-[700px] text-gray-500 md:text-xl'>
                  Our platform offers a fun and engaging way to learn and test
                  your knowledge.
                </p>
              </div>
            </div>
            <div className='gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto mt-8 max-w-5xl'>
              <div className='bg-white shadow-sm hover:shadow-md p-6 border border-pink-100 rounded-xl transition-all'>
                <div className='inline-flex justify-center items-center bg-pink-100 mb-4 rounded-full w-12 h-12'>
                  <BookOpen className='w-6 h-6 text-pink-500' />
                </div>
                <h3 className='mb-2 font-semibold text-xl'>Various Subjects</h3>
                <p className='text-gray-500'>
                  Explore quizzes across different subjects from Mathematics to
                  English and more.
                </p>
              </div>
              <div className='bg-white shadow-sm hover:shadow-md p-6 border border-pink-100 rounded-xl transition-all'>
                <div className='inline-flex justify-center items-center bg-pink-100 mb-4 rounded-full w-12 h-12'>
                  <Award className='w-6 h-6 text-pink-500' />
                </div>
                <h3 className='mb-2 font-semibold text-xl'>Earn XP & Levels</h3>
                <p className='text-gray-500'>
                  Complete quizzes to earn XP and level up your profile.
                </p>
              </div>
              <div className='bg-white shadow-sm hover:shadow-md p-6 border border-pink-100 rounded-xl transition-all'>
                <div className='inline-flex justify-center items-center bg-pink-100 mb-4 rounded-full w-12 h-12'>
                  <Brain className='w-6 h-6 text-pink-500' />
                </div>
                <h3 className='mb-2 font-semibold text-xl'>Create Your Own</h3>
                <p className='text-gray-500'>
                  Create and share your own quizzes with our easy-to-use quiz
                  builder.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className='bg-pink-50 py-12 md:py-24 lg:py-32 w-full'>
          <div className='mx-auto px-4 md:px-6 max-w-6xl container'>
            <div className='flex flex-col justify-center items-center space-y-4 text-center'>
              <div className='space-y-2'>
                <div className='inline-block bg-pink-100 px-3 py-1 rounded-full font-medium text-pink-600 text-sm'>
                  Featured Quizzes
                </div>
                <h2 className='font-bold text-3xl md:text-4xl tracking-tighter'>
                  Popular Right Now
                </h2>
                <p className='max-w-[700px] text-gray-500 md:text-xl'>
                  Check out these trending quizzes from our collection.
                </p>
              </div>
            </div>
            <div className='mx-auto mt-8'>
              <FeaturedQuizzes />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
