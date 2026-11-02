import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  // جلب قائمة الجوائز المتاحة
  async findAll() {
    return this.prisma.reward.findMany({
      where: { isActive: true },
    });
  }

  // إنشاء جائزة جديدة (للإدارة) مع توليد كود خصم تلقائي وعشوائي إذا لزم الأمر
  async create(data: { title: string; description?: string; pointsRequired: number; discountCode?: string; imageUrl?: string }) {
    // توليد كود خصم عشوائي واحترافي إذا تركه الأدمن فارغاً
    const generatedCode = data.discountCode && data.discountCode.trim() !== '' 
      ? data.discountCode 
      : `BLABAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return this.prisma.reward.create({
      data: {
        title: data.title,
        description: data.description,
        pointsRequired: Number(data.pointsRequired),
        discountCode: generatedCode,
        imageUrl: data.imageUrl, // 🌟 حفظ الصورة في قاعدة البيانات
      },
    });
  }

  // 🌟 دالة حذف الجائزة نهائياً من قاعدة البيانات (مع تفادي قيود الارتباط)
  async remove(id: string) {
    // 1. مسح أي عمليات استبدال مرتبطة بهذه الجائزة أولاً لمنع حدوث خطأ القيود
    await this.prisma.rewardRedemption.deleteMany({
      where: { rewardId: id },
    }).catch(() => null);

    // 2. حذف الجائزة نهائياً من قاعدة البيانات
    return this.prisma.reward.delete({
      where: { id },
    });
  }

  // استبدال النقاط بجائزة
  async redeem(userId: string, rewardId: string) {
    const reward = await this.prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward || !reward.isActive) {
      throw new NotFoundException('Reward not found or inactive');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const requiredPoints = reward.pointsRequired || 0;
    if (user.totalPoints < requiredPoints) {
      throw new BadRequestException('Insufficient points balance');
    }

    // خصم النقاط وتسجيل عملية الاستبدال
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { totalPoints: { decrement: requiredPoints } },
      }),
      this.prisma.rewardRedemption.create({
        data: {
          userId,
          rewardId,
        },
      }),
      this.prisma.pointsTransaction.create({
        data: {
          userId,
          points: -requiredPoints,
          type: 'REDEEMED_REWARD',
          description: `Redeemed reward: ${reward.title}`,
        },
      }),
    ]);

    return {
      message: 'Reward redeemed successfully',
      reward: reward.title,
      discountCode: reward.discountCode || 'BLABAN-LOYALTY-OFFER',
    };
  }
}