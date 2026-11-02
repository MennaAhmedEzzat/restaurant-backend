import { Controller, Get, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // مسار جلب الإحصائيات: GET /admin/analytics
  @Get('analytics')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // مسار جلب المستخدمين: GET /admin/users
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  // مسار تعديل النقاط يدوياً: POST /admin/users/points
  @Post('users/points')
  async updateUserPoints(@Body() body: { email: string; points: number }) {
    return this.adminService.updateUserPoints(body.email, body.points);
  }
}