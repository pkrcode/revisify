# 📤 Git Setup & Push to Remote Repository

Complete guide to push your Study App project to GitHub/GitLab/Bitbucket.

---

## 🚀 Quick Start (First Time Setup)

### Step 1: Initialize Git Repository (if not already done)

```bash
cd /home/prateek/Documents/beyond-chats-assignment
git init
```

### Step 2: Create `.gitignore` File

**IMPORTANT:** Prevent sensitive files from being pushed!

```bash
# Create .gitignore in project root
cat > .gitignore << 'EOF'
# Environment variables (NEVER COMMIT THESE!)
.env
.env.local
.env.production
backend-node/.env
ai-service-python/.env

# Dependencies
node_modules/
backend-node/node_modules/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
ai-service-python/__pycache__/
app/__pycache__/

# Virtual environments
venv/
env/
ENV/
.venv

# Vector stores (large files)
vector_store/
*.faiss/
*.pkl

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
*.log

# Build files
dist/
build/
*.egg-info/

# Docker
*.log
docker-compose.override.yml

# Uploads
uploads/
temp/
EOF
```

### Step 3: Add All Files

```bash
# Add all files to staging
git add .

# Check what will be committed
git status
```

### Step 4: Make Initial Commit

```bash
git commit -m "Initial commit: Study App with RAG, Quiz, and YouTube features"
```

---

## 🌐 Push to GitHub

### Option A: Create New Repository on GitHub

1. **Go to GitHub** → https://github.com/new

2. **Fill in details:**
   - Repository name: `study-app` or `beyond-chats-assignment`
   - Description: "AI-powered study assistant with PDF RAG, quiz generation, and YouTube recommendations"
   - Visibility: Choose Public or Private
   - **DON'T** initialize with README (you already have one)

3. **Copy the repository URL** (shown after creation)
   ```
   https://github.com/YOUR_USERNAME/study-app.git
   ```

### Option B: Link to Existing Repository

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/study-app.git

# Verify remote was added
git remote -v
```

### Push to GitHub

```bash
# Push to main branch
git push -u origin main

# If your default branch is 'master', use:
git push -u origin master
```

**If you get an error about 'main' not existing:**
```bash
# Rename current branch to main
git branch -M main

# Then push
git push -u origin main
```

---

## 🔐 Authentication Methods

### Method 1: Personal Access Token (Recommended)

1. **Generate Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (full control)
   - Copy the token (you won't see it again!)

2. **Use Token When Pushing:**
   ```bash
   # GitHub will prompt for credentials
   Username: YOUR_USERNAME
   Password: YOUR_PERSONAL_ACCESS_TOKEN
   ```

3. **Cache Credentials (optional):**
   ```bash
   # Cache for 1 hour
   git config --global credential.helper 'cache --timeout=3600'
   
   # Or store permanently (less secure)
   git config --global credential.helper store
   ```

### Method 2: SSH Key (More Secure)

1. **Generate SSH Key:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter to accept default location
   # Enter passphrase (optional but recommended)
   ```

2. **Add SSH Key to GitHub:**
   ```bash
   # Copy public key
   cat ~/.ssh/id_ed25519.pub
   ```
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste the key, give it a title
   - Click "Add SSH key"

3. **Test Connection:**
   ```bash
   ssh -T git@github.com
   # Should see: "Hi USERNAME! You've successfully authenticated"
   ```

4. **Change Remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/study-app.git
   ```

5. **Push:**
   ```bash
   git push -u origin main
   ```

---

## 📋 Complete Command Summary

```bash
# 1. Navigate to project
cd /home/prateek/Documents/beyond-chats-assignment

# 2. Initialize git (if needed)
git init

# 3. Create .gitignore (see Step 2 above)

# 4. Add all files
git add .

# 5. Check status
git status

# 6. Make initial commit
git commit -m "Initial commit: Study App with RAG, Quiz, and YouTube features"

# 7. Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/study-app.git

# 8. Rename branch to main (if needed)
git branch -M main

# 9. Push to GitHub
git push -u origin main
```

---

## 🔄 Future Updates (After Initial Push)

### Making Changes and Pushing

```bash
# 1. Check current status
git status

# 2. Add modified files
git add .
# Or add specific files:
git add backend-node/src/api/routes/auth.routes.js

# 3. Commit changes
git commit -m "Add user authentication feature"

# 4. Push to remote
git push
```

### Useful Git Commands

```bash
# View commit history
git log --oneline

# View changes before committing
git diff

# Undo changes to a file
git checkout -- filename

# View remote repositories
git remote -v

# Pull latest changes (if working in team)
git pull origin main

