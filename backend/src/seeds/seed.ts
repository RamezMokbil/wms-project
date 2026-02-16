import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Admin, Product, Warehouse, Inventory, IncomingOrder, OutgoingOrder } from '../models';

dotenv.config();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/wms_db');
    console.log('📊 Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await Admin.findOneAndUpdate(
      { email: 'admin@wms.com' },
      {
        email: 'admin@wms.com',
        password: hashedPassword,
        name: 'System Admin',
      },
      { upsert: true, new: true }
    );
    console.log('✅ Created admin user:', admin.email);

    // Create sample products
    const laptop = await Product.findOneAndUpdate(
      { sku: 'LAP-001' },
      {
        name: 'Dell Laptop',
        category: 'Electronics',
        sku: 'LAP-001',
        price: 999.99,
        description: 'High-performance business laptop',
      },
      { upsert: true, new: true }
    );

    const mouse = await Product.findOneAndUpdate(
      { sku: 'MOU-001' },
      {
        name: 'Wireless Mouse',
        category: 'Electronics',
        sku: 'MOU-001',
        price: 29.99,
        description: 'Ergonomic wireless mouse',
      },
      { upsert: true, new: true }
    );

    const keyboard = await Product.findOneAndUpdate(
      { sku: 'KEY-001' },
      {
        name: 'Mechanical Keyboard',
        category: 'Electronics',
        sku: 'KEY-001',
        price: 149.99,
        description: 'RGB mechanical keyboard',
      },
      { upsert: true, new: true }
    );

    const desk = await Product.findOneAndUpdate(
      { sku: 'FUR-001' },
      {
        name: 'Office Desk',
        category: 'Furniture',
        sku: 'FUR-001',
        price: 299.99,
        description: 'Adjustable height office desk',
      },
      { upsert: true, new: true }
    );

    console.log('✅ Created sample products');

    // Create sample warehouses
    const mainWarehouse = await Warehouse.findOneAndUpdate(
      { name: 'Main Warehouse' },
      {
        name: 'Main Warehouse',
        location: 'New York, NY',
        description: 'Primary storage facility',
      },
      { upsert: true, new: true }
    );

    const secondaryWarehouse = await Warehouse.findOneAndUpdate(
      { name: 'Secondary Warehouse' },
      {
        name: 'Secondary Warehouse',
        location: 'Los Angeles, CA',
        description: 'West coast distribution center',
      },
      { upsert: true, new: true }
    );

    console.log('✅ Created sample warehouses');

    // Create sample inventory
    const inventoryRecords = [
      {
        productId: laptop._id,
        warehouseId: mainWarehouse._id,
        quantity: 50,
        minimumStock: 10,
      },
      {
        productId: mouse._id,
        warehouseId: mainWarehouse._id,
        quantity: 200,
        minimumStock: 50,
      },
      {
        productId: keyboard._id,
        warehouseId: mainWarehouse._id,
        quantity: 100,
        minimumStock: 20,
      },
      {
        productId: desk._id,
        warehouseId: mainWarehouse._id,
        quantity: 8,
        minimumStock: 10,
      },
      {
        productId: laptop._id,
        warehouseId: secondaryWarehouse._id,
        quantity: 30,
        minimumStock: 10,
      },
      {
        productId: mouse._id,
        warehouseId: secondaryWarehouse._id,
        quantity: 150,
        minimumStock: 50,
      },
    ];

    for (const inv of inventoryRecords) {
      await Inventory.findOneAndUpdate(
        {
          productId: inv.productId,
          warehouseId: inv.warehouseId,
        },
        inv,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Created sample inventory records');

    // Create sample orders
    await IncomingOrder.create({
      productId: laptop._id,
      warehouseId: mainWarehouse._id,
      quantity: 20,
      notes: 'Initial stock replenishment',
    });

    await OutgoingOrder.create({
      productId: mouse._id,
      warehouseId: mainWarehouse._id,
      quantity: 50,
      notes: 'Bulk order for customer XYZ',
    });

    console.log('✅ Created sample orders');

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📝 Test credentials:');
    console.log('   Email: admin@wms.com');
    console.log('   Password: admin123');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
