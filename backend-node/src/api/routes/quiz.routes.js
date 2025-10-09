import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
    generateQuizController,
    submitQuizController,
    getQuizAttemptsForChatController,
    getQuizAttemptDetailsController
} from '../controllers/quiz.controller.js';

const router = Router();

// All routes in this file are protected and require authentication
router.use(protect);

/**
 * @route   POST /api/v1/quizzes/generate/:chatId
 * @desc    Generate a new quiz for a specific chat session
 * @access  Private
 */
router.post('/generate/:chatId', generateQuizController);

/**
 * @route   POST /api/v1/quizzes/submit/:quizId
 * @desc    Submit answers for a quiz to be graded
 * @access  Private
 */
router.post('/submit/:quizId', submitQuizController);

/**
 * @route   GET /api/v1/quizzes/attempts/chat/:chatId
 * @desc    Get all quiz attempt summaries for a chat
 * @access  Private
 */
router.get('/attempts/chat/:chatId', getQuizAttemptsForChatController);

/**
 * @route   GET /api/v1/quizzes/attempts/:attemptId
 * @desc    Get the full details of a specific quiz attempt
 * @access  Private
 */
router.get('/attempts/:attemptId', getQuizAttemptDetailsController);

export default router;
