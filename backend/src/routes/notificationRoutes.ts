import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const controller = new NotificationController();

// All routes require authentication
router.use(authMiddleware);

// GET /api/notifications - Get all notifications
router.get('/', (req, res) => controller.getNotifications(req as any, res));

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', (req, res) => controller.getUnreadCount(req as any, res));

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', (req, res) => controller.markAllAsRead(req as any, res));

// PATCH /api/notifications/:id/read - Mark one as read
router.patch('/:id/read', (req, res) => controller.markAsRead(req as any, res));

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', (req, res) => controller.deleteNotification(req as any, res));

export default router;
