import API_BASE_URL, { getAuthToken } from './apiConfig.js';

/**
 * Generate a new quiz for a specific chat session
 * @route POST /api/v1/quizzes/generate/:chatId
 * @access Private
 * @param {string} chatId - Chat ID
 */
export const generateQuiz = async (chatId) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/quizzes/generate/${chatId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate quiz');
  }
  
  const data = await response.json();
  return data;
};

/**
 * Submit answers for a quiz to be graded
 * @route POST /api/v1/quizzes/submit/:quizId
 * @access Private
 * @param {string} quizId - Quiz ID
 * @param {Array<Object>} answers - Array of answers with questionId and selectedOption
 */
export const submitQuiz = async (quizId, answers) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/quizzes/submit/${quizId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit quiz');
  }
  
  const data = await response.json();
  return data;
};

/**
 * Get all quiz attempt summaries for a chat
 * @route GET /api/v1/quizzes/attempts/chat/:chatId
 * @access Private
 * @param {string} chatId - Chat ID
 */
export const getQuizAttemptsForChat = async (chatId) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/quizzes/attempts/chat/${chatId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch quiz attempts');
  }
  
  const data = await response.json();
  return data;
};

/**
 * Get the full details of a specific quiz attempt
 * @route GET /api/v1/quizzes/attempts/:attemptId
 * @access Private
 * @param {string} attemptId - Attempt ID
 */
export const getQuizAttemptDetails = async (attemptId) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/quizzes/attempts/${attemptId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch quiz attempt details');
  }
  
  const data = await response.json();
  return data;
};
