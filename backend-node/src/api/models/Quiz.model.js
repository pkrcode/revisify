import mongoose from 'mongoose';

// We define a sub-schema for the questions to ensure they have a consistent structure.
const questionSchema = new mongoose.Schema({
  question_type: {
    type: String,
    required: true,
    enum: ['mcq', 'saq', 'laq'],
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  // Options will only exist for MCQs
  options: {
    type: [String],
    default: undefined,
  },
  // This is the AI-generated correct/ideal answer, used for grading.
  ideal_answer: {
    type: String,
    required: true,
    trim: true,
  }
}, { _id: true }); // Use default _id for subdocuments to uniquely identify questions

const quizSchema = new mongoose.Schema(
  {
    // A reference to the chat session this quiz is based on.
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    
    // A reference to the user who generated this quiz.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // An array containing all the questions for this quiz.
    // We are embedding the questions directly into the quiz document.
    questions: [questionSchema],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
