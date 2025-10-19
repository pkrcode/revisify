# 🤖 AI Service - Study App

**Python/FastAPI AI Service with LLM and RAG**

The AI service for the Study App, providing intelligent conversational abilities, quiz generation, grading, and YouTube recommendations using LangChain, Ollama embeddings, and Google Gemini API.

---

## 📁 Project Structure

```
ai-service-python/
├── app/
│   ├── __init__.py
│   ├── main.py                         # FastAPI app setup
│   ├── routes/
│   │   ├── chat.py                     # Chat endpoints
│   │   ├── quiz.py                     # Quiz generation endpoints
│   │   ├── youtube.py                  # YouTube recommendations
│   │   └── health.py                   # Health check
│   ├── services/
│   │   ├── chat_service.py             # RAG chat logic
│   │   ├── quiz_service.py             # Quiz generation logic
│   │   ├── grading_service.py          # Quiz grading logic
│   │   ├── youtube_service.py          # YouTube recommendations
│   │   └── vector_store_service.py     # Vector store management
│   ├── utils/
│   │   ├── prompts.py                  # LLM prompts
│   │   ├── embeddings.py               # Embedding configuration
│   │   └── llm.py                      # LLM configuration
│   └── models/
│       └── schemas.py                  # Pydantic models
├── vector_store/                       # FAISS vector store (generated)
├── main.py                             # Entry point
├── requirements.txt                    # Python dependencies
├── .env.example                        # Environment template
├── .dockerignore                       # Docker ignore file
├── Dockerfile                          # Docker configuration
├── check_models.py                     # Model verification script
└── README.md                           # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- pip or poetry
- Ollama installed and running (for embeddings)
- Google Gemini API key

### Installation

```bash
cd ai-service-python
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

### Environment Variables

Create `.env` file:

```env
# Server
PORT=8000
ENV=development

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
EMBEDDING_MODEL=nomic-embed-text

# LLM Configuration
LLM_MODEL=gemini-1.5-pro

# Vector Store
VECTOR_STORE_PATH=./vector_store
```

### Download Ollama Models

```bash
ollama pull nomic-embed-text
```

### Start Ollama Service

```bash
ollama serve
```

### Development Server

```bash
python main.py
```

Server runs at `http://localhost:8000`

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **FastAPI** | Web framework |
| **LangChain** | LLM orchestration |
| **Google Gemini** | LLM provider |
| **Ollama** | Local embeddings |
| **FAISS** | Vector similarity search |
| **Pydantic** | Data validation |
| **Python-dotenv** | Environment management |

---

## 📡 API Endpoints

### Health Check
- `GET /health` - Service health status

### Chat (RAG)
- `POST /api/chat` - Send message with context
  - Request body:
    ```json
    {
      "query": "What is machine learning?",
      "documents": ["PDF content chunks"],
      "chat_history": [{"role": "user", "content": "..."}]
    }
    ```
  - Response: `{"response": "...", "sources": ["page 5"], "processing_time": 1.23}`

### Quiz Generation
- `POST /api/quiz/generate` - Generate quiz from documents
  - Request body:
    ```json
    {
      "documents": ["PDF content chunks"],
      "num_mcq": 3,
      "num_saq": 2,
      "num_laq": 1
    }
    ```
  - Response:
    ```json
    {
      "questions": [
        {
          "id": "q1",
          "type": "mcq",
          "question": "...",
          "options": ["A", "B", "C", "D"],
          "ideal_answer": "A"
        }
      ]
    }
    ```

### Quiz Grading
- `POST /api/quiz/grade` - Grade quiz answers
  - Request body:
    ```json
    {
      "questions": [...],
      "user_answers": [...],
      "documents": [...]
    }
    ```
  - Response: `{"score": 85, "feedback": "...", "detailed_grades": [...]}`

