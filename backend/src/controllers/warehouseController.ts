import { Response } from 'express';
import { Warehouse, Inventory } from '../models';
import { AuthRequest } from '../middleware/auth';

export class WarehouseController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const warehouses = await Warehouse.find().sort({ createdAt: -1 });
      const warehousesWithCounts = await Promise.all(
        warehouses.map(async (warehouse: any) => {
          const inventoryCount = await Inventory.countDocuments({ warehouseId: warehouse._id });
          const inventoryItems = await Inventory.find({ warehouseId: warehouse._id })
            .populate('productId')
            .lean();
          
          const warehouseObj = warehouse.toObject();
          return {
            id: warehouseObj._id.toString(),
            name: warehouseObj.name,
            location: warehouseObj.location,
            description: warehouseObj.description,
            createdAt: warehouseObj.createdAt,
            updatedAt: warehouseObj.updatedAt,
            _count: { inventory: inventoryCount },
            products: inventoryItems.map((item: any) => ({
              id: item.productId?._id?.toString(),
              productId: item.productId?._id?.toString(),
              inventoryId: item._id?.toString(),
              name: item.productId?.name,
              category: item.productId?.category,
              sku: item.productId?.sku,
              price: item.productId?.price,
              unitsPerProduct: item.productId?.unitsPerProduct || 1,
              quantity: item.quantity,
            })),
          };
        })
      );
      res.json(warehousesWithCounts);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const warehouse = await Warehouse.findById(id);

      if (!warehouse) {
        res.status(404).json({ message: 'Warehouse not found' });
        return;
      }

      const inventory = await Inventory.find({ warehouseId: id }).populate('productId');
      const incomingOrderCount = 0; // Get from IncomingOrder model if needed
      const outgoingOrderCount = 0; // Get from OutgoingOrder model if needed

      const warehouseObj = warehouse.toObject();
      res.json({
        id: warehouseObj._id.toString(),
        name: warehouseObj.name,
        location: warehouseObj.location,
        description: warehouseObj.description,
        createdAt: warehouseObj.createdAt,
        updatedAt: warehouseObj.updatedAt,
        inventory,
        _count: {
          incomingOrders: incomingOrderCount,
          outgoingOrders: outgoingOrderCount,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, location, description } = req.body;

      const warehouse = await Warehouse.create({
        name,
        location,
        description,
      });

      const warehouseObj = warehouse.toObject();
      res.status(201).json({
        id: warehouseObj._id.toString(),
        name: warehouseObj.name,
        location: warehouseObj.location,
        description: warehouseObj.description,
        createdAt: warehouseObj.createdAt,
        updatedAt: warehouseObj.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, location, description } = req.body;

      const warehouse = await Warehouse.findByIdAndUpdate(
        id,
        {
          name,
          location,
          description,
        },
        { new: true }
      );

      if (!warehouse) {
        res.status(404).json({ message: 'Warehouse not found' });
        return;
      }

      const warehouseObj = warehouse.toObject();
      res.json({
        id: warehouseObj._id.toString(),
        name: warehouseObj.name,
        location: warehouseObj.location,
        description: warehouseObj.description,
        createdAt: warehouseObj.createdAt,
        updatedAt: warehouseObj.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const warehouse = await Warehouse.findById(id);

      if (!warehouse) {
        res.status(404).json({ message: 'Warehouse not found' });
        return;
      }

      const inventoryCount = await Inventory.countDocuments({ warehouseId: id });

      if (inventoryCount > 0) {
        res.status(400).json({
          message: 'Cannot delete warehouse with existing inventory records',
        });
        return;
      }

      await Warehouse.findByIdAndDelete(id);

      res.json({ message: 'Warehouse deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}
