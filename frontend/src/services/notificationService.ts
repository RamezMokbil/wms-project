import api from './api';

export interface Notification {
  id: string;
  type: 'order' | 'stock' | 'product' | 'warehouse' | 'system';
  title: string;
  message: string;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const response = await api.get('/notifications');
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
