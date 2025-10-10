import { useState, useEffect } from 'react';
import ChatWindow from '../components/app/ChatWindow';
import FileList from '../components/app/FileList';
import LeftSidebar from '../components/layout/LeftSidebar';
import RightSidebar from '../components/layout/RightSidebar';
import QuizPage from './QuizPage';
import { createChat, getUserChats, getChatDetails } from '../services/chatService';
import { getUserProfile } from '../services/userService';

const MainPage = ({ onLogout }) => {
    const [view, setView] = useState('file-select'); // 'file-select', 'chat', or 'quiz'
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [chats, setChats] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user profile and chats on mount
    useEffect(() => {
        fetchUserProfile();
        fetchChats();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const userData = await getUserProfile();
            setUser(userData); // Backend returns user data directly
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    };

    const fetchChats = async () => {
        try {
            const response = await getUserChats();
            setChats(response.chats || []);
        } catch (err) {
            console.error('Error fetching chats:', err);
        }
    };

    const handleNewChat = () => {
        setView('file-select');
        setSelectedFiles([]);
        setCurrentChatId(null);
    };

    const handleFileSelectDone = async () => {
        if (selectedFiles.length === 0) return;

        try {
            setLoading(true);
            setError(null);
            // Create a new chat with selected PDFs
            const response = await createChat(selectedFiles);
            setCurrentChatId(response.chat._id);
            setView('chat');
            // Refresh chats list
            await fetchChats();
        } catch (err) {
            setError(err.message);
            console.error('Error creating chat:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChat = async (chatId) => {
        try {
            setLoading(true);
            setCurrentChatId(chatId);
            // Optionally fetch chat details to get the PDFs
            const response = await getChatDetails(chatId);
            setSelectedFiles(response.chat.pdfs.map(pdf => pdf._id));
            setView('chat');
        } catch (err) {
            console.error('Error selecting chat:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = () => {
        setView('quiz');
    };

    const handleBackToChat = () => {
        setView('chat');
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Loading...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-6">
                    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                    <button
                        onClick={handleNewChat}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
                    >
                        Start New Chat
                    </button>
                </div>
            );
        }

        switch (view) {
            case 'file-select':
                return (
                    <FileList
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                        onDone={handleFileSelectDone}
                    />
                );
            case 'chat':
                return (
                    <div className="flex flex-col h-full">
                        <div className="mb-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Chat</h2>
                            <button
                                onClick={handleStartQuiz}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Take Quiz
                            </button>
                        </div>
                        <div className="flex-1 border rounded-lg overflow-hidden">
                            <ChatWindow chatId={currentChatId} />
                        </div>
                    </div>
                );
            case 'quiz':
                return <QuizPage onBackToChat={handleBackToChat} chatId={currentChatId} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <LeftSidebar
                onNewChat={handleNewChat}
                chats={chats}
                onSelectChat={handleSelectChat}
                currentChatId={currentChatId}
            />
            <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
            <div className="w-px bg-gray-300" />
            <RightSidebar user={user} onLogout={onLogout} />
        </div>
    );
};

export default MainPage;
