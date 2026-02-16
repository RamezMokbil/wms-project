import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ email });

      if (!admin) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign({ adminId: admin._id }, config.jwtSecret, {
        expiresIn: '24h',
      });

      res.json({
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      const existingAdmin = await Admin.findOne({ email });

      if (existingAdmin) {
        res.status(400).json({ message: 'Email already registered' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await Admin.create({
        email,
        password: hashedPassword,
        name,
      });

      const token = jwt.sign({ adminId: admin._id }, config.jwtSecret, {
        expiresIn: '24h',
      });

      res.status(201).json({
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const admin = await Admin.findById(req.adminId).select('id email name createdAt');

      if (!admin) {
        res.status(404).json({ message: 'Admin not found' });
        return;
      }

      const obj = admin.toObject();
      res.json({
        id: obj._id.toString(),
        email: obj.email,
        name: obj.name,
        createdAt: obj.createdAt,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      const admin = await Admin.findById(req.adminId);
      if (!admin) {
        res.status(404).json({ message: 'Admin not found' });
        return;
      }

      const isValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isValid) {
        res.status(401).json({ message: 'Current password is incorrect' });
        return;
      }

      admin.password = await bcrypt.hash(newPassword, 10);
      await admin.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}
