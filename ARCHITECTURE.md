# 🏗️ Technical Architecture

## System Overview

The Warehouse Management System is a full-stack TypeScript application following modern web development best practices with a clean separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  React + TypeScript + React Router + Axios                  │
│  Port: 3000                                                 │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     │ JSON
┌────────────────────▼────────────────────────────────────────┐
│                         Backend                             │
│  Node.js + Express + TypeScript                             │
│  JWT Authentication + Validation                            │
│  Port: 5000                                                 │
└────────────────────┬────────────────────────────────────────┘
                     │ Prisma ORM
                     │ SQL Queries
┌────────────────────▼────────────────────────────────────────┐
│                        Database                             │
│              PostgreSQL (Port: 5432)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Architecture Patterns

### Backend Architecture

**Pattern**: MVC (Model-View-Controller) + Service Layer

```
Request Flow:
Client → Router → Middleware → Controller → Service → Database
                      ↓
                 Validation
                 Authentication
                 Error Handling
```

**Directory Structure:**
```
backend/src/
├── config/          # Configuration (database, env)
├── controllers/     # Request handlers (business logic)
├── routes/          # API route definitions
├── middleware/      # Auth, validation, error handling
└── index.ts         # Application entry point

backend/prisma/
├── schema.prisma    # Database schema definition
└── seed.ts          # Sample data seeder
```

### Frontend Architecture

**Pattern**: Component-Based Architecture

```
frontend/src/
├── components/      # Reusable UI components
│   ├── Layout.tsx
│   └── PrivateRoute.tsx
├── pages/           # Page-level components
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── Warehouses.tsx
│   ├── Inventory.tsx
│   └── Orders.tsx
├── services/        # API communication layer
│   ├── api.ts
│   ├── authService.ts
│   ├── productService.ts
│   ├── warehouseService.ts
│   ├── inventoryService.ts
│   └── orderService.ts
├── App.tsx          # Main app component
└── index.tsx        # Application entry point
```

---

## 🔧 Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 16+ | JavaScript runtime |
| Express | 4.18+ | Web framework |
| TypeScript | 5.3+ | Type safety |
| Prisma | 5.9+ | ORM & database migrations |
| PostgreSQL | 15+ | Database |
| bcryptjs | 2.4+ | Password hashing |
| jsonwebtoken | 9.0+ | JWT authentication |
| express-validator | 7.0+ | Input validation |
| cors | 2.8+ | Cross-origin requests |
| dotenv | 16.4+ | Environment variables |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI library |
| TypeScript | 4.9+ | Type safety |
| React Router | 6.21+ | Client-side routing |
| Axios | 1.6+ | HTTP client |
| React Scripts | 5.0+ | Build tools |

### Development Tools

- **nodemon**: Auto-restart dev server
- **ts-node**: Execute TypeScript directly
- **Prisma Studio**: Database GUI
- **ESLint**: Code linting (frontend)

---

## 🗄️ Database Design

### Schema Overview

**5 Main Tables:**
1. **Admin** - User authentication
2. **Product** - Product catalog
3. **Warehouse** - Storage locations
4. **Inventory** - Stock tracking (junction table)
5. **IncomingOrder** & **OutgoingOrder** - Order history

### Relationships

```
Product (1) ──── (M) Inventory (M) ──── (1) Warehouse
                        │
                        ├── (1) IncomingOrder
                        └── (1) OutgoingOrder
```

### Key Constraints

- **Unique**: SKU, Email, (ProductId + WarehouseId)
- **Foreign Keys**: All relationships enforced
- **Cascade Deletes**: Inventory when Product/Warehouse deleted
- **Not Null**: All required fields enforced at DB level

### Indexes

- Primary keys on all tables (UUID)
- Unique indexes: `sku`, `email`, `productId_warehouseId`
- Foreign key indexes: `productId`, `warehouseId`
- Composite index: `(productId, warehouseId)`

---

## 🔐 Security Implementation

### Authentication Flow

```
1. User submits credentials
   ↓
2. Backend validates email/password
   ↓
3. Backend generates JWT token (24h expiry)
   ↓
4. Frontend stores token in localStorage
   ↓
5. Token sent in Authorization header for all requests
   ↓
6. Backend middleware validates token
   ↓
7. Request processed or 401 Unauthorized
```

### Security Measures

