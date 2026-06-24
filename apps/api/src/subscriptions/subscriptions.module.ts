import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsScheduler } from './subscriptions.scheduler';

import { PrismaModule } from '../prisma/prisma.module';

// ✅ ADD THIS
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule, // ✅ REQUIRED for scheduler
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionsScheduler],
})
export class SubscriptionsModule {}
