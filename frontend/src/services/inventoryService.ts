import api from './api';
import { Product } from './productService';
import { Warehouse } from './warehouseService';

export interface Inventory {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  minimumStock: number;
  product?: Product;
  warehouse?: Warehouse;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryInput {
  productId: string;
  warehouseId: string;
  quantity?: number;
  minimumStock?: number;
}

export const inventoryService = {
  async getAll(): Promise<Inventory[]> {
    const response = await api.get('/inventory');
    return response.data;
  },

  async getLowStock(): Promise<Inventory[]> {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },

  async getByWarehouse(warehouseId: string): Promise<Inventory[]> {
    const response = await api.get(`/inventory/warehouse/${warehouseId}`);
    return response.data;
  },

  async getByProduct(productId: string): Promise<Inventory[]> {
    const response = await api.get(`/inventory/product/${productId}`);
    return response.data;
  },

  async create(data: InventoryInput): Promise<Inventory> {
    const response = await api.post('/inventory', data);
    return response.data;
  },

  async update(id: string, data: Partial<InventoryInput>): Promise<Inventory> {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/inventory/${id}`);
  },
};
