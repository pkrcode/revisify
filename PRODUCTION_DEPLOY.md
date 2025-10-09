# Production Deployment on VPS - Step by Step Guide

This guide walks you through deploying the Study App on a VPS (like DigitalOcean, AWS EC2, or Hetzner).

## 📋 Prerequisites
- A VPS with at least 4GB RAM and 10GB storage
- Ubuntu 22.04 LTS (recommended)
- MongoDB Atlas account with a cluster set up
- Domain name (optional but recommended)
- SSH access to your server

---

## 🎯 Step-by-Step Deployment

### 1️⃣ Initial Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl git ufw
```

### 2️⃣ Install Docker

```bash
# Install Docker using convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Start Docker service
systemctl start docker
systemctl enable docker
```

### 3️⃣ Setup Firewall

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### 4️⃣ Clone Your Repository

```bash
# Create app directory
mkdir -p /var/www
cd /var/www

# Clone your repository
git clone <your-repository-url> study-app
cd study-app

# Or if you're uploading manually:
# Use scp to copy files:
# scp -r /path/to/beyond-chats-assignment root@your-server-ip:/var/www/study-app
```

### 5️⃣ Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your production credentials
nano .env
```

**Important Production Settings:**

```bash
# Use strong passwords and secrets
NODE_ENV=production
JWT_SECRET=<generate-64-char-random-string>

# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/study-app?retryWrites=true&w=majority

# Your actual Google API key
GOOGLE_API_KEY=<your-actual-key>

# CORS - your frontend domain
CORS_ORIGIN=https://yourfrontend.com

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

**Generate Strong Secrets:**
```bash
# Generate JWT secret (64 characters)
openssl rand -base64 48
```

**Get MongoDB Atlas Connection String:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

### 6️⃣ Deploy Application

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Select **Option 1** (Start all services - first time setup)

### 7️⃣ Verify Deployment

```bash
# Check all containers are running
docker compose ps

# Should show 3 services: ollama, ai-service, backend

# Check logs
docker compose logs -f

# Test endpoints
curl http://localhost:5000/
curl http://localhost:8000/
```

### 8️⃣ Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
apt install -y nginx

# Create configuration
nano /etc/nginx/sites-available/study-app
```

