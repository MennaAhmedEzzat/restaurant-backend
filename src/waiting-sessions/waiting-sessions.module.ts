import { Module } from '@nestjs/common';
import { WaitingSessionsService } from './waiting-sessions.service';
import { WaitingSessionsController } from './waiting-sessions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WaitingSessionsController],
  providers: [WaitingSessionsService],
})
export class WaitingSessionsModule {}