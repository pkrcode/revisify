import mongoose from 'mongoose';

// A sub-schema to store the details of each graded question within an attempt.
const gradedQuestionSchema = new mongoose.Schema({
  // A reference back to the original question in the Quiz model.
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  user_answer: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  // AI-generated feedback for the user's answer.
  explanation: {
    type: String,
    required: true,
  }
}, { _id: false }); // We don't need a separate _id for each graded answer.

const quizAttemptSchema = new mongoose.Schema(
  {
    // A reference to the specific quiz that was attempted.
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    
    // A reference to the user who made the attempt.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // The total score achieved by the user in this attempt.
    total_score: {
      type: Number,
      required: true,
    },
    
    // An array containing the detailed results for each question.
    graded_questions: [gradedQuestionSchema],

    // A reference to the chat session, useful for fetching all attempts for a chat.
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
