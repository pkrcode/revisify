import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    // A reference to the user who owns this chat session.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // This creates a link to the 'User' model.
      required: true,
      index: true, // Indexing this field for faster queries of a user's chats.
    },
    
    // The title of the chat, which can be displayed in the UI.
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'New Chat', // A default title for newly created chats.
    },
    
    // An array of references to the PDFs that form the context for this chat.
    pdfs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pdf', // This creates a link to the 'Pdf' model.
    }],
  },
  {
    // Automatically add `createdAt` and `updatedAt` timestamps.
    timestamps: true,
  }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
