import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { MaintenanceFindingsController } from './maintenance-findings.controller';
import { MaintenanceFindingsService } from './maintenance-findings.service';

@Module({
  imports: [PrismaModule],
  controllers: [MaintenanceFindingsController],
  providers: [MaintenanceFindingsService],
  exports: [MaintenanceFindingsService],
})
export class MaintenanceFindingsModule {}
