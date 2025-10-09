import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createChatController,
  getUserChatsController,
  getMessagesForChatController,
  createMessageController,
  getChatDetailsController,
} from '../controllers/chat.controller.js';

const router = Router();

// Apply the authentication middleware to all routes in this file
router.use(protect);

/**
 * @route   POST /api/v1/chats
 * @desc    Create a new chat session with selected PDFs
 * @access  Private
 */
router.post('/', createChatController);

/**
 * @route   GET /api/v1/chats
 * @desc    Get all chats for the logged-in user
 * @access  Private
 */
router.get('/', getUserChatsController);

/**
 * @route   GET /api/v1/chats/:chatId/messages
 * @desc    Get all messages for a specific chat
 * @access  Private
 */
router.get('/:chatId/messages', getMessagesForChatController);

/**
 * @route   POST /api/v1/chats/:chatId/messages
 * @desc    Create a new message in a chat and get an AI response
 * @access  Private
 */
router.post('/:chatId/messages', createMessageController);

router.get('/:chatId/details', protect, getChatDetailsController);

export default router;