**Backend:**
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT tokens with secret key
- ✅ Token expiration (24 hours)
- ✅ Input validation with express-validator
- ✅ Parameterized queries (SQL injection protection)
- ✅ CORS configuration
- ✅ Environment variables for secrets

**Frontend:**
- ✅ Protected routes (redirect to login)
- ✅ Token storage in localStorage
- ✅ Automatic token attachment to requests
- ✅ Automatic logout on token expiration
- ✅ Client-side validation
- ✅ XSS prevention (React escapes by default)

---

## 📡 API Design

### RESTful Principles

- **Resources**: Products, Warehouses, Inventory, Orders
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: 200, 201, 400, 401, 404, 500
- **JSON**: Request and response format

### API Structure

```
/api
  /auth
    POST /login
    POST /register
    GET  /profile
  /products
    GET    /              # List all
    GET    /:id           # Get one
    POST   /              # Create
    PUT    /:id           # Update
    DELETE /:id           # Delete
  /warehouses
    GET    /              # List all
    GET    /:id           # Get one
    POST   /              # Create
    PUT    /:id           # Update
    DELETE /:id           # Delete
  /inventory
    GET    /              # List all
    GET    /low-stock     # Low stock items
    GET    /warehouse/:id # By warehouse
    GET    /product/:id   # By product
    POST   /              # Create
    PUT    /:id           # Update
    DELETE /:id           # Delete
  /orders
    GET    /incoming      # List incoming
    GET    /outgoing      # List outgoing
    POST   /in            # Create incoming
    POST   /out           # Create outgoing
```

### Request/Response Format

**Request:**
```json
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Laptop",
  "category": "Electronics",
  "sku": "LAP-001",
  "price": 999.99
}
```

**Response:**
```json
201 Created

{
  "id": "uuid",
  "name": "Laptop",
  "category": "Electronics",
  "sku": "LAP-001",
  "price": 999.99,
  "description": null,
  "createdAt": "2026-02-06T12:00:00.000Z",
  "updatedAt": "2026-02-06T12:00:00.000Z"
}
```

---

## 🔄 Data Flow Examples

### Creating an Outgoing Order

```
1. User clicks "Create Outgoing Order"
   ↓
2. Frontend: orderService.createOutgoingOrder(data)
   ↓
3. HTTP: POST /api/orders/out with JWT token
   ↓
4. Backend: authMiddleware validates token
   ↓
5. Backend: express-validator validates input
   ↓
6. Controller: orderController.createOutgoingOrder()
   ↓
7. Service: Check product exists
   ↓
8. Service: Check warehouse exists
   ↓
9. Service: Check inventory exists
   ↓
10. Service: Validate quantity <= available
   ↓
11. Database: BEGIN TRANSACTION
   ↓
12. Database: INSERT INTO OutgoingOrder
   ↓
13. Database: UPDATE Inventory SET quantity = quantity - X
   ↓
14. Database: COMMIT TRANSACTION
   ↓
15. Response: 201 Created with order data
   ↓
16. Frontend: Update UI, show success message
```

---

## 🧪 Error Handling

### Validation Errors (400)
```typescript
{
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

### Authentication Errors (401)
```typescript
{
  "message": "Authentication required"
}
```

### Not Found Errors (404)
```typescript
{
  "message": "Product not found"
}
```

### Server Errors (500)
```typescript
{
  "message": "Internal server error"
}
```

### Error Middleware
```typescript
app.use(errorHandler);

// Catches all unhandled errors
// Logs to console in development
// Returns sanitized error to client
```

---

## 🎨 Frontend State Management

### State Management Approach

**Local Component State**: React `useState` hook
- Form inputs
- UI state (show/hide forms)
- Loading states

**API Data**: Fetched on mount, stored in state
- Products list
- Warehouses list
- Inventory data
- Orders history

**Authentication**: localStorage + axios interceptors
- Token storage
- Automatic token attachment
- Automatic logout on 401

### No Global State Management
- Simple enough for local state
- API is single source of truth
- Could add Redux/Context if needed in future

---

## 🚀 Performance Optimizations

### Database
- Indexed columns for fast queries
- Connection pooling (Prisma default)
- Efficient queries with Prisma
- Only fetch needed data

### Backend
- Minimal middleware chain
- Efficient routing
- No N+1 queries
- JSON response compression (can add)

### Frontend
- Code splitting (React default)
- Lazy loading routes (can add)
- Minimal re-renders
- Efficient React patterns

---

## 📦 Build & Deployment

### Development Build
```bash
# Backend
npm run dev  # nodemon + ts-node

