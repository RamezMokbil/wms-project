# Database Schema Documentation

## Overview

The WMS database consists of 5 main tables:
- Admin - User authentication
- Product - Product catalog
- Warehouse - Storage locations
- Inventory - Stock tracking
- IncomingOrder & OutgoingOrder - Order history

## Entity Relationship Diagram

```
┌─────────────┐
│    Admin    │
└─────────────┘

┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Product   │────<│  Inventory   │>────│  Warehouse  │
└─────────────┘     └──────────────┘     └─────────────┘
                            │                    │
                            │                    │
                    ┌───────┴────────┐   ┌───────┴────────┐
                    │ IncomingOrder  │   │ OutgoingOrder  │
                    └────────────────┘   └────────────────┘
```

## Tables

### Admin
Stores admin user credentials and information.

| Column    | Type     | Constraints       | Description                    |
|-----------|----------|-------------------|--------------------------------|
| id        | UUID     | PRIMARY KEY       | Unique identifier              |
| email     | String   | UNIQUE, NOT NULL  | Admin email (for login)        |
| password  | String   | NOT NULL          | Hashed password                |
| name      | String   | NOT NULL          | Admin name                     |
| createdAt | DateTime | DEFAULT now()     | Account creation timestamp     |
| updatedAt | DateTime | AUTO UPDATE       | Last update timestamp          |

**Indexes:**
- Primary: `id`
- Unique: `email`

---

### Product
Stores product information in the catalog.

| Column      | Type     | Constraints       | Description                    |
|-------------|----------|-------------------|--------------------------------|
| id          | UUID     | PRIMARY KEY       | Unique identifier              |
| name        | String   | NOT NULL          | Product name                   |
| category    | String   | NOT NULL          | Product category               |
| sku         | String   | UNIQUE, NOT NULL  | Stock Keeping Unit (unique ID) |
| price       | Float    | NOT NULL          | Product price                  |
| description | String   | NULLABLE          | Optional description           |
| createdAt   | DateTime | DEFAULT now()     | Creation timestamp             |
| updatedAt   | DateTime | AUTO UPDATE       | Last update timestamp          |

**Indexes:**
- Primary: `id`
- Unique: `sku`

**Relations:**
- Has many `Inventory` records (one-to-many)

---

### Warehouse
Stores warehouse/storage location information.

| Column      | Type     | Constraints       | Description                    |
|-------------|----------|-------------------|--------------------------------|
| id          | UUID     | PRIMARY KEY       | Unique identifier              |
| name        | String   | NOT NULL          | Warehouse name                 |
| location    | String   | NOT NULL          | Physical location/address      |
| description | String   | NULLABLE          | Optional description           |
| createdAt   | DateTime | DEFAULT now()     | Creation timestamp             |
| updatedAt   | DateTime | AUTO UPDATE       | Last update timestamp          |

**Indexes:**
- Primary: `id`

**Relations:**
- Has many `Inventory` records (one-to-many)
- Has many `IncomingOrder` records (one-to-many)
- Has many `OutgoingOrder` records (one-to-many)

---

### Inventory
Tracks stock quantities for product-warehouse combinations.

| Column       | Type     | Constraints       | Description                    |
|--------------|----------|-------------------|--------------------------------|
| id           | UUID     | PRIMARY KEY       | Unique identifier              |
| productId    | UUID     | FOREIGN KEY       | Reference to Product           |
| warehouseId  | UUID     | FOREIGN KEY       | Reference to Warehouse         |
| quantity     | Integer  | DEFAULT 0         | Current stock quantity         |
| minimumStock | Integer  | DEFAULT 10        | Low stock threshold            |
| createdAt    | DateTime | DEFAULT now()     | Creation timestamp             |
| updatedAt    | DateTime | AUTO UPDATE       | Last update timestamp          |

**Indexes:**
- Primary: `id`
- Composite unique: `(productId, warehouseId)`
- Index: `productId`
- Index: `warehouseId`

**Relations:**
- Belongs to `Product` (many-to-one)
- Belongs to `Warehouse` (many-to-one)

