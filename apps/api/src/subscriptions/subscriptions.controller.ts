import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CreateAdminSubscriptionDto } from './dto/create-admin-subscription.dto';
import { Request } from 'express';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private service: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: Request & { user: { sub: string } },
    @Body() body: CreateSubscriptionDto,
  ) {
    return this.service.createSubscription(
      req.user.sub,
      body.equipmentId,
      body.planId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/:id/cancel')
  cancelAdmin(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') subscriptionId: string,
    @Body() body: CancelSubscriptionDto,
  ) {
    return this.service.cancelAdminSubscription(
      req.user.sub,
      subscriptionId,
      body.reason,
      body.notes,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/:id/renew')
  renewAdmin(
    @Param('id') subscriptionId: string,
    @Body() body: RenewSubscriptionDto,
  ) {
    return this.service.renewSubscription(subscriptionId, body.planId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin')
  createAdmin(@Body() body: CreateAdminSubscriptionDto) {
    return this.service.createAdminSubscription(
      body.companyId,
      body.userId,
      body.equipmentId,
      body.planId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMySubscription(@Req() req: Request & { user: { sub: string } }) {
    return this.service.getMySubscription(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') subscriptionId: string,
    @Body() body: CancelSubscriptionDto,
  ) {
    return this.service.cancelSubscription(
      req.user.sub,
      subscriptionId,
      body.reason,
      body.notes,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/renew')
  renew(
    @Param('id') subscriptionId: string,
    @Body() body: RenewSubscriptionDto,
  ) {
    return this.service.renewSubscription(subscriptionId, body.planId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  getAll() {
    return this.service.getAllSubscriptions();
  }
}
