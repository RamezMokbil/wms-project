import { Response } from 'express';
import { Inventory, Product, Warehouse } from '../models';
import { AuthRequest } from '../middleware/auth';

export class InventoryController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const inventory = await Inventory.find()
        .populate('productId')
        .populate('warehouseId')
        .sort({ updatedAt: -1 });
      
      const inventoryWithId = inventory.map((item: any) => {
        const itemObj = item.toObject();
        return {
          id: itemObj._id.toString(),
          productId: itemObj.productId,
          warehouseId: itemObj.warehouseId,
          quantity: itemObj.quantity,
          minimumStock: itemObj.minimumStock,
          createdAt: itemObj.createdAt,
          updatedAt: itemObj.updatedAt,
        };
      });
      res.json(inventoryWithId);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getLowStock(req: AuthRequest, res: Response): Promise<void> {
    try {
      const lowStock = await Inventory.find({ $expr: { $lte: ['$quantity', '$minimumStock'] } })
        .populate('productId')
        .populate('warehouseId')
        .sort({ quantity: 1 });

      const result = lowStock.map((item: any) => ({
        ...item.toObject(),
        productName: item.productId?.name,
        warehouseName: item.warehouseId?.name,
      }));

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getByWarehouse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { warehouseId } = req.params;
      const inventory = await Inventory.find({ warehouseId })
        .populate('productId')
        .populate('warehouseId');
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getByProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const inventory = await Inventory.find({ productId })
        .populate('productId')
        .populate('warehouseId');
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { productId, warehouseId, quantity, minimumStock } = req.body;

      const existingInventory = await Inventory.findOne({
        productId,
        warehouseId,
      });

      if (existingInventory) {
        res.status(400).json({
          message: 'Inventory record already exists for this product-warehouse combination',
        });
        return;
      }

      const inventory = await Inventory.create({
        productId,
        warehouseId,
        quantity: parseInt(quantity) || 0,
        minimumStock: parseInt(minimumStock) || 10,
      });

      const populatedInventory = await Inventory.findById(inventory._id)
        .populate('productId')
        .populate('warehouseId');

      if (populatedInventory) {
        const invObj = populatedInventory.toObject();
        res.status(201).json({
          id: invObj._id.toString(),
          productId: invObj.productId,
          warehouseId: invObj.warehouseId,
          quantity: invObj.quantity,
          minimumStock: invObj.minimumStock,
          createdAt: invObj.createdAt,
          updatedAt: invObj.updatedAt,
        });
      } else {
        res.status(201).json(inventory);
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity, minimumStock } = req.body;

      const inventory = await Inventory.findByIdAndUpdate(
        id,
        {
          quantity: quantity !== undefined ? parseInt(quantity) : undefined,
          minimumStock: minimumStock !== undefined ? parseInt(minimumStock) : undefined,
        },
        { new: true }
      )
        .populate('productId')
        .populate('warehouseId');

      if (!inventory) {
        res.status(404).json({ message: 'Inventory not found' });
        return;
      }

      const invObj = inventory.toObject();
      res.json({
        id: invObj._id.toString(),
        productId: invObj.productId,
        warehouseId: invObj.warehouseId,
        quantity: invObj.quantity,
        minimumStock: invObj.minimumStock,
        createdAt: invObj.createdAt,
        updatedAt: invObj.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await Inventory.findByIdAndDelete(id);

      res.json({ message: 'Inventory record deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}
