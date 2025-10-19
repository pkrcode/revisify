# 🎓 Study App - AI-Powered Learning Platform

> **A comprehensive full-stack AI application for students** that transforms how you study by combining PDF analysis, intelligent RAG-based chat, automated quiz generation with AI grading, and personalized YouTube video recommendations.

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.118-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-121212?logo=chainlink&logoColor=white)](https://www.langchain.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Limitations & Considerations](#-limitations--considerations)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Development](#-development)

> **📖 Service Documentation:**
> - [🎨 Frontend README](./frontend/README.md) - React UI, components, services
> - [🖥️ Backend README](./backend-node/README.md) - Express API, controllers, models
> - [🤖 AI Service README](./ai-service-python/README.md) - FastAPI, RAG, LangChain
>
> **📖 Additional Resources:**
> - [📋 Complete Project Summary](./PROJECT_SUMMARY.md) - Comprehensive technical overview
> - [⚠️ Detailed Limitations](./LIMITATIONS.md) - API limits, constraints & workarounds
> - [🚀 Deployment Guide](./DEPLOYMENT.md) - Docker setup & production deploy
> - [☁️ MongoDB Setup](./MONGODB_ATLAS_SETUP.md) - Step-by-step Atlas configuration

---

## 🌟 Overview

**Study App** is an AI-powered learning platform designed specifically for students to enhance their study experience. Built with a modern microservices architecture, it leverages both **local AI models** (Ollama) and **cloud AI services** (Google Gemini) to provide a hybrid, cost-effective solution for intelligent document processing and interactive learning

**Study App** is an AI-powered learning platform designed specifically for students to enhance their study experience. Built with a modern microservices architecture, it leverages both **local AI models** (Ollama) and **cloud AI services** (Google Gemini) to provide a hybrid, cost-effective solution for intelligent document processing and interactive learning.

### 🎯 Key Capabilities

- **📄 Multi-PDF Upload & Processing**: Upload up to 10 PDFs simultaneously (50MB each), stored securely on Cloudinary
- **🤖 RAG-Based Conversational AI**: Ask questions about your study materials and get contextually accurate, source-cited answers
- **📝 Smart Quiz Generation**: AI creates customized quizzes (MCQs, SAQs, LAQs) from your PDFs
- **✅ Automated Grading**: Intelligent grading with detailed feedback for all answer types
- **📺 Personalized YouTube Recommendations**: Get relevant video suggestions based on your study content
- **💬 Multi-Document Chat Sessions**: Chat across multiple PDFs simultaneously with full context awareness
- **📊 Progress Tracking**: Monitor quiz attempts, scores, and learning progression

---

## ✨ Features

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Registration & Login**: JWT-based authentication with bcrypt password hashing
- **Protected Routes**: All user-specific actions require authentication
- **User Profile**: Access personal information and study statistics
- **Session Management**: Persistent login with 7-day token expiration

### 📚 PDF Management
- **Batch Upload**: Upload up to 10 PDF files simultaneously
- **File Size Support**: Each PDF can be up to 50MB
- **Cloud Storage**: Secure storage on Cloudinary with public access URLs
- **Processing Pipeline**: Automatic background processing with status tracking
- **Vector Store Creation**: PDFs are embedded using Ollama's nomic-embed-text model (274MB model)
- **Status Tracking**: Real-time status updates (pending → processing → ready → failed)
- **User-Specific Library**: Each user has their own PDF collection

### 💬 Intelligent Chat System (RAG-Based)
- **Multi-Document Context**: Chat across multiple PDFs in a single conversation
- **Contextual Responses**: Answers are generated using relevant document chunks
- **Source Citation**: Responses include page numbers from source documents
- **Streaming Responses**: Real-time text streaming for faster perceived response time
- **Chat History**: Full conversation history saved per chat session
- **Chat Sessions**: Create multiple chat sessions with different PDF combinations
- **Powered by**: 
  - **Embeddings**: Ollama nomic-embed-text (local, free)
  - **LLM**: Google Gemini Pro Latest (cloud API)
  - **Vector Store**: FAISS for fast similarity search

### 📝 Quiz Generation & Grading
- **Customizable Quizzes**: Specify the number of MCQs, SAQs, and LAQs
- **Question Types**:
  - **MCQs (Multiple Choice)**: 4 options, 1 point each
  - **SAQs (Short Answer Questions)**: 3 points each, AI-graded
  - **LAQs (Long Answer Questions)**: 5 points each, AI-graded
- **Context-Based**: Questions generated exclusively from uploaded PDFs
- **Ideal Answers**: AI generates reference answers for each question
- **Smart Grading**:
  - MCQs: Exact match comparison
  - SAQs/LAQs: AI evaluates understanding, provides score + explanation
- **Attempt Tracking**: All quiz submissions saved with scores and feedback
- **Performance Analytics**: View past attempts and scores per chat session

### 📺 YouTube Integration
- **Auto-Recommendations**: Get 2 relevant YouTube video suggestions per PDF
- **Topic Generation**: AI analyzes PDF content to suggest search topics
- **Real Video Results**: Fetches actual videos using YouTube Data API v3
- **Metadata Included**: Title, URL, and video ID for each recommendation
- **Stored with PDFs**: Recommendations saved in the PDF document for quick access

### 🎨 User Experience
- **Async Processing**: PDF processing runs in background, no blocking
- **Real-time Updates**: Streaming chat responses for better UX
- **Error Handling**: Comprehensive error messages and validation
- **Progress Indicators**: Status tracking for all long-running operations
- **Responsive API**: Optimized endpoints with pagination support

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Application                         │
│                     (Frontend - Not Included)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Node.js Backend (Express)                     │
│                        Port: 5000                               │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ Auth Routes  │  PDF Routes  │ Chat Routes  │ Quiz Routes  │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│         │JWT Auth    │File Upload  │Streaming   │Quiz Logic   │
└─────────┼────────────┼─────────────┼────────────┼─────────────┘
          │            │             │            │
          ▼            ▼             ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                 External Services Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ MongoDB  │  │Cloudinary│  │AI Service│  │ YouTube  │       │
│  │  Atlas   │  │  (CDN)   │  │(FastAPI) │  │ Data API │       │
│  └──────────┘  └──────────┘  └────┬─────┘  └──────────┘       │
└───────────────────────────────────┼─────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              AI Service (Python FastAPI) - Port 8000            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PDF Processing  │  RAG Chat  │  Quiz Gen  │  YouTube   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│         ┌─────────────────┼─────────────────┐                  │
│         ▼                 ▼                 ▼                   │
│  ┌──────────┐      ┌──────────┐     ┌──────────┐              │
│  │  Ollama  │      │  Google  │     │  FAISS   │              │
│  │  (Local  │      │  Gemini  │     │  Vector  │              │
│  │Embedding)│      │   (LLM)  │     │  Store   │              │
│  └──────────┘      └──────────┘     └──────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### Microservices Architecture

#### **Backend Service (Node.js/Express)** - Port 5000
**Responsibilities:**
- User authentication & authorization (JWT)
- RESTful API for CRUD operations
- File upload handling (Multer + Cloudinary)
- Business logic & data validation
- Database operations (MongoDB Atlas)
- YouTube API integration
- Request orchestration to AI service

**Key Technologies:**
- Express.js for API routing
- Mongoose for MongoDB ODM
- Multer for file handling
- Bcrypt for password hashing
- JWT for authentication
- Axios for HTTP requests

#### **AI Service (Python/FastAPI)** - Port 8000
**Responsibilities:**
- PDF text extraction & chunking
- Embedding generation (local Ollama)
- Vector database creation (FAISS)
- RAG-based question answering
- Quiz generation from context
- Automated answer grading
- YouTube topic suggestion

**Key Technologies:**
- FastAPI for async API
- LangChain for AI workflows
- FAISS for vector storage
- PyPDF2 for PDF processing
- Google Gemini for text generation
- Ollama for embeddings

### Data Flow Examples

#### 1. PDF Upload & Processing Flow
```
User → Backend (/api/v1/pdfs/upload)
  ↓ [Multer processes file]
  ↓ [Upload to Cloudinary]
  ↓ [Save metadata to MongoDB]
  ↓ [Trigger AI Service]
AI Service (/api/v1/process-pdf)
  ↓ [Download PDF from URL]
  ↓ [Extract text with PyPDF2]
  ↓ [Chunk text (1000 chars, 200 overlap)]
  ↓ [Generate embeddings via Ollama]
  ↓ [Create FAISS vector store]
  ↓ [Save to /vector_store/{pdfId}.faiss]
  ↓ [Callback to Backend]
Backend → Updates status to 'ready'
```

#### 2. RAG Chat Flow
```
User → Backend (/api/v1/chats/{chatId}/messages)
  ↓ [Save user message to DB]
  ↓ [Forward to AI Service]
AI Service (/api/v1/chat)
  ↓ [Load FAISS stores for pdf_ids]
  ↓ [Merge multiple vector stores]
  ↓ [Retrieve top 4 relevant chunks]
  ↓ [Format context with page numbers]
  ↓ [Send to Gemini Pro with prompt]
  ↓ [Stream response tokens]
Backend
  ↓ [Stream to client]
  ↓ [Save complete response to DB]
```

#### 3. Quiz Generation & Grading Flow
```
User → Backend (/api/v1/quizzes/generate/{chatId})
  ↓ [Get PDF IDs from chat]
  ↓ [Forward to AI Service]
AI Service (/api/v1/generate-quiz)
  ↓ [Load vector stores]
  ↓ [Sample 15 random chunks]
  ↓ [Construct prompt for Gemini]
  ↓ [Generate structured JSON quiz]
  ↓ [Parse & validate]
Backend
  ↓ [Save quiz to MongoDB]
  ↓ [Return quiz to user]

--- Submission ---

User → Backend (/api/v1/quizzes/submit/{quizId})
  ↓ [Get original quiz]
  ↓ [Forward answers to AI Service]
AI Service (/api/v1/grade-quiz)
  ↓ [MCQs: Exact match]
  ↓ [SAQs/LAQs: Send to Gemini for grading]
  ↓ [Generate score + explanation]
Backend
  ↓ [Save quiz attempt with results]
  ↓ [Return graded results]
```

### Services

- **Backend (Node.js/Express)**: REST API, authentication, business logic
- **AI Service (Python/FastAPI)**: PDF processing, RAG, quiz generation, grading
- **MongoDB Atlas**: Cloud database for users, PDFs, chats, quizzes
- **Ollama**: Local embedding model (nomic-embed-text)
- **Google Gemini Pro**: Cloud LLM for text generation

## 🛠️ Tech Stack

### Backend
- **Node.js** 20 + Express
- **MongoDB** Atlas (Cloud)
- **JWT** Authentication
- **Axios** for HTTP requests
- **Cloudinary** for file uploads

### AI Service
- **Python** 3.12 + FastAPI
- **LangChain** for AI workflows
- **Ollama** for local embeddings
- **Google Gemini Pro** for LLM
- **FAISS** for vector storage

### Infrastructure
- **Docker** + Docker Compose
- **Nginx** (production reverse proxy)
- **Let's Encrypt** (SSL certificates)

## 🚀 Quick Start

### Prerequisites

- **Docker** (v20.10+) - [Install](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2.0+)
- **MongoDB Atlas** account - [Sign up free](https://www.mongodb.com/cloud/atlas/register)
- **Google API Key** - [Get key](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd beyond-chats-assignment
```

2. **Set up MongoDB Atlas**

Follow the detailed guide: [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

Quick steps:
- Create free cluster
- Create database user
- Whitelist IP (0.0.0.0/0 for development)
- Copy connection string

3. **Configure environment**

```bash
# Copy environment template
cp .env.example .env

# Edit with your credentials
nano .env
```

**Required variables:**
```bash
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/study-app?retryWrites=true&w=majority

# Google API key
GOOGLE_API_KEY=your-google-api-key-here

# JWT secret (generate a strong one)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
```

4. **Deploy with Docker**

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Select **Option 1** for first-time setup.

5. **Verify deployment**

```bash
# Check services are running
docker compose ps

# Test endpoints
curl http://localhost:5000/    # Backend
curl http://localhost:8000/    # AI Service
```

### Access the Application

- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000

## 📚 Deployment

### Local Development
✅ You're already running locally if you followed Quick Start!

### Production Deployment

Choose your deployment method:

1. **VPS Deployment** (Recommended for Ollama)
   - See [PRODUCTION_DEPLOY.md](./PRODUCTION_DEPLOY.md)
   - Works on: AWS EC2, DigitalOcean, Hetzner, Google Cloud
   - Requires: 4GB RAM minimum

2. **Complete Deployment Guide**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Includes: Docker setup, Nginx, SSL, monitoring

### Quick Production Deploy

```bash
# On your VPS (Ubuntu 22.04)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone and setup
git clone <your-repo>
cd beyond-chats-assignment
cp .env.example .env
nano .env  # Add your credentials

# Deploy
chmod +x deploy.sh
./deploy.sh
```

## 📡 API Documentation

### Backend API (Port 5000)

All endpoints (except `/auth/*`) require JWT authentication via `Authorization: Bearer <token>` header.

---

#### 🔐 **Authentication Routes** (`/api/v1/auth`)

<details>
<summary><b>POST</b> <code>/api/v1/auth/signup</code> - Register new user</summary>

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation:**
- `name`: Required, non-empty
- `email`: Valid email format
- `password`: Minimum 6 characters

**Response (201):**
```json
{
  "message": "User registered successfully. Please login.",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Errors:**
- `400`: Validation errors
- `409`: Email already exists
</details>

<details>
<summary><b>POST</b> <code>/api/v1/auth/login</code> - Authenticate user</summary>

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Token Expiration:** 7 days

**Errors:**
- `400`: Invalid credentials
- `401`: Incorrect password
</details>

---

#### 📄 **PDF Routes** (`/api/v1/pdfs`)

<details>
<summary><b>GET</b> <code>/api/v1/pdfs</code> - Get all user's PDFs</summary>

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "pdfs": [
    {
      "_id": "65f7a8b9c3d4e5f6a7b8c9d0",
      "filename": "machine-learning.pdf",
      "cloudinaryUrl": "https://res.cloudinary.com/.../machine-learning.pdf",
      "processingStatus": "ready",
      "youtubeRecommendations": [
        {
          "title": "Introduction to Machine Learning",
          "url": "https://www.youtube.com/watch?v=abc123",
          "videoId": "abc123"
        }
      ],
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-15T10:32:00.000Z"
    }
  ]
}
```

**Statuses:**
- `pending`: Waiting for processing
- `processing`: AI service is processing
- `ready`: Available for chat/quiz
- `failed`: Processing error occurred
</details>

<details>
<summary><b>POST</b> <code>/api/v1/pdfs/upload</code> - Upload PDFs</summary>

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request:**
- Field name: `pdfs`
- Max files: 10 simultaneous
- Max size per file: 50MB
- Allowed type: PDF only

**Request (FormData):**
```javascript
const formData = new FormData();
formData.append('pdfs', file1);
formData.append('pdfs', file2);
// Up to 10 files
```

**Response (201):**
```json
{
  "message": "PDFs uploaded successfully and processing started.",
  "pdfs": [
    {
      "_id": "65f7a8b9c3d4e5f6a7b8c9d0",
      "filename": "algorithms.pdf",
      "cloudinaryUrl": "https://res.cloudinary.com/.../algorithms.pdf",
      "processingStatus": "processing"
    }
  ]
}
```

**Processing Flow:**
1. Files uploaded to Cloudinary
2. Metadata saved to MongoDB
3. Background job triggers AI service
4. AI service creates vector embeddings
5. Status updated to 'ready'

**Errors:**
- `400`: No files / Invalid file type
- `413`: File too large
- `500`: Upload failed
</details>

---

#### 💬 **Chat Routes** (`/api/v1/chats`)

<details>
<summary><b>POST</b> <code>/api/v1/chats</code> - Create new chat session</summary>

**Request Body:**
```json
{
  "title": "Machine Learning Study Session",
  "pdfIds": [
    "65f7a8b9c3d4e5f6a7b8c9d0",
    "65f7a8b9c3d4e5f6a7b8c9d1"
  ]
}
```

**Response (201):**
```json
{
  "chat": {
    "_id": "65f7a8b9c3d4e5f6a7b8c9d2",
    "title": "Machine Learning Study Session",
    "user": "507f1f77bcf86cd799439011",
    "pdfs": ["65f7a8b9c3d4e5f6a7b8c9d0", "65f7a8b9c3d4e5f6a7b8c9d1"],
    "createdAt": "2024-03-15T11:00:00.000Z"
  }
}
```
</details>

<details>
<summary><b>GET</b> <code>/api/v1/chats</code> - Get all user's chats</summary>

**Response (200):**
```json
{
  "chats": [
    {
      "_id": "65f7a8b9c3d4e5f6a7b8c9d2",
      "title": "ML Study Session",
      "pdfs": [
        {
          "_id": "65f7a8b9c3d4e5f6a7b8c9d0",
          "filename": "algorithms.pdf"
        }
      ],
      "createdAt": "2024-03-15T11:00:00.000Z",
      "updatedAt": "2024-03-15T11:30:00.000Z"
    }
  ]
}
```
</details>

<details>
<summary><b>GET</b> <code>/api/v1/chats/:chatId/messages</code> - Get chat messages</summary>

**Response (200):**
```json
{
  "messages": [
    {
      "_id": "65f7a8b9c3d4e5f6a7b8c9d3",
      "chat": "65f7a8b9c3d4e5f6a7b8c9d2",
      "role": "user",
      "content": "Explain gradient descent",
      "createdAt": "2024-03-15T11:05:00.000Z"
    },
    {
      "_id": "65f7a8b9c3d4e5f6a7b8c9d4",
      "chat": "65f7a8b9c3d4e5f6a7b8c9d2",
      "role": "assistant",
      "content": "Gradient descent is an optimization algorithm... [Source: Page 45]",
      "createdAt": "2024-03-15T11:05:03.000Z"
    }
  ]
}
```
</details>

<details>
<summary><b>POST</b> <code>/api/v1/chats/:chatId/messages</code> - Send message (Streaming)</summary>

**Request Body:**
```json
{
  "content": "What is backpropagation?"
}
```

**Response:** Server-Sent Events (SSE) stream
```
Content-Type: text/event-stream

data: Back
data: propagation
data:  is
data:  a
data:  method
... [streaming continues]
```

**After streaming completes:**
- User message saved to DB
- AI response saved to DB
- Both messages linked to chat session

**Note:** Use EventSource API or fetch with stream handling on client side
</details>

<details>
<summary><b>GET</b> <code>/api/v1/chats/:chatId/details</code> - Get chat with PDFs</summary>

**Response (200):**
```json
{
  "chat": {
    "_id": "65f7a8b9c3d4e5f6a7b8c9d2",
    "title": "ML Study Session",
    "pdfs": [
      {
        "_id": "65f7a8b9c3d4e5f6a7b8c9d0",
        "filename": "algorithms.pdf",
        "processingStatus": "ready"
      }
    ],
    "createdAt": "2024-03-15T11:00:00.000Z"
  }
}
```
</details>

---

#### 📝 **Quiz Routes** (`/api/v1/quizzes`)

<details>
<summary><b>POST</b> <code>/api/v1/quizzes/generate/:chatId</code> - Generate quiz</summary>

**Request Body:**
```json
{
  "numMCQs": 5,
  "numSAQs": 3,
  "numLAQs": 2
}
```

**Response (201):**
```json
{
  "quiz": {
    "_id": "65f7a8b9c3d4e5f6a7b8c9d5",
    "chat": "65f7a8b9c3d4e5f6a7b8c9d2",
    "questions": [
      {
        "_id": "65f7a8b9c3d4e5f6a7b8c9d6",
        "question_type": "mcq",
        "question": "What is the primary goal of gradient descent?",
        "options": [
          "Maximize loss",
          "Minimize loss",
          "Calculate derivatives",
          "Update weights"
        ],
        "ideal_answer": "Minimize loss"
      },
      {
        "_id": "65f7a8b9c3d4e5f6a7b8c9d7",
        "question_type": "saq",
        "question": "Explain the vanishing gradient problem.",
        "ideal_answer": "The vanishing gradient problem occurs when..."
      }
    ],
    "createdAt": "2024-03-15T12:00:00.000Z"
  }
}
```

**Question Limits:**
- MCQs: 1 point each
- SAQs: 3 points each (Short Answer)
- LAQs: 5 points each (Long Answer)
</details>

<details>
<summary><b>POST</b> <code>/api/v1/quizzes/submit/:quizId</code> - Submit & grade quiz</summary>

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "65f7a8b9c3d4e5f6a7b8c9d6",
      "answer": "Minimize loss"
    },
    {
      "questionId": "65f7a8b9c3d4e5f6a7b8c9d7",
      "answer": "Gradients become very small during backpropagation..."
    }
  ]
}
```

**Response (200):**
```json
{
  "attempt": {
    "_id": "65f7a8b9c3d4e5f6a7b8c9d8",
    "quiz": "65f7a8b9c3d4e5f6a7b8c9d5",
    "user": "507f1f77bcf86cd799439011",
    "totalScore": 4,
    "maxScore": 10,
    "gradedQuestions": [
      {
        "questionId": "65f7a8b9c3d4e5f6a7b8c9d6",
        "userAnswer": "Minimize loss",
        "score": 1,
        "maxScore": 1,
        "explanation": "Correct! Gradient descent minimizes the loss function."
      },
      {
        "questionId": "65f7a8b9c3d4e5f6a7b8c9d7",
        "userAnswer": "Gradients become very small...",
        "score": 3,
        "maxScore": 3,
        "explanation": "Excellent answer. You correctly explained..."
      }
    ],
    "submittedAt": "2024-03-15T12:15:00.000Z"
  }
}
```

**Grading Method:**
- **MCQs**: Exact string match (case-insensitive after trimming)
- **SAQs/LAQs**: AI-graded by Google Gemini with explanation
</details>

<details>
<summary><b>GET</b> <code>/api/v1/quizzes/attempts/chat/:chatId</code> - Get quiz attempts</summary>

**Response (200):**
```json
{
  "attempts": [
    {
      "_id": "65f7a8b9c3d4e5f6a7b8c9d8",
      "quiz": "65f7a8b9c3d4e5f6a7b8c9d5",
      "totalScore": 8,
      "maxScore": 10,
      "submittedAt": "2024-03-15T12:15:00.000Z"
    }
  ]
}
```
</details>

<details>
<summary><b>GET</b> <code>/api/v1/quizzes/attempts/:attemptId</code> - Get attempt details</summary>

**Response (200):**
```json
{
  "attempt": {
    "_id": "65f7a8b9c3d4e5f6a7b8c9d8",
    "quiz": {
      "_id": "65f7a8b9c3d4e5f6a7b8c9d5",
      "questions": [...]
    },
    "totalScore": 8,
    "maxScore": 10,
    "gradedQuestions": [...],
    "submittedAt": "2024-03-15T12:15:00.000Z"
  }
}
```
</details>

---

#### 👤 **User Routes** (`/api/v1/users`)

<details>
<summary><b>GET</b> <code>/api/v1/users/profile</code> - Get user profile</summary>

**Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-03-01T10:00:00.000Z"
  }
}
```
</details>

---

### AI Service API (Port 8000)

> **Note:** AI Service endpoints are called internally by the Backend. Direct client access is not required.

---

#### 📄 **PDF Processing**

<details>
<summary><b>POST</b> <code>/api/v1/process-pdf</code> - Process PDF & create embeddings</summary>

**Request Body:**
```json
{
  "pdfId": "65f7a8b9c3d4e5f6a7b8c9d0",
  "pdfUrl": "https://res.cloudinary.com/.../document.pdf"
}
```

**Response (202 Accepted):**
```json
{
  "message": "PDF processing has been accepted and started in the background."
}
```

**Background Process:**
1. Downloads PDF from URL
2. Extracts text with PyPDF2
3. Splits into chunks (1000 chars, 200 overlap)
4. Generates embeddings via Ollama (nomic-embed-text)
5. Creates FAISS vector store
6. Saves to `/vector_store/{pdfId}.faiss/`
7. Callbacks backend to update status

**Processing Time:** 30-120 seconds depending on PDF size
</details>

---

#### 💬 **Chat (RAG)**

<details>
<summary><b>POST</b> <code>/api/v1/chat</code> - Stream RAG-based response</summary>

**Request Body:**
```json
{
  "query": "Explain neural networks",
  "pdfIds": ["65f7a8b9c3d4e5f6a7b8c9d0", "65f7a8b9c3d4e5f6a7b8c9d1"]
}
```

**Response:** Text stream (plain text)
```
Content-Type: text/plain

Neural networks are computational models... [Source: Page 12]
```

**RAG Process:**
1. Loads FAISS vector stores for each PDF
2. Merges into single searchable index
3. Retrieves top 4 relevant document chunks
4. Formats context with page numbers
5. Sends to Gemini Pro with structured prompt
6. Streams response tokens in real-time
</details>

---

#### 📝 **Quiz Generation & Grading**

<details>
<summary><b>POST</b> <code>/api/v1/generate-quiz</code> - Generate quiz from PDFs</summary>

**Request Body:**
```json
{
  "pdfIds": ["65f7a8b9c3d4e5f6a7b8c9d0"],
  "numMCQs": 5,
  "numSAQs": 3,
  "numLAQs": 2
}
```

**Response (200):**
```json
{
  "mcqs": [
    {
      "question_type": "mcq",
      "question": "What is a neuron?",
      "options": ["A", "B", "C", "D"],
      "ideal_answer": "B"
    }
  ],
  "saqs": [...],
  "laqs": [...]
}
```

**Generation Process:**
1. Loads vector stores for PDFs
2. Samples 15 random chunks for diversity
3. Constructs structured prompt for Gemini
4. Requests JSON output
5. Validates & parses response
6. Returns categorized questions
</details>

<details>
<summary><b>POST</b> <code>/api/v1/grade-quiz</code> - Grade quiz submission</summary>

**Request Body:**
```json
{
  "questions_to_grade": [
    {
      "question_id": "q1",
      "question": "Explain backpropagation",
      "question_type": "saq",
      "ideal_answer": "Backpropagation is...",
      "user_answer": "It calculates gradients..."
    }
  ]
}
```

**Response (200):**
```json
{
  "total_score": 2.5,
  "max_score": 3.0,
  "graded_questions": [
    {
      "question_id": "q1",
      "score": 2.5,
      "max_score": 3.0,
      "explanation": "Good understanding shown, but could elaborate more on..."
    }
  ]
}
```

**Grading Logic:**
- MCQs: Exact match (1 or 0)
- SAQs/LAQs: Gemini evaluates against ideal answer, provides 0-max score
</details>

---

#### 📺 **YouTube Topics**

<details>
<summary><b>POST</b> <code>/api/v1/youtube/generate-topics</code> - Generate video topics</summary>

**Request Body:**
```json
{
  "pdfIds": ["65f7a8b9c3d4e5f6a7b8c9d0"]
}
```

**Response (200):**
```json
{
  "topics": {
    "65f7a8b9c3d4e5f6a7b8c9d0": [
      "Introduction to Neural Networks",
      "Backpropagation Algorithm Explained"
    ]
  }
}
```

**Process:**
1. Extracts context from each PDF
2. Sends to Gemini to generate 2 topics per PDF
3. Returns topics mapped to PDF IDs
</details>

## 📁 Project Structure

```
beyond-chats-assignment/
├── ai-service-python/           # Python AI Service
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── chat_api.py
│   │   │   ├── pdf_api.py
│   │   │   └── quiz_api.py
│   │   ├── services/            # Business logic
│   │   │   ├── pdf_processor.py
│   │   │   ├── rag_service.py
│   │   │   └── quiz_service.py
│   │   └── schemas/             # Pydantic models
│   ├── vector_store/            # FAISS vector databases
│   ├── Dockerfile
│   └── requirements.txt
│
├── backend-node/                # Node.js Backend
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/     # Request handlers
│   │   │   ├── routes/          # API routes
│   │   │   └── middleware/      # Auth, validation
│   │   ├── config/              # Configuration
│   │   └── services/            # Business logic
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml           # Docker orchestration
├── deploy.sh                    # Interactive deploy script
├── .env.example                 # Environment template
│
└── Documentation/
    ├── DEPLOYMENT.md            # Complete deployment guide
    ├── PRODUCTION_DEPLOY.md     # VPS deployment guide
    └── MONGODB_ATLAS_SETUP.md   # MongoDB setup guide
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available options.

**Required:**
- `MONGO_URI` - MongoDB Atlas connection string
- `GOOGLE_API_KEY` - Google Gemini API key
- `JWT_SECRET` - Secret for JWT signing

**Optional:**
- `CLOUDINARY_*` - For file uploads
- `GOOGLE_CLIENT_*` - For OAuth
- `CORS_ORIGIN` - Frontend URL

## 🐳 Docker Management

### Using Deploy Script
```bash
./deploy.sh

# Options:
# 1. Start all services (first time)
# 2. Start all services (normal)
# 3. Stop all services
# 4. Restart all services
# 5. View logs
# 6. View status
# 7. Clean up
# 8. Rebuild containers
```

### Manual Docker Commands
```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild
docker compose up -d --build

# Check status
docker compose ps
```

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
- Ensure IP is whitelisted in MongoDB Atlas
- Verify connection string in `.env`
- Check Network Access settings

**2. Ollama Model Not Loading**
```bash
docker compose exec ollama ollama pull nomic-embed-text
docker compose logs -f ollama
```

**3. AI Service Errors**
- Verify `GOOGLE_API_KEY` is set
- Check Ollama is running: `curl http://localhost:11434`
- Restart service: `docker compose restart ai-service`

**4. Port Already in Use**
```bash
# Find process using port
sudo lsof -i :5000
# Kill or change port in docker-compose.yml
```

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for more solutions.

## 📊 Monitoring

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f ai-service
```

### Resource Usage
```bash
docker stats
docker system df
```

## 🔒 Security

### Production Checklist
- [ ] Use strong JWT secret (64+ characters)
- [ ] Restrict CORS to your domain
- [ ] Use HTTPS (SSL certificates)
- [ ] Whitelist specific IPs in MongoDB Atlas
- [ ] Don't commit `.env` to git
- [ ] Enable firewall on VPS
- [ ] Regular security updates

## 📈 Performance

### Optimization Tips
- Use MongoDB Atlas M10+ for better performance
- Increase VPS RAM for Ollama (8GB recommended)
- Enable Nginx caching
- Use CDN for static files
- Implement rate limiting

---

## ⚠️ Limitations & Considerations

### AI Model Constraints

#### **Google Gemini Pro API**
- **Rate Limits**: 60 requests/minute on free tier
- **Token Limits**: ~30K input tokens, ~2K output tokens per request
- **Cost**: Free tier available; production usage ~$40-60/month for 1000 users
- **Accuracy**: May occasionally hallucinate; always cites sources
- **Language**: Optimized for English

#### **Ollama nomic-embed-text** (Local Model)
- **Model Size**: 274 MB download
- **RAM Required**: 2-4 GB minimum
- **Processing Speed**: 20-50 seconds per 10-page PDF
- **Vector Store Size**: 1-5 MB per PDF (grows with library)
- **Concurrency**: Sequential processing (queues multiple requests)
- **Deployment**: Cannot use serverless platforms (needs persistent container)

### External Service Limits

#### **MongoDB Atlas (Free Tier)**
- **Storage**: 512 MB max
- **Connections**: 500 concurrent
- **Backups**: None (manual only)
- **Capacity**: ~10K users, 50K PDFs, 100K messages comfortably

#### **Cloudinary (Free Tier)**
- **Storage**: 25 GB (~2,500-12,500 PDFs)
- **Bandwidth**: 25 GB/month (~5,000 downloads)
- **Transformations**: 25,000/month

#### **YouTube Data API v3**
- **Daily Quota**: 10,000 units
- **Searches**: ~100 searches per day (each search = 100 units)
- **Impact**: Limits recommendations to ~50 PDFs per day

### Known Limitations
- ❌ **No offline mode** - Requires internet connection
- ❌ **Scanned PDFs** - Cannot process image-based PDFs (need OCR)
- ❌ **Encrypted PDFs** - Password-protected files not supported
- ❌ **No real-time collaboration** - Single-user sessions only
- ❌ **No mobile app** - Web-only interface
- ❌ **No PDF annotation** - Cannot highlight or annotate
- ⚠️ **AI grading variability** - May not match human judgment exactly
- ⚠️ **Processing delays** - 30-120 seconds per PDF on first upload

**📖 For detailed limitations and workarounds, see [LIMITATIONS.md](./LIMITATIONS.md)**

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

Copyright (c) [2025] [Praveen Kumar]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🙏 Acknowledgments

- Built with [LangChain](https://www.langchain.com/)
- Powered by [Google Gemini](https://ai.google.dev/)
- Local embeddings by [Ollama](https://ollama.ai/)
- Database by [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 📞 Support

- **📋 Complete Overview**: See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for comprehensive technical details
- **📖 Documentation**: All guides in the `/` folder
- **⚠️ Limitations**: See [LIMITATIONS.md](./LIMITATIONS.md) for detailed constraints
- **🐛 Issues**: Check [Troubleshooting](./DEPLOYMENT.md#troubleshooting) first
- **💡 Questions**: Review all documentation files

---

**Made with ❤️ for students**

**Ready to deploy?** Start with [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md), then run `./deploy.sh`!

**Need details?** Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for the complete technical overview!
