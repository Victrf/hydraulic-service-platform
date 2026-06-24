import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Param,
  Patch,
  Req,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import { extname } from 'path';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Service Requests')
@ApiBearerAuth()
@Controller('service-requests')
export class ServiceRequestsController {
  constructor(private service: ServiceRequestsService) {}

  // ✅ CREATE REQUEST
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/service-requests',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  create(
    @Req() req: Request & { user: { sub: string } },
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Body() body: CreateServiceRequestDto,
  ) {
    return this.service.create(req.user.sub, body, files);
  }

  // ✅ CREATE CONTEXT (USER)
  @UseGuards(JwtAuthGuard)
  @Get('create-context')
  getCreateContext(@Req() req: Request & { user: { sub: string } }) {
    return this.service.getCreateContext(req.user.sub);
  }

  // ✅ ADMIN: GET ALL REQUESTS
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.service.findAll(status, parseInt(page), parseInt(limit));
  }

  // ✅ ADMIN: REQUEST STATS
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-stats')
  getAdminStats() {
    return this.service.getAdminStats();
  }

  // ✅ USER: GET OWN REQUESTS (UPDATED WITH VIEW)
  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyRequests(
    @Req() req: Request & { user: { sub: string } },
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('view') view: 'active' | 'completed' | 'history' = 'active',
  ) {
    return this.service.getRequestsByUser(
      req.user.sub,
      parseInt(page),
      parseInt(limit),
      view,
    );
  }

  // ✅ NEW: HIDE REQUEST (USER SOFT DELETE)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/hide')
  hideRequest(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.service.hideRequest(id, req.user.sub);
  }

  // ✅ NEW: RESTORE REQUEST
  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  restoreRequest(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.service.restoreRequest(id, req.user.sub);
  }

  // ✅ EVENTS
  @UseGuards(JwtAuthGuard)
  @Get(':id/events')
  getEvents(@Param('id') id: string) {
    return this.service.getEvents(id);
  }

  // ✅ SINGLE REQUEST
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // 🔒 STATUS UPDATE (ADMIN + TECH)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'technician')
  @Patch(':id/status')
  updateStatus(
    @Req() req: Request & { user: { sub: string; role: string } },
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.service.updateStatus(
      id,
      body.status,
      req.user.sub,
      req.user.role,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Get('assigned')
  getAssignedRequests(@Req() req: Request & { user: { sub: string } }) {
    return this.service.getAssignedRequests(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('user/:userId')
  getRequestsForUser(@Param('userId') userId: string) {
    return this.service.getRequestsForUser(userId);
  }

  // ⚠️ TEMP IMAGE UPLOAD
  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: { filename: string },
  ) {
    return this.service.attachImage(id, file.filename);
  }
}
