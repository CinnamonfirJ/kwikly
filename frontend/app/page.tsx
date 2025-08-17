import Link from "next/link";
import {
  BookOpen,
  Award,
  Brain,
  ChevronRight,
  Sparkles,
  Users,
  TrendingUp,
  Zap,
  Star,
} from "lucide-react";
import FeaturedQuizzes from "@/app/components/featured-quizzes";

export default function Home() {
  return (
    <div className='flex flex-col bg-gradient-to-br from-slate-50 via-white to-pink-50/30 min-h-screen'>
      <main className='flex-1'>
        {/* Hero Section */}
        <section className='relative py-6 md:py-12 lg:py-24 w-full overflow-hidden'>
          {/* Animated Background Elements */}
          <div className='absolute inset-0 pointer-events-none'>
            <div className='top-20 left-10 absolute bg-pink-200/20 blur-xl rounded-full w-20 h-20 animate-pulse'></div>
            <div className='top-40 right-20 absolute bg-purple-200/20 blur-xl rounded-full w-32 h-32 animate-pulse delay-1000'></div>
            <div className='bottom-20 left-1/4 absolute bg-blue-200/20 blur-xl rounded-full w-16 h-16 animate-pulse delay-500'></div>
          </div>

          <div className='relative mx-auto px-4 md:px-6 max-w-6xl container'>
            <div className='flex flex-col items-center space-y-6 text-center'>
              {/* Enhanced Badge */}
              <div className='group relative'>
                <div className='absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-400 opacity-25 group-hover:opacity-50 rounded-full transition duration-300 blur'></div>
                <div className='inline-flex relative items-center bg-white/80 shadow-lg backdrop-blur-sm px-4 py-2 border border-pink-200/50 rounded-full font-medium text-pink-600 text-sm'>
                  <Sparkles className='mr-2 w-4 h-4 text-pink-500' />
                  Learn and grow with fun quizzes
                </div>
              </div>

              {/* Enhanced Heading */}
              <h1 className='font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight'>
                <span className='block mb-2'>Test Your Knowledge</span>
                <span className='block'>
                  with{" "}
                  <span className='relative'>
                    <span className='bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-transparent'>
                      Kwikly
                    </span>
                    <div className='-z-10 absolute -inset-1 bg-gradient-to-r from-pink-400/20 to-purple-400/20 blur-lg animate-pulse'></div>
                  </span>
                </span>
              </h1>

              {/* Enhanced Description */}
              <p className='max-w-[800px] text-gray-600 text-lg md:text-xl leading-relaxed'>
                Join thousands of learners taking interactive quizzes, earning
                XP, and competing on global leaderboards. Make learning
                addictive.
              </p>

              {/* Enhanced Stats */}
              <div className='flex flex-wrap justify-center gap-8 mt-8 text-sm'>
                <div className='flex items-center space-x-2'>
                  <Users className='w-5 h-5 text-pink-500' />
                  <span className='text-gray-600'>50K+ Active Users</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <BookOpen className='w-5 h-5 text-purple-500' />
                  <span className='text-gray-600'>1000+ Quizzes</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <TrendingUp className='w-5 h-5 text-blue-500' />
                  <span className='text-gray-600'>98% Completion Rate</span>
                </div>
              </div>

              {/* Enhanced CTAs */}
              <div className='flex sm:flex-row flex-col gap-4 mt-8'>
                <Link
                  href='/quizzes'
                  className='group inline-flex relative justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-8 py-4 rounded-full overflow-hidden font-semibold text-white hover:scale-105 transition-all duration-300 transform'
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                  <Zap className='mr-2 w-5 h-5' />
                  Start Quiz Now
                  <ChevronRight className='ml-2 w-4 h-4 transition-transform group-hover:translate-x-1' />
                </Link>
                <Link
                  href='/auth/signup'
                  className='group inline-flex justify-center items-center bg-white/80 hover:bg-white hover:shadow-lg backdrop-blur-sm px-8 py-4 border-2 border-pink-200 hover:border-pink-300 rounded-full font-semibold text-pink-600 transition-all duration-300'
                >
                  <Star className='mr-2 w-4 h-4 group-hover:rotate-12 transition-transform' />
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className='relative py-16 md:py-24 lg:py-32 w-full'>
          <div className='mx-auto px-4 md:px-6 max-w-6xl container'>
            <div className='flex flex-col justify-center items-center space-y-6 mb-16 text-center'>
              <div className='space-y-4'>
                <div className='inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 border border-pink-200/50 rounded-full font-medium text-pink-600 text-sm'>
                  <Award className='mr-2 w-4 h-4' />
                  Why Choose Kwikly?
                </div>
                <h2 className='bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 font-bold text-transparent text-4xl md:text-5xl tracking-tight'>
                  Features That Make Learning Fun
                </h2>
                <p className='max-w-[700px] text-gray-600 text-lg md:text-xl leading-relaxed'>
                  Our platform combines gamification with effective learning
                  techniques to keep you engaged and motivated.
                </p>
              </div>
            </div>

            {/* Enhanced Feature Cards */}
            <div className='gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-6xl'>
              <div className='group relative'>
                <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-300 blur'></div>
                <div className='relative bg-white/70 hover:bg-white hover:shadow-xl backdrop-blur-sm p-8 border border-pink-100 rounded-2xl transition-all hover:-translate-y-1 duration-300'>
                  <div className='inline-flex justify-center items-center bg-gradient-to-r from-pink-100 to-pink-200 mb-6 rounded-2xl w-16 h-16 group-hover:scale-110 transition-transform duration-300'>
                    <BookOpen className='w-8 h-8 text-pink-600' />
                  </div>
                  <h3 className='mb-3 font-bold text-gray-900 text-xl'>
                    Diverse Subjects
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    Master everything from Mathematics and Science to Literature
                    and History with our comprehensive quiz collection.
                  </p>
                </div>
              </div>

              <div className='group relative'>
                <div className='absolute -inset-1 bg-gradient-to-r from-purple-300 to-blue-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-300 blur'></div>
                <div className='relative bg-white/70 hover:bg-white hover:shadow-xl backdrop-blur-sm p-8 border border-purple-100 rounded-2xl transition-all hover:-translate-y-1 duration-300'>
                  <div className='inline-flex justify-center items-center bg-gradient-to-r from-purple-100 to-purple-200 mb-6 rounded-2xl w-16 h-16 group-hover:scale-110 transition-transform duration-300'>
                    <Award className='w-8 h-8 text-purple-600' />
                  </div>
                  <h3 className='mb-3 font-bold text-gray-900 text-xl'>
                    Gamified Learning
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    Earn XP, unlock achievements, and climb leaderboards while
                    building knowledge that actually sticks.
                  </p>
                </div>
              </div>

              <div className='group relative'>
                <div className='absolute -inset-1 bg-gradient-to-r from-blue-300 to-green-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-300 blur'></div>
                <div className='relative bg-white/70 hover:bg-white hover:shadow-xl backdrop-blur-sm p-8 border border-blue-100 rounded-2xl transition-all hover:-translate-y-1 duration-300'>
                  <div className='inline-flex justify-center items-center bg-gradient-to-r from-blue-100 to-blue-200 mb-6 rounded-2xl w-16 h-16 group-hover:scale-110 transition-transform duration-300'>
                    <Brain className='w-8 h-8 text-blue-600' />
                  </div>
                  <h3 className='mb-3 font-bold text-gray-900 text-xl'>
                    Create & Share
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    Build custom quizzes with our intuitive editor and share
                    them with the community to test others&apos; knowledge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Featured Quizzes Section */}
        <section className='relative bg-gradient-to-br from-pink-50/50 via-white to-purple-50/30 py-16 md:py-24 lg:py-32 w-full overflow-hidden'>
          {/* Background Pattern */}
          <div className='absolute inset-0 opacity-5'>
            <div
              className='top-0 left-0 absolute w-full h-full'
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #ec4899 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            ></div>
          </div>

          <div className='relative mx-auto px-4 md:px-6 max-w-6xl container'>
            <div className='flex flex-col justify-center items-center space-y-6 mb-16 text-center'>
              <div className='space-y-4'>
                <div className='inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 border border-pink-200/50 rounded-full font-medium text-pink-600 text-sm'>
                  <TrendingUp className='mr-2 w-4 h-4' />
                  Featured Quizzes
                </div>
                <h2 className='bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 font-bold text-transparent text-4xl md:text-5xl tracking-tight'>
                  Trending Now
                </h2>
                <p className='max-w-[700px] text-gray-600 text-lg md:text-xl leading-relaxed'>
                  Join thousands taking these popular quizzes. Challenge
                  yourself and see how you rank against the community.
                </p>
              </div>
            </div>
            <div className='mx-auto'>
              <FeaturedQuizzes />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
