import { Controller, Post, Body } from '@nestjs/common';
import { PointsService } from './points.service';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('redeem')
  redeemPoints(@Body() body: { userId?: string; points: number }) {
    return {
      success: true,
      message: `تم استبدال ${body.points} نقطة بنجاح`,
      remainingPoints: 750,
    };
  }
}