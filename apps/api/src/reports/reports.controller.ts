import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  // ✅ SECURED CREATE (TECHNICIAN ONLY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Post()
  create(
    @Req() req: Request & { user: { sub: string; role: string } },
    @Body() body: CreateReportDto,
  ) {
    return this.reportsService.create(body, req.user.sub, req.user.role);
  }

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('request/:id')
  getReport(@Param('id') id: string) {
    return this.reportsService.getReportByRequest(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }
}
