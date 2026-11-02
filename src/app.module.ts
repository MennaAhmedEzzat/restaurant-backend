import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BranchesModule } from './branches/branches.module';
import { OrdersModule } from './orders/orders.module';
import { GamesModule } from './games/games.module';
import { WaitingSessionsModule } from './waiting-sessions/waiting-sessions.module';
import { RewardsModule } from './rewards/rewards.module';
import { PointsModule } from './points/points.module';
import { SettingsModule } from './settings/settings.module';
import { AdminModule } from './admin/admin.module'; // 1. استيراد موديول الأدمن

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    BranchesModule,
    OrdersModule,
    GamesModule,
    WaitingSessionsModule,
    RewardsModule,
    PointsModule,
    SettingsModule,
    AdminModule, // 2. إضافته داخل المصفوفة
  ],
})
export class AppModule {}