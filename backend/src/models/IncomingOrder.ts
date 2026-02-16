import { Schema, model, Document, Types } from 'mongoose';

interface IIncomingOrder extends Document {
  productId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  quantity: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const incomingOrderSchema = new Schema<IIncomingOrder>(
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
      required: true,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const IncomingOrder = model<IIncomingOrder>('IncomingOrder', incomingOrderSchema);
export type { IIncomingOrder };
