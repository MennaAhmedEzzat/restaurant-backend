import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PointsService } from './points.service';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('redeem')
  async redeemPoints(@Body() body: any) {
    const phone = body?.phone || body?.email || '01000000000';
    const points = Number(body?.points || body?.pointsToRedeem || 0);
    const rewardTitle = body?.title || body?.rewardTitle;

    return this.pointsService.redeemPoints(phone, points, rewardTitle);
  }

  @Get('user')
  async getUserPoints(@Query('phone') phone: string, @Query('email') email: string) {
    const identifier = phone || email || '01000000000';
    return this.pointsService.getUserPoints(identifier);
  }

  @Post('game/complete')
  async recordGameScore(@Body() body: any) {
    const phone = body?.phone || body?.email || '01000000000';
    const gameCode = body?.gameCode || 'GeneralGame';
    const score = Number(body?.score || 0);
    const pointsEarned = Number(body?.pointsEarned || 10);

    return this.pointsService.recordGameScore(phone, gameCode, score, pointsEarned);
  }

  @Post('spin/daily')
  async spinWheelDaily(@Body() body: any) {
    const phone = body?.phone || body?.email || '01000000000';
    const rewardTitle = body?.rewardTitle || 'هدية يومية';
    const points = Number(body?.points || 10);

    return this.pointsService.spinWheelDaily(phone, rewardTitle, points);
  }
}