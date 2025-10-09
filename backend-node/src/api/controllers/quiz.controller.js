import axios from 'axios';
import Chat from '../models/Chat.model.js';
import Quiz from '../models/Quiz.model.js';
import QuizAttempt from '../models/QuizAttempt.model.js';

/**
 * @desc    Generate a new quiz for a chat session
 * @route   POST /api/v1/quizzes/generate/:chatId
 * @access  Private
 */
export const generateQuizController = async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user.id;

    try {
        // 1. Find the chat and verify user access
        const chat = await Chat.findOne({ _id: chatId, user: userId });
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found or access denied.' });
        }

        // 2. Determine the number of questions based on the number of PDFs
        const n = chat.pdfs.length;
        if (n === 0) {
            return res.status(400).json({ message: 'Chat has no associated PDFs to generate a quiz from.' });
        }
        
        // --- UPDATED: Reduced the number of questions for faster generation with local models ---
        const numMCQs = 3 + (n > 1 ? (n - 1) * 2 : 0); // Reduced from 5 + 3*(n-1)
        const numSAQs = 1 + (n > 1 ? (n - 1) * 1 : 0); // Reduced from 3 + 2*(n-1)
        const numLAQs = 1 + (n > 1 ? (n -1)/2 : 0); // Reduced from 2 + 1*(n-1)
        
        // 3. Call the Python AI service to generate the quiz content
        const response = await axios.post(`${process.env.AI_SERVICE_URL}/api/v1/generate-quiz`, {
            pdfIds: chat.pdfs.map(id => id.toString()),
            numMCQs,
            numSAQs,
            numLAQs
        });

        const generatedQuiz = response.data;

        // 4. Create the quiz document in our database with the AI-generated questions
        const newQuiz = new Quiz({
            chat: chatId,
            user: userId,
            questions: [
                ...generatedQuiz.mcqs.map(q => ({ ...q, ideal_answer: q.correct_answer })),
                ...generatedQuiz.saqs,
                ...generatedQuiz.laqs
            ]
        });
        await newQuiz.save();

        // 5. Send the questions to the client, but without the ideal answers
        const quizForClient = {
            _id: newQuiz._id,
            chat: newQuiz.chat,
            questions: newQuiz.questions.map(q => ({
                _id: q._id,
                question_type: q.question_type,
                question: q.question,
                options: q.options
            }))
        };

        res.status(201).json(quizForClient);
    } catch (error) {
        console.error('Generate Quiz Error:', error.message);
        res.status(500).json({ message: 'Failed to generate quiz.' });
    }
};

/**
 * @desc    Submit a user's answers for a quiz to be graded
 * @route   POST /api/v1/quizzes/submit/:quizId
 * @access  Private
 */
export const submitQuizController = async (req, res) => {
    const { quizId } = req.params;
    const { answers } = req.body; // Expecting answers in format: [{ questionId: '...', userAnswer: '...' }]
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'A valid array of answers is required.' });
    }

    try {
        // 1. Find the original quiz and verify user access
        const quiz = await Quiz.findOne({ _id: quizId, user: userId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found or access denied.' });
        }

        // 2. Prepare the payload for the grading service
        const questionsToGrade = answers.map(answer => {
            const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
            if (!question) {
                throw new Error(`Question with id ${answer.questionId} not found in this quiz.`);
            }
            return {
                question: question.question,
                user_answer: answer.userAnswer,
                ideal_answer: question.ideal_answer,
                question_type: question.question_type
            };
        });

        // 3. Call the Python AI service to grade the answers
        const response = await axios.post(`${process.env.AI_SERVICE_URL}/api/v1/grade-quiz`, {
            questions_to_grade: questionsToGrade
        });

        const gradingResult = response.data;

        // 4. Create and save the quiz attempt record
        const newAttempt = new QuizAttempt({
            quiz: quizId,
            user: userId,
            chat: quiz.chat,
            total_score: gradingResult.total_score,
            graded_questions: gradingResult.graded_questions.map(gradedQ => {
                // Find the original question to link the ID
                const originalQuestion = quiz.questions.find(q => q.question === gradedQ.question);
                const userAnswerObj = answers.find(a => {
                    const q = quiz.questions.find(q => q._id.toString() === a.questionId);
                    return q && q.question === gradedQ.question;
                });

                return {
                    ...gradedQ,
                    questionId: originalQuestion ? originalQuestion._id : null,
                    user_answer: userAnswerObj ? userAnswerObj.userAnswer : ''
                };
            })
        });
        await newAttempt.save();

        // 5. Send the detailed results back to the client
        res.status(200).json(newAttempt);
    } catch (error) {
        console.error('Submit Quiz Error:', error.message);
        res.status(500).json({ message: 'Failed to submit quiz.' });
    }
};

/**
 * @desc    Get all quiz attempts for a specific chat
 * @route   GET /api/v1/quizzes/attempts/chat/:chatId
 * @access  Private
 */
export const getQuizAttemptsForChatController = async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user.id;

    try {
        const attempts = await QuizAttempt.find({ chat: chatId, user: userId })
            .sort({ createdAt: -1 })
            .select('total_score createdAt'); // Select only summary fields for the list view

        res.status(200).json(attempts);
    } catch (error) {
        console.error('Get Quiz Attempts Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch quiz attempts.' });
    }
};

/**
 * @desc    Get the full details of a single quiz attempt
 * @route   GET /api/v1/quizzes/attempts/:attemptId
 * @access  Private
 */
export const getQuizAttemptDetailsController = async (req, res) => {
    const { attemptId } = req.params;
    const userId = req.user.id;

    try {
        const attempt = await QuizAttempt.findOne({ _id: attemptId, user: userId });
        if (!attempt) {
            return res.status(404).json({ message: 'Quiz attempt not found or access denied.' });
        }
        res.status(200).json(attempt);
    } catch (error) {
        console.error('Get Attempt Details Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch quiz attempt details.' });
    }
};