# Create and switch to new branch
git checkout -b feature/new-feature

# Switch back to main branch
git checkout main

# Merge branch into main
git merge feature/new-feature
```

---

## 🚨 Important Security Checklist

Before pushing, **VERIFY** these files are in `.gitignore`:

- [ ] `.env` files (contains API keys, database passwords!)
- [ ] `node_modules/` (large, can be reinstalled)
- [ ] `__pycache__/` (Python cache files)
- [ ] `vector_store/` (large FAISS indexes, regenerated from PDFs)
- [ ] `.vscode/` or `.idea/` (IDE settings)

### Check What Will Be Pushed

```bash
# See all files that will be committed
git ls-files

# Make sure .env is NOT listed!
git ls-files | grep .env
# Should return nothing

# Check if .gitignore is working
git status --ignored
```

---

## 🌳 Branching Strategy (Recommended)

### Basic Strategy

```bash
# Main branch (production-ready code)
main

# Development branch
git checkout -b develop

# Feature branches
git checkout -b feature/quiz-improvements
git checkout -b feature/youtube-integration
git checkout -b bugfix/pdf-upload-error
```

### Workflow

```bash
# 1. Create feature branch from develop
git checkout develop
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push feature branch
git push -u origin feature/new-feature

# 4. Merge back to develop (after testing)
git checkout develop
git merge feature/new-feature

# 5. Push develop
git push origin develop

# 6. Merge to main (for production release)
git checkout main
git merge develop
git push origin main
```

---

## 📦 GitLab / Bitbucket (Alternative)

### GitLab

```bash
# Add GitLab remote
git remote add origin https://gitlab.com/YOUR_USERNAME/study-app.git

# Push
git push -u origin main
```

### Bitbucket

```bash
# Add Bitbucket remote
git remote add origin https://bitbucket.org/YOUR_USERNAME/study-app.git

# Push
git push -u origin main
```

---

## 🛠️ Troubleshooting

### Error: "failed to push some refs"

**Solution:**
```bash
# Pull latest changes first
git pull origin main --rebase

# Then push
git push origin main
```

### Error: "Permission denied (publickey)"

**Solution:**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/study-app.git
```

### Error: "Large files detected"

**Solution:**
```bash
# Remove large files from git
git rm --cached vector_store/ -r
git commit -m "Remove large vector store files"

# Make sure .gitignore includes vector_store/
echo "vector_store/" >> .gitignore
git add .gitignore
git commit -m "Update .gitignore"
git push
```

### Error: "Repository not found"

**Solution:**
```bash
# Check remote URL
git remote -v

# Update to correct URL
git remote set-url origin https://github.com/YOUR_USERNAME/correct-repo-name.git
```

---

## 📊 Example: Complete First Push

```bash
# Navigate to project
cd /home/prateek/Documents/beyond-chats-assignment

# Check if git is initialized
git status
# If error "not a git repository", run: git init

# Create .gitignore (copy from Step 2 above)

# Stage all files
git add .

# Verify what will be committed
git status
# Make sure .env files are NOT listed!

# Commit
git commit -m "Initial commit: AI Study App

Features:
- PDF upload and processing with RAG
- AI-powered chat with context
- Quiz generation and grading
- YouTube video recommendations
- Hybrid AI (Ollama + Google Gemini)
- MongoDB Atlas integration
- Docker deployment ready"

# Add GitHub remote (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/study-app.git

# Rename to main branch
git branch -M main

# Push to GitHub
git push -u origin main

# Enter credentials when prompted
```

---

## ✅ Verification Steps

After pushing, verify on GitHub:

1. **Go to your repository URL**
2. **Check files are there:**
   - ✅ README.md
   - ✅ docker-compose.yml
   - ✅ All documentation files
   - ✅ backend-node/ directory
   - ✅ ai-service-python/ directory
   - ❌ .env files (should NOT be there!)
   - ❌ node_modules/ (should NOT be there!)
   - ❌ vector_store/ (should NOT be there!)

3. **Check README displays correctly** on GitHub homepage

---

## 🎯 Next Steps After Pushing

1. **Add Repository Description** on GitHub
2. **Add Topics/Tags**: `ai`, `rag`, `fastapi`, `nodejs`, `mongodb`, `ollama`
3. **Enable GitHub Actions** (optional CI/CD)
4. **Add License** (MIT, Apache, etc.)
5. **Create Releases** for versioning
6. **Set up Branch Protection** for main branch

---

## 📚 Additional Resources

- [GitHub Docs - Getting Started](https://docs.github.com/en/get-started)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Connecting to GitHub with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

**Ready to push! 🚀**

Start with creating `.gitignore`, then follow the step-by-step commands above!
