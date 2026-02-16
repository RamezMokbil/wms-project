import { Schema, model, Document, Types } from 'mongoose';

interface IInventory extends Document {
  productId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  quantity: number;
  minimumStock: number;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    minimumStock: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Create unique compound index
inventorySchema.index({ productId: 1, warehouseId: 1 }, { unique: true });
inventorySchema.index({ productId: 1 });
inventorySchema.index({ warehouseId: 1 });

export const Inventory = model<IInventory>('Inventory', inventorySchema);
export type { IInventory };
