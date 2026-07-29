import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsScheduler } from './subscriptions.scheduler';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
// ✅ ADD THIS
import { NotificationsModule } from '../notifications/notifications.module';
import { MaintenanceReassignmentScheduler } from './maintenance-reassignment.scheduler';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule, // ✅ REQUIRED for scheduler
    MailModule,
  ],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionsScheduler,
    MaintenanceReassignmentScheduler,
  ],
})
export class SubscriptionsModule {}
