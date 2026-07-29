import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  createPayment(
    @Req() req: Request & { user: { sub: string } },
    @Body() body: CreatePaymentDto,
  ) {
    return this.service.createPayment(req.user.sub, body);
  }

  // Simulate successful payment
  @UseGuards(JwtAuthGuard)
  @Post(':id/success')
  markSuccess(@Param('id') paymentId: string) {
    return this.service.markPaymentSuccessful(paymentId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('subscription/:id')
  getSubscriptionPayments(@Param('id') id: string) {
    return this.service.getSubscriptionPayments(id);
  }

  @Get(':id/receipt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getReceipt(@Param('id') paymentId: string) {
    return this.service.getReceipt(paymentId);
  }

  // Simulate failed payment
  @UseGuards(JwtAuthGuard)
  @Post(':id/fail')
  markFailed(@Param('id') paymentId: string) {
    return this.service.markPaymentFailed(paymentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMyPayments(@Req() req: Request & { user: { sub: string } }) {
    return this.service.getMyPayments(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  getAllPayments() {
    return this.service.getAllPayments();
  }
}
