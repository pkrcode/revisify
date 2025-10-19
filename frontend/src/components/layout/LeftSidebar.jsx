import { MessageSquarePlus, Upload, History, BookOpen } from 'lucide-react';

const LeftSidebar = ({ onNewChat, onUploadFiles, chats = [], onSelectChat, currentChatId }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="w-64 bg-gray-950 text-white flex flex-col h-screen border-r border-gray-800">
            {/* Logo */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    <span className="text-xl font-semibold">Revisify</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3 space-y-2 border-b border-gray-800">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span className="text-sm font-medium">New chat</span>
                </button>
                <button
                    onClick={onUploadFiles}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Upload files</span>
                </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-hidden">
                <div className="p-3 flex items-center gap-2 text-gray-400">
                    <History className="w-4 h-4" />
                    <span className="text-sm font-medium">Chat History</span>
                </div>
                <div className="overflow-y-auto h-[calc(100vh-240px)] px-2">
                    <div className="space-y-1">
                        {chats.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No chat history yet
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <button
                                    key={chat._id}
                                    onClick={() => onSelectChat(chat._id)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                                        currentChatId === chat._id
                                            ? 'bg-gray-800'
                                            : 'hover:bg-gray-800'
                                    }`}
                                >
                                    <div className="text-sm text-gray-200 truncate">
                                        {chat.title || `${chat.pdfs?.length || 0} PDF${chat.pdfs?.length !== 1 ? 's' : ''}`}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatDate(chat.createdAt)}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeftSidebar;
