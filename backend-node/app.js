import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/database.js';

// Import Routes
import authRoutes from './src/api/routes/auth.routes.js';
import pdfRoutes from './src/api/routes/pdf.routes.js';
import chatRoutes from './src/api/routes/chat.routes.js';
import quizRoutes from './src/api/routes/quiz.routes.js'; // New
import userRoutes from './src/api/routes/user.routes.js';

// --- 1. Initial Setup ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// --- 2. Middleware ---
app.use(cors({
  origin: process.env.CORS_ORIGIN
}));
app.use(express.json());

// --- 3. API Routes ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/pdfs', pdfRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/quizzes', quizRoutes); // New
app.use('/api/v1/users', userRoutes);

// Health-check route
app.get('/', (req, res) => {
  res.status(200).send('Server is healthy and running!');
});

// --- 4. Start Server ---
const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

startServer();

