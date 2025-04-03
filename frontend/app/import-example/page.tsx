import QuizImportExample from "../components/quiz-import-example";

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen'>
      <main className='flex-1'>
        <section className='bg-pink-50 p-12 w-full'>
          <QuizImportExample />
        </section>
      </main>
    </div>
  );
}
