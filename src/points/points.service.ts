import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}

  async redeemPoints(phone: string, pointsToRedeem: number, rewardTitle?: string) {
    const points = Number(pointsToRedeem);

    const user = await (this.prisma.user as any).findUnique({
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if ((user.totalPoints ?? 0) < points) {
      throw new BadRequestException('رصيد النقاط غير كافٍ');
    }

    // خصم النقاط وإنشاء سجل في جدول PointsTransaction
    const [updatedUser, newTransaction] = await this.prisma.$transaction([
      (this.prisma.user as any).update({
        where: { phone },
        data: { totalPoints: { decrement: points } },
      }),
      this.prisma.pointsTransaction.create({
        data: {
          userId: user.id,
          points: -points, // قيمة سالبة تعبر عن الخصم
          type: TransactionType.REDEEMED_REWARD,
          description: `استبدال: ${rewardTitle || 'مكافأة'}`,
        },
      }),
    ]);

    return {
      success: true,
      message: `تم استبدال ${points} نقطة بنجاح`,
      remainingPoints: updatedUser.totalPoints,
      transaction: newTransaction,
    };
  }

  async getUserPoints(phone: string) {
    const user = await (this.prisma.user as any).findUnique({
      where: { phone },
      include: {
        pointsTransactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return {
      phone: user.phone,
      fullName: user.fullName || 'Admin User',
      totalPoints: user.totalPoints ?? 0,
      transactions: user.pointsTransactions,
    };
  }

  // 1. إضافة نقاط عند إتمام لعبة
  async recordGameScore(phone: string, gameCode: string, score: number, pointsEarned: number) {
    const points = Number(pointsEarned) || 0;
    const gameScore = Number(score) || 0;

    const user = await (this.prisma.user as any).findUnique({ where: { phone } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    const [updatedUser, newTx] = await this.prisma.$transaction([
      (this.prisma.user as any).update({
        where: { phone },
        data: { totalPoints: { increment: points } },
      }),
      this.prisma.pointsTransaction.create({
        data: {
          userId: user.id,
          points: points,
          type: TransactionType.EARNED_GAME,
          description: `فوز في لعبة (${gameCode || 'العاب بلبن'}): ${gameScore} نقطة`,
        },
      }),
    ]);

    return {
      success: true,
      message: `رائع! كسبت ${points} نقطة من اللعبة`,
      totalPoints: updatedUser.totalPoints,
      transaction: newTx,
    };
  }

  // 2. عجلة الحظ (مرة واحدة يومياً وبنقاط خفيفة)
  async spinWheelDaily(phone: string, rewardTitle: string, pointsEarned: number) {
    const user = await (this.prisma.user as any).findUnique({ where: { phone } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    // التحقق من تاريخ آخر لفة
    const lastSpin = await this.prisma.spinHistory.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (lastSpin) {
      const hoursSinceLastSpin = (new Date().getTime() - new Date(lastSpin.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSpin < 24) {
        throw new BadRequestException('عفواً، عجلة الحظ متاحة مرة واحدة كل 24 ساعة!');
      }
    }

    // حد أقصى للنقاط المجانية من العجلة (مثلاً 50 نقطة كحد أقصى)
    const safePoints = Math.min(Number(pointsEarned) || 0, 50);

    const [updatedUser, newTx] = await this.prisma.$transaction([
      (this.prisma.user as any).update({
        where: { phone },
        data: { totalPoints: { increment: safePoints } },
      }),
      this.prisma.pointsTransaction.create({
        data: {
          userId: user.id,
          points: safePoints,
          type: TransactionType.EARNED_GAME,
          description: `هدية يومية: عجلة الحظ (${rewardTitle})`,
        },
      }),
      this.prisma.spinHistory.create({
        data: {
          userId: user.id,
          reward: rewardTitle,
        },
      }),
    ]);

    return {
      success: true,
      message: `مبروك! حصلت على ${safePoints} نقطة هدية اليوم`,
      totalPoints: updatedUser.totalPoints,
      transaction: newTx,
    };
  }
}