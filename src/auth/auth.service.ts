import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(body: { phone: string; password: string }) {
    const user = await (this.prisma.user as any).findUnique({
      where: { phone: body.phone },
    });

    if (!user) {
      throw new UnauthorizedException('رقم الهاتف أو كلمة المرور غير صحيحة');
    }

    const isMatch = await bcrypt.compare(body.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('رقم الهاتف أو كلمة المرور غير صحيحة');
    }

    const { passwordHash, ...result } = user;
    return {
      message: 'تم تسجيل الدخول بنجاح',
      accessToken: 'mock-jwt-token',
      user: result,
    };
  }

  async register(body: { phone: string; password: string; fullName?: string }) {
    const existingUser = await (this.prisma.user as any).findUnique({
      where: { phone: body.phone },
    });

    if (existingUser) {
      throw new BadRequestException('رقم الهاتف مسجل مسبقاً');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await (this.prisma.user as any).create({
      data: {
        phone: body.phone,
        passwordHash: hashedPassword,
        fullName: body.fullName || 'مستخدم جديد',
        totalPoints: 0,
      },
    });

    const { passwordHash, ...result } = newUser;
    return {
      message: 'تم إنشاء الحساب بنجاح',
      access_token: 'mock-jwt-token', // 👈 إضافة التوكن هنا
      user: result,
    };
  }
}