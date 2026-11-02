import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // إنشاء طلب جديد
  async createOrder(userId: string, branchId: string, totalPrice: number) {
    return this.prisma.order.create({
      data: {
        userId,
        branchId,
        totalPrice,
      },
    });
  }

  // تجربة عجلة الحظ (Spin the Wheel)
  async spinWheel(userId: string) {
    const rewards = [
      'خصم 10% على الطلب القادم',
      'طاجن قشطوطة مجاني',
      'خصم 25%',
      'حظ سعيد المرة القادمة',
      'عصير مانجو مجاني',
    ];

    // اختيار مكافأة عشوائية
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const selectedReward = rewards[randomIndex];

    // تسجيل محاولة اللعب في قاعدة البيانات
    await this.prisma.spinHistory.create({
      data: {
        userId,
        reward: selectedReward,
      },
    });

    return {
      success: true,
      reward: selectedReward,
    };
  }
}