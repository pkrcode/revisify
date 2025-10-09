# 🚀 Study App - Complete Deployment Guide

A full-stack study application with AI-powered features including PDF processing, RAG-based chat, quiz generation, and YouTube recommendations.

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start (Local Development with Docker)](#quick-start-local-development-with-docker)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)
- [API Documentation](#api-documentation)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Docker Environment                 │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Node.js    │  │   FastAPI    │  │  Ollama   │ │
│  │   Backend    │◄─┤  AI Service  │◄─┤  (Local   │ │
│  │  (Port 5000) │  │  (Port 8000) │  │   LLM)    │ │
│  └──────┬───────┘  └──────────────┘  └───────────┘ │
│         │                                            │
└─────────┼────────────────────────────────────────────┘
          │
          ▼
   ┌──────────────┐         ┌─────────────────────┐
   │   MongoDB    │         │  Google Gemini API  │
   │    Atlas     │         │  (Cloud LLM)        │
   │   (Cloud)    │         └─────────────────────┘
   └──────────────┘
```

### Services:
- **Backend (Node.js/Express)**: REST API, authentication, business logic
- **AI Service (Python/FastAPI)**: PDF processing, RAG, quiz generation
- **MongoDB Atlas**: Cloud-hosted database (external)
- **Ollama**: Local embedding model (nomic-embed-text)
- **Google Gemini**: Cloud LLM for text generation

---

## ✅ Prerequisites

### Required:
- **Docker** (v20.10+) - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2.0+) - Usually included with Docker Desktop
- **MongoDB Atlas Account** - [Sign up free](https://www.mongodb.com/cloud/atlas/register)
- **Google API Key** - [Get from Google AI Studio](https://makersuite.google.com/app/apikey)

### Optional (for production):
- **Cloudinary Account** - [Sign up](https://cloudinary.com/) (for file uploads)
- **Google OAuth Credentials** - [Google Console](https://console.cloud.google.com/)

### System Requirements:
- **RAM**: Minimum 4GB (Ollama requires ~2-4GB)
- **Storage**: 5GB free space
- **OS**: Linux, macOS, or Windows with WSL2

---

## 🚀 Quick Start (Local Development with Docker)

### Step 1: Clone and Configure

```bash
# Navigate to project directory
cd /path/to/beyond-chats-assignment

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

### Step 2: Configure Environment Variables

Edit `.env` and set **at minimum**:

```bash
# REQUIRED - MongoDB Atlas Connection String
# Get this from your MongoDB Atlas dashboard
MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/study-app?retryWrites=true&w=majority

# REQUIRED - Google API Key
GOOGLE_API_KEY=your-actual-google-api-key-here

# JWT Secret (change for production)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
```

**📝 How to get MongoDB Atlas connection string:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster (if you haven't already)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<database>` with your values

### Step 3: Deploy with Script

```bash
# Make the deploy script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

Select option **1** for first-time setup.

### Step 4: Verify Deployment

```bash
# Check all services are running
docker compose ps

# You should see 3 services: ollama, ai-service, backend

# Check logs
docker compose logs -f

# Test endpoints
curl http://localhost:5000/        # Backend
curl http://localhost:8000/        # AI Service
```

### Step 5: Wait for Ollama Model Download

On first run, Ollama needs to download the embedding model (~274MB):

```bash
# Monitor Ollama logs
docker compose logs -f ollama

# You should see: "pulling manifest" and "success"
```

---

## 🌐 Production Deployment

### Option 1: VPS/Cloud Server (Recommended)

#### Providers:
- **AWS EC2** (t3.large or larger)
- **DigitalOcean Droplets** ($24/month for 4GB RAM)
- **Hetzner Cloud** (€11.90/month for 8GB RAM)
- **Google Cloud Compute Engine**
- **Azure Virtual Machines**

#### Steps:

1. **Provision Server**
   ```bash
   # SSH into your server
   ssh user@your-server-ip
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo apt-get update
   sudo apt-get install docker-compose-plugin
   ```

2. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd beyond-chats-assignment
   ```

3. **Configure Production Environment**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Update these for production:
   ```bash
   NODE_ENV=production
   MONGO_ROOT_PASSWORD=<strong-password>
   JWT_SECRET=<64-char-random-string>
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

4. **Deploy**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   # Select option 1
   ```

5. **Setup Nginx Reverse Proxy** (Optional but recommended)
   ```nginx
   # /etc/nginx/sites-available/study-app
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   
   server {
       listen 80;
       server_name ai.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com -d ai.yourdomain.com
   ```

### Option 2: Railway/Render (Cloud Platform)

⚠️ **Note**: These platforms may have limitations running Ollama. Consider switching to cloud embeddings.

#### For Railway:
1. Create new project
2. Add services from Docker Compose
3. Configure environment variables
4. Deploy

#### For Render:
1. Create new Blueprint
2. Link to your repository
3. Configure build settings
4. Deploy

---

## 🔧 Environment Configuration

### Complete `.env` Reference

```bash
# ============================================
# DATABASE (MongoDB Atlas)
# ============================================
MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/study-app?retryWrites=true&w=majority

# ============================================
# AI SERVICE
# ============================================
GOOGLE_API_KEY=AIzaSy...  # Get from Google AI Studio

# ============================================
# BACKEND
# ============================================
NODE_ENV=production
PORT=5000
JWT_SECRET=your-64-character-random-secret-key-here-min-32-chars
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourfrontend.com

# ============================================
# CLOUDINARY (Optional - for file uploads)
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# GOOGLE OAUTH (Optional)
# ============================================
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 📊 Managing Your Deployment

### Using the Deploy Script

```bash
./deploy.sh
```

Options:
1. **Start all services (first time)** - Builds and starts everything
2. **Start all services** - Normal start
3. **Stop all services** - Graceful shutdown
4. **Restart all services** - Quick restart
5. **View logs** - Monitor service logs
6. **View service status** - Check running containers
7. **Clean up** - Remove all data (⚠️ destructive)
8. **Rebuild containers** - Force rebuild
9. **Pull Ollama model** - Manually download embedding model

### Manual Docker Compose Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f ai-service

# Restart a specific service
docker compose restart backend

# Rebuild and restart
docker compose up -d --build

# Check service status
docker compose ps

# Execute command in container
docker compose exec backend sh
docker compose exec ai-service bash
```

---

## 🐛 Troubleshooting

### 1. Ollama Model Not Loading

**Symptom**: AI service fails with embedding errors

**Solution**:
```bash
# Manually pull the model
docker compose exec ollama ollama pull nomic-embed-text

# Verify model is available
docker compose exec ollama ollama list
```

### 2. MongoDB Connection Failed

**Symptom**: Backend can't connect to MongoDB

**Solution**:
```bash
# Check MongoDB Atlas connection string in .env
cat .env | grep MONGO_URI

# Test connection from backend container
docker compose exec backend node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected!')).catch(e => console.error(e));"

# Ensure your IP is whitelisted in MongoDB Atlas:
# 1. Go to MongoDB Atlas → Network Access
# 2. Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
# 3. Or add your server's specific IP
```

### 3. AI Service 500 Errors

**Symptom**: PDF processing or chat fails

**Solution**:
```bash
# Check GOOGLE_API_KEY is set
docker compose exec ai-service env | grep GOOGLE_API_KEY

# Check Ollama connectivity
docker compose exec ai-service curl http://ollama:11434

# Restart AI service
docker compose restart ai-service
```

### 4. Port Already in Use

**Symptom**: `port is already allocated`

**Solution**:
```bash
# Find what's using the port
sudo lsof -i :5000
sudo lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

### 5. Out of Memory

**Symptom**: Ollama crashes or containers restart

**Solution**:
- Increase Docker memory limit (Docker Desktop settings)
- Reduce number of concurrent requests
- Consider switching to cloud embeddings

### 6. Vector Store Not Found

**Symptom**: Chat/Quiz fails with "Vector store not found"

**Solution**:
```bash
# Ensure PDFs are processed first
# Check vector_store directory exists
docker compose exec ai-service ls -la /app/vector_store

# Reprocess PDFs via API
curl -X POST http://localhost:8000/api/v1/process-pdf \
  -H "Content-Type: application/json" \
  -d '{"pdf_id": "your-pdf-id", "pdf_url": "your-pdf-url"}'
```

---

## 📡 API Documentation

### Backend API (Port 5000)

#### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user

#### PDFs
- `GET /api/v1/pdfs` - List user PDFs
- `POST /api/v1/pdfs` - Upload PDF
- `DELETE /api/v1/pdfs/:id` - Delete PDF

#### Chats
- `GET /api/v1/chats/:pdfId` - Get chat history
- `POST /api/v1/chats` - Send chat message (streaming)

#### Quizzes
- `POST /api/v1/quizzes/generate` - Generate quiz
- `POST /api/v1/quizzes/grade` - Grade quiz answers

### AI Service API (Port 8000)

#### PDF Processing
- `POST /api/v1/process-pdf` - Process PDF and create embeddings

#### Chat
- `POST /api/v1/chat` - RAG-based chat (streaming)

#### Quiz
- `POST /api/v1/generate-quiz` - Generate quiz from PDF
- `POST /api/v1/grade-quiz` - Grade quiz answers

#### Health
- `GET /` - Health check

---

## 🔒 Security Considerations

### Production Checklist:
- [ ] Change all default passwords
- [ ] Use strong JWT secret (64+ characters)
- [ ] Enable HTTPS with SSL certificates
- [ ] Restrict CORS to your frontend domain
- [ ] Use environment-specific `.env` files
- [ ] Don't commit `.env` to version control
- [ ] Setup firewall rules (allow only 80, 443, 22)
- [ ] Regular security updates
- [ ] Enable MongoDB authentication
- [ ] Use Docker secrets for sensitive data

---

## 📈 Monitoring & Logs

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 ai-service
```

### Resource Usage
```bash
# Monitor resource usage
docker stats

# Check disk space
docker system df
```

---

## 🛠️ Development

### Hot Reload Enabled
Both services support hot reload in development mode:
- **Backend**: Uses nodemon (automatic)
- **AI Service**: Uses uvicorn --reload (automatic)

### Running Tests
```bash
# Backend tests
docker compose exec backend npm test

# AI service tests
docker compose exec ai-service pytest
```

---

## 📝 Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **Ollama Models**: https://ollama.ai/library
- **Google AI Studio**: https://makersuite.google.com/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Express.js Docs**: https://expressjs.com/

---

## 🤝 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs: `docker compose logs -f`
3. Check container status: `docker compose ps`

---

## 📄 License

[Your License Here]

---

**Made with ❤️ for students**
