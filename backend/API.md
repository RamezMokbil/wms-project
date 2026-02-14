# Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Auth Endpoints

### Register Admin
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "admin": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin Name"
  }
}
```

### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "admin": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin Name"
  }
}
```

### Get Profile
```http
GET /auth/profile
```

**Response:**
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "name": "Admin Name",
  "createdAt": "2026-02-06T00:00:00.000Z"
}
```

---

## Product Endpoints

### Get All Products
```http
GET /products
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Laptop",
    "category": "Electronics",
    "sku": "LAP-001",
    "price": 999.99,
    "description": "High-performance laptop",
    "createdAt": "2026-02-06T00:00:00.000Z",
    "updatedAt": "2026-02-06T00:00:00.000Z"
  }
]
```

### Get Product by ID
```http
GET /products/:id
```

### Create Product
```http
POST /products
```

**Body:**
```json
{
  "name": "Laptop",
  "category": "Electronics",
  "sku": "LAP-001",
  "price": 999.99,
  "description": "High-performance laptop"
}
```

### Update Product
```http
PUT /products/:id
```

**Body:** (all fields optional)
```json
{
  "name": "Gaming Laptop",
  "price": 1299.99
}
```

### Delete Product
```http
DELETE /products/:id
```

---

## Warehouse Endpoints

### Get All Warehouses
```http
GET /warehouses
```

### Get Warehouse by ID
```http
GET /warehouses/:id
```

### Create Warehouse
```http
POST /warehouses
```

**Body:**
```json
{
  "name": "Main Warehouse",
  "location": "New York, NY",
  "description": "Primary storage facility"
}
```

### Update Warehouse
```http
PUT /warehouses/:id
```

### Delete Warehouse
```http
DELETE /warehouses/:id
```

---

## Inventory Endpoints

### Get All Inventory
```http
GET /inventory
```

**Response:**
```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "warehouseId": "uuid",
    "quantity": 100,
    "minimumStock": 10,
    "product": { ... },
    "warehouse": { ... },
    "createdAt": "2026-02-06T00:00:00.000Z",
    "updatedAt": "2026-02-06T00:00:00.000Z"
  }
]
```

### Get Low Stock Items
```http
GET /inventory/low-stock
```

### Get Inventory by Warehouse
```http
GET /inventory/warehouse/:warehouseId
```

### Get Inventory by Product
```http
GET /inventory/product/:productId
```

### Create Inventory Record
```http
POST /inventory
```

**Body:**
```json
{
  "productId": "uuid",
  "warehouseId": "uuid",
  "quantity": 100,
  "minimumStock": 10
}
```

### Update Inventory
```http
PUT /inventory/:id
```

**Body:**
```json
{
  "quantity": 150,
  "minimumStock": 20
}
```

### Delete Inventory
```http
DELETE /inventory/:id
```

---

## Order Endpoints

### Get Incoming Orders
```http
GET /orders/incoming
```

**Response:**
```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "warehouseId": "uuid",
    "quantity": 50,
    "notes": "Regular stock replenishment",
    "createdAt": "2026-02-06T00:00:00.000Z",
    "product": { ... },
    "warehouse": { ... }
  }
]
```

### Get Outgoing Orders
```http
GET /orders/outgoing
```

### Create Incoming Order
```http
POST /orders/in
```

**Body:**
```json
{
  "productId": "uuid",
  "warehouseId": "uuid",
  "quantity": 50,
  "notes": "Regular stock replenishment"
}
```

**Effect:** Adds `quantity` to inventory

### Create Outgoing Order
```http
POST /orders/out
```

**Body:**
```json
{
  "productId": "uuid",
  "warehouseId": "uuid",
  "quantity": 25,
  "notes": "Customer order #12345"
}
```

**Effect:** Subtracts `quantity` from inventory (fails if insufficient stock)

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Status Codes

- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