# Frontend  
npm start    # webpack-dev-server
```

### Production Build
```bash
# Backend
npm run build  # TypeScript → JavaScript (dist/)
npm start      # node dist/index.js

# Frontend
npm run build  # Optimized static files (build/)
```

### Environment Configuration

**Development:**
- Hot reload
- Source maps
- Detailed errors
- Prisma query logs

**Production:**
- Optimized bundles
- Minified code
- Error sanitization
- Minimal logging

---

## 🔍 Testing Strategy

### Current State
- Manual testing via UI
- API testing via Postman/curl
- Database validation via Prisma Studio

### Future Testing (Recommended)
```
Backend:
- Unit tests: Jest + ts-jest
- Integration tests: Supertest
- E2E tests: Playwright

Frontend:
- Unit tests: Jest + React Testing Library
- Component tests: React Testing Library
- E2E tests: Cypress or Playwright
```

---

## 📊 Monitoring & Logging

### Current Logging
- Console logs in development
- Error middleware catches exceptions
- Prisma query logs (dev only)

### Production Recommendations
- Winston or Pino for structured logging
- Log aggregation (e.g., Loggly, Papertrail)
- Error tracking (e.g., Sentry)
- Performance monitoring (e.g., New Relic)
- Database query analytics

---

## 🔧 Configuration Management

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=5000
NODE_ENV=development|production
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Configuration Files
- `tsconfig.json` - TypeScript compiler options
- `package.json` - Dependencies and scripts
- `.gitignore` - Files to exclude from git
- `prisma/schema.prisma` - Database schema

---

## 🌐 API Versioning

### Current: No Versioning
- Simple, single version
- Breaking changes require careful migration

### Future: Version API
```
/api/v1/products
/api/v2/products
```

---

## 📈 Scalability Considerations

### Current Limitations
- Single server instance
- Single database connection
- No caching
- No load balancing

### Scaling Path

**Horizontal Scaling:**
1. Deploy multiple backend instances
2. Add load balancer (Nginx, AWS ELB)
3. Session management with Redis
4. Shared PostgreSQL database

**Vertical Scaling:**
1. Increase server resources
2. Database performance tuning
3. Connection pooling optimization

**Caching:**
1. Redis for frequently accessed data
2. API response caching
3. Database query caching

**Database:**
1. Read replicas for queries
2. Connection pooling
3. Indexes optimization
4. Partitioning large tables

---

## 🔐 Security Checklist

- ✅ Passwords hashed
- ✅ JWT tokens
- ✅ Input validation
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (React)
- ✅ CORS configured
- ⚠️ HTTPS (add in production)
- ⚠️ Rate limiting (add)
- ⚠️ CSRF tokens (consider)
- ⚠️ Helmet.js headers (add)

---

## 📚 Code Quality

### TypeScript Benefits
- Type safety throughout
- Better IDE support
- Catch errors at compile time
- Self-documenting code

### Code Organization
- Clear separation of concerns
- Consistent naming conventions
- Modular structure
- Single responsibility principle

### Best Practices
- Error handling in all async functions
- Input validation at API boundary
- Database transactions for multi-step operations
- Consistent response format

---

## 🎯 Key Design Decisions

1. **TypeScript**: Type safety, better DX
2. **Prisma**: Type-safe ORM, great migrations
3. **JWT**: Stateless authentication, scalable
4. **REST**: Simple, widely understood
5. **PostgreSQL**: Robust, ACID compliant
6. **React**: Component-based, ecosystem
7. **No state management**: KISS principle
8. **Axios**: Promise-based, interceptors
9. **Bcrypt**: Industry standard hashing
10. **UUID**: Unique, distributed-friendly IDs

---

## 🔮 Future Improvements

### Technical Debt to Address
- Add comprehensive testing
- Implement rate limiting
- Add request/response logging
- Implement proper error tracking
- Add API documentation (Swagger)
- Optimize database queries
- Add caching layer
- Implement WebSockets for real-time updates

### Feature Enhancements
- Advanced search and filters
- Bulk operations
- Export functionality
- Role-based access control
- Email notifications
- Reporting and analytics
- Mobile responsive improvements
- Dark mode

---

## 📖 Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Express Docs**: https://expressjs.com
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

**Architecture Design: Production-Ready, Scalable, Maintainable** ✨
