# 📐 System Flow Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                     http://localhost:3000                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │ REST API Calls
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      BACKEND SERVER                             │
│                   http://localhost:5000                         │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────────┐  │
│  │   Routes     │───▶│ Controllers  │───▶│   Services      │  │
│  │ (Endpoints)  │    │ (Logic)      │    │ (DB Access)     │  │
│  └──────────────┘    └──────────────┘    └─────────────────┘  │
│         │                                          │            │
│         │                                          │            │
│  ┌──────▼────────┐                                │            │
│  │  Middleware   │                                │            │
│  │ - Auth        │                                │            │
│  │ - Validation  │                                │            │
│  │ - Error       │                                │            │
│  └───────────────┘                                │            │
└───────────────────────────────────────────────────┼────────────┘
                                                    │
                                                    │ Prisma ORM
                                                    │ SQL Queries
                                                    │
┌───────────────────────────────────────────────────▼────────────┐
│                    POSTGRESQL DATABASE                          │
│                      localhost:5432                             │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │
│  │  Admin   │  │ Product  │  │ Warehouse │  │  Inventory   │  │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────┘  │
│                                                                 │
│  ┌────────────────┐        ┌────────────────┐                  │
│  │ IncomingOrder  │        │ OutgoingOrder  │                  │
│  └────────────────┘        └────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─────────┐                                          ┌─────────┐
│  User   │                                          │ Backend │
└────┬────┘                                          └────┬────┘
     │                                                    │
     │  1. POST /api/auth/login                          │
     │  { email, password }                              │
     ├──────────────────────────────────────────────────▶│
     │                                                    │
     │                           2. Validate credentials │
     │                              (check email/pass)   │
     │                                                    │
     │                        3. Generate JWT token      │
     │                           (expires in 24h)        │
     │                                                    │
     │  4. { token, admin }                              │
     │◀──────────────────────────────────────────────────┤
     │                                                    │
     │  5. Store token in localStorage                   │
     │                                                    │
     │  6. All future requests include:                  │
     │  Authorization: Bearer <token>                    │
     ├──────────────────────────────────────────────────▶│
     │                                                    │
     │                        7. Validate token          │
     │                           (middleware)            │
     │                                                    │
     │  8. Response (if token valid)                     │
     │◀──────────────────────────────────────────────────┤
     │                                                    │
```

---

## Order Processing Flow

### Incoming Order (Adding Stock)

```
User Action: Click "Create Incoming Order"
     │
     ▼
┌─────────────────────────────────────┐
│  1. Select Product                  │
│  2. Select Warehouse                │
│  3. Enter Quantity: 50              │
│  4. Click "Create"                  │
└──────────────┬──────────────────────┘
               │
               ▼
     Frontend Validation
     (quantity > 0?)
               │
               ▼
┌──────────────────────────────────────┐
│  POST /api/orders/in                 │
│  {                                   │
│    productId: "abc",                 │
│    warehouseId: "xyz",               │
│    quantity: 50                      │
│  }                                   │
└──────────────┬───────────────────────┘
               │
               ▼
     Backend Processing
               │
               ├─▶ Validate product exists
               │
               ├─▶ Validate warehouse exists
               │
               ├─▶ Create IncomingOrder record
               │
               ▼
     Update Inventory
               │
               ├─▶ Find existing inventory record
               │   (product + warehouse)
               │
               ├─▶ If exists:
               │      inventory.quantity += 50
               │
               └─▶ If not exists:
                      Create new inventory
                      with quantity = 50
               │
               ▼
┌──────────────────────────────────────┐
│  Response: 201 Created               │
│  { id, productId, quantity, ... }    │
└──────────────┬───────────────────────┘
               │
               ▼
     Frontend Updates
               │
               ├─▶ Show success message
               ├─▶ Refresh orders list
               └─▶ Update inventory display
```

### Outgoing Order (Removing Stock)

```
User Action: Click "Create Outgoing Order"
     │
     ▼
┌─────────────────────────────────────┐
│  1. Select Product                  │
│  2. Select Warehouse                │
│  3. Enter Quantity: 25              │
│  4. Click "Create"                  │
└──────────────┬──────────────────────┘
               │
               ▼
     Frontend Validation
     (quantity > 0?)
               │
               ▼
┌──────────────────────────────────────┐
│  POST /api/orders/out                │
│  {                                   │
│    productId: "abc",                 │
│    warehouseId: "xyz",               │
│    quantity: 25                      │
│  }                                   │
└──────────────┬───────────────────────┘
               │
               ▼
     Backend Processing
               │
               ├─▶ Validate product exists
               │
               ├─▶ Validate warehouse exists
               │
               ├─▶ Find inventory record
               │
               ▼
     Validate Stock Available
               │
               ├─▶ Does inventory exist?
               │   NO ─▶ Error: "No inventory found"
               │
               ├─▶ Is quantity <= available?
               │   NO ─▶ Error: "Insufficient stock"
               │
               ▼
     YES - Process Order
               │
               ├─▶ Create OutgoingOrder record
               │
               ▼
     Update Inventory
               │
               └─▶ inventory.quantity -= 25
               │
               ▼
