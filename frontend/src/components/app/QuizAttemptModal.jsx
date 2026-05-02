import { useState, useEffect } from 'react';
import { getQuizAttemptDetails } from '../../services/quizService';

const QuizAttemptModal = ({ attemptId, onClose }) => {
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAttemptDetails();
    }, [attemptId]);

    const fetchAttemptDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getQuizAttemptDetails(attemptId);
            setAttempt(response.attempt);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching quiz attempt details:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderQuestion = (question, index) => {
        const userAnswer = attempt.answers.find(a => a.questionId === question._id);
        const isCorrect = userAnswer?.isCorrect;

        return (
            <div key={question._id} className="mb-6 p-4 bg-white rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Question {index + 1}
                        <span className="ml-2 text-sm font-normal text-gray-500 uppercase">
                            ({question.question_type})
                        </span>
                    </h3>
                    {question.question_type === 'mcq' && (
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            isCorrect 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {isCorrect ? '✓ Correct' : '✗ Wrong'}
                        </span>
                    )}
                </div>

                <p className="text-gray-800 mb-4">{question.question}</p>

                {question.question_type === 'mcq' && (
                    <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                            const isUserAnswer = userAnswer?.userAnswer === option;
                            const isCorrectAnswer = question.ideal_answer === option;

                            return (
                                <div
                                    key={optIndex}
                                    className={`p-3 rounded-lg border-2 ${
                                        isCorrectAnswer
                                            ? 'border-green-500 bg-green-50'
                                            : isUserAnswer
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-800">{option}</span>
                                        <div className="flex items-center gap-2">
                                            {isUserAnswer && (
                                                <span className="text-sm text-gray-600 italic">
                                                    Your answer
                                                </span>
                                            )}
                                            {isCorrectAnswer && (
                                                <span className="text-sm font-semibold text-green-700">
                                                    Correct Answer
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {(question.question_type === 'saq' || question.question_type === 'laq') && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Your Answer:</h4>
                            <p className="text-gray-800 whitespace-pre-wrap">
                                {userAnswer?.userAnswer || 'Not answered'}
                            </p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-green-900 mb-2">Ideal Answer:</h4>
                            <p className="text-gray-800 whitespace-pre-wrap">
                                {question.ideal_answer}
                            </p>
                        </div>
                    </div>
                )}

                {question.explanation && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Explanation:</h4>
                        <p className="text-sm text-gray-600">{question.explanation}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 bg-white border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Quiz Attempt Review</h2>
                        {attempt && (
                            <p className="text-sm text-gray-500 mt-1">
                                Submitted on {new Date(attempt.submittedAt).toLocaleString()}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <svg className="animate-spin h-10 w-10 mx-auto text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-500">Loading quiz details...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {attempt && !loading && (
                        <>
                            {/* Score Summary */}
                            <div className="mb-6 bg-white rounded-lg p-6 border shadow-sm">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-3xl font-bold text-indigo-600">
                                            {attempt.score}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">Score</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-gray-700">
                                            {attempt.totalQuestions}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">Total Questions</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">Percentage</p>
                                    </div>
                                </div>
                            </div>

                            {/* Questions and Answers */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Detailed Review
                                </h3>
                                {attempt.quiz.questions.map((question, index) => 
                                    renderQuestion(question, index)
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizAttemptModal;
