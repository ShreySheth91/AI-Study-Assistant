// ============================================
// QUIZ GENERATOR COMPONENT
// ============================================
//
// Generates quizzes from study material using Gemini AI.
// Supports MCQ, True/False, and Short Answer questions.
// Tracks scores and provides explanations.
//
// ============================================

import { useState } from 'react';
import { 
  Brain, Loader2, CheckCircle, XCircle, 
  ChevronRight, RotateCcw, Trophy 
} from 'lucide-react';
import { generateQuiz } from '../lib/gemini';
import { saveQuiz, saveQuizResult } from '../lib/database';

const QuizGenerator = ({ material, userId }) => {
  const [numQuestions, setNumQuestions] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  // Generate quiz using Gemini
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const generatedQuiz = await generateQuiz(material.content, numQuestions);
      setQuiz(generatedQuiz);
      setAnswers({});
      setCurrentQuestion(0);
      setShowResults(false);

      // Save quiz to Firestore
      if (userId) {
        const quizId = await saveQuiz(userId, material.id, generatedQuiz);
        generatedQuiz.id = quizId;
      }
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      setError('Failed to generate quiz. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle answer selection
  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Submit quiz and show results
  const handleSubmit = async () => {
    setShowResults(true);

    // Calculate score
    const score = quiz.questions.reduce((acc, q) => {
      const userAnswer = answers[q.id];
      if (q.type === 'true-false') {
        return acc + (userAnswer === q.correctAnswer ? 1 : 0);
      } else if (q.type === 'mcq') {
        return acc + (userAnswer === q.correctAnswer ? 1 : 0);
      } else {
        // For short answer, check if key terms are included
        const keywords = q.correctAnswer.toLowerCase().split(' ');
        const userWords = (userAnswer || '').toLowerCase();
        const matches = keywords.filter(kw => userWords.includes(kw)).length;
        return acc + (matches >= keywords.length / 2 ? 1 : 0);
      }
    }, 0);

    // Save results to Firestore
    if (userId && quiz?.id) {
      await saveQuizResult(userId, quiz.id, {
        score,
        totalQuestions: quiz.questions.length,
        answers
      });
    }
  };

  // Reset quiz
  const resetQuiz = () => {
    setQuiz(null);
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
  };

  // Calculate score
  const calculateScore = () => {
    return quiz.questions.reduce((acc, q) => {
      const userAnswer = answers[q.id];
      if (q.type === 'true-false') {
        return acc + (userAnswer === q.correctAnswer ? 1 : 0);
      } else if (q.type === 'mcq') {
        return acc + (userAnswer === q.correctAnswer ? 1 : 0);
      } else {
        const keywords = q.correctAnswer.toLowerCase().split(' ');
        const userWords = (userAnswer || '').toLowerCase();
        const matches = keywords.filter(kw => userWords.includes(kw)).length;
        return acc + (matches >= keywords.length / 2 ? 1 : 0);
      }
    }, 0);
  };

  // If no quiz yet, show generator form
  if (!quiz) {
    return (
      <div className="bg-slate rounded-2xl p-6 border border-gray-800">
        <h2 className="font-display text-xl font-semibold mb-2 text-white">
          🧠 Generate Quiz
        </h2>
        <p className="text-gray-400 mb-6">
          Test your knowledge: <span className="text-accent">{material.title}</span>
        </p>

        {/* Number of questions */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-3">
            Number of questions
          </label>
          <div className="flex gap-2 flex-wrap">
            {[5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => setNumQuestions(n)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  numQuestions === n
                    ? 'bg-accent text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {n} questions
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 bg-accent hover:bg-accent-light disabled:bg-gray-700 
                     disabled:cursor-not-allowed text-white font-semibold rounded-lg 
                     transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Generate Quiz
            </>
          )}
        </button>
      </div>
    );
  }

  // Show results
  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <div className="bg-slate rounded-2xl p-6 border border-gray-800">
        {/* Score Header */}
        <div className="text-center mb-8">
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${
            percentage >= 70 ? 'text-yellow-500' : 'text-gray-500'
          }`} />
          <h2 className="font-display text-3xl font-bold text-white mb-2">
            {percentage >= 90 ? '🎉 Excellent!' :
             percentage >= 70 ? '👏 Great Job!' :
             percentage >= 50 ? '💪 Good Effort!' : '📚 Keep Studying!'}
          </h2>
          <div className="text-5xl font-bold text-accent mb-2">
            {score}/{quiz.questions.length}
          </div>
          <p className="text-gray-400">{percentage}% correct</p>
        </div>

        {/* Results List */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {quiz.questions.map((q, index) => {
            const userAnswer = answers[q.id];
            let isCorrect = false;

            if (q.type === 'true-false') {
              isCorrect = userAnswer === q.correctAnswer;
            } else if (q.type === 'mcq') {
              isCorrect = userAnswer === q.correctAnswer;
            } else {
              const keywords = q.correctAnswer.toLowerCase().split(' ');
              const userWords = (userAnswer || '').toLowerCase();
              const matches = keywords.filter(kw => userWords.includes(kw)).length;
              isCorrect = matches >= keywords.length / 2;
            }

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border ${
                  isCorrect
                    ? 'bg-green-900/20 border-green-800'
                    : 'bg-red-900/20 border-red-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2">
                      {index + 1}. {q.question}
                    </p>
                    <p className="text-sm text-gray-400">
                      Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                        {String(userAnswer) || '(no answer)'}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-gray-400">
                        Correct answer: <span className="text-green-400">{String(q.correctAnswer)}</span>
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2 italic">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Retry Button */}
        <button
          onClick={resetQuiz}
          className="mt-6 w-full py-3 bg-accent hover:bg-accent-light text-white 
                     font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Take Another Quiz
        </button>
      </div>
    );
  }

  // Quiz in progress - show current question
  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;

  return (
    <div className="bg-slate rounded-2xl p-6 border border-gray-800">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full uppercase">
          {question.type === 'mcq' ? 'Multiple Choice' :
           question.type === 'true-false' ? 'True/False' : 'Short Answer'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
        <div
          className="bg-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <h3 className="text-xl font-semibold text-white mb-6">
        {question.question}
      </h3>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {question.type === 'mcq' && question.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(question.id, option)}
            className={`w-full p-4 rounded-xl text-left transition-all border ${
              answers[question.id] === option
                ? 'bg-accent/20 border-accent text-white'
                : 'bg-midnight border-gray-700 text-gray-300 hover:border-gray-600'
            }`}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full 
                           bg-gray-800 text-sm mr-3">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </button>
        ))}

        {question.type === 'true-false' && (
          <>
            <button
              onClick={() => handleAnswer(question.id, true)}
              className={`w-full p-4 rounded-xl text-left transition-all border ${
                answers[question.id] === true
                  ? 'bg-green-900/30 border-green-700 text-white'
                  : 'bg-midnight border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <CheckCircle className="inline w-5 h-5 mr-2 text-green-500" />
              True
            </button>
            <button
              onClick={() => handleAnswer(question.id, false)}
              className={`w-full p-4 rounded-xl text-left transition-all border ${
                answers[question.id] === false
                  ? 'bg-red-900/30 border-red-700 text-white'
                  : 'bg-midnight border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <XCircle className="inline w-5 h-5 mr-2 text-red-500" />
              False
            </button>
          </>
        )}

        {question.type === 'short-answer' && (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-32 p-4 bg-midnight border border-gray-700 rounded-xl 
                       text-white placeholder-gray-500 focus:border-accent focus:outline-none
                       resize-none"
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentQuestion > 0 && (
          <button
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 
                       rounded-lg transition-colors"
          >
            Previous
          </button>
        )}

        {currentQuestion < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            disabled={answers[question.id] === undefined}
            className="flex-1 py-3 bg-accent hover:bg-accent-light disabled:bg-gray-700
                       disabled:cursor-not-allowed text-white font-semibold rounded-lg 
                       transition-colors flex items-center justify-center gap-2"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < totalQuestions}
            className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700
                       disabled:cursor-not-allowed text-white font-semibold rounded-lg 
                       transition-colors"
          >
            Submit Quiz
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <p className="text-sm text-gray-500 mb-3">Jump to question:</p>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                currentQuestion === index
                  ? 'bg-accent text-white'
                  : answers[quiz.questions[index].id] !== undefined
                  ? 'bg-green-900/30 text-green-400 border border-green-800'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;
