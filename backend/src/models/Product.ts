import { Schema, model, Document } from 'mongoose';

interface IProduct extends Document {
  name: string;
  category: string;
  sku: string;
  price: number;
  unitsPerProduct: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    unitsPerProduct: {
      type: Number,
      required: true,
      default: 1,
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

export const Product = model<IProduct>('Product', productSchema);
export type { IProduct };
