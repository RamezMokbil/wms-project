import { Response } from 'express';
import { IncomingOrder, OutgoingOrder, Product, Warehouse, Inventory } from '../models';
import { AuthRequest } from '../middleware/auth';
import { createNotificationForAllAdmins } from './notificationController';

export class OrderController {
  async getIncomingOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const orders = await IncomingOrder.find().populate('warehouseId').sort({ createdAt: -1 });

      const ordersWithProduct = await Promise.all(
        orders.map(async (order: any) => {
          const product = await Product.findById(order.productId);
          const orderObj = order.toObject();
          return {
            id: orderObj._id.toString(),
            productId: orderObj.productId,
            warehouseId: orderObj.warehouseId,
            quantity: orderObj.quantity,
            notes: orderObj.notes,
            createdAt: orderObj.createdAt,
            updatedAt: orderObj.updatedAt,
            product,
          };
        })
      );

      res.json(ordersWithProduct);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getOutgoingOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const orders = await OutgoingOrder.find().populate('warehouseId').sort({ createdAt: -1 });

      const ordersWithProduct = await Promise.all(
        orders.map(async (order: any) => {
          const product = await Product.findById(order.productId);
          const orderObj = order.toObject();
          return {
            id: orderObj._id.toString(),
            productId: orderObj.productId,
            warehouseId: orderObj.warehouseId,
            quantity: orderObj.quantity,
            notes: orderObj.notes,
            createdAt: orderObj.createdAt,
            updatedAt: orderObj.updatedAt,
            product,
          };
        })
      );

      res.json(ordersWithProduct);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createIncomingOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { productId, warehouseId, quantity, notes } = req.body;

      const product = await Product.findById(productId);

      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      const warehouse = await Warehouse.findById(warehouseId);

      if (!warehouse) {
        res.status(404).json({ message: 'Warehouse not found' });
        return;
      }

      const parsedQuantity = parseInt(quantity);

      // Create incoming order
      const order = await IncomingOrder.create({
        productId,
        warehouseId,
        quantity: parsedQuantity,
        notes,
      });

      // Update or create inventory
      const existingInventory = await Inventory.findOne({
        productId,
        warehouseId,
      });

      if (existingInventory) {
        await Inventory.updateOne(
          { _id: existingInventory._id },
          {
            quantity: existingInventory.quantity + parsedQuantity,
          }
        );
      } else {
        await Inventory.create({
          productId,
          warehouseId,
          quantity: parsedQuantity,
          minimumStock: 10,
        });
      }

      // Send notification for incoming order
      createNotificationForAllAdmins(
        'order',
        'New Incoming Order',
        `Incoming order: ${parsedQuantity} units of "${product.name}" received at "${warehouse.name}".`
      );

      const orderObj = order.toObject();
      res.status(201).json({
        id: orderObj._id.toString(),
        productId: orderObj.productId,
        warehouseId: orderObj.warehouseId,
        quantity: orderObj.quantity,
        notes: orderObj.notes,
        createdAt: orderObj.createdAt,
        updatedAt: orderObj.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createOutgoingOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { productId, warehouseId, quantity, notes } = req.body;

      const product = await Product.findById(productId);

      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      const warehouse = await Warehouse.findById(warehouseId);

      if (!warehouse) {
        res.status(404).json({ message: 'Warehouse not found' });
        return;
      }

      const parsedQuantity = parseInt(quantity);

      // Check inventory
      const inventory = await Inventory.findOne({
        productId,
        warehouseId,
      });

      if (!inventory) {
        res.status(400).json({ message: 'No inventory found for this product-warehouse combination' });
        return;
      }

      if (inventory.quantity < parsedQuantity) {
        res.status(400).json({
          message: `Insufficient inventory. Available: ${inventory.quantity}, Requested: ${parsedQuantity}`,
        });
        return;
      }

      // Create outgoing order
      const order = await OutgoingOrder.create({
        productId,
        warehouseId,
        quantity: parsedQuantity,
        notes,
      });

      // Update inventory
      const newQuantity = inventory.quantity - parsedQuantity;
      await Inventory.updateOne(
        { _id: inventory._id },
        {
          quantity: newQuantity,
        }
      );

      // Send notification for outgoing order
      createNotificationForAllAdmins(
        'order',
        'New Outgoing Order',
        `Outgoing order: ${parsedQuantity} units of "${product.name}" shipped from "${warehouse.name}".`
      );

      // Check for low stock after outgoing order
      if (newQuantity <= inventory.minimumStock) {
        createNotificationForAllAdmins(
          'stock',
          'Low Stock Alert',
          `⚠️ "${product.name}" in "${warehouse.name}" is running low! Current stock: ${newQuantity}, Minimum: ${inventory.minimumStock}.`
        );
      }

      const orderObj = order.toObject();
      res.status(201).json({
        id: orderObj._id.toString(),
        productId: orderObj.productId,
        warehouseId: orderObj.warehouseId,
        quantity: orderObj.quantity,
        notes: orderObj.notes,
        createdAt: orderObj.createdAt,
        updatedAt: orderObj.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}
