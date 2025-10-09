import API_BASE_URL, { getAuthToken, apiRequest } from './apiConfig.js';

/**
 * Create a new chat session with selected PDFs
 * @route POST /api/v1/chats
 * @access Private
 * @param {Array<string>} pdfIds - Array of PDF IDs to include in the chat
 */
export const createChat = async (pdfIds) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pdfIds }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create chat');
  }
  
  const data = await response.json();
  return data;
};

/**
 * Get all chats for the logged-in user
 * @route GET /api/v1/chats
 * @access Private
 */
export const getUserChats = async () => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch chats');
  }
  
  const data = await response.json();
  return data;
};

/**
 * Get all messages for a specific chat
 * @route GET /api/v1/chats/:chatId/messages
 * @access Private
 * @param {string} chatId - Chat ID
 */
export const getMessagesForChat = async (chatId) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch messages');
  }
  
  const data = await response.json();
  return data;
};

/**
 * Create a new message in a chat and get an AI response
 * @route POST /api/v1/chats/:chatId/messages
 * @access Private
 * @param {string} chatId - Chat ID
 * @param {string} text - Message text
 */
export const createMessage = async (chatId, text) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send message');
  }
  
  const data = await response.json();
  return data;
};

/**
 * Get chat details including PDFs
 * @route GET /api/v1/chats/:chatId/details
 * @access Private
 * @param {string} chatId - Chat ID
 */
export const getChatDetails = async (chatId) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/details`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch chat details');
  }
  
  const data = await response.json();
  return data;
};
