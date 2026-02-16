import { Schema, model, Document } from 'mongoose';

interface IWarehouse extends Document {
  name: string;
  location: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const warehouseSchema = new Schema<IWarehouse>(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Warehouse = model<IWarehouse>('Warehouse', warehouseSchema);
export type { IWarehouse };
