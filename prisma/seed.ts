import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@blaban.com';
  const rawPassword = '12345678';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // حذف الحساب القديم إن وجد لضمان تجديد كلمة المرور
  await prisma.user.deleteMany({ where: { email } });

  // إنشاء المستخدم مع منح 2500 نقطة لتجاوز حد الـ 2000
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      fullName: 'Admin User',
      totalPoints: 2500,
    },
  });

  console.log('User regenerated successfully with 2500 points:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });