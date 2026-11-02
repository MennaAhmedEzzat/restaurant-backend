import { Controller, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { WaitingSessionsService } from './waiting-sessions.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('waiting-sessions')
export class WaitingSessionsController {
  constructor(private readonly waitingSessionsService: WaitingSessionsService) {}

  @Post('start')
  startSession(@Request() req: any, @Body('orderId') orderId: string) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    
    if (!userId) {
      throw new UnauthorizedException('User identity could not be verified from token');
    }

    return this.waitingSessionsService.startSession(userId, orderId);
  }

  @Post('submit-score')
  submitScore(
    @Request() req: any,
    @Body('sessionId') sessionId: string,
    @Body('score') score: number,
  ) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    
    if (!userId) {
      throw new UnauthorizedException('User identity could not be verified from token');
    }

    return this.waitingSessionsService.submitGameScore(userId, sessionId, score);
  }
}