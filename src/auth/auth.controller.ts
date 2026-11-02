import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { phone: string; password: string; fullName: string }) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { phone: string; password: string }) {
    return this.authService.login(body);
  }

  @Get('profile')
  async getProfile(@Request() req: any) {
    return req.user || { phone: '01000000000', fullName: 'Admin User' };
  }
}