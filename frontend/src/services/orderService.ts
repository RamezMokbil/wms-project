import api from './api';
import { Product } from './productService';
import { Warehouse } from './warehouseService';

export interface Order {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  notes?: string;
  createdAt: string;
  product?: Product;
  warehouse?: Warehouse;
}

export interface OrderInput {
  productId: string;
  warehouseId: string;
  quantity: number;
  notes?: string;
}

export const orderService = {
  async getIncomingOrders(): Promise<Order[]> {
    const response = await api.get('/orders/incoming');
    return response.data;
  },

  async getOutgoingOrders(): Promise<Order[]> {
    const response = await api.get('/orders/outgoing');
    return response.data;
  },

  async createIncomingOrder(data: OrderInput): Promise<Order> {
    const response = await api.post('/orders/in', data);
    return response.data;
  },

  async createOutgoingOrder(data: OrderInput): Promise<Order> {
    const response = await api.post('/orders/out', data);
    return response.data;
  },
};
