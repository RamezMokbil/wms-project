import { Schema, model, Document, Types } from 'mongoose';

interface IOutgoingOrder extends Document {
  productId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  quantity: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const outgoingOrderSchema = new Schema<IOutgoingOrder>(
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

export const OutgoingOrder = model<IOutgoingOrder>('OutgoingOrder', outgoingOrderSchema);
export type { IOutgoingOrder };
