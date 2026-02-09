# 🚂 Railway Food Service Management System

A comprehensive food quality tracking system for Indian Railways with QR code-based complaint management.

## ✨ Features

- 🔐 **Role-Based Access Control** (Admin, Kitchen Head, Pantry Staff)
- 📱 **Mobile-First Design** - Works on all devices
- 🎫 **QR Code Generation** - Scannable codes for food batches
- 📝 **Public Complaint System** - No login required for passengers
- 🍽️ **Batch Tracking** - Track food from kitchen to pantry
- 📊 **Admin Dashboard** - Complete system overview
- ⚡ **Real-time Updates** - Instant status tracking

## 🚀 Quick Start with Docker

**One command to run everything:**

```bash
docker-compose up --build
```

Visit: http://localhost:3000

**Default Login:**
- Email: `admin@railway.com`
- Password: `admin123`

## 📖 Documentation

- **[Complete Setup Guide](SETUP_GUIDE.md)** - Full installation instructions
- **[Mobile Testing Guide](MOBILE_TESTING.md)** - Test on your phone

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT tokens with bcrypt
- **QR Codes**: qrcode.react
- **Containerization**: Docker & Docker Compose

## 👥 User Roles

### Admin
- Full system access
- User management
- System statistics

### Kitchen Head
- Create kitchens & batches
- Generate QR codes
- View complaints

### Pantry Staff
- Receive batches
- Track inventory

### Passengers (Public)
- Scan QR codes
- Submit complaints
- No login required!
