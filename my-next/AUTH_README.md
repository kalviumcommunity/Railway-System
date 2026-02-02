# Railway Food Management System - Authentication Setup

## ✅ Day 2 - Authentication (JWT) - COMPLETED

### What's Implemented:

#### Backend ✅
- ✅ User model with ADMIN, KITCHEN, PANTRY roles
- ✅ JWT authentication system
- ✅ Login endpoint (`/api/auth/login`)
- ✅ Register endpoint (`/api/auth/register`)
- ✅ Profile endpoint (`/api/auth/me`)
- ✅ JWT middleware for protected routes
- ✅ Role-based access control middleware
- ✅ Password hashing with bcrypt

#### Frontend ✅
- ✅ Login page (`/login`)
- ✅ AuthContext for state management
- ✅ Token storage in localStorage
- ✅ Protected routes component
- ✅ Role-based dashboards:
  - Admin Dashboard (`/admin/dashboard`)
  - Kitchen Dashboard (`/kitchen/dashboard`)
  - Pantry Dashboard (`/pantry/dashboard`)

---

## 🚀 Getting Started

### Prerequisites
- PostgreSQL running in Docker
- Node.js installed
- Dependencies installed (`npm install`)

### Setup Steps

1. **Start PostgreSQL Container**
   ```bash
   docker start railway_postgres
   ```

2. **Push Database Schema**
   ```bash
   npx prisma db push
   ```

3. **Seed Demo Users**
   ```bash
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to: http://localhost:3000/login

---

## 🔐 Demo Credentials

| Role    | Email                 | Password   |
|---------|-----------------------|------------|
| ADMIN   | admin@railway.com     | admin123   |
| KITCHEN | kitchen@railway.com   | kitchen123 |
| PANTRY  | pantry@railway.com    | pantry123  |

---

## 📁 Project Structure

```
my-next/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Login endpoint
│   │   │   ├── register/route.ts    # Registration endpoint
│   │   │   └── me/route.ts          # Get current user
│   │   └── admin/
│   │       └── users/route.ts       # Admin-only endpoint
│   ├── admin/dashboard/page.tsx     # Admin dashboard
│   ├── kitchen/dashboard/page.tsx   # Kitchen dashboard
│   ├── pantry/dashboard/page.tsx    # Pantry dashboard
│   ├── login/page.tsx               # Login page
│   └── unauthorized/page.tsx        # 403 page
├── components/
│   └── ProtectedRoute.tsx           # Route protection wrapper
├── contexts/
│   └── AuthContext.tsx              # Auth state management
├── lib/
│   ├── prisma.ts                    # Prisma client
│   ├── jwt.ts                       # JWT utilities
│   ├── auth-middleware.ts           # Auth middleware
│   ├── password.ts                  # Password hashing
│   └── validation.ts                # Zod schemas
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── seed.js                      # Seed script
└── .env                             # Environment variables
```

---

## 🔧 API Endpoints

### Public Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Protected Endpoints (Requires JWT)
- `GET /api/auth/me` - Get current user profile

### Admin-Only Endpoints
- `GET /api/admin/users` - List all users

---

## 🧪 Testing Authentication

### Test with curl:

**1. Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@railway.com","password":"admin123"}'
```

**2. Get Profile** (replace TOKEN with actual token)
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**3. Run Automated Tests**
```bash
# Make sure server is running first
node test-auth.js
```

---

## 🔐 How JWT Authentication Works

1. **User Login**
   - User submits email & password
   - Server validates credentials
   - Server generates JWT token with user info
   - Token sent to client

2. **Token Storage**
   - Client stores token in localStorage
   - Token included in Authorization header for API calls

3. **Protected Routes**
   - Middleware extracts & verifies token
   - User info attached to request
   - Request proceeds if valid

4. **Role-Based Access**
   - Middleware checks user role
   - Returns 403 if insufficient permissions
   - Allows access if role matches

---

## 🛡️ Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token expiration (7 days)
- ✅ Token verification on protected routes
- ✅ Role-based access control
- ✅ Active user check
- ✅ Secure token storage

---

## 📝 Environment Variables

```env
DATABASE_URL="postgresql://admin:railway123@localhost:5433/railway_food?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-12345"
```

⚠️ **Important**: Change `JWT_SECRET` in production!

---

## 🎯 Next Steps (Day 3+)

- [ ] Batch CRUD operations
- [ ] Kitchen management
- [ ] Batch tracking & events
- [ ] Complaint system
- [ ] Real-time updates
- [ ] Email notifications

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Restart PostgreSQL container
docker restart railway_postgres

# Check if container is running
docker ps | grep railway_postgres
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Prisma Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (⚠️ deletes all data)
npx prisma db push --force-reset
```

---

## 📚 Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Prisma 7** - ORM with PostgreSQL adapter
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Validation
- **Tailwind CSS** - Styling

---

## ✅ Deliverable Status

**Role-based login works!** ✨

- Users can login with different roles
- Each role redirects to appropriate dashboard
- Protected routes enforce authentication
- Role middleware enforces permissions
- Token-based session management
