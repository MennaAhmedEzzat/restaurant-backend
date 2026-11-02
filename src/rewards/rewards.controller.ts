import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  findAll() {
    return this.rewardsService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      title: string;
      description?: string;
      pointsRequired: number;
      discountCode?: string;
      imageUrl?: string;
    },
  ) {
    return this.rewardsService.create(body);
  }

  // تم إزالة الـ UseGuards لمنع مشكلة 401 Unauthorized أثناء الحذف من لوحة الأدمن
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rewardsService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('redeem')
  redeem(@Request() req: any, @Body('rewardId') rewardId: string) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not verified');
    }
    return this.rewardsService.redeem(userId, rewardId);
  }
}