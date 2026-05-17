import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../prisma.js';
import { env } from '../../config/env.js';
import { authenticate } from '../../middleware/auth.js';

export const authRoutes = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

function demoToolsEnabled() {
  return process.env.ENABLE_DEMO_TOOLS === 'true' || process.env.NODE_ENV !== 'production';
}

async function ensureDemoAccount(email: string, options: { resetPassword?: boolean } = {}) {
  const demoMap: Record<string, { password: string; fullName: string; role: Role; phone: string }> = {
    'admin@demo.com': { password: 'Admin@123', fullName: 'Admin Demo', role: Role.ADMIN, phone: '0900000000' },
    'coach@demo.com': { password: 'Coach@123', fullName: 'HLV Demo', role: Role.COACH, phone: '0911111111' },
  };

  const demo = demoMap[email];
  if (!demo) return null;

  const passwordHash = await bcrypt.hash(demo.password, 10);
  const updateData = options.resetPassword
    ? { passwordHash, fullName: demo.fullName, role: demo.role, status: 'ACTIVE' as const, phone: demo.phone }
    : { fullName: demo.fullName, role: demo.role, status: 'ACTIVE' as const, phone: demo.phone };

  return prisma.user.upsert({
    where: { email },
    update: updateData,
    create: { email, passwordHash, fullName: demo.fullName, role: demo.role, status: 'ACTIVE', phone: demo.phone },
  });
}

authRoutes.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const email = body.email.trim().toLowerCase();

    let user = await prisma.user.findUnique({ where: { email } });

    // Chống lỗi seed chưa tạo tài khoản demo: tạo lại demo account ngay khi đăng nhập.
    if (!user && demoToolsEnabled() && (email === 'admin@demo.com' || email === 'coach@demo.com')) {
      user = await ensureDemoAccount(email);
    }

    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    if (user.status !== 'ACTIVE') return res.status(403).json({ message: 'Tài khoản đang bị khóa' });

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: '7d' });
    return res.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

authRoutes.get('/debug', async (_req, res, next) => {
  try {
    if (!demoToolsEnabled()) return res.status(404).json({ message: 'Debug endpoint đang tắt trong production' });
    const userCount = await prisma.user.count();
    const admin = await prisma.user.findUnique({ where: { email: 'admin@demo.com' }, select: { id: true, email: true, role: true, status: true } });
    res.json({
      ok: true,
      api: 'online',
      database: 'connected',
      mode: 'single-port',
      port: process.env.PORT || '5173',
      userCount,
      adminExists: !!admin,
      admin,
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/reset-demo', async (_req, res, next) => {
  try {
    if (!demoToolsEnabled()) return res.status(403).json({ message: 'Tính năng reset demo đang tắt trong production' });
    const admin = await ensureDemoAccount('admin@demo.com', { resetPassword: true });
    const coach = await ensureDemoAccount('coach@demo.com', { resetPassword: true });
    res.json({
      ok: true,
      message: 'Đã tạo/cập nhật lại tài khoản demo',
      admin: { email: admin?.email, role: admin?.role, status: admin?.status },
      coach: { email: coach?.email, role: coach?.role, status: coach?.status },
    });
  } catch (error) {
    next(error);
  }
});
