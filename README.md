# 📦 Warehouse Management System (WMS)

> A modern, full-stack TypeScript application for managing warehouse operations

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.9-2D3748)](https://www.prisma.io/)

---

## 📑 Quick Links

- **[🚀 Quick Start Guide](QUICKSTART.md)** - Get started in 5 minutes
- **[✨ Features Documentation](FEATURES.md)** - Detailed feature guide
- **[🏗️ Architecture Details](ARCHITECTURE.md)** - Technical architecture
- **[🔌 API Reference](backend/API.md)** - Complete API documentation
- **[🗄️ Database Schema](backend/DATABASE.md)** - Database documentation
- **[🚢 Deployment Guide](DEPLOYMENT.md)** - Production deployment
- **[📊 Project Summary](PROJECT_SUMMARY.md)** - Complete project overview

---

## 🎯 Overview

A production-ready web application for managing warehouse operations including:
- **Product Management** - Catalog with SKU tracking
- **Warehouse Management** - Multiple storage locations
- **Inventory Tracking** - Real-time stock levels with low stock alerts
- **Order Management** - Incoming/outgoing orders with automatic inventory updates
- **Admin Dashboard** - Statistics and system overview

---

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express** (TypeScript)
- **Prisma** ORM
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing

### Frontend
- **React** (TypeScript)
- **React Router** for navigation
- **Axios** for API calls
- Clean, responsive UI

## 📁 Project Structure

```
/backend
  /src
    /config       - Database and environment configuration
    /controllers  - Business logic
    /routes       - API endpoints
    /middleware   - Auth and validation middleware
    /prisma       - Database schema
/frontend
  /src
    /components   - Reusable UI components
    /pages        - Page components
    /services     - API service layer
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/wms_db"
JWT_SECRET="your-secret-key-here"
PORT=5000
NODE_ENV=development
```

5. Create database and run migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

6. (Optional) Create a seed admin user:
You can register through the frontend or use Prisma Studio:
```bash
npx prisma studio
```

7. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` if needed:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Warehouses
- `GET /api/warehouses` - Get all warehouses
- `GET /api/warehouses/:id` - Get warehouse by ID
- `POST /api/warehouses` - Create warehouse
- `PUT /api/warehouses/:id` - Update warehouse
- `DELETE /api/warehouses/:id` - Delete warehouse

### Inventory
- `GET /api/inventory` - Get all inventory records
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/warehouse/:warehouseId` - Get inventory by warehouse
- `GET /api/inventory/product/:productId` - Get inventory by product
- `POST /api/inventory` - Create inventory record
- `PUT /api/inventory/:id` - Update inventory
- `DELETE /api/inventory/:id` - Delete inventory record

### Orders
- `GET /api/orders/incoming` - Get all incoming orders
- `GET /api/orders/outgoing` - Get all outgoing orders
- `POST /api/orders/in` - Create incoming order (adds stock)
- `POST /api/orders/out` - Create outgoing order (reduces stock)

## ✨ Features

### ✅ Implemented Features

1. **Authentication**
   - Admin registration and login
   - JWT-based authentication
   - Protected routes

2. **Product Management**
   - Create, read, update, delete products
   - Product fields: name, category, SKU, price, description
   - SKU uniqueness validation

3. **Warehouse Management**
   - Manage storage locations
   - Track inventory per warehouse
   - Prevent deletion of warehouses with inventory

4. **Inventory Management**
   - Track quantity per product-warehouse combination
   - Set minimum stock levels
   - Low stock warnings and alerts
   - Real-time inventory updates

5. **Order Management**
   - Incoming orders (add stock)
   - Outgoing orders (reduce stock)
   - Automatic inventory updates
   - Prevent negative inventory
   - Order history tracking

6. **Dashboard**
   - Overview statistics
   - Quick access to all features
   - Low stock notifications

## 🎯 Business Rules

- ✅ Inventory quantity cannot go below zero
- ✅ Only authenticated admins can access the system
- ✅ All input data is validated
- ✅ Proper HTTP status codes
- ✅ SKU uniqueness enforced
- ✅ Cascading deletes for related records

## 🔒 Security

- Password hashing with bcryptjs
- JWT token authentication
- Token expiration (24 hours)
- Protected API routes
- Input validation
- SQL injection protection via Prisma

## 🧪 Testing the Application

1. Register a new admin account
2. Log in with your credentials
3. Create some products (e.g., "Laptop", "Mouse", "Keyboard")
4. Create warehouses (e.g., "Main Warehouse - New York")
5. Add inventory records linking products to warehouses
6. Create incoming orders to add stock
7. Create outgoing orders to reduce stock
8. Check the dashboard for statistics
9. View low stock items in the inventory page

## 📝 Development Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Update `DATABASE_URL` with production database
3. Generate a secure `JWT_SECRET`
4. Run `npm run build`
5. Start with `npm start`

### Frontend
1. Update `REACT_APP_API_URL` with production API URL
2. Run `npm run build`
3. Serve the `build` folder with a static file server

## 🎓 Learn More

### Documentation Files
- **[README.md](README.md)** - This file (complete setup guide)
- **[QUICKSTART.md](QUICKSTART.md)** - Fast 5-minute setup
- **[FEATURES.md](FEATURES.md)** - User features and workflows
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and technical details
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview
- **[backend/API.md](backend/API.md)** - REST API documentation
- **[backend/DATABASE.md](backend/DATABASE.md)** - Database schema details

### External Resources
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---

## 📊 Project Stats

- **Backend Files**: 15+ TypeScript files
- **Frontend Files**: 15+ React components
- **API Endpoints**: 25+ RESTful endpoints
- **Database Tables**: 6 tables with relationships
- **Documentation Pages**: 8 comprehensive guides
- **Total Lines of Code**: 3,500+ lines
- **Development Time**: Complete, production-ready

---

## ✅ Checklist for Success

- [x] Clean, modular TypeScript code
- [x] Complete CRUD operations for all entities
- [x] JWT authentication system
- [x] Real-time low stock alerts
- [x] Automatic inventory updates
- [x] Input validation at all levels
- [x] Error handling throughout
- [x] Responsive UI design
- [x] Sample data seeder
- [x] Comprehensive documentation
- [x] Production deployment guide
- [x] Security best practices

---

## 🤝 Contributing

This project follows clean code principles and best practices. When contributing:

1. Follow the existing code structure
2. Maintain TypeScript types
3. Add appropriate error handling
4. Update documentation
5. Test thoroughly before submitting

---

## 📜 License

This project is provided as-is for educational and commercial use.

---

## 📞 Support

### Getting Help

1. **Check the documentation** - See the links above
2. **Review error messages** - Check terminal/console logs
3. **Verify setup** - Ensure all prerequisites are installed
4. **Check .env files** - Verify configuration is correct
5. **Use Prisma Studio** - Inspect database directly: `npx prisma studio`

### Common Issues

**Database connection failed**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists

**Port already in use**
- Change PORT in backend .env
- Change PORT in frontend: `PORT=3001 npm start`

**Authentication errors**
- Clear localStorage
- Check JWT_SECRET is set
- Verify token hasn't expired

---

## 🎉 Acknowledgments

Built with modern web technologies:
- **TypeScript** - Type safety and better DX
- **React** - Component-based UI
- **Node.js & Express** - Backend server
- **Prisma** - Type-safe database access
- **PostgreSQL** - Robust database
- **JWT** - Secure authentication

---

## 🌟 Features Spotlight

✨ **Real-time Inventory** - Automatic updates on every order
⚠️ **Low Stock Alerts** - Never run out of critical items
🔐 **Secure Auth** - JWT tokens with bcrypt password hashing
📊 **Dashboard** - Quick overview of your entire operation
🏢 **Multi-Warehouse** - Manage inventory across multiple locations
📦 **Order History** - Complete audit trail of all transactions

---

## 🚀 What's Next?

This system is ready for:
- ✅ **Immediate use** in small to medium warehouses
- ✅ **Production deployment** with the deployment guide
- ✅ **Extension** with additional features
- ✅ **Learning** modern web development patterns
- ✅ **Customization** for specific business needs

Check [FEATURES.md](FEATURES.md) for potential future enhancements!

---

<div align="center">

**Built with ❤️ using TypeScript, React, Node.js, Express, Prisma, and PostgreSQL**

⭐ **Ready to deploy • Production-grade code • Comprehensive documentation** ⭐

</div>
