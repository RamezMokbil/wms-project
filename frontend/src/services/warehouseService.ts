import api from './api';

export interface WarehouseProduct {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  products?: WarehouseProduct[];
}

export interface WarehouseInput {
  name: string;
  location: string;
  description?: string;
}

export const warehouseService = {
  async getAll(): Promise<Warehouse[]> {
    const response = await api.get('/warehouses');
    return response.data;
  },

  async getById(id: string): Promise<Warehouse> {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },

  async create(data: WarehouseInput): Promise<Warehouse> {
    const response = await api.post('/warehouses', data);
    return response.data;
  },

  async update(id: string, data: Partial<WarehouseInput>): Promise<Warehouse> {
    const response = await api.put(`/warehouses/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/warehouses/${id}`);
  },
};
