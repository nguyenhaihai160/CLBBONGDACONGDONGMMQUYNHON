import { Router } from 'express';
import { Role, StudentStatus } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../../middleware/auth.js';
import { prisma } from '../../prisma.js';
import { buildStudentCode } from '../../utils/code.js';

export const studentRoutes = Router();
studentRoutes.use(authenticate, authorize(Role.ADMIN, Role.COACH));

const studentSchema = z.object({
  fullName: z.string().min(2),
  dateOfBirth: z.string().optional().nullable(),
  parentPhone: z.string().min(8),
  address: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  classId: z.string().optional().nullable(),
  sessionTotal: z.number().int().nonnegative().default(0),
});

async function assertCoachOwnsClass(userId: string, classId?: string | null) {
  if (!classId) return;
  const klass = await prisma.class.findFirst({ where: { id: classId, coachId: userId } });
  if (!klass) throw Object.assign(new Error('HLV chỉ được thao tác trong lớp của mình'), { statusCode: 403 });
}

async function assertCoachCanAccessStudent(userId: string, studentId: string) {
  const student = await prisma.student.findFirst({ where: { id: studentId, class: { coachId: userId } } });
  if (!student) throw Object.assign(new Error('HLV chỉ được thao tác học viên trong lớp của mình'), { statusCode: 403 });
}

studentRoutes.get('/', async (req, res, next) => {
  try {
    const classId = typeof req.query.classId === 'string' ? req.query.classId : undefined;
    const where: any = {};
    if (classId) where.classId = classId;
    if (req.user?.role === Role.COACH) where.class = { coachId: req.user.id };

    const students = await prisma.student.findMany({
      where,
      include: { class: { select: { id: true, name: true, ageGroup: true, coachId: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(students);
  } catch (error) { next(error); }
});

studentRoutes.get('/:id', async (req, res, next) => {
  try {
    if (req.user?.role === Role.COACH) await assertCoachCanAccessStudent(req.user.id, req.params.id);
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        class: true,
        attendanceHistories: { orderBy: { date: 'desc' }, take: 20 },
        paymentHistories: { orderBy: { createdAt: 'desc' }, take: 20 },
        uniformOrders: { orderBy: { createdAt: 'desc' }, take: 20, include: { items: { include: { product: true } } } },
        notes: { orderBy: { createdAt: 'desc' }, take: 20, include: { createdBy: { select: { fullName: true } } } },
      },
    });
    if (!student) return res.status(404).json({ message: 'Không tìm thấy học viên' });
    res.json(student);
  } catch (error) { next(error); }
});

studentRoutes.post('/', async (req, res, next) => {
  try {
    const body = studentSchema.parse(req.body);
    if (req.user?.role === Role.COACH) await assertCoachOwnsClass(req.user.id, body.classId);

    const count = await prisma.student.count();
    const studentCode = buildStudentCode(count);
    const created = await prisma.student.create({
      data: {
        studentCode,
        fullName: body.fullName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        parentPhone: body.parentPhone,
        address: body.address,
        avatarUrl: body.avatarUrl,
        classId: body.classId,
        sessionTotal: body.sessionTotal,
        sessionRemaining: body.sessionTotal,
        createdById: req.user?.id,
      },
      include: { class: true },
    });
    res.status(201).json(created);
  } catch (error) { next(error); }
});

studentRoutes.put('/:id', async (req, res, next) => {
  try {
    const body = studentSchema.partial().extend({ status: z.nativeEnum(StudentStatus).optional() }).parse(req.body);
    if (req.user?.role === Role.COACH) {
      await assertCoachCanAccessStudent(req.user.id, req.params.id);
      if (body.classId) await assertCoachOwnsClass(req.user.id, body.classId);
    }

    const current = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ message: 'Không tìm thấy học viên' });

    const nextTotal = body.sessionTotal ?? current.sessionTotal;
    const nextRemaining = Math.max(0, nextTotal - current.sessionUsed);

    const updated = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        ...body,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : body.dateOfBirth === null ? null : undefined,
        sessionRemaining: body.sessionTotal !== undefined ? nextRemaining : undefined,
      },
      include: { class: true },
    });
    res.json(updated);
  } catch (error) { next(error); }
});

studentRoutes.delete('/:id', async (req, res, next) => {
  try {
    if (req.user?.role !== Role.ADMIN) return res.status(403).json({ message: 'Chỉ Admin được xóa học viên' });
    await prisma.student.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) { next(error); }
});
