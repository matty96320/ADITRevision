import { Quiz } from './components/Quiz';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            OECD TP Master 2022
          </h1>
          <p className="text-lg text-slate-600">
            Master the Transfer Pricing Guidelines with AI-generated questions.
          </p>
        </header>

        <main className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <Quiz />
        </main>

        <footer className="text-center text-slate-400 text-sm">
          <p>© 2025 OECD TP Master. Powered by Google Gemini.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
