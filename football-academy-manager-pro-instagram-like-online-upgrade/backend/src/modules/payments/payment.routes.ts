import { Router } from 'express';
import { FeeType, PaymentStatus, Role } from '@prisma/client';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.js';
import { prisma } from '../../prisma.js';
import { buildPaymentQrPayload } from '../../utils/code.js';
import { env } from '../../config/env.js';
import { emitRealtime } from '../../socket.js';

export const paymentRoutes = Router();
paymentRoutes.use(authenticate);

const createPaymentSchema = z.object({
  studentId: z.string(),
  amount: z.number().positive(),
  paidAmount: z.number().nonnegative().default(0),
  feeType: z.nativeEnum(FeeType),
  packageSessions: z.number().int().positive().optional(),
  month: z.string().optional(),
});

function isPackagePayment(feeType: FeeType, packageSessions?: number | null) {
  return feeType === FeeType.PACKAGE && !!packageSessions && packageSessions > 0;
}

paymentRoutes.get('/', async (req, res, next) => {
  try {
    const where: any = {};
    if (req.user?.role === Role.COACH) where.student = { class: { coachId: req.user.id } };
    const payments = await prisma.payment.findMany({ where, include: { student: { include: { class: true } } }, orderBy: { createdAt: 'desc' } });
    res.json(payments);
  } catch (error) { next(error); }
});

paymentRoutes.get('/overdue', async (req, res, next) => {
  try {
    const where: any = { tuitionStatus: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL, PaymentStatus.OVERDUE] } };
    if (req.user?.role === Role.COACH) where.class = { coachId: req.user.id };
    const students = await prisma.student.findMany({ where, include: { class: true, paymentHistories: { orderBy: { createdAt: 'desc' }, take: 1 } } });
    res.json(students);
  } catch (error) { next(error); }
});

paymentRoutes.post('/', async (req, res, next) => {
  try {
    const body = createPaymentSchema.parse(req.body);
    const student = await prisma.student.findUnique({ where: { id: body.studentId }, include: { class: true } });
    if (!student) return res.status(404).json({ message: 'Không tìm thấy học viên' });
    if (req.user?.role === Role.COACH && student.class?.coachId !== req.user.id) return res.status(403).json({ message: 'Không đủ quyền' });
    if (body.feeType === FeeType.PACKAGE && !body.packageSessions) return res.status(400).json({ message: 'Gói buổi học cần nhập số buổi' });

    const debtAmount = body.amount - body.paidAmount;
    const status = debtAmount <= 0 ? PaymentStatus.PAID : body.paidAmount > 0 ? PaymentStatus.PARTIAL : PaymentStatus.PENDING;
    const transferContent = `${student.studentCode} ${student.fullName}`.toUpperCase().replace(/\s+/g, ' ').slice(0, 80);
    const qrPayload = buildPaymentQrPayload({
      bankBin: env.bankBin,
      bankAccount: env.bankAccount,
      bankAccountName: env.bankAccountName,
      amount: body.amount,
      content: transferContent,
    });

    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          studentId: body.studentId,
          amount: body.amount,
          paidAmount: body.paidAmount,
          debtAmount,
          feeType: body.feeType,
          packageSessions: body.packageSessions,
          month: body.month,
          status,
          confirmedById: status === PaymentStatus.PAID && req.user?.role === Role.ADMIN ? req.user.id : undefined,
          confirmedAt: status === PaymentStatus.PAID && req.user?.role === Role.ADMIN ? new Date() : undefined,
          sessionsApplied: status === PaymentStatus.PAID && req.user?.role === Role.ADMIN && isPackagePayment(body.feeType, body.packageSessions),
          transferContent,
          qrPayload,
          bankCode: env.bankBin,
        },
      });

      const studentUpdate: any = { tuitionStatus: created.status };
      if (created.sessionsApplied && created.packageSessions) {
        studentUpdate.sessionTotal = { increment: created.packageSessions };
        studentUpdate.sessionRemaining = { increment: created.packageSessions };
      }

      await tx.student.update({ where: { id: body.studentId }, data: studentUpdate });
      return created;
    });

    res.status(201).json(payment);
  } catch (error) { next(error); }
});

paymentRoutes.patch('/:id/confirm', async (req, res, next) => {
  try {
    if (req.user?.role !== Role.ADMIN) return res.status(403).json({ message: 'Chỉ Admin được xác nhận thanh toán' });
    const paidAmount = z.number().positive().optional().parse(req.body.paidAmount);
    const old = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!old) return res.status(404).json({ message: 'Không tìm thấy thanh toán' });

    const finalPaid = paidAmount ?? Number(old.amount);
    const debt = Number(old.amount) - finalPaid;
    const status = debt <= 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
    const shouldApplySessions = status === PaymentStatus.PAID && !old.sessionsApplied && isPackagePayment(old.feeType, old.packageSessions);

    const payment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: req.params.id },
        data: {
          paidAmount: finalPaid,
          debtAmount: debt,
          status,
          confirmedById: req.user?.id,
          confirmedAt: new Date(),
          sessionsApplied: old.sessionsApplied || shouldApplySessions,
        },
      });

      const studentUpdate: any = { tuitionStatus: status };
      if (shouldApplySessions && old.packageSessions) {
        studentUpdate.sessionTotal = { increment: old.packageSessions };
        studentUpdate.sessionRemaining = { increment: old.packageSessions };
      }

      await tx.student.update({ where: { id: updated.studentId }, data: studentUpdate });
      return updated;
    });

    emitRealtime('payment.confirmed', { paymentId: payment.id, studentId: payment.studentId, status });
    res.json(payment);
  } catch (error) { next(error); }
});
