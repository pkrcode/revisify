import { useState } from 'react';
import { Award, Youtube, User, Loader2 } from 'lucide-react';

const RightSidebar = ({ user, onLogout, quizAttempts = [], youtubeRecommendations = [], onViewQuizAttempt, processingStatus }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <>
            <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-screen">
                {/* User Avatar Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                    <button
                        onClick={() => setIsProfileOpen(true)}
                        className="flex items-center gap-3 w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                            <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
                            <div className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</div>
                        </div>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden">
                    {/* Quiz History Section */}
                    <div className="border-b border-gray-200">
                        <div className="p-4 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="w-5 h-5 text-purple-600" />
                                <h2 className="font-semibold text-gray-900">Quiz History</h2>
                            </div>
                        </div>

                        <div className="overflow-y-auto h-[calc(40vh-80px)]">
                            <div className="p-4 space-y-3">
                                {quizAttempts.length === 0 ? (
                                    <div className="text-center py-6 bg-white rounded-lg border">
                                        <Award className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">No quizzes attempted yet</p>
                                    </div>
                                ) : (
                                    quizAttempts.map((attempt) => {
                                        const percentage = attempt.total_score 
                                            ? Math.round(attempt.total_score) 
                                            : 0;
                                        const isGood = percentage >= 70;

                                        return (
                                            <div
                                                key={attempt._id}
                                                onClick={() => onViewQuizAttempt(attempt._id)}
                                                className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-sm font-medium">Quiz Attempt</h3>
                                                    <span className={`text-xs px-2 py-1 rounded ${isGood ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                                        {percentage}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                                                    <span>Score: {percentage}%</span>
                                                    <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${isGood ? 'bg-green-500' : 'bg-orange-500'}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* YouTube Recommendations Section */}
                    <div className="border-t border-gray-200">
                        <div className="p-4 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                                <Youtube className="w-5 h-5 text-red-600" />
                                <h2 className="font-semibold text-gray-900">Recommended Videos</h2>
                            </div>
                        </div>

                        <div className="overflow-y-auto h-[calc(60vh-120px)]">
                            <div className="p-4 space-y-3">
                                {processingStatus?.isProcessing && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                        <div className="flex items-center gap-2 text-blue-700">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm font-medium">
                                                Processing PDFs ({processingStatus.ready}/{processingStatus.total})
                                            </span>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Video recommendations will appear as PDFs are processed...
                                        </p>
                                    </div>
                                )}
                                {youtubeRecommendations.length === 0 ? (
                                    <div className="text-center py-6 bg-white rounded-lg border">
                                        <Youtube className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">
                                            {processingStatus?.isProcessing 
                                                ? 'Processing PDFs to generate recommendations...' 
                                                : 'Select files to see recommendations'}
                                        </p>
                                    </div>
                                ) : (
                                    youtubeRecommendations.slice(0, 8).map((video, index) => (
                                        <a
                                            key={index}
                                            href={video.url || `https://www.youtube.com/watch?v=${video.videoId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block bg-white rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
                                        >
                                            <div className="relative aspect-video bg-gray-200">
                                                <img
                                                    src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/320x180/gray/white?text=Video';
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg opacity-90">
                                                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                                                    {video.duration || '0:00'}
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-2" title={video.title}>
                                                    {video.title}
                                                </p>
                                            </div>
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <button
                        onClick={onLogout}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            {/* Profile Modal */}
            {isProfileOpen && user && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsProfileOpen(false)}>
                    <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                            <User className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                        <p className="text-gray-600 mb-4">{user.email}</p>
                        <button
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default RightSidebar;
