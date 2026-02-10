# 🔄 Database Sync Guide - Share Same Database with Your Friend

## 🎯 Goal
Your friend will have the EXACT SAME database as you - same users, kitchens, batches, and complaints!

---

## 🚀 Quick Setup (3 Options)

### **Option 1: Use Seed Script (Recommended - Fresh Start)**

Both of you start with identical sample data.

#### **Your Friend's Setup:**
```bash
# 1. Clone your repo
git clone <your-repo-url>
cd railway-food-system

# 2. Start with Docker (includes database)
docker-compose up -d

# 3. Seed the database
npm run seed

# Done! Same data as you!
```

**Credentials (Same for both):**
- **Admin**: admin@railway.com / admin123
- **Kitchen**: kitchen@railway.com / kitchen123
- **Pantry**: pantry@railway.com / pantry123

---

### **Option 2: Export/Import Your Actual Database**

Your friend gets YOUR EXACT DATA (everything you created).

#### **Step 1: You Export Your Database**
```bash
# Make script executable (first time only)
chmod +x scripts/db-tools.sh

# Export your database
./scripts/db-tools.sh export

# This creates: railway_db_backup_20260209_143022.sql
```

#### **Step 2: Share the SQL File**
Send the `.sql` file to your friend via:
- Google Drive
- WeTransfer
- Email (if small)
- GitHub (add to repo in `database/` folder)

#### **Step 3: Your Friend Imports**
```bash
# 1. Clone repo and start Docker
docker-compose up -d

# 2. Make script executable
chmod +x scripts/db-tools.sh

# 3. Import your database
./scripts/db-tools.sh import railway_db_backup_20260209_143022.sql

# Done! Has your exact data!
```

---

### **Option 3: Database Dump to Repo**

Include database export in your Git repo.

#### **Your Setup:**
```bash
# 1. Create database folder
mkdir -p database

# 2. Export database
./scripts/db-tools.sh export

# 3. Move export to database folder
mv railway_db_backup_*.sql database/initial_db.sql

# 4. Commit to Git
git add database/
git commit -m "Add initial database dump"
git push
```

#### **Your Friend's Setup:**
```bash
# 1. Clone repo
git clone <your-repo-url>
cd railway-food-system

# 2. Start services
docker-compose up -d

# 3. Import from repo
./scripts/db-tools.sh import database/initial_db.sql

# Done!
```

---

## 🛠️ Database Tools Commands

### **Export Database**
```bash
./scripts/db-tools.sh export
```
Creates: `railway_db_backup_YYYYMMDD_HHMMSS.sql`

### **Import Database**
```bash
./scripts/db-tools.sh import backup.sql
```
⚠️ Overwrites current data!

### **Seed Sample Data**
```bash
./scripts/db-tools.sh seed
# OR
npm run seed
```

### **Reset Database** (Start Fresh)
```bash
./scripts/db-tools.sh reset
```
⚠️ Deletes ALL data!

---

## 📦 What Gets Shared?

When using seed or import:
- ✅ All Users (Admin, Kitchen, Pantry)
- ✅ All Kitchens
- ✅ All Batches with QR codes
- ✅ All Complaints
- ✅ All Events
- ✅ Login credentials

---

## 🐳 Docker Database Sync

### **With Docker Compose:**
Both of you use `docker-compose up` - database is created automatically!

The database runs in a container named `railway_db`:

```bash
# Check database
docker exec -it railway_db psql -U railway -d railway_food

# Inside PostgreSQL:
\dt          # List tables
\du          # List users
SELECT * FROM "User";
```

### **Database Persistence:**
Docker stores data in a volume named `postgres_data`:

```bash
# View volumes
docker volume ls

# Remove volume (deletes all data!)
docker volume rm my-next_postgres_data
```

---

## 🔧 Troubleshooting

### **Can't export - pg_dump not found:**
```bash
# Install PostgreSQL tools
# Ubuntu/Debian:
sudo apt install postgresql-client

# macOS:
brew install postgresql
```

### **Can't import - database doesn't exist:**
```bash
# Create database first
docker exec -it railway_db psql -U railway

CREATE DATABASE railway_food;
\q

# Then run migrations
npx prisma migrate deploy
```

### **Want to start completely fresh:**
```bash
# Stop containers
docker-compose down

# Remove volumes (deletes data!)
docker volume rm my-next_postgres_data

# Start again
docker-compose up -d

# Seed or import
npm run seed
```

### **Database out of sync:**
```bash
# Run migrations
npx prisma migrate deploy

# Regenerate Prisma Client
npx prisma generate
```

---

## 📊 Verify Same Data

Both of you run this to check:

```bash
# Check users
docker exec railway_db psql -U railway -d railway_food -c "SELECT email, name, role FROM \"User\";"

# Check kitchens
docker exec railway_db psql -U railway -d railway_food -c "SELECT name, status FROM \"Kitchen\";"

# Check batches
docker exec railway_db psql -U railway -d railway_food -c "SELECT \"foodItem\", \"qrCode\", status FROM \"Batch\";"
```

Should show identical results!

---

## 🎯 Best Practice for Teams

### **Initial Setup:**
1. You create the project
2. Seed sample data: `npm run seed`
3. Push to Git
4. Friend clones and runs `npm run seed`
5. Both have identical starting data!

### **During Development:**
1. Create migrations for schema changes
2. Push migrations to Git
3. Friend pulls and runs: `npx prisma migrate deploy`
4. Schemas stay in sync!

### **Sharing Test Data:**
1. Export: `./scripts/db-tools.sh export`
2. Add to Git: `git add database/test_data.sql`
3. Friend imports: `./scripts/db-tools.sh import database/test_data.sql`

---

## 🔐 Security Note

⚠️ **Never commit `.env` with production credentials!**

Sample data passwords (`admin123`, `kitchen123`) are fine for development but change in production!

---

## ✅ Quick Checklist

**Your setup:**
- [ ] Export database OR seed script works
- [ ] Push to Git
- [ ] Share SQL file (if using export)

**Friend's setup:**
- [ ] Clone repo
- [ ] Run `docker-compose up -d`
- [ ] Import database OR run seed
- [ ] Login and verify data

---

**Both of you should see the same kitchens, users, and QR codes! 🎉**
