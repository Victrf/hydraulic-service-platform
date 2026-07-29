import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ServiceRequestsModule } from '../service-requests/service-requests.module';

import { MaintenanceVisitsController } from './maintenance-visits.controller';
import { MaintenanceVisitsService } from './maintenance-visits.service';

@Module({
  imports: [PrismaModule, NotificationsModule, ServiceRequestsModule],
  controllers: [MaintenanceVisitsController],
  providers: [MaintenanceVisitsService],
  exports: [MaintenanceVisitsService],
})
export class MaintenanceVisitsModule {}
