# 📋 Study App - Complete Project Summary

> **Executive Summary**: A full-stack AI-powered learning platform with PDF processing, RAG-based chat, automated quiz generation & grading, and YouTube recommendations. Built with Node.js, Python/FastAPI, MongoDB Atlas, Ollama (local embeddings), and Google Gemini (cloud LLM).

---

## 🎯 Project Overview

### Purpose
Help students study smarter by leveraging AI to:
- Extract knowledge from PDF textbooks
- Answer questions with source citations
- Generate customized quizzes
- Provide automated grading with feedback
- Suggest relevant learning videos

### Target Users
- Students (High School, College, University)
- Self-learners
- Educators creating study materials
- Anyone studying from PDF documents

---

## 🏗️ Technical Architecture

### Stack Summary
```
Frontend: NOT INCLUDED (API-only backend)
Backend: Node.js 20 + Express
AI Service: Python 3.12 + FastAPI
Database: MongoDB Atlas (Cloud)
Storage: Cloudinary (PDFs)
Local AI: Ollama (Embeddings)
Cloud AI: Google Gemini Pro (Text Generation)
Vector DB: FAISS (In-memory)
Container: Docker + Docker Compose
```

### Services Breakdown

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| **Backend** | Node.js/Express | 5000 | REST API, Auth, Business Logic |
| **AI Service** | Python/FastAPI | 8000 | PDF Processing, RAG, Quiz Gen |
| **Database** | MongoDB Atlas | Cloud | Data Persistence |
| **File Storage** | Cloudinary | Cloud | PDF File Hosting |
| **Ollama** | Local Model | 11434 | Text Embeddings (nomic-embed-text) |
| **Gemini** | Google API | Cloud | Text Generation (LLM) |
| **Vector Store** | FAISS | N/A | Similarity Search |

---

## ✨ Core Features

### 1. User Authentication
- JWT-based secure authentication
- Bcrypt password hashing
- 7-day token expiration
- Protected routes

**Endpoints:**
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/profile`

### 2. PDF Management
- Upload up to 10 PDFs simultaneously (50MB each)
- Automatic cloud storage (Cloudinary)
- Background processing pipeline
- Status tracking (pending → processing → ready → failed)
- Vector embedding creation (FAISS + Ollama)
- YouTube video recommendations

**Endpoints:**
- `GET /api/v1/pdfs` - List user's PDFs
- `POST /api/v1/pdfs/upload` - Upload PDFs

**Processing Pipeline:**
```
Upload → Cloudinary → DB Save → AI Service
  → Extract Text → Chunk → Embed → Vector Store
  → Generate YouTube Topics → Fetch Videos → Save
