import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { PrismaModule } from '../prisma/prisma.module'; // adjust path if needed

@Module({
  imports: [PrismaModule], // ✅ THIS FIXES YOUR ERROR
  providers: [EquipmentService],
  controllers: [EquipmentController],
})
export class EquipmentModule {}
