import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // إنشاء طلب جديد
  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(
    @Req() req: any,
    @Body() body: { branchId: string; totalPrice: number },
  ) {
    return this.ordersService.createOrder(req.user.id, body.branchId, body.totalPrice);
  }

  // تجربة عجلة الحظ
  @UseGuards(JwtAuthGuard)
  @Post('spin')
  async spinWheel(@Req() req: any) {
    return this.ordersService.spinWheel(req.user.id);
  }
}