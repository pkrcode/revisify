# MongoDB Atlas Setup Guide

This guide helps you set up MongoDB Atlas for the Study App.

## 🚀 Quick Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (no credit card required)

### Step 2: Create a Free Cluster

1. Click **"Build a Database"**
2. Choose **"M0 Free"** tier
3. Select your preferred cloud provider (AWS/Google Cloud/Azure)
4. Choose a region closest to your deployment server
5. Click **"Create Cluster"**
6. Wait 3-5 minutes for cluster creation

### Step 3: Create Database User

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username (e.g., `studyapp`)
5. **Auto-generate a secure password** (copy and save it!)
6. Under "Database User Privileges", select **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Whitelist IP Addresses

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**

**For Development:**
- Click **"Allow Access from Anywhere"** (0.0.0.0/0)
- Click **"Confirm"**

**For Production:**
- Add your VPS server's specific IP address
- Click **"Confirm"**

### Step 5: Get Connection String

1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** driver and latest version
5. Copy the connection string

It will look like:
```
mongodb+srv://studyapp:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 6: Update Connection String

1. Replace `<password>` with the password you saved in Step 3
2. Add your database name before the query parameters

**Before:**
```
mongodb+srv://studyapp:mypassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**After:**
```
mongodb+srv://studyapp:mypassword@cluster0.xxxxx.mongodb.net/study-app?retryWrites=true&w=majority
```

### Step 7: Add to .env File

Copy the updated connection string to your `.env` file:

```bash
MONGO_URI=mongodb+srv://studyapp:mypassword@cluster0.xxxxx.mongodb.net/study-app?retryWrites=true&w=majority
```

## 🔐 Security Best Practices

### Use Strong Passwords
- Auto-generated passwords are recommended
- Minimum 16 characters
- Use a password manager to store them

### IP Whitelisting
**Development:**
- Use 0.0.0.0/0 for convenience
- **⚠️ Not recommended for production**

**Production:**
- Add only your server's specific IP
- Add your development machine IP separately
- Update if server IP changes

### Connection String Security
- Never commit `.env` file to git
- Use environment variables in production
- Rotate passwords periodically

## 📊 Database Structure

The app will automatically create these collections:

```
study-app/
├── users          # User accounts
├── pdfs           # PDF documents metadata
├── chats          # Chat conversations
├── quizzes        # Generated quizzes
└── messages       # Chat messages
```

## 🔍 Monitoring Your Database

### View Data
1. Go to **"Database"** → **"Browse Collections"**
2. Select `study-app` database
3. View and edit documents

### Monitor Performance
1. Go to **"Metrics"**
2. View:
   - Operations per second
   - Network traffic
   - Connections
   - Document count

### Set Up Alerts
1. Go to **"Alerts"**
2. Configure alerts for:
   - High connections
   - Low storage
   - Query performance

## 💾 Backup & Recovery

### Automatic Backups (Free Tier)
- MongoDB Atlas M0 (free tier) does **NOT** include automated backups
- Upgrade to M10+ for automatic backups

### Manual Backup Options

**Option 1: Export Data**
```bash
# Install MongoDB Tools
# https://www.mongodb.com/try/download/database-tools

# Export database
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/study-app"

# Import backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/study-app" dump/
```

**Option 2: Upgrade to Paid Tier**
- M10 ($0.08/hour) includes:
  - Continuous backups
  - Point-in-time recovery
  - Automated snapshots

## 📈 Scaling

### Free Tier Limits (M0)
- 512 MB storage
- Shared RAM
- Shared vCPU
- No backups
- **Perfect for development and small apps**

### When to Upgrade

Upgrade to M10+ if you need:
- More storage (10GB+)
- Dedicated resources
- Automated backups
- Better performance
- Vertical scaling

### Estimated Costs

| Tier | Storage | RAM | Price/Month |
|------|---------|-----|-------------|
| M0   | 512 MB  | Shared | **Free** |
| M10  | 10 GB   | 2 GB | ~$57 |
| M20  | 20 GB   | 4 GB | ~$114 |
| M30  | 40 GB   | 8 GB | ~$228 |

*Prices vary by region and cloud provider*

## 🐛 Troubleshooting

### Connection Timeout
**Problem:** Can't connect to MongoDB Atlas

**Solutions:**
1. Check IP whitelist (Network Access)
2. Verify connection string is correct
3. Ensure password doesn't contain special characters (URL encode if needed)
4. Check firewall on your server

### Authentication Failed
**Problem:** "Authentication failed" error

**Solutions:**
1. Verify username and password
2. Check database user has correct permissions
3. Ensure password is URL-encoded if it contains special chars
4. Try resetting the password

### URL Encoding Passwords
If your password contains special characters:

```javascript
// Example password: p@ssw0rd!
// Encoded: p%40ssw0rd%21

const encodedPassword = encodeURIComponent('p@ssw0rd!');
// Result: p%40ssw0rd%21
```

### Too Many Connections
**Problem:** "Too many connections" error

**Solutions:**
1. Free tier has connection limits
2. Close unused connections
3. Implement connection pooling
4. Consider upgrading to M10+

## 📚 Useful Links

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
- [Security Best Practices](https://docs.atlas.mongodb.com/security-best-practices/)
- [Pricing Calculator](https://www.mongodb.com/pricing)

## ✅ Quick Checklist

Before deploying, ensure:

- [ ] MongoDB Atlas account created
- [ ] Free cluster deployed
- [ ] Database user created with strong password
- [ ] IP address whitelisted (0.0.0.0/0 or specific IP)
- [ ] Connection string copied and updated
- [ ] Database name added to connection string
- [ ] MONGO_URI set in .env file
- [ ] Connection tested successfully

## 🎯 Testing Your Connection

After setup, test the connection:

```bash
# From your project directory
cd /path/to/beyond-chats-assignment

# Create .env if not exists
cp .env.example .env

# Edit and add your MONGO_URI
nano .env

# Test connection with Node.js
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGO_URI).then(() => { console.log('✓ Connected to MongoDB Atlas!'); process.exit(0); }).catch(e => { console.error('✗ Connection failed:', e.message); process.exit(1); });"
```

If you see **"✓ Connected to MongoDB Atlas!"**, you're all set! 🎉

---

**Need Help?**
- Check [MongoDB Community Forums](https://www.mongodb.com/community/forums/)
- Review [Atlas FAQ](https://docs.atlas.mongodb.com/faq/)
