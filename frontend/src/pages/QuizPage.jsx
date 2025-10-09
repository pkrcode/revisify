import { useState, useEffect } from 'react';
import { generateQuiz, submitQuiz, getQuizAttemptsForChat, getQuizAttemptDetails } from '../services/quizService';

const QuizPage = ({ onBackToChat, chatId }) => {
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [viewingAttempt, setViewingAttempt] = useState(null);
    const [showAttempts, setShowAttempts] = useState(false);

    useEffect(() => {
        if (chatId) {
            fetchQuizAttempts();
        }
    }, [chatId]);

    const fetchQuizAttempts = async () => {
        try {
            const response = await getQuizAttemptsForChat(chatId);
            setAttempts(response.attempts || []);
        } catch (err) {
            console.error('Error fetching quiz attempts:', err);
        }
    };

    const handleGenerateQuiz = async () => {
        try {
            setLoading(true);
            setError(null);
            setResult(null);
            setAnswers({});
            const response = await generateQuiz(chatId);
            setQuiz(response.quiz);
        } catch (err) {
            setError(err.message);
            console.error('Error generating quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, selectedOption) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const handleSubmitQuiz = async () => {
        if (!quiz) return;

        // Convert answers object to array format expected by backend
        const answersArray = quiz.questions.map(q => ({
            questionId: q._id,
            selectedOption: answers[q._id] || ''
        }));

        try {
            setSubmitting(true);
            setError(null);
            const response = await submitQuiz(quiz._id, answersArray);
            setResult(response.attempt);
            await fetchQuizAttempts(); // Refresh attempts list
        } catch (err) {
            setError(err.message);
            console.error('Error submitting quiz:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewAttempt = async (attemptId) => {
        try {
            setLoading(true);
            const response = await getQuizAttemptDetails(attemptId);
            setViewingAttempt(response.attempt);
            setShowAttempts(false);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching attempt details:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderAttemptsList = () => (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-bold mb-4">Previous Quiz Attempts</h2>
            {attempts.length === 0 ? (
                <p className="text-gray-500">No quiz attempts yet</p>
            ) : (
                <div className="space-y-3">
                    {attempts.map((attempt) => (
                        <div
                            key={attempt._id}
                            className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleViewAttempt(attempt._id)}
                        >
                            <div>
                                <p className="font-semibold">
                                    Score: {attempt.score}/{attempt.totalQuestions}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {new Date(attempt.submittedAt).toLocaleString()}
                                </p>
                            </div>
                            <button className="text-indigo-600 hover:underline">
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderAttemptDetails = () => {
        if (!viewingAttempt) return null;

        return (
            <div>
                <button
                    onClick={() => setViewingAttempt(null)}
                    className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                    &larr; Back to Attempts
                </button>
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
                    <p className="text-xl mb-4">
                        Score: <span className="font-bold text-indigo-600">
                            {viewingAttempt.score}/{viewingAttempt.totalQuestions}
                        </span> ({Math.round((viewingAttempt.score / viewingAttempt.totalQuestions) * 100)}%)
                    </p>
                    <p className="text-sm text-gray-500">
                        Submitted: {new Date(viewingAttempt.submittedAt).toLocaleString()}
                    </p>
                </div>
                <div className="space-y-6">
                    {viewingAttempt.responses.map((response, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-lg shadow ${response.isCorrect ? 'bg-green-50' : 'bg-red-50'
                                }`}
                        >
                            <p className="font-semibold text-lg mb-3">
                                {index + 1}. {response.questionText}
                            </p>
                            <div className="space-y-2 mb-3">
                                {response.options.map((option, optIdx) => (
                                    <div
                                        key={optIdx}
                                        className={`p-2 rounded ${option === response.correctAnswer
                                                ? 'bg-green-200 font-semibold'
                                                : option === response.userAnswer && !response.isCorrect
                                                    ? 'bg-red-200'
                                                    : 'bg-white'
                                            }`}
                                    >
                                        {option}
                                        {option === response.correctAnswer && ' ✓ (Correct)'}
                                        {option === response.userAnswer && !response.isCorrect && ' ✗ (Your answer)'}
                                    </div>
                                ))}
                            </div>
                            <p className={`font-semibold ${response.isCorrect ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {response.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderQuizResult = () => {
        if (!result) return null;

        return (
            <div>
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-2xl font-bold mb-2">Quiz Submitted!</h2>
                    <p className="text-xl mb-4">
                        Your Score: <span className="font-bold text-indigo-600">
                            {result.score}/{result.totalQuestions}
                        </span> ({Math.round((result.score / result.totalQuestions) * 100)}%)
                    </p>
                    <button
                        onClick={() => handleViewAttempt(result._id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        View Detailed Results
                    </button>
                </div>
            </div>
        );
    };

    if (!chatId) {
        return (
            <div className="p-6">
                <p className="text-center text-gray-500">Please select a chat to generate a quiz</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={onBackToChat}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                    &larr; Back to Chat
                </button>
                <div className="space-x-2">
                    <button
                        onClick={() => setShowAttempts(!showAttempts)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        {showAttempts ? 'Hide' : 'Show'} Previous Attempts ({attempts.length})
                    </button>
                    {!quiz && !result && (
                        <button
                            onClick={handleGenerateQuiz}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {loading ? 'Generating...' : 'Generate New Quiz'}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {showAttempts && renderAttemptsList()}

            {viewingAttempt && renderAttemptDetails()}

            {result && !viewingAttempt && renderQuizResult()}

            {quiz && !result && !viewingAttempt && (
                <div>
                    <h1 className="text-3xl font-bold mb-6">Quiz</h1>
                    <div className="space-y-8">
                        {quiz.questions.map((q, index) => (
                            <div key={q._id} className="bg-white p-6 rounded-lg shadow">
                                <p className="font-semibold text-lg mb-4">
                                    {index + 1}. {q.questionText}
                                </p>
                                <div className="space-y-2">
                                    {q.options.map((option, optIdx) => (
                                        <label key={optIdx} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                            <input
                                                type="radio"
                                                name={`question-${q._id}`}
                                                value={option}
                                                checked={answers[q._id] === option}
                                                onChange={() => handleAnswerChange(q._id, option)}
                                                className="h-4 w-4"
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleSubmitQuiz}
                        disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
                        className="mt-8 w-full py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                    {Object.keys(answers).length !== quiz.questions.length && (
                        <p className="text-center text-sm text-gray-500 mt-2">
                            Please answer all questions before submitting
                        </p>
                    )}
                </div>
            )}

            {!quiz && !result && !viewingAttempt && !showAttempts && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">No active quiz. Generate a new quiz to get started!</p>
                </div>
            )}
        </div>
    );
};

export default QuizPage;
