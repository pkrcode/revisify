import Chat from '../models/Chat.model.js';
import Message from '../models/Message.model.js';
import Pdf from '../models/Pdf.model.js';
import axios from 'axios';
import Quiz from '../models/Quiz.model.js'; // NEW: Import Quiz model
import QuizAttempt from '../models/QuizAttempt.model.js'; // NEW: Import QuizAttempt model

/**
 * @desc    Create a new chat session
 * @route   POST /api/v1/chats
 * @access  Private
 */
export const createChatController = async (req, res) => {
  const { pdfIds, title } = req.body;
  const userId = req.user.id;

  if (!pdfIds || !Array.isArray(pdfIds) || pdfIds.length === 0) {
    return res.status(400).json({ message: 'An array of pdfIds is required.' });
  }

  try {
    // Verify that all provided PDFs exist and belong to the user
    for (const pdfId of pdfIds) {
      const pdf = await Pdf.findOne({ _id: pdfId, owner: userId });
      if (!pdf) {
        return res.status(404).json({ message: `PDF with ID ${pdfId} not found or access denied.` });
      }
    }

    const newChat = new Chat({
      user: userId,
      pdfs: pdfIds,
      title: title || 'New Chat Session',
    });

    await newChat.save();

    res.status(201).json(newChat);
  } catch (error) {
    console.error('Create Chat Error:', error.message);
    res.status(500).json({ message: 'Server error while creating chat.' });
  }
};

/**
 * @desc    Get all chats for the logged-in user
 * @route   GET /api/v1/chats
 * @access  Private
 */
export const getUserChatsController = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    console.error('Get User Chats Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching chats.' });
  }
};

/**
 * @desc    Get all messages for a specific chat
 * @route   GET /api/v1/chats/:chatId/messages
 * @access  Private
 */
export const getMessagesForChatController = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    // First, verify the user has access to this chat
    const chat = await Chat.findOne({ _id: chatId, user: userId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied.' });
    }

    const messages = await Message.find({ chat: chatId }).sort({ createdAt: 'asc' });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Get Messages Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching messages.' });
  }
};


/**
 * @desc    Create a new message in a chat and get a streamed response from the AI
 * @route   POST /api/v1/chats/:chatId/messages
 * @access  Private
 */
export const createMessageController = async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ message: 'Message content is required.' });
  }

  try {
    // 1. Verify chat exists and user has access
    const chat = await Chat.findOne({ _id: chatId, user: userId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied.' });
    }

    // 2. Save the user's message to the database
    const userMessage = new Message({
      chat: chatId,
      user: userId,
      sender: 'user',
      content: content.trim(),
    });
    await userMessage.save();
    
    // 3. Update chat's title with the first user message if it's the default
    if (chat.title === 'New Chat Session' || chat.title === 'New Chat') {
        chat.title = content.trim().substring(0, 50); // Use first 50 chars as title
    }
    // Update the `updatedAt` timestamp to bring this chat to the top of the list
    chat.updatedAt = Date.now();
    await chat.save();

    // 4. Call the Python AI service with the query and context (PDF IDs)
    const aiServiceResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/v1/chat`,
      {
        query: content,
        pdfIds: chat.pdfs.map(id => id.toString()),
      },
      {
        responseType: 'stream', // This is crucial for handling the streamed response
      }
    );
    
    // 5. Stream the response directly to the client
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    aiServiceResponse.data.pipe(res);

    // 6. Concurrently, capture the full response to save it to the database
    let assistantResponseContent = '';
    const dataPromise = new Promise((resolve, reject) => {
        aiServiceResponse.data.on('data', chunk => {
            assistantResponseContent += chunk.toString('utf-8');
        });
        aiServiceResponse.data.on('end', resolve);
        aiServiceResponse.data.on('error', reject);
    });

    await dataPromise;

    // 7. Once the stream is finished, save the assistant's full message
    if (assistantResponseContent) {
      const assistantMessage = new Message({
        chat: chatId,
        user: userId,
        sender: 'assistant',
        content: assistantResponseContent.trim(),
      });
      await assistantMessage.save();
    }

  } catch (error) {
    console.error('Create Message Error:', error.response ? error.response.data : error.message);
    // Important: Don't try to send another response if the stream has already started
    if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to get response from AI service.' });
    }
  }
};

/**
 * @desc    Get all details for a chat session (PDFs, recommendations, quiz history).
 * @route   GET /api/v1/chats/:chatId/details
 * @access  Private
 */
export const getChatDetailsController = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate('pdfs');

    // CORRECTED: Changed chat.owner to chat.user
    if (!chat || chat.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Chat not found.' });
    }

    const quizzes = await Quiz.find({ chat: req.params.chatId }).select('_id');
    const quizIds = quizzes.map(q => q._id);

    const quizAttempts = await QuizAttempt.find({ 
      quiz: { $in: quizIds },
      user: req.user.id 
    }).sort({ createdAt: -1 });
    
    const response = {
      pdfs: chat.pdfs,
      quizHistory: quizAttempts.map(attempt => ({
        attemptId: attempt._id,
        score: attempt.totalScore,
        totalQuestions: attempt.answeredQuestions.length,
        date: attempt.createdAt,
      })),
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Get Chat Details Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching chat details.' });
  }
};