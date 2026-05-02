# Study App — AI-Powered Learning Platform

> A full-stack application for students that combines PDF analysis, RAG-based chat, automated quiz generation with AI grading, and YouTube video recommendations.

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.118-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-121212?logo=chainlink&logoColor=white)](https://www.langchain.com/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Limitations & Considerations](#limitations--considerations)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Docker Management](#docker-management)
- [Troubleshooting](#troubleshooting)

---

## Overview

Study App is an AI-powered learning platform built with a microservices architecture. It uses a hybrid model approach — **local Ollama embeddings** for free, unlimited vector search, and **Google Gemini Pro** for text generation — which keeps costs low while maintaining good quality.

The idea is straightforward: upload your PDFs once, then actually interact with them. Ask questions across multiple documents, generate quizzes from the content, and get YouTube recommendations for topics you're struggling with. Everything persists across sessions so your chat history and quiz attempts don't disappear.

### What's under the hood

- **Multi-PDF Upload & Processing** — upload up to 10 PDFs at once (50MB each), stored on Cloudinary, processed into FAISS vector indexes in the background
- **RAG-Based Chat** — questions are answered using the actual content of your PDFs, with page-number citations so you can verify things
- **Quiz Generation** — MCQs, short-answer, and long-answer questions generated from your documents; SAQs and LAQs are graded by Gemini with a written explanation
- **YouTube Recommendations** — 2 relevant video suggestions per PDF, fetched from the actual YouTube Data API (not just search terms)
- **Progress Tracking** — all quiz attempts are saved with scores and per-question feedback

---

## Features

### Authentication & User Management

- JWT-based auth with bcrypt password hashing
- 7-day token expiration
- All user data (PDFs, chats, quizzes) is scoped to the authenticated user
- Profile endpoint for basic user info

### PDF Management

Upload PDFs and let the pipeline handle the rest. Files go to Cloudinary, text gets extracted and chunked, embeddings are generated locally via Ollama, and a FAISS vector store gets saved to disk. The whole thing runs in the background so the upload endpoint returns immediately.

- Batch upload: up to 10 files at once, 50MB each
- Processing status tracked per file: `pending → processing → ready / failed`
- Each user has their own PDF library
- Vector stores saved at `/vector_store/{pdfId}.faiss/`
- YouTube recommendations generated and stored alongside each PDF after processing

### Chat (RAG)

Create a chat session with one or more of your PDFs, then ask anything. The system retrieves the most relevant chunks from your documents, sends them to Gemini along with your question, and streams back the answer with source citations.

- Chat across multiple PDFs in one session
- Real-time streaming responses (Server-Sent Events)
- Source citations include page numbers from the original document
- Full conversation history saved and retrievable
- Multiple independent chat sessions supported

**How retrieval works:** for each message, the FAISS indexes for the session's PDFs are loaded and merged into a single index. The top 4 most relevant chunks are retrieved, formatted with their page numbers, and passed to Gemini as context.

### Quiz Generation & Grading

Point the quiz generator at any chat session and specify how many of each question type you want. It samples 15 random chunks from the session's PDFs for diversity, builds a structured prompt, and asks Gemini to return a JSON quiz.

**Question types:**
- **MCQ** (Multiple Choice) — 4 options, 1 point each, graded by exact string match
- **SAQ** (Short Answer) — 3 points each, AI-graded with explanation
- **LAQ** (Long Answer) — 5 points each, AI-graded with explanation

On submission, MCQs are checked instantly. SAQs and LAQs are sent to Gemini along with the ideal answer for evaluation — it returns a numeric score and a written explanation of what was right or missing.

All attempts are saved with full per-question breakdowns so you can review your reasoning afterward.

### YouTube Integration

After a PDF is processed, the app extracts representative context from it and asks Gemini to suggest 2 relevant search topics. These topics are used to fetch actual video results from the YouTube Data API v3. The recommendations (title, URL, video ID) are stored with the PDF and returned in listing endpoints.

Note: the free YouTube API quota allows around 50 PDFs worth of recommendations per day before hitting the limit.

---

## Architecture

### System diagram

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
│         │JWT Auth    │File Upload  │Streaming   │Quiz Logic   │ │
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
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  PDF Processing  │  RAG Chat  │  Quiz Gen  │  YouTube   │  │
│  └─────────────────────────────────────────────────────────┘   │
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

### Service responsibilities

**Node.js / Express (port 5000)**

Handles everything user-facing: auth, file uploads, chat session management, quiz orchestration, and all database operations. It's the single entry point for the frontend and coordinates calls to the AI service.

Key libraries: Express, Mongoose, Multer, Bcrypt, JWT, Axios

**Python / FastAPI (port 8000)**

Does all the AI work: PDF text extraction, chunking, embedding generation, vector store management, retrieval, generation, and grading. It's called internally by the Node backend — no direct client access needed.

Key libraries: FastAPI, LangChain, PyPDF2, FAISS, Ollama, Google Generative AI

**Why two services?** Keeping Node and Python separate means you can swap out the AI backend (e.g., switch from Gemini to OpenAI, or change the embedding model) without touching auth or file logic. It also makes local development cleaner since you can restart one without affecting the other.

### Data flow examples

**PDF Upload & Processing**
```
User → POST /api/v1/pdfs/upload
  → Multer buffers file
  → Upload to Cloudinary
  → Save metadata to MongoDB (status: pending)
  → Trigger AI service (async)

AI Service → POST /api/v1/process-pdf
  → Download PDF from Cloudinary URL
  → Extract text (PyPDF2)
  → Split into chunks (1000 chars, 200 overlap)
  → Generate embeddings (Ollama nomic-embed-text)
  → Build FAISS index
  → Save to /vector_store/{pdfId}.faiss/
  → Callback to Node backend

Node backend → Update status to 'ready'
```

**RAG Chat**
```
User → POST /api/v1/chats/:chatId/messages
  → Save user message to MongoDB
  → Forward to AI service

AI Service → POST /api/v1/chat
  → Load FAISS stores for all pdfIds in session
  → Merge into single searchable index
  → Retrieve top 4 relevant chunks
  → Format context with page numbers
  → Build prompt and send to Gemini Pro
  → Stream response tokens back

Node backend → Stream to client via SSE
           → Save complete response to MongoDB
```

**Quiz Generation & Grading**
```
User → POST /api/v1/quizzes/generate/:chatId
  → Node gets PDF IDs from session
  → Forward to AI service

AI Service
  → Load vector stores
  → Sample 15 random chunks for diversity
  → Build structured Gemini prompt requesting JSON
  → Parse and validate response
  → Return MCQs, SAQs, LAQs

Node backend → Save quiz to MongoDB → Return to user

--- On submission ---

User → POST /api/v1/quizzes/submit/:quizId
  → Node retrieves original quiz
  → Forwards user answers to AI service

AI Service
  → MCQs: exact string match
  → SAQs/LAQs: Gemini evaluates vs ideal answer → score + explanation

Node backend → Save attempt with all results → Return to user
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Node.js 20 + Express |
| Database | MongoDB Atlas |
| File Storage | Cloudinary |
| AI Service | Python 3.12 + FastAPI |
| AI Orchestration | LangChain 0.3 |
| Embeddings | Ollama (nomic-embed-text, 274MB, local) |
| LLM | Google Gemini Pro |
| Vector Store | FAISS |
| Containerization | Docker + Docker Compose |
| Production Proxy | Nginx + Let's Encrypt |

---

## Quick Start

### Prerequisites

- **Docker** v20.10+ — [Install](https://docs.docker.com/get-docker/)
- **Docker Compose** v2.0+
- **MongoDB Atlas** account — [Sign up free](https://www.mongodb.com/cloud/atlas/register)
- **Google API Key** for Gemini — [Get one](https://makersuite.google.com/app/apikey)

### Installation

**1. Clone the repo**

```bash
git clone <your-repo-url>
cd beyond-chats-assignment
```

**2. Set up MongoDB Atlas**

Follow the detailed walkthrough: [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

Short version: create a free cluster, add a database user, whitelist `0.0.0.0/0` for development, copy the connection string.

**3. Configure environment variables**

```bash
cp .env.example .env
nano .env
```

Minimum required:
```bash
MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/study-app?retryWrites=true&w=majority
GOOGLE_API_KEY=your-google-api-key
JWT_SECRET=your-secret-key-at-least-32-characters
```

**4. Deploy**

```bash
chmod +x deploy.sh
./deploy.sh
# Select option 1 for first-time setup
```

**5. Verify**

```bash
docker compose ps

curl http://localhost:5000/   # Node backend
curl http://localhost:8000/   # AI service
```

---

## API Documentation

All endpoints except `/api/v1/auth/*` require:
```
Authorization: Bearer <jwt_token>
```

---

### Authentication — `/api/v1/auth`

<details>
<summary><b>POST</b> <code>/api/v1/auth/signup</code> — Register a new user</summary>

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Validation: name required, valid email, password ≥ 6 characters.

**Response (201):**
```json
{
  "message": "User registered successfully. Please login.",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Errors:** `400` validation failed, `409` email already in use
</details>

<details>
<summary><b>POST</b> <code>/api/v1/auth/login</code> — Log in</summary>

**Request body:**
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

Token expires after 7 days.

**Errors:** `400` invalid credentials, `401` wrong password
</details>

---

### PDFs — `/api/v1/pdfs`

<details>
<summary><b>GET</b> <code>/api/v1/pdfs</code> — List your PDFs</summary>

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

Processing statuses: `pending` → `processing` → `ready` / `failed`
</details>

<details>
<summary><b>POST</b> <code>/api/v1/pdfs/upload</code> — Upload PDFs</summary>

**Headers:**
```
Content-Type: multipart/form-data
```

**Request:** form field `pdfs`, up to 10 files, 50MB each, PDF only.

```javascript
const formData = new FormData();
formData.append('pdfs', file1);
formData.append('pdfs', file2);
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

Background processing starts immediately after upload. Poll the GET endpoint to check status.

**Errors:** `400` no files or wrong type, `413` file too large, `500` upload failed
</details>

---

### Chats — `/api/v1/chats`

<details>
<summary><b>POST</b> <code>/api/v1/chats</code> — Create a chat session</summary>

**Request body:**
```json
{
  "title": "Machine Learning Study Session",
  "pdfIds": [
    "65f7a8b9c3d4e5f6a7b8c9d0",
    "65f7a8b9c3d4e5f6a7b8c9d1"
  ]
}
```

All PDFs in `pdfIds` should have status `ready` — otherwise retrieval won't have anything to search.

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
<summary><b>GET</b> <code>/api/v1/chats</code> — List your sessions</summary>

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
<summary><b>GET</b> <code>/api/v1/chats/:chatId/messages</code> — Get message history</summary>

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
<summary><b>POST</b> <code>/api/v1/chats/:chatId/messages</code> — Send a message (streaming)</summary>

**Request body:**
```json
{
  "content": "What is backpropagation?"
}
```

**Response:** Server-Sent Events stream
```
Content-Type: text/event-stream

data: Back
data: propagation
data:  is
data:  a
data:  method
... (continues until complete)
```

Use `EventSource` or `fetch` with stream reading on the client side. The full response is saved to MongoDB once streaming finishes.
</details>

<details>
<summary><b>GET</b> <code>/api/v1/chats/:chatId/details</code> — Session details with PDF info</summary>

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

### Quizzes — `/api/v1/quizzes`

<details>
<summary><b>POST</b> <code>/api/v1/quizzes/generate/:chatId</code> — Generate a quiz</summary>

**Request body:**
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

Point values: MCQ = 1pt, SAQ = 3pts, LAQ = 5pts.
</details>

<details>
<summary><b>POST</b> <code>/api/v1/quizzes/submit/:quizId</code> — Submit and grade</summary>

**Request body:**
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

MCQs are graded by case-insensitive exact match. SAQs and LAQs go through Gemini, which compares the answer against the ideal and returns a numeric score with an explanation.
</details>

<details>
<summary><b>GET</b> <code>/api/v1/quizzes/attempts/chat/:chatId</code> — Past attempts for a session</summary>

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
<summary><b>GET</b> <code>/api/v1/quizzes/attempts/:attemptId</code> — Full attempt details</summary>

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

### User — `/api/v1/users`

<details>
<summary><b>GET</b> <code>/api/v1/users/profile</code> — Get your profile</summary>

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

### AI Service API (port 8000)

These are called internally by the Node backend. Documented here for completeness — you won't need to hit them from a frontend.

<details>
<summary><b>POST</b> <code>/api/v1/process-pdf</code> — Process a PDF and create embeddings</summary>

**Request body:**
```json
{
  "pdfId": "65f7a8b9c3d4e5f6a7b8c9d0",
  "pdfUrl": "https://res.cloudinary.com/.../document.pdf"
}
```

**Response (202):**
```json
{
  "message": "PDF processing has been accepted and started in the background."
}
```

Runs async: download → extract → chunk → embed → index → callback to backend. Usually 30–120 seconds.
</details>

<details>
<summary><b>POST</b> <code>/api/v1/chat</code> — Stream a RAG response</summary>

**Request body:**
```json
{
  "query": "Explain neural networks",
  "pdfIds": ["65f7a8b9c3d4e5f6a7b8c9d0", "65f7a8b9c3d4e5f6a7b8c9d1"]
}
```

**Response:** plain text stream with source citations inline.
</details>

<details>
<summary><b>POST</b> <code>/api/v1/generate-quiz</code> — Generate quiz questions</summary>

**Request body:**
```json
{
  "pdfIds": ["65f7a8b9c3d4e5f6a7b8c9d0"],
  "numMCQs": 5,
  "numSAQs": 3,
  "numLAQs": 2
}
```

**Response:** JSON object with `mcqs`, `saqs`, `laqs` arrays, each containing questions and ideal answers.
</details>

<details>
<summary><b>POST</b> <code>/api/v1/grade-quiz</code> — Grade submitted answers</summary>

**Request body:**
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

**Response:** `total_score`, `max_score`, and per-question `score` + `explanation`.
</details>

<details>
<summary><b>POST</b> <code>/api/v1/youtube/generate-topics</code> — Generate video search topics</summary>

**Request body:**
```json
{
  "pdfIds": ["65f7a8b9c3d4e5f6a7b8c9d0"]
}
```

**Response:**
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
</details>

---

## Deployment

### Local development

You're already set if you followed Quick Start.

### Production (VPS)

Recommended for anything beyond local testing since Ollama needs a persistent container — serverless won't work here.

**Minimum specs:** 4GB RAM. 8GB recommended if you expect concurrent PDF processing.

Works on: AWS EC2, DigitalOcean Droplets, Hetzner Cloud, Google Cloud VMs.

```bash
# On your VPS (Ubuntu 22.04)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

git clone <your-repo>
cd beyond-chats-assignment
cp .env.example .env
nano .env

chmod +x deploy.sh
./deploy.sh
```

Full guides:
- [PRODUCTION_DEPLOY.md](./PRODUCTION_DEPLOY.md) — VPS setup with Nginx and SSL
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Everything including monitoring
- [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md) — Atlas configuration walkthrough

---

## Project Structure

```
beyond-chats-assignment/
├── ai-service-python/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat_api.py
│   │   │   ├── pdf_api.py
│   │   │   └── quiz_api.py
│   │   ├── services/
│   │   │   ├── pdf_processor.py
│   │   │   ├── rag_service.py
│   │   │   └── quiz_service.py
│   │   └── schemas/            # Pydantic models
│   ├── vector_store/           # FAISS indexes, one per PDF
│   ├── Dockerfile
│   └── requirements.txt
│
├── backend-node/
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── routes/         # Route definitions
│   │   │   └── middleware/     # Auth, validation
│   │   ├── config/
│   │   └── services/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── deploy.sh
├── .env.example
│
└── Documentation/
    ├── DEPLOYMENT.md
    ├── PRODUCTION_DEPLOY.md
    └── MONGODB_ATLAS_SETUP.md
```

---

## Docker Management

### Using the deploy script

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

### Manual commands

```bash
docker compose up -d
docker compose down
docker compose logs -f
docker compose logs -f backend      # specific service
docker compose logs -f ai-service
docker compose up -d --build        # rebuild after code changes
docker compose ps
docker stats
docker system df
```

---

## Troubleshooting

**MongoDB connection failing**
- Whitelist your IP (or `0.0.0.0/0` for dev) in Atlas → Network Access
- Double-check the connection string format in `.env`
- Make sure the database user has read/write permissions

**Ollama model not loading**
```bash
docker compose exec ollama ollama pull nomic-embed-text
docker compose logs -f ollama
```

**AI service errors**
- Confirm `GOOGLE_API_KEY` is set correctly in `.env`
- Check Ollama is up: `curl http://localhost:11434`
- Restart the service: `docker compose restart ai-service`

**Port already in use**
```bash
sudo lsof -i :5000   # find what's using it
# kill it or change the port in docker-compose.yml
```

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for more.

---

## Limitations & Considerations

### AI model constraints

**Google Gemini Pro**
- Free tier: 60 requests/minute
- Token limits: ~30K input, ~2K output per request
- Production cost estimate: $40–60/month for ~1000 active users
- Grading is non-deterministic — the same answer can score slightly differently on separate runs, which is fine for studying but not for anything high-stakes
- Optimized for English; other languages will see weaker results

**Ollama (nomic-embed-text)**
- Model download: 274MB on first run
- RAM needed: 2–4GB minimum
- Embedding speed: 20–50 seconds per 10-page PDF
- Vector store size: 1–5MB per PDF on disk
- Processes one PDF at a time — concurrent requests queue up
- Can't run on serverless platforms; needs a persistent container

### External service limits

**MongoDB Atlas (free tier)**
- 512MB storage
- 500 concurrent connections
- No automated backups
- Roughly comfortable for: ~10K users, 50K PDFs, 100K messages

**Cloudinary (free tier)**
- 25GB storage (~2,500–12,500 PDFs depending on size)
- 25GB bandwidth/month
- 25,000 transformations/month

**YouTube Data API v3**
- 10,000 quota units/day
- Each search costs 100 units → ~100 searches/day → ~50 PDFs worth of recommendations per day on the free quota

### Other known limitations

- No offline mode — requires internet throughout
- Scanned PDFs don't work — text layer required; no OCR built in
- Password-protected PDFs are not supported
- Single-user sessions only — no real-time collaboration
- Web only, no mobile app
- No PDF annotation or highlighting
- First-time processing: 30–120 seconds per PDF

---

## Security Checklist (production)

- [ ] Strong JWT secret (64+ characters)
- [ ] CORS restricted to your actual domain
- [ ] HTTPS with valid SSL certificate
- [ ] MongoDB Atlas IP whitelist locked down (not `0.0.0.0/0`)
- [ ] `.env` not committed to git
- [ ] Firewall configured on VPS
- [ ] Regular dependency updates

---

## License

MIT — use it however you want.

```
Copyright (c) 2025 Praveen Kumar

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
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## Acknowledgments

- [LangChain](https://www.langchain.com/) for the AI workflow abstractions
- [Google Gemini](https://ai.google.dev/) for the LLM and grading
- [Ollama](https://ollama.ai/) for making local embeddings actually usable
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for the free tier that got this off the ground