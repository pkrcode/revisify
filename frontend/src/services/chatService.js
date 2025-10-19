import API_BASE_URL, { getAuthToken, apiRequest } from './apiConfig.js';
import { withRetry } from './retry.js';

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
  
  console.log('[chatService] getMessagesForChat status:', response.status);
  
  if (!response.ok) {
    let errorMsg = 'Failed to fetch messages';
    try {
      const errorData = await response.json();
      console.log('[chatService] getMessagesForChat error data:', errorData);
      errorMsg = errorData.message || errorMsg;
    } catch (_) {
      errorMsg = await response.text() || errorMsg;
      console.log('[chatService] getMessagesForChat error text:', errorMsg);
    }
    throw new Error(errorMsg);
  }
  
  const data = await response.json();
  console.log('[chatService] getMessagesForChat raw data:', data);
  console.log('[chatService] getMessagesForChat data is array?', Array.isArray(data));
  console.log('[chatService] getMessagesForChat data length:', Array.isArray(data) ? data.length : 'N/A');
  const result = Array.isArray(data) ? data : [];
  console.log('[chatService] getMessagesForChat returning:', result);
  return result;
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

  return withRetry(async () => {
    console.log('[chatService] createMessage called with:', { chatId, text });
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Backend expects { content: string }
      body: JSON.stringify({ content: text }),
    });
    console.log('[chatService] createMessage response status:', response.status);
    if (!response.ok) {
      let message = 'Failed to get response from AI service.';
      try {
        // Streaming responses might still have a text body on error
        const text = await response.text();
        console.log('[chatService] createMessage error body:', text);
        message = text || message;
      } catch (_) {}
      const err = new Error(message);
      err.status = response.status;
      throw err;
    }
    try { await response.text(); } catch (_) {}
    console.log('[chatService] createMessage succeeded');
    return true;
  });
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

/**
 * Delete a chat session
 * @route DELETE /api/v1/chats/:chatId
 * @access Private
 * @param {string} chatId - Chat ID to delete
 */
export const deleteChat = async (chatId) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete chat');
  }
  
  return { success: true };
};
