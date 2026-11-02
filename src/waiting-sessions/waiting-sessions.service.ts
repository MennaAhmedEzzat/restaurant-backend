import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaitingSessionsService {
  constructor(private prisma: PrismaService) {}

  async startSession(userId: string, orderId: string) {
    if (!orderId) {
      throw new BadRequestException('orderId must be provided');
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // التحقق من وجود جلسة سابقة مرتبطة بالطلب
    const existingSession = await this.prisma.waitingSession.findFirst({
      where: { orderId },
    });
    if (existingSession) {
      return existingSession;
    }

    // تحديث الطلب لربطه بالمستخدم في حال لم يكن مرتبطاً
    if (!order.userId) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { userId },
      });
    }

    // إنشاء جلسة الانتظار
    return this.prisma.waitingSession.create({
      data: {
        userId,
        branchId: order.branchId,
        orderId: order.id,
        status: 'ACTIVE',
      },
    });
  }

  async submitGameScore(userId: string, sessionId: string, score: number) {
    const session = await this.prisma.waitingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== 'ACTIVE') {
      throw new BadRequestException('Session is not active or found');
    }

    // التأكد من وجود لعبة افتراضية أو إنشائها
    let game = await this.prisma.game.findFirst();
    if (!game) {
      game = await this.prisma.game.create({
        data: {
          code: 'SPIN_OR_PUZZLE',
          title: 'Waiting Challenge',
          description: 'Mini game while waiting for order',
        },
      });
    }

    const earnedPoints = Math.floor(score / 10);

    // تسجيل محاولة اللعب
    const attempt = await this.prisma.gameAttempt.create({
      data: {
        sessionId,
        userId,
        gameId: game.id,
        score,
        earnedPoints,
        isVerified: true,
      },
    });

    // تحديث رصيد نقاط العميل
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: earnedPoints },
      },
    });

    // تسجيل المعاملة في السجل
    await this.prisma.pointsTransaction.create({
      data: {
        userId,
        points: earnedPoints,
        type: 'EARNED_GAME',
        description: `Earned ${earnedPoints} points from game`,
      },
    });

    return {
      message: 'Score submitted successfully',
      earnedPoints,
      attempt,
    };
  }
}