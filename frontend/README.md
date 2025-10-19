# 🎨 Frontend - Study App# React + Vite



**Modern React UI for AI-Powered Learning Platform**This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



A responsive, interactive frontend built with **React 19** and **Vite** for the Study App, providing seamless user experience for PDF uploads, AI chat, quiz generation, and progress tracking.Currently, two official plugins are available:



---- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## 📁 Project Structure

## React Compiler

```

frontend/The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

├── src/

│   ├── components/## Expanding the ESLint configuration

│   │   ├── app/

│   │   │   ├── ChatWindow.jsx          # Main chat interfaceIf you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

│   │   │   ├── FileList.jsx            # PDF file list and management
│   │   │   ├── FullscreenQuiz.jsx      # Quiz fullscreen view
│   │   │   ├── QuizAttemptModal.jsx    # Quiz attempt modal
│   │   │   └── UploadModal.jsx         # PDF upload modal
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx           # User login form
│   │   │   └── SignupForm.jsx          # User registration form
│   │   └── layout/
│   │       ├── LeftSidebar.jsx         # Chat sessions sidebar
│   │       └── RightSidebar.jsx        # User profile & stats sidebar
│   ├── pages/
│   │   ├── LoginPage.jsx               # Login page
│   │   ├── SignupPage.jsx              # Registration page
│   │   ├── MainPage.jsx                # Main application page
│   │   └── QuizPage.jsx                # Quiz taking page
│   ├── services/
│   │   ├── authService.js              # Authentication API calls
│   │   ├── chatService.js              # Chat API calls
│   │   ├── quizService.js              # Quiz API calls
│   │   ├── fileService.js              # File upload API calls
│   │   └── retry.js                    # Retry logic with exponential backoff
│   ├── App.jsx                         # Main app component
│   ├── App.css                         # Global styles
│   ├── index.css                       # Global CSS
│   └── main.jsx                        # Entry point
├── public/
│   └── vite.svg                        # Vite logo
├── eslint.config.js                    # ESLint configuration
├── vite.config.js                      # Vite build configuration
├── package.json                        # Dependencies & scripts
└── index.html                          # HTML entry point
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend running on `http://localhost:5000`
- AI Service running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

Server runs at `http://localhost:5173` with hot-reload enabled.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI library |
| **Vite 7** | Build tool (fast HMR) |
| **Tailwind CSS 4** | Styling & responsive design |
| **Lucide React** | Icon library |
| **Axios** | HTTP client |
| **React Router** | Client-side routing |

---

## 📡 API Integration

All API calls are handled through service files in `src/services/`:

### Authentication (`authService.js`)
- `register(email, password, name)` - User registration
- `login(email, password)` - User login
- `getUserProfile()` - Fetch user profile

### Chat (`chatService.js`)
- `createChat(name)` - Create new chat session
- `createMessage(chatId, text)` - Send message
- `getMessagesForChat(chatId)` - Fetch chat messages
- `deleteChat(chatId)` - Delete chat session

### Quiz (`quizService.js`)
- `generateQuiz(chatId, options)` - Generate new quiz
- `submitQuiz(quizId, answers)` - Submit quiz answers
- `getQuizDetails(quizId)` - Fetch quiz details

### Files (`fileService.js`)
- `uploadFiles(files)` - Upload PDF files
- `getUserFiles()` - Fetch user's uploaded files
- `deleteFile(fileId)` - Delete uploaded file

---

## 🎯 Key Features Implemented

- ✅ **User Authentication** - Register, login, logout with JWT
- ✅ **PDF Management** - Upload, list, delete PDFs
- ✅ **Chat Interface** - Real-time chat with AI across multiple PDFs
- ✅ **Quiz Generation** - Generate customized quizzes from PDFs
- ✅ **Quiz Attempt** - Take quizzes with automatic grading
- ✅ **User Profile** - View stats and progress
- ✅ **Responsive Design** - Works on desktop and tablet

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the frontend directory:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_AI_SERVICE_URL=http://localhost:8000
```

### API Base URL

Update `src/services/chatService.js` and other services if backend URL changes:

```javascript
const API_BASE_URL = process.env.VITE_BACKEND_URL || 'http://localhost:5000';
```

---

## 🧪 Testing

Components use console logging for debugging. Check browser console for:
- API call details
- Error messages
- Component lifecycle events

Enable detailed logging in service files for troubleshooting.

---

## 📦 Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-*.js       # Bundled JavaScript
│   ├── index-*.css      # Bundled CSS
│   └── ...              # Other assets
```

Deploy the `dist/` folder to any static hosting service.

---

## 🔗 Related Services

- **Backend**: `../backend-node/README.md` - Node.js/Express API server
- **AI Service**: `../ai-service-python/README.md` - Python/FastAPI AI service
- **Main Project**: `../README.md` - Complete project documentation

---

## 📝 Notes

- All API calls include automatic retry logic with exponential backoff
- Messages are normalized to ensure consistent format across components
- Polling is used to fetch updated chat responses
- Error handling is implemented throughout with user-friendly messages

---

## 🤝 Support

For issues or questions about the frontend, please refer to the main project documentation or create an issue on GitHub.
