import { useState, useEffect } from 'react';
import { submitQuiz } from '../../services/quizService';

const FullscreenQuiz = ({ quiz, onExit, onSubmitSuccess }) => {
    const [answers, setAnswers] = useState({});
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Request fullscreen on mount
    useEffect(() => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
        }

        // Exit fullscreen on unmount
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log('Exit fullscreen failed:', err));
            }
        };
    }, []);

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleExit = () => {
        setShowExitConfirm(true);
    };

    const confirmExit = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        onExit();
    };

    const handleSubmit = async () => {
        // Convert answers object to array format expected by backend
        const answersArray = quiz.questions.map(q => ({
            questionId: q._id,
            userAnswer: answers[q._id] || ''
        }));

        try {
            setSubmitting(true);
            setError(null);
            const response = await submitQuiz(quiz._id, answersArray);
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            onSubmitSuccess(response.attempt);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getAnsweredCount = () => {
        return Object.keys(answers).filter(key => answers[key] && answers[key].trim() !== '').length;
    };

    const getQuestionTypeLabel = (type) => {
        switch (type) {
            case 'mcq': return 'Multiple Choice';
            case 'saq': return 'Short Answer';
            case 'laq': return 'Long Answer';
            default: return type;
        }
    };

    // Group questions by type
    const mcqQuestions = quiz.questions.filter(q => q.question_type === 'mcq');
    const saqQuestions = quiz.questions.filter(q => q.question_type === 'saq');
    const laqQuestions = quiz.questions.filter(q => q.question_type === 'laq');

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quiz</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {quiz.questions.length} questions • {mcqQuestions.length} MCQ, {saqQuestions.length} Short Answer, {laqQuestions.length} Long Answer
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Answered</p>
                            <p className="text-lg font-semibold text-indigo-600">
                                {getAnsweredCount()}/{quiz.questions.length}
                            </p>
                        </div>
                        <button
                            onClick={handleExit}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* MCQ Section */}
                {mcqQuestions.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Multiple Choice Questions</h2>
                        <div className="space-y-6">
                            {mcqQuestions.map((q, index) => (
                                <div key={q._id} className="bg-white rounded-lg shadow-sm border p-6">
                                    <p className="font-semibold text-lg mb-4 text-gray-900">
                                        Question {index + 1}. {q.question}
                                    </p>
                                    <div className="space-y-3">
                                        {q.options.map((option, optIdx) => (
                                            <label
                                                key={optIdx}
                                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                                                    answers[q._id] === option
                                                        ? 'bg-indigo-50 border-2 border-indigo-500'
                                                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${q._id}`}
                                                    value={option}
                                                    checked={answers[q._id] === option}
                                                    onChange={() => handleAnswerChange(q._id, option)}
                                                    className="w-4 h-4 text-indigo-600"
                                                />
                                                <span className="ml-3 text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SAQ Section */}
                {saqQuestions.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Short Answer Questions</h2>
                        <div className="space-y-6">
                            {saqQuestions.map((q, index) => (
                                <div key={q._id} className="bg-white rounded-lg shadow-sm border p-6">
                                    <p className="font-semibold text-lg mb-4 text-gray-900">
                                        Question {mcqQuestions.length + index + 1}. {q.question}
                                    </p>
                                    <textarea
                                        value={answers[q._id] || ''}
                                        onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                        placeholder="Type your answer here..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        rows="4"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* LAQ Section */}
                {laqQuestions.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Long Answer Questions</h2>
                        <div className="space-y-6">
                            {laqQuestions.map((q, index) => (
                                <div key={q._id} className="bg-white rounded-lg shadow-sm border p-6">
                                    <p className="font-semibold text-lg mb-4 text-gray-900">
                                        Question {mcqQuestions.length + saqQuestions.length + index + 1}. {q.question}
                                    </p>
                                    <textarea
                                        value={answers[q._id] || ''}
                                        onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                        placeholder="Type your detailed answer here..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        rows="8"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="sticky bottom-0 bg-white border-t shadow-lg p-4 -mx-6">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            {getAnsweredCount() === quiz.questions.length ? (
                                <span className="text-green-600 font-medium">✓ All questions answered</span>
                            ) : (
                                <span>{quiz.questions.length - getAnsweredCount()} question(s) remaining</span>
                            )}
                        </p>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || getAnsweredCount() !== quiz.questions.length}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                        >
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Exit Confirmation Modal */}
            {showExitConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Exit Quiz?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to exit? Your progress will not be saved.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmExit}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                            >
                                Exit Quiz
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FullscreenQuiz;
