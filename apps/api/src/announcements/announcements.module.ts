import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';

// ✅ ADD THIS
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, // ✅ REQUIRED
  ],
  providers: [AnnouncementsService],
  controllers: [AnnouncementsController],
})
export class AnnouncementsModule {}
