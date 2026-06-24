import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

// ✅ ADD THESE
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  // ✅ MAKE PAYMENT
  @UseGuards(JwtAuthGuard)
  @Post()
  pay(
    @Req() req: Request & { user: { sub: string } },
    @Body() body: { amount: number },
  ) {
    return this.service.recordPayment(req.user.sub, body.amount);
  }

  // ✅ GET PAYMENT HISTORY
  @UseGuards(JwtAuthGuard)
  @Get()
  getMyPayments(@Req() req: Request & { user: { sub: string } }) {
    return this.service.getMyPayments(req.user.sub);
  }

  // ✅ ADMIN: GET ALL PAYMENTS
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  getAllPayments() {
    return this.service.getAllPayments();
  }
}