**Constraints:**
- Unique combination of `productId` and `warehouseId`
- Cascade delete when product or warehouse is deleted

---

### IncomingOrder
Records incoming stock orders (adding inventory).

| Column      | Type     | Constraints       | Description                    |
|-------------|----------|-------------------|--------------------------------|
| id          | UUID     | PRIMARY KEY       | Unique identifier              |
| productId   | UUID     | NOT NULL          | Product being added            |
| warehouseId | UUID     | FOREIGN KEY       | Destination warehouse          |
| quantity    | Integer  | NOT NULL          | Quantity added                 |
| notes       | String   | NULLABLE          | Optional notes                 |
| createdAt   | DateTime | DEFAULT now()     | Order creation timestamp       |

**Indexes:**
- Primary: `id`

**Relations:**
- References `Warehouse` (many-to-one)
- References `Product` (not enforced in schema, handled in app)

---

### OutgoingOrder
Records outgoing stock orders (removing inventory).

| Column      | Type     | Constraints       | Description                    |
|-------------|----------|-------------------|--------------------------------|
| id          | UUID     | PRIMARY KEY       | Unique identifier              |
| productId   | UUID     | NOT NULL          | Product being removed          |
| warehouseId | UUID     | FOREIGN KEY       | Source warehouse               |
| quantity    | Integer  | NOT NULL          | Quantity removed               |
| notes       | String   | NULLABLE          | Optional notes                 |
| createdAt   | DateTime | DEFAULT now()     | Order creation timestamp       |

**Indexes:**
- Primary: `id`

**Relations:**
- References `Warehouse` (many-to-one)
- References `Product` (not enforced in schema, handled in app)

---

## Business Logic

### Inventory Management
1. **Product-Warehouse Uniqueness**: Each product can only have ONE inventory record per warehouse
2. **Low Stock Detection**: Items are flagged as "low stock" when `quantity <= minimumStock`
3. **Automatic Updates**: Orders automatically update inventory quantities

### Order Processing

#### Incoming Orders (Stock In)
1. Validate product and warehouse exist
2. Create incoming order record
3. Update or create inventory record
4. Add quantity to existing stock (or create new record with initial quantity)

#### Outgoing Orders (Stock Out)
1. Validate product and warehouse exist
2. Check if inventory record exists
3. Validate sufficient stock available
4. Prevent order if `quantity > available stock`
5. Create outgoing order record
6. Subtract quantity from inventory

### Cascade Deletes
- Deleting a product deletes all related inventory records
- Deleting a warehouse deletes all related inventory records
- Orders are preserved for historical tracking (no cascade delete)

---

## Sample Queries

### Get Low Stock Items
```sql
SELECT * FROM "Inventory" 
WHERE quantity <= "minimumStock"
ORDER BY quantity ASC;
```

### Get Total Inventory by Product
```sql
SELECT 
  p.name, 
  p.sku, 
  SUM(i.quantity) as total_stock
FROM "Product" p
LEFT JOIN "Inventory" i ON p.id = i."productId"
GROUP BY p.id, p.name, p.sku;
```

### Get Warehouse Inventory Value
```sql
SELECT 
  w.name as warehouse,
  SUM(p.price * i.quantity) as total_value
FROM "Warehouse" w
JOIN "Inventory" i ON w.id = i."warehouseId"
JOIN "Product" p ON i."productId" = p.id
GROUP BY w.id, w.name;
```

---

## Migration Commands

### Create Migration
```bash
npx prisma migrate dev --name description_of_changes
```

### Apply Migrations
```bash
npx prisma migrate deploy
```

### Reset Database
```bash
npx prisma migrate reset
```

### Generate Prisma Client
```bash
npx prisma generate
```

---

## Data Integrity Rules

1. ✅ No negative inventory quantities
2. ✅ SKU must be unique across all products
3. ✅ Email must be unique across all admins
4. ✅ Product-Warehouse combinations must be unique
5. ✅ All foreign keys must reference valid records
6. ✅ Passwords must be hashed before storage
7. ✅ Timestamps are automatically managed
