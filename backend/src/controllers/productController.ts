import { Response } from 'express';
import { Product, Inventory } from '../models';
import { AuthRequest } from '../middleware/auth';
import { createNotificationForAllAdmins } from './notificationController';

export class ProductController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      const productsWithId = products.map((product: any) => {
        const productObj = product.toObject();
        return {
          id: productObj._id.toString(),
          name: productObj.name,
          category: productObj.category,
          sku: productObj.sku,
          price: productObj.price,
          unitsPerProduct: productObj.unitsPerProduct || 1,
          description: productObj.description,
          createdAt: productObj.createdAt,
          updatedAt: productObj.updatedAt,
        };
      });
      res.json(productsWithId);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      const inventory = await Inventory.find({ productId: id }).populate('warehouseId');

      const productObj = product.toObject();
      res.json({
        id: productObj._id.toString(),
        name: productObj.name,
        category: productObj.category,
        sku: productObj.sku,
        price: productObj.price,
        unitsPerProduct: productObj.unitsPerProduct || 1,
        description: productObj.description,
        createdAt: productObj.createdAt,
        updatedAt: productObj.updatedAt,
        inventory,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, category, sku, price, unitsPerProduct, description } = req.body;

      // Auto-generate SKU if not provided
      let finalSku = sku;
      if (!finalSku) {
        const prefix = category.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        finalSku = `${prefix}-${timestamp}${random}`;
      }

      const existingProduct = await Product.findOne({ sku: finalSku });

      if (existingProduct) {
        res.status(400).json({ message: 'SKU already exists' });
        return;
      }

      const product = await Product.create({
        name,
        category,
        sku: finalSku,
        price: parseFloat(price),
        unitsPerProduct: parseInt(unitsPerProduct) || 1,
        description,
      });

      const productObj = product.toObject();

      // Send notification to all admins
      createNotificationForAllAdmins(
        'product',
        'New Product Added',
        `A new product "${name}" (${category}) has been added to the system.`
      );

      res.status(201).json({
        id: productObj._id.toString(),
        name: productObj.name,
        category: productObj.category,
        sku: productObj.sku,
        price: productObj.price,
        unitsPerProduct: productObj.unitsPerProduct || 1,
        description: productObj.description,
        createdAt: productObj.createdAt,
        updatedAt: productObj.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, category, sku, price, unitsPerProduct, description } = req.body;

      const existingProduct = await Product.findById(id);

      if (!existingProduct) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      if (sku && sku !== existingProduct.sku) {
        const skuExists = await Product.findOne({ sku });
        if (skuExists) {
          res.status(400).json({ message: 'SKU already exists' });
          return;
        }
      }

      const product = await Product.findByIdAndUpdate(
        id,
        {
          name,
          category,
          sku,
          price: price ? parseFloat(price) : undefined,
          unitsPerProduct: unitsPerProduct ? parseInt(unitsPerProduct) : undefined,
          description,
        },
        { new: true }
      );

      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      const productObj = product.toObject();
      res.json({
        id: productObj._id.toString(),
        name: productObj.name,
        category: productObj.category,
        sku: productObj.sku,
        price: productObj.price,
        unitsPerProduct: productObj.unitsPerProduct || 1,
        description: productObj.description,
        createdAt: productObj.createdAt,
        updatedAt: productObj.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      await Product.findByIdAndDelete(id);

      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}