┌──────────────────────────────────────┐
│  Response: 201 Created               │
│  { id, productId, quantity, ... }    │
└──────────────┬───────────────────────┘
               │
               ▼
     Frontend Updates
               │
               ├─▶ Show success message
               ├─▶ Refresh orders list
               └─▶ Update inventory display
```

---

## Data Relationships

```
┌─────────────┐
│    Admin    │  (Independent - no relations)
└─────────────┘

┌─────────────┐           ┌──────────────┐           ┌─────────────┐
│   Product   │◀─────────▶│  Inventory   │◀─────────▶│  Warehouse  │
└─────────────┘           └──────────────┘           └─────────────┘
      │                                                      │
      │                                                      │
      │ Referenced by                        Referenced by  │
      │                                                      │
      ▼                                                      ▼
┌─────────────┐                                    ┌─────────────┐
│IncomingOrder│                                    │IncomingOrder│
└─────────────┘                                    └─────────────┘

┌─────────────┐                                    ┌─────────────┐
│OutgoingOrder│                                    │OutgoingOrder│
└─────────────┘                                    └─────────────┘
```

**Key Points:**
- **Inventory** is the junction table between Product and Warehouse
- One Product can be in multiple Warehouses (via Inventory)
- One Warehouse can have multiple Products (via Inventory)
- Each Product-Warehouse combination has ONE inventory record
- Orders reference Products and Warehouses but don't have direct relations

---

## Request/Response Cycle

```
┌──────────────────────────────────────────────────────────────────┐
│                        TYPICAL API REQUEST                        │
└──────────────────────────────────────────────────────────────────┘

Frontend                Backend               Database
   │                       │                      │
   │  1. User Action       │                      │
   │  (e.g., click save)   │                      │
   │                       │                      │
   │  2. API Call          │                      │
   ├──────────────────────▶│                      │
   │  POST /api/products   │                      │
   │  Auth: Bearer token   │                      │
   │  Body: {...}          │                      │
   │                       │                      │
   │                       │  3. Auth Middleware  │
   │                       │  (validate token)    │
   │                       │                      │
   │                       │  4. Validation       │
   │                       │  (check input)       │
   │                       │                      │
   │                       │  5. Controller       │
   │                       │  (business logic)    │
   │                       │                      │
   │                       │  6. Prisma Query     │
   │                       ├─────────────────────▶│
   │                       │  INSERT INTO ...     │
   │                       │                      │
   │                       │  7. Result           │
   │                       │◀─────────────────────┤
   │                       │  { id, name, ... }   │
   │                       │                      │
   │  8. JSON Response     │                      │
   │◀──────────────────────┤                      │
   │  201 Created          │                      │
   │  { id, name, ... }    │                      │
   │                       │                      │
   │  9. Update UI         │                      │
   │  (show success)       │                      │
   │                       │                      │
```

---

## Low Stock Alert System

```
┌──────────────────────────────────────────────────────────────┐
│                     LOW STOCK DETECTION                      │
└──────────────────────────────────────────────────────────────┘

Inventory Record:
┌─────────────────────────────────┐
│ Product: Laptop                 │
│ Warehouse: Main                 │
│ Quantity: 8                     │
│ MinimumStock: 10                │
└─────────────────────────────────┘
         │
         │ Check: quantity <= minimumStock?
         │ 8 <= 10? YES
         ▼
┌─────────────────────────────────┐
│ Status: LOW STOCK ⚠️            │
└─────────────────────────────────┘
         │
         ├─▶ Shows in Dashboard count
         │
         ├─▶ Warning icon in Inventory table
         │
         ├─▶ Available in "Show Low Stock" filter
         │
         └─▶ Alert banner on Inventory page

When Order Created:
         │
         ├─▶ Incoming: quantity increases
         │   May move out of low stock
         │
         └─▶ Outgoing: quantity decreases
             May enter low stock
