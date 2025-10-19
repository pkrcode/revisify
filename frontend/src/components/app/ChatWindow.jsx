import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Trash2 } from 'lucide-react';
import { getMessagesForChat, createMessage, deleteChat } from '../../services/chatService';
import { generateQuiz } from '../../services/quizService';
import FullscreenQuiz from './FullscreenQuiz';

const ChatWindow = ({ chatId, pdfsReady = true, onChatDeleted = () => {} }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [waitingForAi, setWaitingForAi] = useState(false);
    const [waitingMessage, setWaitingMessage] = useState('');
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);

    useEffect(() => {
        console.log('[ChatWindow] Component mounted/updated - pdfsReady:', pdfsReady, 'chatId:', chatId);
    }, [pdfsReady, chatId]);

    useEffect(() => {
        if (chatId) {
            fetchMessages();
        }
    }, [chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const normalizeMessages = (msgs) => {
        return (Array.isArray(msgs) ? msgs : []).map(m => ({
            ...m,
            // Backend uses `sender` ('user' | 'assistant'); UI expects `role`
            role: m.role || m.sender || 'assistant',
            createdAt: m.createdAt || m.updatedAt || new Date().toISOString(),
        }));
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getMessagesForChat(chatId);
            console.log('[ChatWindow] fetchMessages raw response:', response);
            console.log('[ChatWindow] fetchMessages response type:', typeof response);
            console.log('[ChatWindow] fetchMessages response is array:', Array.isArray(response));
            const normalized = normalizeMessages(response);
            console.log('[ChatWindow] normalized messages:', normalized);
            setMessages(normalized);
        } catch (err) {
            setError(err.message);
            console.error('[ChatWindow] Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const pollForAssistantReply = async (timeoutMs = 30000, intervalMs = 3000) => {
        const start = Date.now();
        let lastCount = messages.length;
        console.log('[ChatWindow] Starting poll for assistant reply, initial message count:', lastCount);
        while (Date.now() - start < timeoutMs) {
            try {
                const msgs = await getMessagesForChat(chatId);
                const normalized = normalizeMessages(msgs);
                console.log('[ChatWindow] Poll check - message count:', normalized.length, 'previous:', lastCount);
                
                if (normalized.length > lastCount) {
                    console.log('[ChatWindow] Found new messages! Setting and returning true');
                    setMessages(normalized);
                    return true;
                }
                
                const hasAssistant = normalized.some(m => m.role === 'assistant' && new Date(m.createdAt).getTime() >= start);
                if (hasAssistant) {
                    console.log('[ChatWindow] Found assistant message! Setting and returning true');
                    setMessages(normalized);
                    return true;
                }
            } catch (err) {
                console.log('[ChatWindow] Poll fetch error (ignored):', err.message);
                // ignore transient fetch issues during polling
            }
            await new Promise(r => setTimeout(r, intervalMs));
        }
        console.log('[ChatWindow] Poll timeout - no new messages found');
        return false;
    };

    const handleSend = async () => {
        if (!input.trim() || !chatId) return;

        const userMessage = input.trim();
        setInput('');

        const tempUserMsg = {
            _id: Date.now(),
            role: 'user',
            sender: 'user',
            content: userMessage,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            setSending(true);
            setError(null);
            console.log('[ChatWindow] Sending message:', userMessage);
            await createMessage(chatId, userMessage);
            console.log('[ChatWindow] Message sent, polling for AI response...');
            
            // Show waiting indicator
            setWaitingForAi(true);
            setWaitingMessage('Waiting for AI response... This may take a moment.');
            
            // Poll for AI response with longer timeout (60 seconds)
            const found = await pollForAssistantReply(60000, 2000);
            
            if (!found) {
                setError('Response timed out. The backend might be processing. Please refresh the page or try again.');
                console.warn('[ChatWindow] Poll timeout - no AI response received within 60 seconds');
            } else {
                console.log('[ChatWindow] AI response received and loaded');
            }
        } catch (err) {
            console.error('[ChatWindow] Error sending message:', err);
            setError(`Failed to send message: ${err.message}`);
            // Remove temp message since it failed
            setMessages(prev => prev.filter(msg => msg._id !== tempUserMsg._id));
        } finally {
            setSending(false);
            setWaitingForAi(false);
            setWaitingMessage('');
        }
    };

    const handleGenerateQuiz = async () => {
        try {
            setIsGeneratingQuiz(true);
            setError(null);
            const response = await generateQuiz(chatId);
            setCurrentQuiz(response);
            setShowQuiz(true);
        } catch (err) {
            console.error('Error generating quiz:', err);
            // Display waiting and retry in background for a bit
            setWaitingForAi(true);
            setWaitingMessage('Preparing quiz... this may take a moment');
            let quiz = null;
            const start = Date.now();
            while (!quiz && Date.now() - start < 45000) {
                try {
                    // try generate again (frontend only; backend unchanged)
                    quiz = await generateQuiz(chatId);
                } catch (_) {
                    await new Promise(r => setTimeout(r, 3000));
                }
            }
            setWaitingForAi(false);
            setWaitingMessage('');
            if (quiz) {
                setCurrentQuiz(quiz);
                setShowQuiz(true);
            } else {
                setError(err.message);
            }
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    const handleDeleteChat = async () => {
        if (!window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
            return;
        }
        try {
            console.log('[ChatWindow] Deleting chat:', chatId);
            await deleteChat(chatId);
            console.log('[ChatWindow] Chat deleted successfully');
            onChatDeleted();
        } catch (err) {
            console.error('[ChatWindow] Error deleting chat:', err);
            setError(`Failed to delete chat: ${err.message}`);
        }
    };

    const handleQuizExit = () => {
        setShowQuiz(false);
        setCurrentQuiz(null);
    };

    const handleQuizSubmit = () => {
        setShowQuiz(false);
        setCurrentQuiz(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!chatId) {
        return (
            <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100">
                <div className="text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Select files to start a chat</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 mx-auto text-gray-800 mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-700">Loading messages...</p>
                </div>
            </div>
        );
    }

    if (showQuiz && currentQuiz) {
        return <FullscreenQuiz quiz={currentQuiz} onExit={handleQuizExit} onSubmitComplete={handleQuizSubmit} />;
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100">
            {/* Header with Delete Button */}
            <div className="border-b border-gray-200 px-6 py-3 flex justify-between items-center bg-white/40 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
                <button
                    onClick={handleDeleteChat}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete this chat"
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                </button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>Start a conversation or generate a quiz!</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                        msg.role === 'user'
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-white/70 backdrop-blur-sm text-gray-900 border border-gray-200'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    <span
                                        className={`text-xs mt-2 block ${
                                            msg.role === 'user' ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                    >
                                        {formatTimestamp(msg.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {error && (
                <div className="mx-6 mb-2 p-3 bg-red-100/70 border border-red-300 text-red-800 rounded-lg text-sm backdrop-blur-sm">
                    {error}
                </div>
            )}
            {waitingForAi && (
                <div className="mx-6 mb-2 p-3 bg-gray-100/70 border border-gray-300 text-gray-800 rounded-lg text-sm flex items-center gap-2 backdrop-blur-sm">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0c-5.523 0-10 4.477-10 10h2z"></path>
                    </svg>
                    <span>{waitingMessage || 'Waiting for AI response...'}</span>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white/40 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto space-y-2">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask a question about your study materials..."
                                className="w-full min-h-[60px] max-h-[200px] resize-none border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                                disabled={sending || !pdfsReady}
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || sending || !pdfsReady || waitingForAi}
                            className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white p-3 rounded-lg transition-colors disabled:cursor-not-allowed shrink-0 h-fit"
                            title={!pdfsReady ? 'PDFs are still processing. Please wait.' : 'Send message'}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={handleGenerateQuiz}
                        disabled={isGeneratingQuiz || waitingForAi || !pdfsReady}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-400 text-gray-800 hover:bg-gray-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!pdfsReady ? 'PDFs are still processing. Please wait.' : 'Generate Quiz'}
                    >
                        <Sparkles className="w-4 h-4" />
                        {isGeneratingQuiz || waitingForAi ? 'Generating Quiz...' : 'Generate Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
