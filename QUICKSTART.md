# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 16+ installed (`node --version`)
- ✅ PostgreSQL installed and running
- ✅ npm or yarn installed

---

## 🏃 Quick Start (5 minutes)

### Step 1: Setup Database

**Create PostgreSQL database:**
```bash
# Open PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE wms_db;
CREATE USER wms_user WITH PASSWORD 'wms_password';
GRANT ALL PRIVILEGES ON DATABASE wms_db TO wms_user;
\q
```

### Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `backend/.env`:**
```env
DATABASE_URL="postgresql://wms_user:wms_password@localhost:5432/wms_db"
JWT_SECRET="my-super-secret-jwt-key-change-in-production"
PORT=5000
NODE_ENV=development
```

**Initialize database and seed data:**
```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed sample data (optional but recommended)
npm run seed

# Start backend server
npm run dev
```

✅ **Backend should now be running on http://localhost:5000**

Test it: http://localhost:5000/health

---

### Step 3: Setup Frontend

**Open a NEW terminal window:**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `frontend/.env` (should already be correct):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Start frontend:**
```bash
npm start
```

✅ **Frontend should open automatically at http://localhost:3000**

---

## 🎯 First Login

If you ran the seed script, use these credentials:
```
Email: admin@wms.com
Password: admin123
```

Otherwise, click **Register** to create your first admin account.

---

## 📚 What's Next?

### Explore the Features:

1. **Dashboard** - View statistics and overview
2. **Products** - Add your first product
3. **Warehouses** - Create a warehouse location
4. **Inventory** - Link products to warehouses with quantities
5. **Orders** - Create incoming/outgoing orders

### Try These Actions:

✅ Create a product (e.g., "Laptop")
✅ Create a warehouse (e.g., "Main Warehouse")
✅ Add inventory (link product to warehouse)
✅ Create an incoming order (adds stock)
✅ Create an outgoing order (removes stock)
✅ Check low stock warnings

---

## 🔧 Useful Commands

### Backend Commands
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed sample data
npm run seed
```

### Frontend Commands
```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error: "Can't reach database server"**
```bash
# Check if PostgreSQL is running
sudo service postgresql status  # Linux
brew services list              # macOS
# Or check Windows Services for PostgreSQL

# Restart PostgreSQL if needed
sudo service postgresql start   # Linux
brew services start postgresql  # macOS
```

**Error: "Database does not exist"**
```bash
# Recreate database
psql -U postgres
CREATE DATABASE wms_db;
\q

# Run migrations again
npx prisma migrate dev
```

### Frontend won't start

**Error: "Port 3000 is already in use"**
```bash
# Kill the process using port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm start
```

### Can't login

1. Check backend is running (http://localhost:5000/health)
2. Check browser console for errors
3. Verify credentials or register new account
4. Check backend terminal for error logs

---

## 📖 Additional Resources

- **Full Documentation**: See [README.md](README.md)
- **API Documentation**: See [backend/API.md](backend/API.md)
- **Database Schema**: See [backend/DATABASE.md](backend/DATABASE.md)
- **Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🎉 Success!

You should now have:
- ✅ Backend API running on port 5000
- ✅ Frontend UI running on port 3000
- ✅ PostgreSQL database connected
- ✅ Sample data loaded (if you ran seed)
- ✅ Ability to login and use all features

**Happy warehouse managing! 📦**

---

## 💡 Tips

- Keep both terminal windows open (backend & frontend)
- Use Prisma Studio to view database: `npx prisma studio`
- Check the Dashboard for system statistics
- Low stock items show warnings automatically
- All data is validated before saving

---

## 🆘 Need Help?

If you encounter issues:
1. Check the error message in terminal/console
2. Review the troubleshooting section above
3. Check [README.md](README.md) for detailed setup
4. Ensure all prerequisites are installed
5. Verify database connection settings in `.env`
