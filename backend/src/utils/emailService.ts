import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.gmailUser,
    pass: config.gmailAppPassword,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!config.gmailUser || !config.gmailAppPassword) {
      console.warn('⚠️ Gmail credentials not configured. Skipping email send.');
      return false;
    }

    await transporter.sendMail({
      from: `"WMS Notifications" <${config.gmailUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`📧 Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

export const sendNotificationEmail = async (
  recipientEmail: string,
  title: string,
  message: string,
  type: string
): Promise<boolean> => {
  const typeColors: Record<string, string> = {
    order: '#3b82f6',
    stock: '#ef4444',
    product: '#8b5cf6',
    warehouse: '#10b981',
    system: '#f59e0b',
  };

  const typeIcons: Record<string, string> = {
    order: '🚚',
    stock: '⚠️',
    product: '📦',
    warehouse: '🏭',
    system: '🔔',
  };

  const color = typeColors[type] || '#6b7280';
  const icon = typeIcons[type] || '🔔';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, ${color}, ${color}dd); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${icon} WMS Notification</h1>
      </div>
      <div style="padding: 32px 24px;">
        <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin: 0 0 12px 0; font-size: 18px;">${title}</h2>
          <p style="color: #64748b; margin: 0; font-size: 15px; line-height: 1.6;">${message}</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          This is an automated notification from your Warehouse Management System.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `[WMS] ${title}`,
    html,
  });
};
