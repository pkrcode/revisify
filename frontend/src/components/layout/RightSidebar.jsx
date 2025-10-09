import { useState } from 'react';

const ProfileModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <img
                className="h-24 w-24 rounded-full mx-auto mb-4"
                src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random&size=128`}
                alt="User avatar"
            />
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
                Close
            </button>
        </div>
    </div>
);

const RightSidebar = ({ user, onLogout }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <>
            <div className="bg-gray-100 flex flex-col w-64">
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className="text-xl font-bold ">Profile</h1>
                </div>
                <div className="flex-grow p-4">
                    <div
                        className="flex items-center space-x-4 cursor-pointer"
                        onClick={() => setIsProfileOpen(true)}
                    >
                        <img
                            className="h-12 w-12 rounded-full "
                            src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`}
                            alt="User avatar"
                        />
                        <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold">Quiz History</h2>
                        <div className="mt-2 space-y-2">
                            <p className="text-gray-600 text-sm">No quizzes attempted yet.</p>
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <button
                        onClick={onLogout}
                        className="w-full text-left bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
            {isProfileOpen && <ProfileModal user={user} onClose={() => setIsProfileOpen(false)} />}
        </>
    );
};

export default RightSidebar;
