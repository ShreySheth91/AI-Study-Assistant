// ============================================
// MAIN APP COMPONENT
// ============================================
//
// AI Study Assistant - GDG Workshop Project
// 
// Features:
// - PDF/Text upload with content extraction
// - AI-powered study plan generation (Gemini)
// - Interactive quiz generation and taking
// - Firebase anonymous auth + Firestore storage
//
// ============================================

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInAnon } from './lib/firebase';
import { saveMaterial } from './lib/database';
import FileUpload from './components/FileUpload';
import StudyPlanGenerator from './components/StudyPlanGenerator';
import QuizGenerator from './components/QuizGenerator';
import { 
  BookOpen, Calendar, Brain, Sparkles, 
  ArrowLeft, Loader2, Github 
} from 'lucide-react';

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App state
  const [step, setStep] = useState('upload'); // 'upload' | 'choose' | 'plan' | 'quiz'
  const [material, setMaterial] = useState(null);

  // Initialize anonymous auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setAuthLoading(false);
      } else {
        // Sign in anonymously
        signInAnon()
          .then((user) => {
            setUser(user);
            setAuthLoading(false);
          })
          .catch((error) => {
            console.error('Auth error:', error);
            setAuthLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle content ready from FileUpload
  const handleContentReady = async (content) => {
    // Save material to Firestore
    if (user) {
      try {
        const materialId = await saveMaterial(user.uid, content);
        setMaterial({ ...content, id: materialId });
      } catch (error) {
        console.error('Error saving material:', error);
        setMaterial(content);
      }
    } else {
      setMaterial(content);
    }
    setStep('choose');
  };

  // Go back to previous step
  const goBack = () => {
    if (step === 'choose') {
      setStep('upload');
      setMaterial(null);
    } else {
      setStep('choose');
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight">
      {/* Header */}
      <header className="border-b border-gray-800 bg-slate/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white">
                AI Study Assistant
              </h1>
              <p className="text-xs text-gray-500">Powered by Gemini</p>
            </div>
          </div>
          
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        {step !== 'upload' && (
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white 
                       transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {/* Step: Upload Material */}
        {step === 'upload' && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl font-bold text-white mb-4">
                Study Smarter with AI
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Upload your study material and let AI create personalized study plans 
                and quizzes to help you master any subject.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="bg-slate p-6 rounded-xl border border-gray-800 text-center">
                <BookOpen className="w-10 h-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Upload Material</h3>
                <p className="text-sm text-gray-400">
                  PDF files or paste text directly
                </p>
              </div>
              <div className="bg-slate p-6 rounded-xl border border-gray-800 text-center">
                <Calendar className="w-10 h-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Study Plans</h3>
                <p className="text-sm text-gray-400">
                  AI-generated plans for your timeline
                </p>
              </div>
              <div className="bg-slate p-6 rounded-xl border border-gray-800 text-center">
                <Brain className="w-10 h-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Smart Quizzes</h3>
                <p className="text-sm text-gray-400">
                  Test your knowledge with AI quizzes
                </p>
              </div>
            </div>

            {/* File Upload Component */}
            <FileUpload onContentReady={handleContentReady} />
          </div>
        )}

        {/* Step: Choose Action */}
        {step === 'choose' && material && (
          <div className="animate-fade-in">
            {/* Material Info */}
            <div className="bg-slate rounded-2xl p-6 border border-gray-800 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg mb-1">
                    {material.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {material.content.length.toLocaleString()} characters loaded
                  </p>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <h2 className="font-display text-2xl font-bold text-white mb-6">
              What would you like to do?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Study Plan Card */}
              <button
                onClick={() => setStep('plan')}
                className="bg-slate p-8 rounded-2xl border border-gray-800 text-left
                           hover:border-accent transition-all group"
              >
                <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-4
                               group-hover:bg-accent/30 transition-colors">
                  <Calendar className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">
                  Create Study Plan
                </h3>
                <p className="text-gray-400">
                  Generate a personalized day-by-day study schedule based on your 
                  available time and material complexity.
                </p>
              </button>

              {/* Quiz Card */}
              <button
                onClick={() => setStep('quiz')}
                className="bg-slate p-8 rounded-2xl border border-gray-800 text-left
                           hover:border-accent transition-all group"
              >
                <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-4
                               group-hover:bg-accent/30 transition-colors">
                  <Brain className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">
                  Take a Quiz
                </h3>
                <p className="text-gray-400">
                  Test your understanding with AI-generated questions including 
                  multiple choice, true/false, and short answer.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step: Study Plan */}
        {step === 'plan' && material && (
          <div className="animate-fade-in">
            <StudyPlanGenerator 
              material={material} 
              userId={user?.uid}
              onPlanGenerated={(plan) => console.log('Plan generated:', plan)}
            />
          </div>
        )}

        {/* Step: Quiz */}
        {step === 'quiz' && material && (
          <div className="animate-fade-in">
            <QuizGenerator 
              material={material} 
              userId={user?.uid}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-500 text-sm">
            Built with ❤️ at GDG Workshop • Powered by Google Gemini & Firebase
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
