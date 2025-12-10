// ============================================
// FIRESTORE DATABASE OPERATIONS
// ============================================
//
// All database operations for storing and retrieving:
// - Study materials
// - Generated study plans
// - Quizzes and quiz results
//
// ============================================

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// STUDY MATERIALS
// ============================================

/**
 * Save uploaded study material
 */
export const saveMaterial = async (userId, material) => {
  try {
    const docRef = await addDoc(collection(db, 'materials'), {
      userId,
      title: material.title,
      content: material.content,
      contentPreview: material.content.substring(0, 500), // First 500 chars for preview
      createdAt: serverTimestamp()
    });
    console.log('✅ Material saved:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving material:', error);
    throw error;
  }
};

/**
 * Get all materials for a user
 */
export const getUserMaterials = async (userId) => {
  try {
    const q = query(
      collection(db, 'materials'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error fetching materials:', error);
    throw error;
  }
};

// ============================================
// STUDY PLANS
// ============================================

/**
 * Save a generated study plan
 */
export const saveStudyPlan = async (userId, materialId, plan) => {
  try {
    const docRef = await addDoc(collection(db, 'studyPlans'), {
      userId,
      materialId,
      ...plan,
      progress: {}, // Track completed days
      createdAt: serverTimestamp()
    });
    console.log('✅ Study plan saved:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving study plan:', error);
    throw error;
  }
};

/**
 * Get all study plans for a user
 */
export const getUserStudyPlans = async (userId) => {
  try {
    const q = query(
      collection(db, 'studyPlans'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error fetching study plans:', error);
    throw error;
  }
};

/**
 * Update study plan progress
 */
export const updatePlanProgress = async (planId, dayNumber, completed) => {
  try {
    const planRef = doc(db, 'studyPlans', planId);
    await updateDoc(planRef, {
      [`progress.day${dayNumber}`]: completed
    });
    console.log(`✅ Day ${dayNumber} marked as ${completed ? 'complete' : 'incomplete'}`);
  } catch (error) {
    console.error('❌ Error updating progress:', error);
    throw error;
  }
};

// ============================================
// QUIZZES
// ============================================

/**
 * Save a generated quiz
 */
export const saveQuiz = async (userId, materialId, quiz) => {
  try {
    const docRef = await addDoc(collection(db, 'quizzes'), {
      userId,
      materialId,
      ...quiz,
      createdAt: serverTimestamp()
    });
    console.log('✅ Quiz saved:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving quiz:', error);
    throw error;
  }
};

/**
 * Get all quizzes for a user
 */
export const getUserQuizzes = async (userId) => {
  try {
    const q = query(
      collection(db, 'quizzes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error fetching quizzes:', error);
    throw error;
  }
};

/**
 * Save quiz results
 */
export const saveQuizResult = async (userId, quizId, result) => {
  try {
    const docRef = await addDoc(collection(db, 'quizResults'), {
      userId,
      quizId,
      score: result.score,
      totalQuestions: result.totalQuestions,
      answers: result.answers,
      completedAt: serverTimestamp()
    });
    console.log('✅ Quiz result saved:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving quiz result:', error);
    throw error;
  }
};

/**
 * Get quiz results for a user
 */
export const getUserQuizResults = async (userId) => {
  try {
    const q = query(
      collection(db, 'quizResults'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error fetching quiz results:', error);
    throw error;
  }
};