**Nginx Configuration:**

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# AI Service
server {
    listen 80;
    server_name ai.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site:**

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/study-app /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 9️⃣ Setup SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificates
certbot --nginx -d api.yourdomain.com -d ai.yourdomain.com

# Follow prompts and enter your email

# Test auto-renewal
certbot renew --dry-run
```

### 🔟 Setup Auto-Restart on Server Reboot

```bash
# Docker containers will auto-restart (already configured in docker-compose.yml)
# Just ensure Docker starts on boot
systemctl enable docker
```

---

## 🔄 Updating Your Application

### Method 1: Git Pull (Recommended)

```bash
cd /var/www/study-app

# Pull latest changes
git pull origin main

# Rebuild and restart
./deploy.sh
# Select option 8 (Rebuild containers)
```

### Method 2: Manual File Upload

```bash
# From your local machine
scp -r ./ai-service-python root@your-server-ip:/var/www/study-app/
scp -r ./backend-node root@your-server-ip:/var/www/study-app/

# On server
cd /var/www/study-app
./deploy.sh
# Select option 8 (Rebuild containers)
```

---

## 📊 Monitoring

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 ai-service
```

### Check Resource Usage

```bash
# Container stats
docker stats

# Disk usage
df -h
docker system df

# Memory
free -h
```

### Setup Log Rotation

```bash
# Edit Docker daemon config
nano /etc/docker/daemon.json
```

Add:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
# Restart Docker
systemctl restart docker
```

---

## 🛡️ Security Hardening

### 1. SSH Security

```bash
# Disable root login
nano /etc/ssh/sshd_config

# Set: PermitRootLogin no
# Set: PasswordAuthentication no (if using SSH keys)

# Restart SSH
systemctl restart sshd
```

### 2. Automatic Security Updates

```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### 3. Fail2Ban (Prevent Brute Force)

```bash
apt install -y fail2ban

# Start service
systemctl start fail2ban
systemctl enable fail2ban
```

### 4. Regular Backups

```bash
# Backup script
nano /root/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup vector store
docker cp study-app-ai-service:/app/vector_store $BACKUP_DIR/vector_store_$DATE

# Note: MongoDB Atlas has its own backup system
# Enable automatic backups in MongoDB Atlas dashboard

# Compress
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/vector_store_$DATE

# Clean up temporary files
rm -rf $BACKUP_DIR/vector_store_$DATE

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
echo "MongoDB Atlas backups are managed in Atlas dashboard"
```

```bash
# Make executable
chmod +x /root/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup.sh >> /var/log/backup.log 2>&1
```

---

## 🚨 Troubleshooting Production Issues

### Service Won't Start

```bash
# Check logs
docker compose logs backend
docker compose logs ai-service

# Check disk space
df -h

# Check memory
free -h

# Restart services
docker compose restart
```

### Ollama Out of Memory

```bash
# Stop other services temporarily
docker compose stop backend

# Start Ollama alone
docker compose up -d ollama

# Wait for model download
docker compose logs -f ollama

# Start other services
docker compose up -d
```

### MongoDB Connection Issues

**Important for MongoDB Atlas:**

```bash
# 1. Whitelist your server IP in MongoDB Atlas
# Go to: MongoDB Atlas → Network Access → Add IP Address
# Add your VPS IP address or use 0.0.0.0/0 for testing

# 2. Test connection from backend container
docker compose exec backend node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('✓ Connected to MongoDB Atlas')).catch(e => console.error('✗ Connection failed:', e.message));"

# 3. Check environment variable is set
docker compose exec backend env | grep MONGO_URI

# 4. Verify connection string format
# Should be: mongodb+srv://username:password@cluster.xxxxx.mongodb.net/database
```

### SSL Certificate Issues

```bash
# Renew certificates
certbot renew

# Force renew
certbot renew --force-renewal

# Check certificate status
certbot certificates
```

---

## 📈 Scaling Considerations

### Vertical Scaling (Increase Resources)

- Upgrade VPS plan (more RAM/CPU)
- Recommended: 8GB RAM for heavy usage with Ollama
- 2-4 vCPU cores for better performance

### Horizontal Scaling (Multiple Servers)

1. **Database**: Already on MongoDB Atlas ✓ (scalable)
2. **Load Balancer**: Use Nginx/HAProxy to distribute traffic
3. **AI Service**: Run multiple instances behind load balancer
4. **Shared Storage**: Use NFS or S3 for vector store

### Example Multi-Server Setup

```
┌──────────────┐
│ Load Balancer│
│   (Nginx)    │
└──────┬───────┘
       │
   ┌───┴────┐
   │        │
┌──▼───┐ ┌──▼───┐
│App #1│ │App #2│
└──┬───┘ └──┬───┘
   │        │
   └────┬───┘
        │
   ┌────▼────┐
   │ MongoDB │
   │  Atlas  │
   │ (Cloud) │
   └─────────┘
```

---

## ✅ Production Checklist

Before going live, ensure:

- [ ] MongoDB Atlas cluster is set up and accessible
- [ ] Server IP is whitelisted in MongoDB Atlas Network Access
- [ ] MONGO_URI connection string is correct in .env
- [ ] Strong JWT secret is configured
- [ ] CORS is restricted to your frontend domain
- [ ] SSL certificates are installed and working
- [ ] Firewall is configured (UFW)
- [ ] Backups are scheduled
- [ ] Log rotation is configured
- [ ] Monitoring is in place
- [ ] SSH is secured (key-based auth)
- [ ] Domain DNS is pointing to your server
- [ ] All services are running (`docker compose ps`)
- [ ] Health checks pass (curl endpoints)
- [ ] Ollama model is downloaded

---

## 📞 Getting Help

If you encounter issues:

1. Check logs: `docker compose logs -f`
2. Verify environment: `cat .env`
3. Check service status: `docker compose ps`
4. Review this troubleshooting guide
5. Check Docker documentation

---

**Your app is now live! 🎉**

Access your APIs at:
- Backend: `https://api.yourdomain.com`
- AI Service: `https://ai.yourdomain.com`
