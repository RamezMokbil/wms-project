import { Response } from 'express';
import { Notification, Admin } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendNotificationEmail } from '../utils/emailService';

export class NotificationController {
  // Get all notifications for the logged-in user
  async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const notifications = await Notification.find({ recipientId: req.adminId })
        .sort({ createdAt: -1 })
        .limit(50);

      const mapped = notifications.map((n: any) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        emailSent: n.emailSent,
        createdAt: n.createdAt,
      }));

      res.json(mapped);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get unread count
  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const count = await Notification.countDocuments({
        recipientId: req.adminId,
        read: false,
      });

      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Mark one notification as read
  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await Notification.updateOne(
        { _id: id, recipientId: req.adminId },
        { read: true }
      );

      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      await Notification.updateMany(
        { recipientId: req.adminId, read: false },
        { read: true }
      );

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Delete a notification
  async deleteNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await Notification.deleteOne({ _id: id, recipientId: req.adminId });

      res.json({ message: 'Notification deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}

/**
 * Helper function to create notifications for all admins and send emails.
 * Call this from other controllers to trigger notifications.
 */
export async function createNotificationForAllAdmins(
  type: 'order' | 'stock' | 'product' | 'warehouse' | 'system',
  title: string,
  message: string
): Promise<void> {
  try {
    const admins = await Admin.find({});

    for (const admin of admins) {
      // Create in-app notification
      const notification = await Notification.create({
        recipientId: admin._id,
        type,
        title,
        message,
      });

      // Send email notification
      const emailSent = await sendNotificationEmail(
        admin.email,
        title,
        message,
        type
      );

      // Update emailSent status
      if (emailSent) {
        await Notification.updateOne(
          { _id: notification._id },
          { emailSent: true }
        );
      }
    }
  } catch (error) {
    console.error('❌ Failed to create notifications:', error);
  }
}
