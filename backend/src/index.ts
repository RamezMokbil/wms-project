import express, { Application } from 'express';
import cors from 'cors';
import passport from 'passport';
import { config } from './config/env';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import warehouseRoutes from './routes/warehouseRoutes';
import orderRoutes from './routes/orderRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Connect to MongoDB
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'WMS API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📦 Environment: ${config.nodeEnv}`);
});

export default app;
