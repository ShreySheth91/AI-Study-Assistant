// ============================================
// STUDY PLAN GENERATOR COMPONENT
// ============================================
//
// Takes the extracted content and number of days,
// calls Gemini API to generate a personalized study plan
//
// ============================================

import { useState } from 'react';
import { Calendar, Loader2, CheckCircle, BookOpen, Target, Clock } from 'lucide-react';
import { generateStudyPlan } from '../lib/gemini';
import { saveStudyPlan, updatePlanProgress } from '../lib/database';

const StudyPlanGenerator = ({ material, userId, onPlanGenerated }) => {
  const [days, setDays] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [error, setError] = useState('');
  const [completedDays, setCompletedDays] = useState({});

  // Generate study plan using Gemini
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // Call Gemini API to generate the plan
      const plan = await generateStudyPlan(material.content, days);
      setStudyPlan(plan);

      // Save to Firestore
      if (userId) {
        const planId = await saveStudyPlan(userId, material.id, plan);
        plan.id = planId;
      }

      onPlanGenerated?.(plan);
    } catch (err) {
      console.error('Failed to generate study plan:', err);
      setError('Failed to generate study plan. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle day completion
  const toggleDayComplete = async (dayNumber) => {
    const newStatus = !completedDays[dayNumber];
    setCompletedDays(prev => ({ ...prev, [dayNumber]: newStatus }));

    // Update in Firestore
    if (studyPlan?.id && userId) {
      await updatePlanProgress(studyPlan.id, dayNumber, newStatus);
    }
  };

  // If no plan yet, show the generator form
  if (!studyPlan) {
    return (
      <div className="bg-slate rounded-2xl p-6 border border-gray-800">
        <h2 className="font-display text-xl font-semibold mb-2 text-white">
          📅 Generate Study Plan
        </h2>
        <p className="text-gray-400 mb-6">
          Creating plan for: <span className="text-accent">{material.title}</span>
        </p>

        {/* Days Selection */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-3">
            How many days do you have to study?
          </label>
          <div className="flex gap-2 flex-wrap">
            {[3, 5, 7, 14, 21, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  days === d
                    ? 'bg-accent text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
          
          {/* Custom days input */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-gray-400 text-sm">Or enter custom:</span>
            <input
              type="number"
              min="1"
              max="90"
              value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(90, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-2 bg-midnight border border-gray-700 rounded-lg 
                         text-white text-center focus:border-accent focus:outline-none"
            />
            <span className="text-gray-400 text-sm">days</span>
          </div>
        </div>

        {/* Error Message */}
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
              Generating with AI...
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              Generate {days}-Day Study Plan
            </>
          )}
        </button>
      </div>
    );
  }

  // Display the generated study plan
  return (
    <div className="bg-slate rounded-2xl p-6 border border-gray-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            {studyPlan.title}
          </h2>
          <p className="text-gray-400">{studyPlan.overview}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-accent">
            {Object.values(completedDays).filter(Boolean).length}/{studyPlan.days?.length || 0}
          </div>
          <div className="text-sm text-gray-500">days completed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
        <div
          className="bg-accent h-2 rounded-full transition-all duration-500"
          style={{
            width: `${(Object.values(completedDays).filter(Boolean).length / (studyPlan.days?.length || 1)) * 100}%`
          }}
        />
      </div>

      {/* Days List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {studyPlan.days?.map((day) => (
          <div
            key={day.day}
            className={`p-4 rounded-xl border transition-all ${
              completedDays[day.day]
                ? 'bg-green-900/20 border-green-800'
                : 'bg-midnight border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleDayComplete(day.day)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    completedDays[day.day]
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-600 hover:border-accent'
                  }`}
                >
                  {completedDays[day.day] && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
                <div>
                  <h3 className="font-semibold text-white">Day {day.day}: {day.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4" />
                    {day.duration}
                  </div>
                </div>
              </div>
            </div>

            {/* Topics */}
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <BookOpen className="w-4 h-4" />
                Topics
              </div>
              <div className="flex flex-wrap gap-2">
                {day.topics?.map((topic, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Objectives */}
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Target className="w-4 h-4" />
                Objectives
              </div>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {day.objectives?.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>

            {/* Activities */}
            <div>
              <div className="text-sm text-gray-400 mb-2">Activities</div>
              <ul className="text-sm text-gray-300 space-y-1">
                {day.activities?.map((activity, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Study Tips */}
      {studyPlan.tips && studyPlan.tips.length > 0 && (
        <div className="mt-6 p-4 bg-accent/10 rounded-xl border border-accent/30">
          <h4 className="font-semibold text-accent mb-2">💡 Study Tips</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            {studyPlan.tips.map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={() => setStudyPlan(null)}
        className="mt-6 w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 
                   rounded-lg transition-colors text-sm"
      >
        Generate New Plan
      </button>
    </div>
  );
};

export default StudyPlanGenerator;
