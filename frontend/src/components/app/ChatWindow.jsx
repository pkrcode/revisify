import { useState, useEffect, useRef } from 'react';
import { getMessagesForChat, createMessage } from '../../services/chatService';

const ChatWindow = ({ chatId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Fetch messages when chatId changes
    useEffect(() => {
        if (chatId) {
            fetchMessages();
        }
    }, [chatId]);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getMessagesForChat(chatId);
            setMessages(response.messages || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !chatId) return;

        const userMessage = input.trim();
        setInput('');

        // Optimistically add user message to UI
        const tempUserMsg = {
            _id: Date.now(),
            role: 'user',
            content: userMessage,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            setSending(true);
            setError(null);
            const response = await createMessage(chatId, userMessage);
            
            // Replace temp messages with actual messages from backend
            setMessages(response.messages || []);
        } catch (err) {
            setError(err.message);
            console.error('Error sending message:', err);
            // Remove the optimistic message on error
            setMessages(prev => prev.filter(msg => msg._id !== tempUserMsg._id));
        } finally {
            setSending(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!chatId) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-center">
                    Select files to start a chat
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="flex-grow p-4 overflow-y-auto">
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500">
                        Start chatting with your documents. Ask questions and get AI-powered answers!
                    </p>
                ) : (
                    <>
                        {messages.map((msg, index) => (
                            <div
                                key={msg._id || index}
                                className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'
                                    }`}
                            >
                                <div
                                    className={`inline-block p-3 rounded-lg max-w-[75%] ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-900'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                                        }`}>
                                        {formatTimestamp(msg.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !sending && handleSend()}
                        disabled={sending}
                        className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        placeholder="Type your message..."
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {sending ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
