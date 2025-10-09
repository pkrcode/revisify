import { useState } from 'react';
import ChatWindow from '../components/app/ChatWindow';
import FileList from '../components/app/FileList';
import LeftSidebar from '../components/layout/LeftSidebar';
import RightSidebar from '../components/layout/RightSidebar';
import QuizPage from './QuizPage';

const MainPage = ({ user, onLogout }) => {
    const [view, setView] = useState('file-select'); // 'file-select', 'chat', or 'quiz'
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleNewChat = () => {
        setView('file-select');
        setSelectedFiles([]);
    };

    const handleFileSelectDone = () => {
        if (selectedFiles.length > 0) {
            setView('chat');
        }
    };

    const handleStartQuiz = () => {
        setView('quiz');
    };

    const handleBackToChat = () => {
        setView('chat');
    };

    // Dummy file upload handler
    const handleUpload = () => {
        alert('File upload functionality not implemented yet.');
    };

    const renderContent = () => {
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
                return <ChatWindow files={selectedFiles} onStartQuiz={handleStartQuiz} />;
            case 'quiz':
                return <QuizPage onBackToChat={handleBackToChat} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <LeftSidebar onNewChat={handleNewChat} onUpload={handleUpload} />
            <main className="flex-1 p-6">{renderContent()}</main>
            <div className="w-px bg-gray-300" />
            <RightSidebar user={user} onLogout={onLogout} />
        </div>
    );
};

export default MainPage;