```

---

## Component Hierarchy (Frontend)

```
App.tsx
│
├── Router
│   │
│   ├── /login ──────────▶ Login.tsx
│   │
│   ├── /register ───────▶ Register.tsx
│   │
│   └── PrivateRoute (authenticated only)
│       │
│       └── Layout.tsx
│           │
│           ├── Navigation Bar
│           │
│           └── Outlet (renders child routes)
│               │
│               ├── /dashboard ──────▶ Dashboard.tsx
│               │                      ├─ Stats Cards
│               │                      └─ Welcome Message
│               │
│               ├── /products ────────▶ Products.tsx
│               │                      ├─ Product Form
│               │                      └─ Product Table
│               │
│               ├── /warehouses ──────▶ Warehouses.tsx
│               │                      ├─ Warehouse Form
│               │                      └─ Warehouse Table
│               │
│               ├── /inventory ───────▶ Inventory.tsx
│               │                      ├─ Inventory Form
│               │                      ├─ Filter Buttons
│               │                      └─ Inventory Table
│               │
│               └── /orders ──────────▶ Orders.tsx
│                                      ├─ Order Form
│                                      ├─ Order Type Toggle
│                                      └─ Orders Table
```

---

## API Service Layer (Frontend)

```
services/
│
├── api.ts ──────────────▶ Base Axios instance
│                         ├─ Sets base URL
│                         ├─ Adds token to headers
│                         └─ Handles 401 errors
│
├── authService.ts ──────▶ Authentication
│                         ├─ login()
│                         ├─ register()
│                         ├─ getProfile()
│                         └─ logout()
│
├── productService.ts ───▶ Products CRUD
│                         ├─ getAll()
│                         ├─ getById()
│                         ├─ create()
│                         ├─ update()
│                         └─ delete()
│
├── warehouseService.ts ─▶ Warehouses CRUD
│
├── inventoryService.ts ─▶ Inventory management
│                         ├─ getAll()
│                         ├─ getLowStock()
│                         ├─ getByWarehouse()
│                         └─ getByProduct()
│
└── orderService.ts ─────▶ Order management
                          ├─ getIncomingOrders()
                          ├─ getOutgoingOrders()
                          ├─ createIncomingOrder()
                          └─ createOutgoingOrder()
```

---

## Database Transaction Example

```
BEGIN TRANSACTION

User creates outgoing order for 10 units:

Step 1: Validate
  SELECT * FROM Product WHERE id = 'abc';
  SELECT * FROM Warehouse WHERE id = 'xyz';
  SELECT * FROM Inventory 
    WHERE productId = 'abc' AND warehouseId = 'xyz';

Step 2: Check Stock
  IF inventory.quantity >= 10 THEN
    proceed
  ELSE
    ROLLBACK
    return error
  END IF

Step 3: Create Order
  INSERT INTO OutgoingOrder 
    (id, productId, warehouseId, quantity, notes)
  VALUES (...);

Step 4: Update Inventory
  UPDATE Inventory
  SET quantity = quantity - 10
  WHERE productId = 'abc' AND warehouseId = 'xyz';

COMMIT TRANSACTION

If any step fails:
  ROLLBACK TRANSACTION
  No changes applied
```

---

## State Management (Frontend)

```
No Global State Management Used

Each page manages its own state:

┌─────────────────────────────────────┐
│          Products.tsx               │
├─────────────────────────────────────┤
│ State:                              │
│  - products: Product[]              │
│  - loading: boolean                 │
│  - showForm: boolean                │
│  - editingId: string | null         │
│  - formData: ProductInput           │
│  - message: string                  │
│                                     │
│ Effects:                            │
│  - useEffect(() => loadProducts())  │
│                                     │
│ Functions:                          │
│  - handleSubmit()                   │
│  - handleDelete()                   │
│  - handleEdit()                     │
│  - resetForm()                      │
└─────────────────────────────────────┘

Data Flow:
1. Component mounts
2. useEffect runs
3. API call to fetch data
4. Update local state
5. Render with state data
6. User action triggers function
7. Function updates backend via API
8. Refresh data from API
9. Update local state
10. Re-render
```

---

## Error Handling Flow

```
┌────────────────────────────────────────────────────────────────┐
│                         ERROR FLOW                             │
└────────────────────────────────────────────────────────────────┘

Frontend                Backend               Response
   │                       │                      │
   │  API Request          │                      │
   ├──────────────────────▶│                      │
   │                       │                      │
   │                       │  Validation Error?   │
   │                       │  (400)               │
   │                       ├─────────────────────▶│
   │  OR                   │                      │
   │                       │  Auth Error?         │
   │                       │  (401)               │
   │                       ├─────────────────────▶│
   │  OR                   │                      │
   │                       │  Not Found?          │
   │                       │  (404)               │
   │                       ├─────────────────────▶│
   │  OR                   │                      │
   │                       │  Server Error?       │
   │                       │  (500)               │
   │                       ├─────────────────────▶│
   │                       │                      │
   │  Error Response       │                      │
   │◀──────────────────────┤                      │
   │  { message: "..." }   │                      │
   │                       │                      │
   │  Handle Error:        │                      │
   │  - Show error message │                      │
   │  - Log to console     │                      │
   │  - If 401: logout     │                      │
   │                       │                      │
```

---

These diagrams provide a visual understanding of how the Warehouse Management System works at different levels, from high-level architecture to detailed data flows.
