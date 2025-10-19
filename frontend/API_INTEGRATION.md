# Frontend-Backend API Integration

This document describes the complete integration between the Revisify frontend and backend APIs.

## API Configuration

The frontend uses a centralized API configuration located in `src/services/apiConfig.js`:

- **Base URL**: Configured via environment variable `VITE_API_BASE_URL` (default: `http://localhost:5000/api/v1`)
- **Authentication**: JWT tokens stored in localStorage and sent via `Authorization: Bearer <token>` header
- **Error Handling**: Centralized error handling with proper error messages

## Services Overview

### 1. Auth Service (`authService.js`)

Handles user authentication.

**Endpoints:**
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Authenticate user and get token

**Functions:**
- `signup(name, email, password)` - Register new user
- `login(email, password)` - Login user
- `logout()` - Clear authentication token

### 2. User Service (`userService.js`)

Manages user profile data.

**Endpoints:**
- `GET /users/profile` - Get user profile

**Functions:**
- `getUserProfile()` - Fetch current user's profile

### 3. PDF Service (`pdfService.js`)

Handles PDF document upload and retrieval.

**Endpoints:**
- `GET /pdfs` - Get all PDFs for logged-in user
- `POST /pdfs/upload` - Upload one or more PDF files (multipart/form-data)

**Functions:**
- `getAllPdfs()` - Fetch all user's PDFs
- `uploadPdfs(files)` - Upload PDF files (accepts File, FileList, or Array)

**PDF Status:**
- `completed` - PDF processed and ready to use
- `processing` - PDF is being processed
- `failed` - PDF processing failed

### 4. Chat Service (`chatService.js`)

Manages chat sessions with AI.

**Endpoints:**
- `POST /chats` - Create new chat session with selected PDFs
- `GET /chats` - Get all user's chats
- `GET /chats/:chatId/messages` - Get all messages in a chat
- `POST /chats/:chatId/messages` - Send message and get AI response
- `GET /chats/:chatId/details` - Get chat details with PDFs

**Functions:**
- `createChat(pdfIds)` - Create new chat with array of PDF IDs
- `getUserChats()` - Get all user's chat sessions
- `getMessagesForChat(chatId)` - Get all messages in a chat
- `createMessage(chatId, text)` - Send message and get AI response
- `getChatDetails(chatId)` - Get chat with associated PDFs

### 5. Quiz Service (`quizService.js`)

Handles quiz generation and submission.

**Endpoints:**
- `POST /quizzes/generate/:chatId` - Generate quiz for a chat
- `POST /quizzes/submit/:quizId` - Submit quiz answers
- `GET /quizzes/attempts/chat/:chatId` - Get all quiz attempts for a chat
- `GET /quizzes/attempts/:attemptId` - Get detailed quiz attempt results

**Functions:**
- `generateQuiz(chatId)` - Generate new quiz based on chat content
- `submitQuiz(quizId, answers)` - Submit quiz with answers array
- `getQuizAttemptsForChat(chatId)` - Get all quiz attempts for a chat
- `getQuizAttemptDetails(attemptId)` - Get detailed results of a quiz attempt

## Component Integration

### FileList Component
- **Fetches PDFs**: Calls `getAllPdfs()` on mount
- **Uploads PDFs**: Handles file upload with `uploadPdfs()`
- **PDF Status Display**: Shows processing status with color-coded cards
- **Selection**: Only allows selecting completed PDFs

### ChatWindow Component
- **Receives**: `chatId` prop
- **Fetches Messages**: Loads messages using `getMessagesForChat(chatId)`
- **Sends Messages**: Uses `createMessage(chatId, text)`
- **Real-time Updates**: Optimistic UI updates with error handling
- **Auto-scroll**: Automatically scrolls to latest message

### QuizPage Component
- **Receives**: `chatId` prop
- **Generate Quiz**: `generateQuiz(chatId)` creates new quiz
- **Submit Quiz**: `submitQuiz(quizId, answers)` submits answers
- **View Attempts**: Shows quiz history with `getQuizAttemptsForChat(chatId)`
- **Detailed Results**: Displays correct/incorrect answers with `getQuizAttemptDetails(attemptId)`

### MainPage Component
- **Manages State**: Controls view (file-select, chat, quiz)
- **Creates Chats**: Calls `createChat(selectedFiles)` when files are selected
- **Fetches User**: Loads user profile on mount
- **Chat History**: Loads and displays all user chats
- **Chat Selection**: Allows switching between existing chats

### LeftSidebar Component
- **Chat History**: Displays list of all chats
- **Chat Selection**: Clicking a chat loads it in main view
- **New Chat**: Button to start file selection
- **Active Highlight**: Shows currently active chat

## Data Flow

### 1. Authentication Flow
```
User → Login/Signup Form → authService → Backend → Token
Token → localStorage → All subsequent API calls include token
```

### 2. PDF Upload Flow
```
User selects files → FileList → uploadPdfs() → Backend → Processing
Backend processes → Status updates → Frontend polls/displays status
```

### 3. Chat Creation Flow
```
User selects PDFs → FileList → createChat(pdfIds) → Backend creates chat
Chat ID returned → ChatWindow loads with chatId → Ready for messages
```

### 4. Messaging Flow
```
User types message → ChatWindow → createMessage() → Backend
Backend sends to AI → AI response → Both messages returned
ChatWindow updates → Display user + AI messages
```

### 5. Quiz Flow
```
User clicks "Take Quiz" → QuizPage → generateQuiz(chatId) → Backend
Backend uses AI → Generates questions → Returns quiz
User answers → submitQuiz() → Backend grades → Returns results
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

For production, update to your production backend URL.

## Error Handling

All services implement consistent error handling:

1. **Network Errors**: Caught and displayed to user
2. **API Errors**: Backend error messages shown in UI
3. **Authentication Errors**: Redirect to login if token invalid
4. **Validation Errors**: Form-level validation before API calls

## Authentication Token Management

- **Storage**: `localStorage.setItem('token', token)`
- **Retrieval**: `getAuthToken()` from apiConfig
- **Removal**: `removeAuthToken()` on logout
- **Usage**: Automatically included in all protected API calls

## Running the Application

1. **Start Backend**:
   ```bash
   cd backend-node
   npm install
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access**: Open `http://localhost:5173` (or the port Vite specifies)

## API Request Examples

### Upload PDF
```javascript
const fileInput = document.querySelector('input[type="file"]');
const files = fileInput.files;
const result = await uploadPdfs(files);
```

### Create Chat
```javascript
const pdfIds = ['pdf_id_1', 'pdf_id_2'];
const result = await createChat(pdfIds);
const chatId = result.chat._id;
```

### Send Message
```javascript
const result = await createMessage(chatId, 'Explain this concept');
const messages = result.messages; // Array of all messages
```

### Generate Quiz
```javascript
const result = await generateQuiz(chatId);
const quiz = result.quiz;
```

### Submit Quiz
```javascript
const answers = [
  { questionId: 'q1_id', selectedOption: 'Option A' },
  { questionId: 'q2_id', selectedOption: 'Option B' }
];
const result = await submitQuiz(quizId, answers);
const score = result.attempt.score;
```

## Backend API Response Formats

All responses follow consistent patterns:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Notes

- All dates are in ISO 8601 format
- File uploads use multipart/form-data
- All other requests use application/json
- PDF processing is asynchronous - check status field
- Quiz generation may take a few seconds
- Chat messages are returned in chronological order
