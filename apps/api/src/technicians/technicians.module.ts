import { Module } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { TechniciansController } from './technicians.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule, // ✅ Makes NotificationsGateway available
  ],
  controllers: [TechniciansController],
  providers: [TechniciansService, PrismaService],
})
export class TechniciansModule {}
