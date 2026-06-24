import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PrismaModule } from '../prisma/prisma.module'; // ✅ ADD THIS

@Module({
  imports: [PrismaModule], // ✅ REQUIRED
  providers: [CompaniesService],
  controllers: [CompaniesController],
})
export class CompaniesModule {}