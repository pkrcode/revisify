import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    // A reference to the chat this message belongs to.
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat', // This creates a link to the 'Chat' model.
      required: true,
      index: true, // Index this field for fast retrieval of all messages for a chat.
    },

    // Identifies who sent the message.
    sender: {
      type: String,
      required: true,
      enum: ['user', 'assistant'], // The sender can only be one of these two roles.
    },

    // The actual text content of the message.
    content: {
      type: String,
      required: true,
      trim: true,
    },
    
    // A reference to the user who sent the message. 
    // This is useful for validation and ensuring the user belongs to the chat.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
  },
  {
    // Automatically add `createdAt` and `updatedAt` timestamps.
    // `createdAt` is essential for sorting messages chronologically.
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
 