// ============================================
// GEMINI AI CONFIGURATION
// ============================================
//
// WORKSHOP SETUP INSTRUCTIONS:
// 1. Go to https://aistudio.google.com/app/apikey
// 2. Create an API key
// 3. Replace YOUR_GEMINI_API_KEY below
//
// NOTE: In production, NEVER expose API keys in frontend code!
// Use a backend/serverless function instead. For workshop purposes,
// we're keeping it simple.
//
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai';

// TODO: Replace with your Gemini API key
const API_KEY = '';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the Gemini model
// Using gemini-2.0-flash which is the current fast model
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// ============================================
// STUDY PLAN GENERATION
// ============================================
export const generateStudyPlan = async (content, numberOfDays) => {
  // Truncate content if too long (Gemini has token limits)
  const truncatedContent = content.length > 15000
    ? content.substring(0, 15000) + '\n\n[Content truncated...]'
    : content;

  const prompt = `
You are an expert study planner. Based on the following study material, create a detailed study plan for ${numberOfDays} days.

STUDY MATERIAL:
${truncatedContent}

Please create a study plan in the following JSON format:
{
  "title": "Study Plan Title",
  "overview": "Brief overview of what will be covered",
  "days": [
    {
      "day": 1,
      "title": "Day 1 Title",
      "topics": ["Topic 1", "Topic 2"],
      "objectives": ["Objective 1", "Objective 2"],
      "activities": ["Activity 1", "Activity 2"],
      "duration": "2-3 hours"
    }
  ],
  "tips": ["Study tip 1", "Study tip 2"]
}

Make the plan realistic and balanced. Include breaks and revision days if the duration allows.
Return ONLY valid JSON, no markdown or extra text.
`;

  try {
    console.log('🚀 Calling Gemini API for study plan...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini response received');

    // Parse the JSON response
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('❌ Error generating study plan:', error);
    throw error;
  }
};

// ============================================
// QUIZ GENERATION
// ============================================
export const generateQuiz = async (content, numberOfQuestions = 10) => {
  // Truncate content if too long
  const truncatedContent = content.length > 15000
    ? content.substring(0, 15000) + '\n\n[Content truncated...]'
    : content;

  const prompt = `
You are an expert quiz creator. Based on the following study material, create a quiz with ${numberOfQuestions} questions.

STUDY MATERIAL:
${truncatedContent}

Create a mix of question types:
- Multiple Choice (MCQ)
- True/False
- Short Answer

Return the quiz in the following JSON format:
{
  "title": "Quiz Title",
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why this is correct"
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "Statement to evaluate",
      "correctAnswer": true,
      "explanation": "Why this is true/false"
    },
    {
      "id": 3,
      "type": "short-answer",
      "question": "Question requiring a short answer?",
      "correctAnswer": "Expected answer keywords",
      "explanation": "Full explanation"
    }
  ]
}

Make questions progressively harder. Test understanding, not just memorization.
Return ONLY valid JSON, no markdown or extra text.
`;

  try {
    console.log('🚀 Calling Gemini API for quiz...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini response received');

    // Parse the JSON response
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('❌ Error generating quiz:', error);
    throw error;
  }
};