### YouTube Recommendations
- `POST /api/youtube/recommend` - Get video recommendations
  - Request body:
    ```json
    {
      "documents": ["PDF content chunks"],
      "num_recommendations": 2
    }
    ```
  - Response:
    ```json
    {
      "topics": ["machine learning", "neural networks"],
      "recommendations": [
        {
          "topic": "machine learning",
          "query": "machine learning tutorial"
        }
      ]
    }
    ```

---

## 🤖 RAG (Retrieval Augmented Generation) Flow

1. **Document Ingestion**
   - PDF chunks received from backend
   - Split into manageable pieces
   - Embedded using Ollama's nomic-embed-text

2. **Vector Storage**
   - Embeddings stored in FAISS
   - Fast similarity search enabled

3. **Query Processing**
   - User query embedded
   - Similar document chunks retrieved
   - Chunks + query sent to Gemini

4. **Response Generation**
   - Gemini generates contextual response
   - Sources referenced
   - Response sent back to user

---

## 📊 Models Used

### Embeddings
- **Model**: `nomic-embed-text`
- **Provider**: Ollama (local)
- **Dimension**: 768
- **Advantages**: Free, fast, private

### LLM
- **Model**: `gemini-1.5-pro`
- **Provider**: Google Cloud
- **Context Window**: 1M tokens
- **Advantages**: Latest, multimodal, accurate

---

## 🧪 Testing

### Health Check

```bash
curl http://localhost:8000/health
```

### Chat Endpoint

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is mentioned in the documents?",
    "documents": ["Chapter 1: Introduction to..."],
    "chat_history": []
  }'
```

### Quiz Generation

```bash
curl -X POST http://localhost:8000/api/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{
    "documents": ["Chapter 1: ..."],
    "num_mcq": 2,
    "num_saq": 1,
    "num_laq": 1
  }'
```

---

## 🐳 Docker Deployment

Build Docker image:

```bash
docker build -t revisify-ai-service .
```

Run container:

```bash
docker run -p 8000:8000 --env-file .env revisify-ai-service
```

---

## ⚠️ Important Notes

- **Model Loading**: First request may take 2-5 seconds (model loading)
- **Ollama Required**: Must have Ollama running for embeddings
- **API Rate Limits**: Google Gemini has rate limits (monitor usage)
- **Context Length**: Large documents require chunking
- **Processing Time**: Average response time 2-10 seconds depending on query
- **Memory**: Requires 2GB+ RAM for models

---

## 🔧 Configuration

### Model Parameters

Edit `app/utils/llm.py`:

```python
# Temperature (0-1): Lower = more deterministic
TEMPERATURE = 0.7

# Max tokens: Response length
MAX_TOKENS = 500

# Top-p: Nucleus sampling
TOP_P = 0.9
```

### Vector Store Configuration

Edit `app/utils/embeddings.py`:

```python
# Chunk size (characters)
CHUNK_SIZE = 500

# Chunk overlap
CHUNK_OVERLAP = 100

# Number of similar chunks to retrieve
K_RETRIEVE = 5
```

---

## 📈 Performance Optimization

- ✅ **Batch Processing** - Multiple queries processed together
- ✅ **Vector Caching** - Embeddings cached for reuse
- ✅ **Async Processing** - Non-blocking operations
- ✅ **Connection Pooling** - Reuse API connections

---

## 🔗 Related Services

- **Backend**: `../backend-node/README.md` - Node.js API server
- **Frontend**: `../frontend/README.md` - React UI
- **Main Project**: `../README.md` - Complete project documentation

---

## 📝 Development Tips

### Adding New Endpoints

1. Create new file in `app/routes/`
2. Define Pydantic models in `app/models/schemas.py`
3. Create service in `app/services/`
4. Import and include router in `app/main.py`

### Debugging

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Check Ollama status:

```bash
ollama list
```

---

## 🤝 Support

For issues or questions about the AI service, please refer to the main project documentation or create an issue on GitHub.
