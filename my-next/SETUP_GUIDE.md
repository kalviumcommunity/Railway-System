# 🚂 Railway Food Service System - Complete Setup Guide

## 📋 Table of Contents
1. [Quick Start with Docker](#quick-start-with-docker-recommended)
2. [Manual Setup](#manual-setup-without-docker)
3. [Sharing with Friends](#sharing-with-friends)
4. [Docker Hub Deployment](#docker-hub-optional)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)

---

## 🐳 Quick Start with Docker (Recommended)

### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Git installed

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd Railway-System/my-next
```

### Step 2: Create Environment File
Create a `.env` file in the project root:
```bash
# .env
DATABASE_URL="postgresql://railway:railway123@postgres:5432/railway_food"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### Step 3: Start Everything with One Command
```bash
docker-compose up --build
```

That's it! 🎉

- **App URL**: http://localhost:3000
- **Database**: PostgreSQL running on port 5432

### Step 4: Create Default Admin User
```bash
# In a new terminal
docker exec -it railway_app npx ts-node -e "
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('./lib/password');
const prisma = new PrismaClient();
async function createAdmin() {
  const hashedPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@railway.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN'
    }
  });
  console.log('Admin created:', admin.email);
  await prisma.\$disconnect();
}
createAdmin();
"
```

### Default Login Credentials:
- **Email**: admin@railway.com
- **Password**: admin123

---

## 🔧 Manual Setup (Without Docker)

### Prerequisites
- Node.js 22+ ([Download](https://nodejs.org/))
- PostgreSQL 15+ ([Download](https://www.postgresql.org/download/))

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd Railway-System/my-next
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Database
Create a PostgreSQL database:
```sql
CREATE DATABASE railway_food;
```

### Step 4: Configure Environment
Create `.env` file:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/railway_food"
JWT_SECRET="your-secret-key"
```

### Step 5: Run Migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

### Step 6: Seed Database (Optional)
```bash
node prisma/seed.js
```

### Step 7: Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000

---

## 👥 Sharing with Friends

### Option 1: Git Repository (Recommended)

#### Push to GitHub:
```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Railway Food Service System"

# Add remote (create repo on GitHub first)
git remote add origin https://github.com/yourusername/railway-food-system.git

# Push
git push -u origin main
```

#### Your Friend's Setup:
```bash
# 1. Clone your repository
git clone https://github.com/yourusername/railway-food-system.git
cd railway-food-system

# 2. Start with Docker (easiest)
docker-compose up --build

# Done! App runs on http://localhost:3000
```

### Option 2: Zip File

#### Create a zip:
```bash
# Exclude node_modules and .next
zip -r railway-food-system.zip . -x "node_modules/*" ".next/*"
```

Send `railway-food-system.zip` to your friend.

#### Your Friend's Setup:
```bash
# 1. Extract zip
unzip railway-food-system.zip
cd railway-food-system

# 2. Start with Docker
docker-compose up --build
```

---

## 🐋 Docker Hub (Optional)

### Why Use Docker Hub?
- Share Docker images instead of source code
- Faster deployment (pre-built images)
- Version control for images

### Step 1: Create Docker Hub Account
Go to [hub.docker.com](https://hub.docker.com) and sign up

### Step 2: Build and Tag Image
```bash
# Build image
docker build -t yourusername/railway-food-system:latest .

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push yourusername/railway-food-system:latest
```

### Step 3: Update docker-compose.yml
```yaml
services:
  app:
    image: yourusername/railway-food-system:latest  # Instead of build
    # ... rest of config
```

### Your Friend's Setup with Docker Hub:
```bash
# 1. Pull docker-compose.yml only (or create it)
# 2. Run:
docker-compose pull
docker-compose up
```

---

## 🔐 Environment Variables

### Required Variables:
```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-secret-key-min-32-chars"
NODE_ENV="development"  # or "production"
```

### Production Settings:
```bash
# Change these in production!
DATABASE_URL="<your-production-db-url>"
JWT_SECRET="<generate-strong-random-string>"
NODE_ENV="production"
```

---

## 🚀 Testing on Mobile

### With Docker:
```bash
# Start services
docker-compose up

# Get your IP address
# Linux/Mac:
ip addr show | grep "inet " | grep -v 127.0.0.1

# Windows:
ipconfig | findstr IPv4
```

Access from mobile: `http://YOUR_IP:3000`

---

## 🛠️ Troubleshooting

### Docker Issues:

**Port already in use:**
```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

**Database connection failed:**
```bash
# Check if database is ready
docker-compose logs postgres

# Restart services
docker-compose down
docker-compose up
```

**Rebuild after code changes:**
```bash
docker-compose down
docker-compose up --build
```

### Manual Setup Issues:

**Prisma Client not generated:**
```bash
npx prisma generate
```

**Database connection error:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check credentials are correct

**Port 3000 in use:**
```bash
# Kill process on port 3000
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📱 User Roles & Access

### Admin (`admin@railway.com`):
- Full system access
- Manage users, kitchens, batches
- View all complaints
- Access: `/admin/dashboard`

### Kitchen Head:
- Create kitchens and batches
- Generate QR codes
- Track batch complaints
- Access: `/kitchen/dashboard`

### Pantry Staff:
- View dispatched batches
- Receive batches
- Track inventory
- Access: `/pantry/dashboard`

### Passengers:
- No login required
- Scan QR codes
- Submit complaints
- Access: `/complaint/[qrcode]`

---

## 📦 What's Included?

- ✅ Next.js 16 with TypeScript
- ✅ PostgreSQL database
- ✅ Prisma ORM
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ QR code generation
- ✅ Mobile-responsive design
- ✅ Docker containerization
- ✅ Public complaint system

---

## 🎯 Quick Commands Reference

```bash
# Start with Docker
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build

# Access database
docker exec -it railway_db psql -U railway -d railway_food

# Run Prisma Studio
docker exec -it railway_app npx prisma studio

# Manual start (without Docker)
npm run dev
```

---

## 🤝 Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Restart services: `docker-compose restart`
3. Rebuild: `docker-compose up --build`

---

**Happy Coding! 🚂🍽️**
