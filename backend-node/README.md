# 🖥️ Backend - Study App

**Node.js/Express REST API Server**

The backend API server for the Study App, handling user authentication, PDF management, chat sessions, quiz generation, and communication with the AI service.

---

## 📁 Project Structure

```
backend-node/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js      # Authentication logic
│   │   │   ├── chat.controller.js      # Chat operations
│   │   │   ├── quiz.controller.js      # Quiz management
│   │   │   ├── file.controller.js      # File handling
│   │   │   ├── pdf.controller.js       # PDF processing
│   │   │   └── youtube.controller.js   # YouTube recommendations
│   │   ├── routes/
│   │   │   ├── auth.routes.js          # Authentication endpoints
│   │   │   ├── chat.routes.js          # Chat endpoints
│   │   │   ├── quiz.routes.js          # Quiz endpoints
│   │   │   ├── file.routes.js          # File endpoints
│   │   │   └── index.js                # Route aggregation
│   │   └── middleware/
│   │       ├── auth.middleware.js      # JWT verification
│   │       └── errorHandler.js         # Error handling
│   ├── config/
│   │   └── db.js                       # MongoDB connection
│   ├── models/
│   │   ├── User.js                     # User schema
│   │   ├── Chat.js                     # Chat session schema
│   │   ├── Message.js                  # Chat message schema
│   │   ├── Quiz.js                     # Quiz schema
│   │   ├── Question.js                 # Question schema
│   │   ├── File.js                     # File schema
│   │   └── QuizAttempt.js              # Quiz attempt schema
│   ├── services/
│   │   ├── ai.service.js               # AI service integration
│   │   ├── file.service.js             # File upload service
│   │   ├── youtube.service.js          # YouTube API service
│   │   └── email.service.js            # Email notifications
│   └── utils/
│       ├── jwt.util.js                 # JWT helper
│       └── validators.js               # Input validation
├── scripts/
│   └── seed.js                         # Database seeding
├── app.js                              # Express app setup
├── .env.example                        # Environment template
├── .dockerignore                       # Docker ignore file
├── Dockerfile                          # Docker configuration
├── package.json                        # Dependencies
└── README.md                           # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- AI Service running on `http://localhost:8000`

### Installation

```bash
cd backend-node
npm install
```

### Environment Variables

Create `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/revisify

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d

# AI Service
AI_SERVICE_URL=http://localhost:8000

# File Upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Development Server

```bash
npm run dev
```

Server runs at `http://localhost:5000`

### Production Build

```bash
npm start
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication |
| **Axios** | HTTP client |
| **Cloudinary** | File storage |
| **dotenv** | Environment management |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Chat
- `POST /api/chats` - Create new chat
- `GET /api/chats` - Get user's chats
- `GET /api/chats/:id` - Get chat details
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/chats/:id/messages` - Send message
- `GET /api/chats/:id/messages` - Get chat messages

### Quiz
- `POST /api/quizzes/generate/:chatId` - Generate quiz
- `GET /api/quizzes/:id` - Get quiz details
- `POST /api/quizzes/:id/submit` - Submit quiz attempt
- `GET /api/quizzes/:id/attempts` - Get quiz attempts

### Files
- `POST /api/files/upload` - Upload PDF file
- `GET /api/files` - Get user's files
- `DELETE /api/files/:id` - Delete file

### YouTube
- `GET /api/youtube/recommendations/:chatId` - Get video recommendations

---

## 🔄 AI Service Integration

The backend communicates with the AI service at `http://localhost:8000`:

### AI Service Endpoints Called
- `POST /api/chat` - Send message to AI
- `POST /api/quiz/generate` - Generate quiz with AI
- `POST /api/quiz/grade` - Grade quiz answers with AI
- `POST /api/youtube/recommend` - Get AI recommendations

All requests include:
- `messages` - Chat history or context
- `documents` - Relevant PDF chunks
- `query` - User question or prompt

---

## 💾 Database Models

### User
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Chat
```javascript
{
  userId: ObjectId,
  name: String,
  fileIds: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  chatId: ObjectId,
  userId: ObjectId,
  sender: String (user/assistant),
  content: String,
  createdAt: Date
}
```

### Quiz
```javascript
{
  chatId: ObjectId,
  userId: ObjectId,
  questions: [ObjectId],
  totalScore: Number,
  createdAt: Date
}
```

---

## 🧪 Testing

### Manual API Testing

Use tools like Postman or cURL:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create Chat
curl -X POST http://localhost:5000/api/chats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Chat","fileIds":[]}'
```

---

## 🐳 Docker Deployment

Build Docker image:

```bash
docker build -t revisify-backend .
```

Run container:

```bash
docker run -p 5000:5000 --env-file .env revisify-backend
```

---

## 🔐 Security Features

- ✅ **Password Hashing** - bcrypt for secure password storage
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **CORS Protection** - Cross-origin request handling
- ✅ **Input Validation** - Request validation middleware
- ✅ **Error Handling** - Secure error messages
- ✅ **Environment Variables** - Sensitive data protection

---

## 📝 Important Notes

- All API responses follow a consistent JSON format
- Errors include appropriate HTTP status codes
- Database indices are set up for performance
- File uploads are validated before processing
- AI service calls include timeout handling
- All user data is associated with their account

---

## 🔗 Related Services

- **Frontend**: `../frontend/README.md` - React UI
- **AI Service**: `../ai-service-python/README.md` - Python AI server
- **Main Project**: `../README.md` - Complete project documentation

---

## 🤝 Support

For issues or questions about the backend, please refer to the main project documentation or create an issue on GitHub.