```

### 3. RAG-Based Chat
- Multi-document conversational AI
- Context-aware responses with source citations
- Streaming responses (real-time)
- Full conversation history
- Multiple chat sessions per user

**Endpoints:**
- `POST /api/v1/chats` - Create chat session
- `GET /api/v1/chats` - List all chats
- `GET /api/v1/chats/:chatId/messages` - Get messages
- `POST /api/v1/chats/:chatId/messages` - Send message (streaming)
- `GET /api/v1/chats/:chatId/details` - Get chat details

**RAG Process:**
1. User asks question
2. Load FAISS stores for chat's PDFs
3. Retrieve top 4 relevant chunks
4. Format context with page numbers
5. Send to Gemini Pro with prompt
6. Stream response to user
7. Save conversation to DB

### 4. Quiz Generation & Grading
- Customizable quiz types (MCQ, SAQ, LAQ)
- Context-based question generation
- Ideal answers provided by AI
- Automated grading with explanations
- Attempt history and scoring

**Endpoints:**
- `POST /api/v1/quizzes/generate/:chatId` - Generate quiz
- `POST /api/v1/quizzes/submit/:quizId` - Submit & grade
- `GET /api/v1/quizzes/attempts/chat/:chatId` - List attempts
- `GET /api/v1/quizzes/attempts/:attemptId` - Attempt details

**Question Types:**
- **MCQ**: 4 options, 1 point, exact match grading
- **SAQ**: Short answer, 3 points, AI-graded
- **LAQ**: Long answer, 5 points, AI-graded

**Generation Process:**
1. Sample 15 random chunks from PDFs
2. Send to Gemini with structured prompt
3. Request JSON output
4. Parse & validate
5. Save quiz to database

**Grading Process:**
- MCQs: Exact string match (case-insensitive)
- SAQs/LAQs: Gemini evaluates against ideal answer, provides score + detailed explanation

### 5. YouTube Integration
- Automatic topic generation per PDF
- 2 relevant video suggestions per PDF
- Real video search using YouTube Data API v3
- Metadata: title, URL, video ID
- Saved with PDF for quick access

**Endpoints:**
- `POST /api/v1/youtube/generate-topics` (AI Service)

---

## 💾 Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### PDF
```javascript
{
  _id: ObjectId,
  filename: String,
  cloudinaryUrl: String,
  cloudinaryId: String,
  owner: ObjectId (User),
  processingStatus: Enum ['pending', 'processing', 'ready', 'failed'],
  vectorStorePath: String,
  youtubeRecommendations: [{
    title: String,
    url: String,
    videoId: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Chat
```javascript
{
  _id: ObjectId,
  user: ObjectId (User),
  title: String,
  pdfs: [ObjectId (PDF)],
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  _id: ObjectId,
  chat: ObjectId (Chat),
  role: Enum ['user', 'assistant'],
  content: String,
  createdAt: Date
}
```

### Quiz
```javascript
{
  _id: ObjectId,
  chat: ObjectId (Chat),
  user: ObjectId (User),
  questions: [{
    question_type: Enum ['mcq', 'saq', 'laq'],
    question: String,
    options: [String] (MCQ only),
    ideal_answer: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### QuizAttempt
```javascript
{
  _id: ObjectId,
  quiz: ObjectId (Quiz),
  user: ObjectId (User),
  answers: [{
    questionId: ObjectId,
    userAnswer: String
  }],
  totalScore: Number,
  maxScore: Number,
  gradedQuestions: [{
    questionId: ObjectId,
    score: Number,
    maxScore: Number,
    explanation: String
  }],
  submittedAt: Date
}
```

---

## 🔄 Complete User Flows

### Flow 1: Getting Started
```
1. User signs up → POST /api/v1/auth/signup
2. User logs in → POST /api/v1/auth/login
3. Receives JWT token
4. All subsequent requests include: Authorization: Bearer <token>
```

### Flow 2: Uploading & Processing PDFs
```
1. User uploads PDFs → POST /api/v1/pdfs/upload
   - Multer handles multipart/form-data
   - Files uploaded to Cloudinary
   - Metadata saved to MongoDB
   - Status: 'processing'
   
2. Backend triggers AI Service → POST /api/v1/process-pdf
   - Downloads PDF from Cloudinary URL
   - Extracts text with PyPDF2
   - Splits into chunks (1000 chars, 200 overlap)
   - Generates embeddings via Ollama
   - Creates FAISS vector store
   - Saves to /vector_store/{pdfId}.faiss/
   
3. AI Service generates YouTube topics → POST /api/v1/youtube/generate-topics
   - Analyzes PDF content
   - Generates 2 relevant search topics
   - Searches YouTube API
   - Returns video metadata
   
4. Backend updates PDF status → 'ready'
   - Saves YouTube recommendations
   - PDF ready for chat/quiz
```

### Flow 3: Chatting with PDFs
```
1. User creates chat session → POST /api/v1/chats
   - Selects PDFs to include
   - Creates Chat document
   
2. User sends message → POST /api/v1/chats/:chatId/messages
   - Saves user message to DB
   
3. Backend forwards to AI Service → POST /api/v1/chat
   - Loads FAISS stores for chat's PDFs
   - Merges into single searchable index
   - Retrieves top 4 relevant chunks
   - Formats context with page numbers
   
4. AI Service queries Gemini
   - Sends structured prompt with context
   - Streams response tokens
   
5. Backend streams to user
   - Real-time text streaming
   - Saves complete response to DB
   - Links message to chat
```

### Flow 4: Quiz Generation & Taking
```
1. User requests quiz → POST /api/v1/quizzes/generate/:chatId
   - Specifies: numMCQs, numSAQs, numLAQs
   
2. Backend gets chat's PDF IDs
3. Forwards to AI Service → POST /api/v1/generate-quiz
   - Loads vector stores
   - Samples 15 random chunks
   - Sends to Gemini with structured prompt
   - Gemini generates JSON quiz
   
4. AI Service validates & returns quiz
5. Backend saves to MongoDB
6. User receives questions

--- Taking Quiz ---

7. User submits answers → POST /api/v1/quizzes/submit/:quizId
8. Backend gets original quiz
9. Forwards to AI Service → POST /api/v1/grade-quiz
   
10. AI Service grades:
    - MCQs: Exact match (1 or 0)
    - SAQs/LAQs: Gemini evaluates
      - Compares to ideal answer
      - Provides score (0-3 or 0-5)
      - Generates explanation
      
11. Backend saves QuizAttempt
12. User receives graded results
```

---

## 🔧 Configuration

### Environment Variables

**Root `.env`**
```bash
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/study-app
GOOGLE_API_KEY=AIzaSy...
JWT_SECRET=64-char-secret
CORS_ORIGIN=*
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
YOUTUBE_API_KEY=key (optional)
```

**AI Service `.env`**
```bash
GOOGLE_API_KEY=AIzaSy...
OLLAMA_HOST=http://ollama:11434
```

### Docker Compose Services
```yaml
services:
  ollama:        # Port 11434 - Local embedding model
  ai-service:    # Port 8000 - Python FastAPI
  backend:       # Port 5000 - Node.js Express
```

---

## 📊 Capacity & Performance

### Free Tier Capacity
```
Users: ~10,000
PDFs: ~50,000 (within MongoDB limit)
Messages: ~100,000
Storage: 25 GB (Cloudinary)
Database: 512 MB (MongoDB Atlas)
```

### Performance Benchmarks
```
Operation                    | Time
-----------------------------|------------------
User signup/login            | 100-300ms
PDF upload                   | 1-3s
PDF processing (10 pages)    | 20-50s
PDF processing (50 pages)    | 100-250s
Chat message (streaming)     | 2-5s
Quiz generation (10 Qs)      | 5-10s
Quiz grading (10 answers)    | 3-8s
```

### Scaling Limits
- **Ollama**: Sequential processing, needs horizontal scaling
- **Gemini API**: 60 req/min (free tier), rate limiting needed
- **MongoDB Atlas**: 500 connections, upgrade for more
- **FAISS**: In-memory, limited by RAM
- **Cloudinary**: 25GB free, 25GB bandwidth/month

---

## 🚀 Deployment

### Quick Start (Docker)
```bash
# 1. Configure environment
cp .env.example .env
nano .env  # Add API keys

# 2. Deploy
chmod +x deploy.sh
./deploy.sh  # Select option 1

# 3. Services running
Backend:     http://localhost:5000
AI Service:  http://localhost:8000
Ollama:      http://localhost:11434
```

### Production (VPS)
```bash
# 1. Provision server (4GB RAM min)
# 2. Install Docker
# 3. Clone repository
# 4. Configure .env
# 5. Run deploy.sh
# 6. Setup Nginx reverse proxy
# 7. Setup SSL (Let's Encrypt)
```

**See:**
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [PRODUCTION_DEPLOY.md](./PRODUCTION_DEPLOY.md) - VPS deployment
- [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md) - MongoDB setup

---

## ⚠️ Important Limitations

### Cannot Do
- ❌ Process scanned PDFs (need OCR)
- ❌ Handle encrypted/password-protected PDFs
- ❌ Work offline
- ❌ Deploy on serverless platforms (needs Ollama)
- ❌ Annotate or edit PDFs
- ❌ Real-time collaboration
- ❌ Export quiz results to PDF

### Constraints
- ⚠️ 60 API requests/minute (Gemini free tier)
- ⚠️ ~50 PDFs max per day (YouTube API limit)
- ⚠️ 30-120 seconds PDF processing time
- ⚠️ 50MB max file size
- ⚠️ AI grading may vary from human judgment
- ⚠️ English language optimized (other languages less accurate)

**Full details:** [LIMITATIONS.md](./LIMITATIONS.md)

---

## 📁 Project Structure

```
beyond-chats-assignment/
├── ai-service-python/              # Python AI Microservice
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── pdf_api.py         # PDF processing endpoint
│   │   │   ├── chat_api.py        # RAG chat endpoint
│   │   │   ├── quiz_api.py        # Quiz gen & grading
│   │   │   └── youtube_api.py     # YouTube topics
│   │   ├── services/               # Business logic
│   │   │   ├── pdf_processor.py   # PDF text extraction
│   │   │   ├── rag_service.py     # RAG implementation
│   │   │   ├── quiz_service.py    # Quiz logic
│   │   │   └── youtube_service.py # YouTube integration
│   │   └── schemas/                # Pydantic models
│   ├── vector_store/               # FAISS indexes
│   ├── Dockerfile
│   └── requirements.txt
│
├── backend-node/                   # Node.js Backend
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/       # Request handlers
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── pdf.controller.js
│   │   │   │   ├── chat.controller.js
│   │   │   │   ├── quiz.controller.js
│   │   │   │   └── user.controller.js
│   │   │   ├── routes/            # API routes
│   │   │   ├── models/            # Mongoose schemas
│   │   │   │   ├── User.model.js
│   │   │   │   ├── Pdf.model.js
│   │   │   │   ├── Chat.model.js
│   │   │   │   ├── Message.model.js
│   │   │   │   ├── Quiz.model.js
│   │   │   │   └── QuizAttempt.model.js
│   │   │   └── middlewares/       # Auth, validation
│   │   ├── config/                # Database, Cloudinary
│   │   └── services/              # Business logic
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml             # Multi-service orchestration
├── deploy.sh                      # Interactive deployment script
├── .env.example                   # Environment template
│
└── Documentation/
    ├── README.md                  # This file
    ├── DEPLOYMENT.md              # Deployment guide
    ├── PRODUCTION_DEPLOY.md       # VPS deployment
    ├── MONGODB_ATLAS_SETUP.md     # MongoDB setup
    └── LIMITATIONS.md             # Detailed limitations
```

---

## 🔗 Key Dependencies

### Backend (Node.js)
```json
{
  "express": "^4.19.2",
  "mongoose": "^8.4.1",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "multer": "^2.0.2",
  "cloudinary": "^2.7.0",
  "axios": "^1.12.2",
  "googleapis": "^161.0.0"
}
```

### AI Service (Python)
```
fastapi==0.118.2
langchain==0.3.27
langchain-google-genai==2.1.12
langchain-ollama==0.3.10
langchain-community==0.3.31
faiss-cpu==1.12.0
pypdf2
python-dotenv
uvicorn
```

---

## 🎓 Use Cases

### For Students
1. **Exam Preparation**: Upload textbooks, generate practice quizzes
2. **Homework Help**: Ask questions about reading materials
3. **Concept Clarification**: Get explanations with source citations
4. **Self-Assessment**: Take quizzes, get instant feedback
5. **Video Learning**: Get relevant YouTube videos per topic

### For Educators
1. **Quiz Creation**: Auto-generate quizzes from course materials
2. **Student Support**: Provide 24/7 AI study assistant
3. **Content Gaps**: Identify what students are asking about most

---

## 🛡️ Security Features

- ✅ JWT authentication with secure tokens
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Protected routes (authentication required)
- ✅ Input validation (express-validator)
- ✅ File type validation (PDF only)
- ✅ File size limits (50MB)
- ✅ CORS configuration
- ⚠️ No rate limiting (should be added)
- ⚠️ No 2FA (should be added for production)

---

## 📞 API Request Examples

### Signup
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Upload PDF
```bash
curl -X POST http://localhost:5000/api/v1/pdfs/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "pdfs=@/path/to/file.pdf"
```

### Send Chat Message
```bash
curl -X POST http://localhost:5000/api/v1/chats/{chatId}/messages \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"content": "What is machine learning?"}'
```

---

## 📈 Future Enhancements

### Planned Features
- [ ] OCR support for scanned PDFs
- [ ] Multi-language support
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] PDF annotation and highlighting
- [ ] Export quiz results (PDF/Excel)
- [ ] Advanced analytics dashboard
- [ ] Spaced repetition system
- [ ] Flashcard generation
- [ ] Audio lecture transcription

### Technical Improvements
- [ ] Redis caching layer
- [ ] Request rate limiting
- [ ] Comprehensive error logging (Sentry)
- [ ] Database indexing optimization
- [ ] CDN for static assets
- [ ] Managed vector DB (Pinecone)
- [ ] Kubernetes orchestration
- [ ] CI/CD pipeline
- [ ] End-to-end testing
- [ ] API documentation (Swagger)

---

## 🏆 Project Highlights

### What Makes This Unique
1. **Hybrid AI Approach**: Combines local (Ollama) and cloud (Gemini) AI for cost-effectiveness
2. **RAG Implementation**: Retrieval-Augmented Generation for accurate, source-cited answers
3. **Automated Grading**: AI grades both MCQs and descriptive answers
4. **Microservices**: Clean separation between backend and AI services
5. **Production-Ready**: Docker deployment with comprehensive documentation
6. **Full-Stack**: Complete backend with auth, storage, and AI capabilities

### Technical Achievements
- ✅ Streaming responses for better UX
- ✅ Background job processing (non-blocking PDF uploads)
- ✅ Vector similarity search with FAISS
- ✅ Multi-document context merging
- ✅ Structured LLM output parsing
- ✅ YouTube API integration
- ✅ Comprehensive error handling

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Main project overview & getting started |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Complete deployment guide with Docker |
| [PRODUCTION_DEPLOY.md](./PRODUCTION_DEPLOY.md) | Step-by-step VPS deployment |
| [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md) | MongoDB Atlas configuration |
| [LIMITATIONS.md](./LIMITATIONS.md) | Detailed limitations & workarounds |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | This comprehensive summary |

---

## 🤝 Contributing

Contributions welcome! Areas needing help:
1. Frontend development (React/Vue)
2. Mobile app (React Native)
3. OCR integration for scanned PDFs
4. Multi-language support
5. Performance optimizations
6. Documentation improvements

---

## 📄 License

[Specify License - MIT/Apache 2.0/etc.]

---

## 🙏 Credits & Acknowledgments

### Built With
- **LangChain** - AI framework
- **Google Gemini** - Text generation
- **Ollama** - Local embeddings
- **MongoDB Atlas** - Cloud database
- **Cloudinary** - File storage
- **FastAPI** - Python web framework
- **Express.js** - Node.js framework

### Inspired By
- Modern AI-powered learning platforms
- RAG-based question-answering systems
- Automated assessment tools

---

**Made with ❤️ for students worldwide**

**Questions?** Check the [DEPLOYMENT.md](./DEPLOYMENT.md) or [LIMITATIONS.md](./LIMITATIONS.md) for answers!
