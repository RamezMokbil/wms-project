import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  type: 'order' | 'stock' | 'product' | 'warehouse' | 'system';
  title: string;
  message: string;
  read: boolean;
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    type: {
      type: String,
      enum: ['order', 'stock', 'product', 'warehouse', 'system'],
      default: 'system',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
