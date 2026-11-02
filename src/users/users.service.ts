import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByPhone(phone: string) {
    return (this.prisma.user as any).findUnique({ where: { phone } });
  }

  async createUser(data: { phone: string; passwordHash: string; fullName: string }) {
    return (this.prisma.user as any).create({ data });
  }

  async findById(id: string) {
    return (this.prisma.user as any).findUnique({ where: { id } });
  }

  // جلب معلومات الملف الشخصي مع رصيد النقاط
  async getProfile(userId: string) {
    const user = await (this.prisma.user as any).findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        totalPoints: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // جلب سجل حركة النقاط الخاص بالمستخدم (مرتبة من الأحدث للأقدم)
  async getPointsHistory(userId: string) {
    return this.prisma.pointsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // جلب الجوائز التي استبدلها المستخدم سابقاً
  async getMyRedemptions(userId: string) {
    return this.prisma.rewardRedemption.findMany({
      where: { userId },
      include: {
        reward: true,
      },
      orderBy: { redeemedAt: 'desc' },
    });
  }

  // ==========================================
  //  الدوال الجديدة المطلوبة للـ Dashboard
  // ==========================================

  // 1. جلب النقاط وأحدث العمليات معاً للـ Dashboard
  async getDashboardData(userId: string) {
    const user = await (this.prisma.user as any).findUnique({
      where: { id: userId },
      select: {
        totalPoints: true,
        pointsTransactions: {
          orderBy: { createdAt: 'desc' }, // جلب الأحدث أولاً
          take: 20,                       // أحدث 20 عملية فقط
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      points: user.totalPoints,
      transactions: user.pointsTransactions,
    };
  }

  // 2. إضافة نقاط جديدة عند الفوز في لعبة وتسجيل العملية
  async addPoints(userId: string, pointsToAdd: number, description: string) {
    if (pointsToAdd <= 0) {
      throw new BadRequestException('Points to add must be greater than zero');
    }

    return this.prisma.$transaction([
      // أ) تحديث النقاط الإجمالية
      (this.prisma.user as any).update({
        where: { id: userId },
        data: {
          totalPoints: { increment: pointsToAdd },
        },
      }),
      // ب) إدخال سجل العملية
      this.prisma.pointsTransaction.create({
        data: {
          userId,
          points: pointsToAdd,
          type: TransactionType.EARNED_GAME,
          description,
        },
      }),
    ]);
  }

  // 3. خصم النقاط واستبدال جائزة داخل Transaction
  async redeemReward(userId: string, rewardId: string, cost: number, description: string) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.totalPoints < cost) {
      throw new BadRequestException('Insufficient points balance');
    }

    return this.prisma.$transaction([
      // أ) خصم النقاط من المستخدم
      (this.prisma.user as any).update({
        where: { id: userId },
        data: {
          totalPoints: { decrement: cost },
        },
      }),
      // ب) تسجيل عملية النقاط بالسالب
      this.prisma.pointsTransaction.create({
        data: {
          userId,
          points: -cost,
          type: TransactionType.REDEEMED_REWARD,
          description,
        },
      }),
      // ج) تسجيل عملية استبدال الجائزة في جدول reward_redemptions
      this.prisma.rewardRedemption.create({
        data: {
          userId,
          rewardId,
        },
      }),
    ]);
  }
}