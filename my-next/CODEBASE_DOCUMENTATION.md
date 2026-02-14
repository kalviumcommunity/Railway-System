# 🚂 Railway Food Management System - Complete Codebase Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [File Structure & Explanations](#file-structure--explanations)
6. [Workflow & Data Flow](#workflow--data-flow)
7. [Authentication Flow](#authentication-flow)
8. [Key Features](#key-features)

---

## 🎯 System Overview

This is a **Railway Food Service Management System** designed to track food quality and distribution across Indian Railways. It enables:

- **Kitchen heads** to create food batches with QR codes
- **Pantry staff** to receive and track batches
- **Passengers** to scan QR codes and file complaints (without login)
- **Administrators** to monitor the entire system

**Core Concept**: Every food batch gets a unique QR code. When passengers receive food on trains, they can scan the QR code to view batch details and file complaints about food quality.

---

## 🏗️ Architecture

**Framework**: Next.js 16 (Full-stack React framework)
- **Frontend**: React components with TypeScript
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker Compose for easy setup

**Architecture Pattern**: 
- **Role-Based Access Control (RBAC)**: 3 roles - Admin, Kitchen, Pantry
- **JWT Authentication**: Token-based auth with HTTP-only approach
- **RESTful API**: Standard REST endpoints for all operations

---


## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with server-side rendering
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **qrcode.react** - QR code generation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Schema validation

### DevOps
- **Docker & Docker Compose** - Containerization
- **ESLint** - Code linting

---

## 💾 Database Schema

### Tables & Relationships

#### 1. **User**
```prisma
- id: String (UUID, Primary Key)
- email: String (Unique)
- password: String (Hashed)
- name: String
- role: Enum (ADMIN, KITCHEN, PANTRY)
- active: Boolean
- createdAt: DateTime
```
**Purpose**: Stores system users with role-based access

#### 2. **Kitchen**
```prisma
- id: String (UUID, Primary Key)
- name: String
- status: Enum (ACTIVE, BLOCKED)
- createdAt: DateTime
- batches: Batch[] (One-to-Many)
```
**Purpose**: Represents railway kitchens that prepare food

#### 3. **Batch**
```prisma
- id: String (UUID, Primary Key)
- kitchenId: String (Foreign Key)
- supplierName: String
- foodItem: String
- qrCode: String (Unique)
- status: Enum (CREATED, DISPATCHED, RECEIVED, EXPIRED)
- expiresAt: DateTime
- createdAt: DateTime
- kitchen: Kitchen (Relation)
- events: BatchEvent[] (One-to-Many)
- complaints: Complaint[] (One-to-Many)
```
**Purpose**: Represents a food batch with QR code for tracking and complaints

#### 4. **BatchEvent**
```prisma
- id: String (UUID, Primary Key)
- batchId: String (Foreign Key)
- eventType: Enum (CREATED, DISPATCHED, RECEIVED, COMPLAINT)
- actorRole: Enum (ADMIN, KITCHEN, PANTRY)
- createdAt: DateTime
- batch: Batch (Relation)
```
**Purpose**: Audit trail for batch lifecycle events

#### 5. **Complaint**
```prisma
- id: String (UUID, Primary Key)
- batchId: String (Foreign Key)
- trainNo: String
- message: String
- createdAt: DateTime
- batch: Batch (Relation)
```
**Purpose**: Stores passenger complaints linked to specific batches

---

## 📁 File Structure & Explanations

### Root Configuration Files

#### `package.json`
**Purpose**: Project dependencies and scripts
- **Dependencies**: Next.js, React, Prisma, JWT, bcrypt, Zod, QR code library
- **Scripts**: 
  - `dev`: Development server
  - `build`: Production build
  - `start`: Production server
  - `db:seed`: Populate database with demo users

#### `docker-compose.yml`
**Purpose**: Multi-container Docker setup
- **postgres service**: PostgreSQL database container
- **app service**: Next.js application container
- **Environment variables**: Database connection, JWT secret
- **Health checks**: Ensures DB is ready before app starts

#### `Dockerfile`
**Purpose**: Builds the Next.js application image
- Installs dependencies
- Builds production bundle
- Runs Prisma migrations
- Starts the server

#### `next.config.ts`
**Purpose**: Next.js configuration
- Build settings
- Environment variables
- Routing configuration

#### `tsconfig.json`
**Purpose**: TypeScript compiler configuration
- Path aliases (`@/` points to root)
- Strict type checking
- ES module settings

#### `tailwind.config.js` & `postcss.config.mjs`
**Purpose**: Tailwind CSS v4 configuration
- Styling framework setup
- Custom theme configuration

---

### Prisma Directory (`/prisma`)

#### `schema.prisma`
**Purpose**: Database schema definition
- Defines all tables and relationships
- Enums for roles, statuses, event types
- PostgreSQL configuration
- Acts as single source of truth for database structure

#### `seed.js`
**Purpose**: Database seeding script
- Creates 3 demo users:
  - `admin@railway.com` / `admin123` (ADMIN role)
  - `kitchen@railway.com` / `kitchen123` (KITCHEN role)
  - `pantry@railway.com` / `pantry123` (PANTRY role)
- Hashes passwords with bcrypt
- Run with: `npm run db:seed`

#### `migrations/`
**Purpose**: Database migration history
- Tracks schema changes over time
- `20260202032132_init/migration.sql`: Initial schema creation
- Ensures database consistency across environments

---

### Library Directory (`/lib`)

#### `prisma.ts`
**Purpose**: Prisma client singleton
- Creates single database connection instance
- Prevents multiple connections in development
- Optimizes database connection pooling

#### `jwt.ts`
**Purpose**: JWT token management
- **`generateToken()`**: Creates JWT with user ID, email, role (expires in 7 days)
- **`verifyToken()`**: Validates and decodes JWT
- **`extractToken()`**: Extracts token from "Bearer {token}" header
- Uses `JWT_SECRET` environment variable

#### `password.ts`
**Purpose**: Password security
- **`hashPassword()`**: Hashes passwords with bcrypt (10 salt rounds)
- **`comparePassword()`**: Verifies password against hash
- Never stores plain text passwords

#### `auth-middleware.ts`
**Purpose**: API route protection
- **`withAuth()`**: Ensures user is authenticated
- **`withRole()`**: Ensures user has required role(s)
- Returns 401 for unauthorized, 403 for insufficient permissions
- Adds `user` object to request for use in handlers

#### `validation.ts`
**Purpose**: Input validation schemas using Zod
- **`loginSchema`**: Validates email and password (min 6 chars)
- **`registerSchema`**: Validates email, password, name, and optional role
- Type-safe validation with clear error messages

---

### Context Directory (`/contexts`)

#### `AuthContext.tsx`
**Purpose**: Global authentication state management
- **State**: `user`, `token`, `isLoading`, `isAuthenticated`
- **`login()`**: Authenticates user, stores token, redirects by role
- **`logout()`**: Clears token and redirects to login
- **`fetchUserProfile()`**: Validates token on app load
- **localStorage**: Persists JWT token across page reloads
- Provides authentication to entire app via React Context

**Flow**:
1. App loads → checks localStorage for token
2. If token exists → validates with `/api/auth/me`
3. If valid → sets user state
4. Components can access auth state via `useAuth()` hook

---

### Components Directory (`/components`)

#### `ProtectedRoute.tsx`
**Purpose**: Client-side route protection
- **Props**: `children`, `allowedRoles`
- Checks if user is authenticated
- Checks if user has required role
- Redirects to `/login` if not authenticated
- Redirects to `/unauthorized` if wrong role
- Shows loading spinner during auth check

**Usage**: Wrap any page that requires authentication
```tsx
<ProtectedRoute allowedRoles={['ADMIN']}>
  <AdminDashboard />
</ProtectedRoute>
```

---

### App Directory (`/app`) - Next.js App Router

#### Root Files

##### `layout.tsx`
**Purpose**: Root layout for entire application
- Wraps all pages with `<AuthProvider>`
- Sets up fonts (Geist Sans, Geist Mono)
- Defines metadata (title, description)
- Applies global styles

##### `globals.css`
**Purpose**: Global CSS styles
- Tailwind CSS imports
- Custom utility classes
- CSS variables
- Base styles for whole app

##### `page.tsx`
**Purpose**: Landing page (/)
- Beautiful hero section with gradient
- Shows features of the system
- **"Get Started" button**: Redirects to appropriate dashboard based on role
- **"File Complaint" button**: Public complaint submission
- Role-aware routing (different dashboards for different users)
- No authentication required to view

---

### Authentication Pages

#### `/app/login/page.tsx`
**Purpose**: Login page (/login)
- Email and password inputs
- Calls `useAuth().login()` function
- Shows error messages on failed login
- Redirects to appropriate dashboard on success
- Link to signup page

#### `/app/signup/page.tsx`
**Purpose**: Registration page (/signup)
- Name, email, password, role selection
- Creates new user account
- Auto-login after successful registration
- Input validation

#### `/app/unauthorized/page.tsx`
**Purpose**: Access denied page (/unauthorized)
- Shown when user tries to access page without proper role
- Clean error message
- Button to return to home

---

### API Routes (`/app/api`)

#### Authentication APIs (`/api/auth`)

##### `/api/auth/login/route.ts`
**Purpose**: User login endpoint (POST)
- **Input**: email, password
- **Process**:
  1. Validates input with Zod schema
  2. Finds user in database
  3. Checks if user is active
  4. Compares password with bcrypt
  5. Generates JWT token
- **Output**: token, user object (without password)
- **Errors**: 401 for invalid credentials, 403 for inactive account

##### `/api/auth/register/route.ts`
**Purpose**: User registration endpoint (POST)
- **Input**: name, email, password, role (optional)
- **Process**:
  1. Validates input
  2. Checks if email already exists
  3. Hashes password
  4. Creates user with default role KITCHEN
  5. Generates JWT token
- **Output**: token, user object
- **Errors**: 400 for invalid input, 409 for duplicate email

##### `/api/auth/me/route.ts`
**Purpose**: Get current user profile (GET)
- **Input**: JWT token in Authorization header
- **Process**:
  1. Verifies JWT token
  2. Fetches user from database
- **Output**: user object
- **Errors**: 401 for invalid token, 404 for user not found
- Used by AuthContext to validate token on app load

---

#### Admin APIs (`/api/admin`) - Protected with Admin role

##### `/api/admin/users/route.ts`
**Purpose**: User management (GET, POST)
- **GET**: Lists all users in system
- **POST**: Creates new user (admin only)
- Protected by `withRole('ADMIN')`

##### `/api/admin/users/[id]/route.ts`
**Purpose**: Single user operations (PATCH, DELETE)
- **PATCH**: Update user (toggle active status, change role)
- **DELETE**: Soft delete user
- Prevents admin from deactivating themselves

##### `/api/admin/kitchens/route.ts`
**Purpose**: Kitchen management (GET, POST)
- **GET**: Lists all kitchens with batch counts
- **POST**: Creates new kitchen
- Protected by multiple roles (ADMIN, KITCHEN)

##### `/api/admin/kitchens/[id]/route.ts`
**Purpose**: Single kitchen operations (PATCH)
- **PATCH**: Update kitchen status (ACTIVE ↔ BLOCKED)
- **Blocking kitchen**: Prevents creating new batches
- Includes batch count in response

##### `/api/admin/batches/route.ts`
**Purpose**: Batch management (GET, POST)
- **GET**: Lists all batches (admin sees all, others see only active kitchens)
- **POST**: Creates new batch
  - Generates unique QR code
  - Validates kitchen exists
  - Validates expiration date
  - Creates CREATED event
  - Returns batch with QR code
- Protected by `withRole('ADMIN', 'KITCHEN')`

##### `/api/admin/complaints/route.ts`
**Purpose**: Complaint management (GET)
- **GET**: Lists all complaints with batch and kitchen details
- Ordered by creation date (newest first)
- Protected by `withRole('ADMIN', 'KITCHEN')`

##### `/api/admin/stats/route.ts`
**Purpose**: Dashboard statistics (GET)
- **Returns**:
  - User stats (total, active)
  - Kitchen stats (total, active)
  - Batch stats (total, active)
  - Total complaints
  - Recent activity (last 10 batch events)
- Protected by `withRole('ADMIN')`

---

#### Public APIs (`/api/public`) - No authentication required

##### `/api/public/batch/[qrcode]/route.ts`
**Purpose**: Get batch info by QR code (GET)
- **Input**: QR code in URL parameter
- **Output**: Batch details (kitchen, food item, supplier, expiry, status)
- **Public access**: No authentication needed
- Used by complaint page when passenger scans QR code

##### `/api/public/complaints/route.ts`
**Purpose**: Submit complaint (POST)
- **Input**: qrCode, trainNo, passengerName (optional), message
- **Process**:
  1. Finds batch by QR code
  2. Creates complaint linked to batch
  3. Records passenger name in message
- **Output**: Complaint ID and creation time
- **Public access**: Passengers don't need login to complain

##### `/api/health/route.js`
**Purpose**: Health check endpoint (GET)
- Returns system status
- Used for monitoring and load balancers

---

### Dashboard Pages

#### `/app/admin/dashboard/page.tsx`
**Purpose**: Admin control panel
- **Protection**: Only ADMIN role
- **Features**:
  - **Overview Tab**: System statistics, recent activity
  - **Kitchen Management Tab**: 
    - Create new kitchens
    - Block/unblock kitchens
    - View batch counts
  - **Batch Tracking Tab**: 
    - View all batches
    - See status, expiry, complaints
    - Filter by kitchen
  - **Complaints Tab**: 
    - View all complaints
    - See train number, message, batch details
  - **User Management Tab**: 
    - Create users
    - Activate/deactivate users
    - Prevent self-deactivation
- **Real-time updates**: Fetches fresh data after actions
- **Color-coded statuses**: Visual status indicators

#### `/app/kitchen/dashboard/page.tsx`
**Purpose**: Kitchen head dashboard
- **Protection**: Only KITCHEN role
- **Features**:
  - **Overview Tab**: Kitchen and batch statistics
  - **Kitchens Tab**: 
    - Create new kitchens
    - View kitchen list
  - **Batches Tab**: 
    - Create new batches
    - Specify kitchen, supplier, food item, expiry
    - View all batches
  - **QR Codes Tab**: 
    - View generated QR codes
    - Download/print QR codes
    - Click to view large QR code
- **QR Code Generation**: Automatic unique QR per batch
- **Modal dialogs**: Clean UI for creation forms

#### `/app/pantry/dashboard/page.tsx`
**Purpose**: Pantry staff dashboard
- **Protection**: Only PANTRY role
- **Features**:
  - Receive batch (scan QR or enter code)
  - View received batches
  - File complaint
- **Note**: Currently basic implementation, can be extended

#### `/app/complaint/[qrcode]/page.tsx`
**Purpose**: Public complaint submission page
- **URL**: `/complaint/{qrcode}`
- **Access**: Public (no login required)
- **Flow**:
  1. Passenger scans QR code on food package
  2. Browser opens this page with QR code in URL
  3. Page fetches batch info (kitchen, food item, supplier, expiry)
  4. Shows batch details with visual indicators
  5. Passenger fills form: train number, name (optional), complaint message
  6. Submits complaint
  7. Shows success message
- **Validation**: Checks if QR code is valid
- **Error handling**: Shows "Invalid QR Code" if batch not found
- **Mobile-friendly**: Large touch targets, clear text

---

## 🔄 Workflow & Data Flow

### Complete System Workflow

#### 1. **User Registration & Authentication**
```
User → /signup → POST /api/auth/register → Hash password → Create user → Generate JWT → Store token → Redirect to dashboard
```

#### 2. **Login Flow**
```
User → /login → POST /api/auth/login → Verify password → Generate JWT → Store token → Redirect by role:
  - ADMIN → /admin/dashboard
  - KITCHEN → /kitchen/dashboard
  - PANTRY → /pantry/dashboard
```

#### 3. **Kitchen Creation (Admin/Kitchen Head)**
```
Dashboard → Create Kitchen button → POST /api/admin/kitchens → Save to DB → Refresh list
```

#### 4. **Batch Creation (Kitchen Head)**
```
Kitchen Dashboard → Create Batch button → Fill form:
  - Select kitchen
  - Enter supplier name
  - Enter food item
  - Set expiry date
→ POST /api/admin/batches → Generate unique QR code → Create batch → Create CREATED event → Return batch with QR
```

#### 5. **QR Code Distribution**
```
Kitchen Dashboard → QR Codes tab → View/Download QR codes → Print QR codes → Attach to food packages
```

#### 6. **Passenger Complaint Submission**
```
Passenger receives food on train → Scans QR code → Opens /complaint/{qrcode} → 
GET /api/public/batch/{qrcode} → Shows batch info → Passenger fills form → 
POST /api/public/complaints → Create complaint → Show success message
```

#### 7. **Admin Monitoring**
```
Admin Dashboard → View stats → Monitor complaints → Block problematic kitchens → Manage users
```

---

## 🔐 Authentication Flow

### Token-Based Authentication

```
1. Login
   ↓
2. Server validates credentials
   ↓
3. Server generates JWT with user data
   ↓
4. Client stores JWT in localStorage
   ↓
5. Client includes JWT in Authorization header for all API requests
   ↓
6. Server validates JWT and extracts user info
   ↓
7. Server processes request based on user role
```

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@railway.com",
  "role": "ADMIN",
  "iat": 1234567890,
  "exp": 1234999999
}
```

### Role-Based Access Matrix

| Endpoint | Public | ADMIN | KITCHEN | PANTRY |
|----------|--------|-------|---------|--------|
| `/api/auth/*` | ✅ | ✅ | ✅ | ✅ |
| `/api/public/*` | ✅ | ✅ | ✅ | ✅ |
| `/api/admin/users/*` | ❌ | ✅ | ❌ | ❌ |
| `/api/admin/kitchens` | ❌ | ✅ | ✅ | ❌ |
| `/api/admin/batches` | ❌ | ✅ | ✅ | ❌ |
| `/api/admin/complaints` | ❌ | ✅ | ✅ | ❌ |
| `/api/admin/stats` | ❌ | ✅ | ❌ | ❌ |

---

## ✨ Key Features

### 1. **Role-Based Access Control**
- 3 distinct user roles with different permissions
- Protected routes and API endpoints
- Role-specific dashboards

### 2. **QR Code System**
- Unique QR code per batch
- Scannable from mobile devices
- Links to public complaint page
- No app installation required

### 3. **Public Complaint Portal**
- No authentication needed
- Accessible via QR code scan
- Records train number and message
- Immediate feedback to passengers

### 4. **Kitchen Management**
- Create and manage kitchens
- Block problematic kitchens
- Track batch production per kitchen

### 5. **Batch Tracking**
- Full lifecycle tracking (Created → Dispatched → Received → Expired)
- Supplier information
- Expiry date tracking
- Complaint linkage

### 6. **Admin Dashboard**
- System-wide statistics
- User management
- Kitchen status control
- Complaint monitoring
- Recent activity feed

### 7. **Real-time Updates**
- Automatic data refresh after actions
- Instant status changes
- Live complaint tracking

### 8. **Mobile-First Design**
- Responsive Tailwind CSS
- Touch-friendly interfaces
- Works on all device sizes
- Optimized for QR scanning

### 9. **Security Features**
- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation with Zod
- Active/inactive user control

### 10. **Docker Deployment**
- One-command setup with Docker Compose
- PostgreSQL containerized
- Environment variable configuration
- Health checks for reliability

---

## 🚀 Quick Start Commands

```bash
# Development
npm run dev              # Start development server

# Production with Docker
docker-compose up --build  # Start all services

# Database
npm run db:seed          # Create demo users

# Access
http://localhost:3000    # Application
admin@railway.com / admin123  # Admin login
```

---

## 📊 Data Flow Example: Complete Complaint Journey

```
1. Kitchen Head logs in
   ↓
2. Creates new batch with QR code "QR-12345"
   ↓
3. QR code printed and attached to food package
   ↓
4. Food dispatched to train
   ↓
5. Passenger receives food
   ↓
6. Passenger scans QR code with phone camera
   ↓
7. Phone opens: /complaint/QR-12345
   ↓
8. App fetches: GET /api/public/batch/QR-12345
   ↓
9. Shows: "Biryani | Supplied by ABC Kitchen | Expires: 2026-02-15"
   ↓
10. Passenger enters: Train No: 12345, Message: "Food was cold"
    ↓
11. Submits: POST /api/public/complaints
    ↓
12. Database creates complaint linked to batch
    ↓
13. Admin sees complaint in dashboard
    ↓
14. Admin can block kitchen if multiple complaints
```

---

## 🎓 Learning Points

This codebase demonstrates:

1. **Full-stack TypeScript development** with Next.js
2. **Database design** with proper relationships
3. **Authentication & authorization** patterns
4. **API design** (REST principles)
5. **React patterns** (Context, Hooks, Protected Routes)
6. **Security best practices** (password hashing, JWT)
7. **Docker containerization**
8. **ORM usage** (Prisma)
9. **Input validation** (Zod schemas)
10. **Role-based access control** implementation

---

## 📝 Notes

- **Environment Variables**: Required: `DATABASE_URL`, `JWT_SECRET`
- **Database Migrations**: Run automatically in Docker, manually with `npx prisma migrate dev`
- **Type Safety**: Full TypeScript coverage with Prisma-generated types
- **Error Handling**: Consistent error responses across all API routes
- **Scalability**: Stateless JWT auth allows horizontal scaling

---

**Documentation Last Updated**: February 12, 2026
**Version**: 1.0.0
**Author**: Railway System Development Team
