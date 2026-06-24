import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ✅ RBAC
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

// ✅ DTOs
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  // 🔒 ADMIN ONLY
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() body: CreateAnnouncementDto) {
    return this.announcementsService.create(body);
  }

  // ✅ ALL AUTHENTICATED USERS
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.announcementsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  // 🔒 ADMIN ONLY
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, body);
  }

  // 🔒 ADMIN ONLY
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
