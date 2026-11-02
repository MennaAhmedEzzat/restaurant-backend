import { Controller, Get, Post, Body, UseGuards, Request, Query, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('dashboard')
  async getDashboard(@Request() req: any, @Query('phone') phoneQuery: string) {
    // محاولة استخراج المعرف من الـ Token أو من الـ Query أو استخدام رقم افتراضي
    const identifier = req.user?.userId || req.user?.id || req.user?.sub || phoneQuery || req.user?.phone || '01000000000';
    return this.usersService.getDashboardData(identifier);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub || req.user?.phone;
    if (!userId) throw new UnauthorizedException('User identity not verified');
    return this.usersService.getProfile(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('points-history')
  getPointsHistory(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub || req.user?.phone;
    if (!userId) throw new UnauthorizedException('User identity not verified');
    return this.usersService.getPointsHistory(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-rewards')
  getMyRedemptions(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub || req.user?.phone;
    if (!userId) throw new UnauthorizedException('User identity not verified');
    return this.usersService.getMyRedemptions(userId);
  }

  @Post('add-points')
  async addPoints(@Request() req: any, @Body() body: { phone?: string; points: number; description: string }) {
    const identifier = body.phone || req.user?.phone || '01000000000';
    return this.usersService.addPoints(identifier, body.points, body.description);
  }

  @Post('redeem-reward')
  async redeemReward(@Request() req: any, @Body() body: { phone?: string; rewardId: string; cost: number; description: string }) {
    const identifier = body.phone || req.user?.phone || '01000000000';
    return this.usersService.redeemReward(identifier, body.rewardId, body.cost, body.description);
  }
}