import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import ChatWindow from '../components/app/ChatWindow';
import FileList from '../components/app/FileList';
import LeftSidebar from '../components/layout/LeftSidebar';
import RightSidebar from '../components/layout/RightSidebar';
import QuizPage from './QuizPage';
import UploadModal from '../components/app/UploadModal';
import QuizAttemptModal from '../components/app/QuizAttemptModal';
import { createChat, getUserChats, getChatDetails } from '../services/chatService';
import { getUserProfile } from '../services/userService';
import { getQuizAttemptDetails, getQuizAttemptsForChat } from '../services/quizService';

const MainPage = ({ onLogout }) => {
    const [view, setView] = useState('file-select'); // 'file-select', 'chat', or 'quiz'
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [chats, setChats] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState(null);
    const [quizAttempts, setQuizAttempts] = useState([]);
    const [youtubeRecommendations, setYoutubeRecommendations] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [currentChatDetails, setCurrentChatDetails] = useState(null);
    const [selectedAttemptId, setSelectedAttemptId] = useState(null);
    const [refreshFileList, setRefreshFileList] = useState(null);
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

    // Fetch user profile and chats on mount
    useEffect(() => {
        fetchUserProfile();
        fetchChats();
    }, []);

    // Fetch YouTube recommendations when current chat changes
    useEffect(() => {
        if (currentChatId && currentChatDetails) {
            fetchYoutubeRecommendations();
        } else {
            setYoutubeRecommendations([]);
        }
    }, [currentChatId, currentChatDetails]);

    // Poll for PDF processing updates
    useEffect(() => {
        if (!currentChatId || !currentChatDetails) return;

        // Check if any PDFs are still processing
        const hasProcessingPdfs = currentChatDetails.pdfs?.some(
            pdf => pdf.processingStatus === 'processing' || pdf.processingStatus === 'pending'
        );

        if (hasProcessingPdfs) {
            console.log('Some PDFs still processing, will refetch in 3 seconds...');
            const pollInterval = setInterval(async () => {
                try {
                    const updatedChatDetails = await getChatDetails(currentChatId);
                    setCurrentChatDetails(updatedChatDetails);
                    
                    // Check if all PDFs are now ready
                    const stillProcessing = updatedChatDetails.pdfs?.some(
                        pdf => pdf.processingStatus === 'processing' || pdf.processingStatus === 'pending'
                    );
                    
                    if (!stillProcessing) {
                        console.log('All PDFs processed! Clearing poll interval.');
                        clearInterval(pollInterval);
                    }
                } catch (err) {
                    console.error('Error polling for PDF updates:', err);
                }
            }, 3000); // Poll every 3 seconds

            // Clear interval on cleanup
            return () => clearInterval(pollInterval);
        }
    }, [currentChatId, currentChatDetails]);

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
            // Backend returns array directly, not wrapped in { chats: [] }
            setChats(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Error fetching chats:', err);
        }
    };

    const fetchQuizAttemptsForCurrentChat = async (chatId) => {
        if (!chatId) {
            setQuizAttempts([]);
            return;
        }
        
        try {
            const response = await getQuizAttemptsForChat(chatId);
            // Backend returns array directly, not wrapped in { attempts: [] }
            setQuizAttempts(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Error fetching quiz attempts:', err);
            setQuizAttempts([]);
        }
    };

    const fetchYoutubeRecommendations = () => {
        if (!currentChatDetails || !currentChatDetails.pdfs) {
            setYoutubeRecommendations([]);
            return;
        }

        // Collect all YouTube recommendations from all PDFs in the chat
        const recommendations = [];
        let totalPdfs = 0;
        let readyPdfs = 0;
        
        currentChatDetails.pdfs.forEach(pdf => {
            totalPdfs++;
            console.log(`[PDF ${totalPdfs}] ${pdf.filename}:`, {
                status: pdf.processingStatus,
                recommendationsCount: pdf.youtubeRecommendations?.length || 0
            });
            
            if (pdf.processingStatus === 'ready') {
                readyPdfs++;
            }
            
            if (pdf.youtubeRecommendations && Array.isArray(pdf.youtubeRecommendations)) {
                recommendations.push(...pdf.youtubeRecommendations);
            }
        });

        console.log(`Total YouTube recommendations collected: ${recommendations.length} from ${readyPdfs}/${totalPdfs} ready PDFs`);
        setYoutubeRecommendations(recommendations);
    };

    const handleViewQuizAttempt = async (attemptId) => {
        setSelectedAttemptId(attemptId);
    };

    const handleNewChat = () => {
        setView('file-select');
        setSelectedFiles([]);
        setCurrentChatId(null);
        setCurrentChatDetails(null);
    };

    const handleChatDeleted = () => {
        // After chat is deleted, go back to file select view
        setView('file-select');
        setSelectedFiles([]);
        setCurrentChatId(null);
        setCurrentChatDetails(null);
        // Refresh the chat list
        if (setRefreshChatList) setRefreshChatList(true);
    };

    const handleUploadFiles = () => {
        setIsUploadModalOpen(true);
    };

    const handleUploadSuccess = async () => {
        // Refresh the file list and chats after upload
        setIsUploadModalOpen(false);
        await fetchChats();
        // Refresh the file list if callback is available
        if (refreshFileList) {
            refreshFileList();
        }
    };

    const handleFileSelectDone = async () => {
        if (selectedFiles.length === 0) return;

        try {
            setLoading(true);
            setLoadingMessage('Creating chat session...');
            setError(null);
            
            // selectedFiles is already an array of PDF IDs (strings)
            // Create a new chat with selected PDFs
            const chat = await createChat(selectedFiles);
            // Backend returns chat object directly, not wrapped
            setCurrentChatId(chat._id);
            
            setLoadingMessage('Loading PDFs and processing content with AI...');
            // Fetch full chat details to get populated PDFs with YouTube recommendations
            const chatDetails = await getChatDetails(chat._id);
            setCurrentChatDetails(chatDetails);
            
            setView('chat');
            setLoadingMessage('Refreshing chat list...');
            // Refresh chats list
            await fetchChats();
            
            setLoadingMessage('Loading quiz history...');
            // Fetch quiz attempts for this chat
            await fetchQuizAttemptsForCurrentChat(chat._id);
        } catch (err) {
            setError(err.message || 'Failed to create chat. Please try again.');
            console.error('Error creating chat:', err);
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
    };

    const handleSelectChat = async (chatId) => {
        try {
            setLoading(true);
            setLoadingMessage('Loading chat details...');
            setCurrentChatId(chatId);
            // Fetch chat details to get the PDFs and their YouTube recommendations
            const chatDetails = await getChatDetails(chatId);
            // Backend returns { pdfs, quizHistory } directly
            setCurrentChatDetails(chatDetails);
            setSelectedFiles(chatDetails.pdfs.map(pdf => pdf._id));
            setView('chat');
            
            setLoadingMessage('Loading quiz attempts...');
            // Fetch quiz attempts for this chat
            await fetchQuizAttemptsForCurrentChat(chatId);
        } catch (err) {
            setError(err.message || 'Failed to load chat. Please try again.');
            console.error('Error selecting chat:', err);
        } finally {
            setLoading(false);
            setLoadingMessage('');
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
                <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100">
                    <div className="text-center">
                        <svg className="animate-spin h-12 w-12 mx-auto text-gray-800 mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-900 font-medium text-lg">{loadingMessage || 'Processing...'}</p>
                        <p className="text-gray-600 text-sm mt-2">Please wait, this may take a moment</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-8 flex items-center justify-center h-full bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100">
                    <div className="max-w-md w-full bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-300">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Error</h3>
                                <p className="text-gray-700">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleNewChat}
                            className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors"
                        >
                            Start New Chat
                        </button>
                    </div>
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
                        onRefresh={setRefreshFileList}
                    />
                );
            case 'chat':
                const pdfsReady = currentChatDetails?.pdfs?.every(pdf => pdf.processingStatus === 'ready') ?? false;
                console.log('[MainPage] Chat view - pdfsReady:', pdfsReady);
                console.log('[MainPage] Chat view - currentChatDetails.pdfs:', currentChatDetails?.pdfs);
                return (
                    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100">
                        <ChatWindow 
                            chatId={currentChatId}
                            pdfsReady={pdfsReady}
                            onChatDeleted={handleChatDeleted}
                        />
                    </div>
                );
            case 'quiz':
                return <QuizPage onBackToChat={handleBackToChat} chatId={currentChatId} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100 overflow-hidden">
            {/* Mobile Menu Buttons */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                    className="p-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-900 transition-colors"
                >
                    {leftSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
            
            <div className="lg:hidden fixed top-4 right-4 z-50">
                <button
                    onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                    className="p-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-900 transition-colors"
                >
                    {rightSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Left Sidebar - Desktop always visible, Mobile with overlay */}
            <div className={`
                fixed lg:relative inset-y-0 left-0 z-40
                transform transition-transform duration-300 ease-in-out
                ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <LeftSidebar
                    onNewChat={handleNewChat}
                    onUploadFiles={handleUploadFiles}
                    chats={chats}
                    onSelectChat={(chatId) => {
                        handleSelectChat(chatId);
                        setLeftSidebarOpen(false);
                    }}
                    currentChatId={currentChatId}
                />
            </div>

            {/* Mobile Overlay for Left Sidebar */}
            {leftSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setLeftSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto pt-16 lg:pt-0">{renderContent()}</main>

            {/* Right Sidebar - Desktop always visible, Mobile with overlay */}
            <div className={`
                fixed lg:relative inset-y-0 right-0 z-40
                transform transition-transform duration-300 ease-in-out
                ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                <RightSidebar
                    user={user}
                    onLogout={onLogout}
                    quizAttempts={quizAttempts}
                    youtubeRecommendations={youtubeRecommendations}
                    onViewQuizAttempt={handleViewQuizAttempt}
                    processingStatus={currentChatDetails?.pdfs ? {
                        isProcessing: currentChatDetails.pdfs.some(
                            pdf => pdf.processingStatus === 'processing' || pdf.processingStatus === 'pending'
                        ),
                        ready: currentChatDetails.pdfs.filter(pdf => pdf.processingStatus === 'ready').length,
                        total: currentChatDetails.pdfs.length
                    } : null}
                />
            </div>

            {/* Mobile Overlay for Right Sidebar */}
            {rightSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setRightSidebarOpen(false)}
                />
            )}

            {isUploadModalOpen && (
                <UploadModal
                    onClose={() => setIsUploadModalOpen(false)}
                    onUploadSuccess={handleUploadSuccess}
                />
            )}
            {selectedAttemptId && (
                <QuizAttemptModal
                    attemptId={selectedAttemptId}
                    onClose={() => setSelectedAttemptId(null)}
                />
            )}
        </div>
    );
};

export default MainPage;
