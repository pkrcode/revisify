import { useState } from 'react';

const LeftSidebar = ({ onNewChat, onUpload }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div
            className={`bg-gray-800 text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-64'
                }`}
        >
         <div className="flex items-center justify-between p-4">
    {!isCollapsed && <h1 className="text-xl font-bold">Revisify</h1>}
    <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-md hover:bg-gray-700 cursor-pointer">
        {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        )}
    </button>
</div>
            <div className="flex-grow p-4 space-y-4">
                <button
                    onClick={onNewChat}
                    className={`w-full text-left bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded flex items-center ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${!isCollapsed ? 'mr-3' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {!isCollapsed && 'New chat'}
                </button>
                <button
                    onClick={onUpload}
                    className={`w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded flex items-center ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${!isCollapsed ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {!isCollapsed && 'Upload files'}
                </button>
            </div>
            <div className="p-4 border-t border-gray-700">
                {!isCollapsed && <h2 className="text-lg font-semibold">Chat History</h2>}
                <div className="mt-2 space-y-2">
                    {/* Placeholder for chat history items */}
                    <p className="text-gray-400 text-sm">{isCollapsed ? '...' : 'No recent chats.'}</p>
                </div>
            </div>
        </div>
    );
};

export default LeftSidebar;
