import api from './api';

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  unitsPerProduct: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  category: string;
  sku?: string;
  price: number;
  unitsPerProduct: number;
  description?: string;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get('/products');
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(data: ProductInput): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  },

  async update(id: string, data: Partial<ProductInput>): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
