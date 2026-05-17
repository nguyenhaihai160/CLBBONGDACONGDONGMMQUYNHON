import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../../middleware/auth.js';
import { prisma } from '../../prisma.js';

export const userRoutes = Router();
userRoutes.use(authenticate, authorize(Role.ADMIN));

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  role: z.nativeEnum(Role),
});

userRoutes.get('/', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { coachClasses: true, createdStudents: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) { next(error); }
});

userRoutes.post('/', async (req, res, next) => {
  try {
    const body = createUserSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: { email: body.email, passwordHash, fullName: body.fullName, phone: body.phone, role: body.role },
      select: { id: true, email: true, fullName: true, phone: true, role: true, status: true },
    });
    res.status(201).json(user);
  } catch (error) { next(error); }
});

userRoutes.patch('/:id/status', async (req, res, next) => {
  try {
    const status = z.enum(['ACTIVE', 'INACTIVE']).parse(req.body.status);
    if (req.params.id === req.user?.id && status === 'INACTIVE') {
      return res.status(400).json({ message: 'Không thể khóa chính tài khoản đang đăng nhập' });
    }
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { status } });
    res.json(user);
  } catch (error) { next(error); }
});

userRoutes.delete('/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user?.id) return res.status(400).json({ message: 'Không thể xóa chính tài khoản đang đăng nhập' });

    const user = await prisma.user.findUnique({ where: { id: req.params.id }, include: { _count: { select: { coachClasses: true } } } });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

    if (user.role === Role.ADMIN) {
      const adminCount = await prisma.user.count({ where: { role: Role.ADMIN, status: 'ACTIVE' } });
      if (adminCount <= 1) return res.status(400).json({ message: 'Không thể xóa Admin hoạt động cuối cùng' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.class.updateMany({ where: { coachId: user.id }, data: { coachId: null } });
      await tx.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'DELETE_USER',
          entity: 'User',
          entityId: user.id,
          metadata: { email: user.email, fullName: user.fullName, role: user.role, detachedClasses: user._count.coachClasses },
        },
      });
      await tx.user.delete({ where: { id: user.id } });
    });

    res.status(204).send();
  } catch (error) { next(error); }
});
