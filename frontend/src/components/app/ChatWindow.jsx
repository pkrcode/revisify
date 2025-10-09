import { useState } from 'react';

const ChatWindow = ({ files }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            setMessages([...messages, { text: input, sender: 'user' }]);
            setInput('');
            // Here you would typically send the message to the backend
            // and receive a response. For now, we'll just clear the input.
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500">
                        Chat with the files you selected.
                    </p>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-2 my-2 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-100 ml-auto' : 'bg-gray-200'
                                }`}
                            style={{ maxWidth: '75%' }}
                        >
                            {msg.text}
                        </div>
                    ))
                )}
            </div>
            <div className="p-4 flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none"
                    placeholder="Type your message..."
                />
                <button
                    onClick={handleSend}
                    className="px-6 h-full bg-indigo-600 text-white rounded-r-md"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
