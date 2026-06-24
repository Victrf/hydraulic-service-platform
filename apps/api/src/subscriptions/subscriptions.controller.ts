import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { Request } from 'express';

// ✅ ADD THESE
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private service: SubscriptionsService) {}

  // ✅ CREATE / REPLACE
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: Request & { user: { sub: string } },
    @Body() body: { planId: string },
  ) {
    return this.service.createSubscription(req.user.sub, body.planId);
  }

  // ✅ GET CURRENT SUBSCRIPTION
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMySubscription(@Req() req: Request & { user: { sub: string } }) {
    return this.service.getMySubscription(req.user.sub);
  }

  // ✅ CANCEL SUBSCRIPTION
  @UseGuards(JwtAuthGuard)
  @Patch('cancel')
  cancel(@Req() req: Request & { user: { sub: string } }) {
    return this.service.cancelSubscription(req.user.sub);
  }

  // ✅ ADMIN: GET ALL SUBSCRIPTIONS (NEW)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  getAll() {
    return this.service.getAllSubscriptions();
  }
}
