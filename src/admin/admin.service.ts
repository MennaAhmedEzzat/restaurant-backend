import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // 1. جلب إحصائيات النظام الحقيقية
  async getAnalytics() {
    const totalUsers = await this.prisma.user.count();
    
    const users = await (this.prisma.user as any).findMany({
      select: { totalPoints: true },
    });

    const totalPointsGranted = users.reduce((acc: number, user: any) => acc + (user.totalPoints || 0), 0);

    // حساب عدد الكوبونات المستبدلة من جدول rewardRedemptions أو من معاملات النقاط REDEEMED_REWARD
    let totalCouponsRedeemed = 0;
    try {
      const redemptionsCount = await this.prisma.rewardRedemption.count();
      const transactionsCount = await this.prisma.pointsTransaction.count({
        where: { type: 'REDEEMED_REWARD' },
      });
      
      // نأخذ القيمة الأكبر بينهما لضمان دقة العد
      totalCouponsRedeemed = Math.max(redemptionsCount, transactionsCount);
    } catch {
      totalCouponsRedeemed = 0;
    }

    return {
      totalUsers,
      totalPointsGranted,
      totalCouponsRedeemed,
    };
  }

  // 2. جلب قائمة كل المستخدمين بالاعتماد على totalPoints المباشر من قاعدة البيانات
  async getAllUsers() {
    const users = await (this.prisma.user as any).findMany({
      select: {
        id: true,
        phone: true,
        fullName: true,
        totalPoints: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user: any) => ({
  id: user.id,
  phone: user.phone,
  email: user.phone,
  name: user.fullName || 'مستخدم',
  points: user.totalPoints || 0,
  totalPoints: user.totalPoints || 0,
}));
  }

  // 3. تعديل نقاط المستخدم يدوياً (إضافة أو خصم) عن طريق الـ phone
  async updateUserPoints(phone: string, pointsChange: number) {
    const user = await (this.prisma.user as any).findUnique({
      where: { phone },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await (this.prisma.user as any).update({
      where: { phone },
      data: {
        totalPoints: { 
          increment: pointsChange,
        },
      },
    });

    try {
      // @ts-ignore
      if (this.prisma.transaction) {
        // @ts-ignore
        await this.prisma.transaction.create({
          data: {
            userId: user.id,
            points: pointsChange,
            type: pointsChange >= 0 ? 'earn' : 'spend',
            description: `تعديل يدوي من لوحة الأدمن بقيمة ${pointsChange} نقطة`,
          },
        });
      }
    } catch {
      // تجاهل الخطأ
    }

    return { ...updatedUser, points: updatedUser.totalPoints };
  }
}