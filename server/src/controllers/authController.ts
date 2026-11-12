import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, saveDb } from '../db/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aashmi_beauty_parlour_jwt_super_secret_key_2026_secure';

export function login(req: Request, res: Response): void {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const db = getDb();
    const admin = db.admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());

    if (!admin) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        full_name: admin.full_name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        full_name: admin.full_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function getCurrentUser(req: AuthenticatedRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const db = getDb();
  const admin = db.admins.find((a) => a.id === req.user!.id);

  if (!admin) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      full_name: admin.full_name,
      created_at: admin.created_at,
    },
  });
}

export function changePassword(req: AuthenticatedRequest, res: Response): void {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
      return;
    }

    const db = getDb();
    const adminIndex = db.admins.findIndex((a) => a.id === req.user!.id);

    if (adminIndex === -1) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const admin = db.admins[adminIndex];
    if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    db.admins[adminIndex].password_hash = bcrypt.hashSync(newPassword, salt);
    saveDb(db);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
