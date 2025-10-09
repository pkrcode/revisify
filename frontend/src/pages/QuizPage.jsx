
const QuizPage = ({ onBackToChat }) => {
    // Dummy quiz data
    const quiz = {
        title: 'History of Ancient Rome Quiz',
        questions: [
            {
                question: 'Who was the first emperor of Rome?',
                options: ['Julius Caesar', 'Augustus', 'Nero', 'Constantine'],
                answer: 'Augustus',
            },
            {
                question: 'What year did the Western Roman Empire fall?',
                options: ['476 AD', '1453 AD', '44 BC', '753 BC'],
                answer: '476 AD',
            },
            {
                question: 'The Punic Wars were fought between Rome and which other power?',
                options: ['Greece', 'Persia', 'Carthage', 'Egypt'],
                answer: 'Carthage',
            },
        ],
    };

    return (
        <div className="p-6">
            <button onClick={onBackToChat} className="mb-4 px-4 py-2 bg-gray-200 rounded-md">
                &larr; Back to Chat
            </button>
            <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
            <div className="space-y-8">
                {quiz.questions.map((q, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow">
                        <p className="font-semibold text-lg mb-4">
                            {index + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                            {q.options.map((option) => (
                                <label key={option} className="flex items-center space-x-3">
                                    <input type="radio" name={`question-${index}`} value={option} className="h-4 w-4" />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <button className="mt-8 w-full py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700">
                Submit Quiz
            </button>
        </div>
    );
};

export default QuizPage;
