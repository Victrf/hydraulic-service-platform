import {
  Controller,
  Get,
  Patch,
  UseGuards,
  Req,
  Param,
  Query, //
} from '@nestjs/common';
import { TechniciansService } from './technicians.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('technicians')
export class TechniciansController {
  constructor(private service: TechniciansService) {}

  // GET ALL MY JOBS (WITH FILTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Get('my-jobs')
  getMyJobs(
    @Req() req: Request & { user: { sub: string } },
    @Query('status') status?: string, //  ADD THIS
  ) {
    return this.service.getMyJobs(req.user.sub, status);
  }

  // ✅ ACCEPT JOB
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Patch('my-jobs/:id/accept')
  acceptJob(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.service.acceptJob(id, req.user.sub);
  }

  // ✅ START WORK
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Patch('my-jobs/:id/start')
  startJob(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.service.startJob(id, req.user.sub);
  }

  // ✅ COMPLETED JOB SUMMARY
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Get('completed-summary')
  getCompletedSummary(@Req() req: Request & { user: { sub: string } }) {
    return this.service.getCompletedSummary(req.user.sub);
  }

  // ✅ TECHNICIAN DASHBOARD
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Get('dashboard')
  getDashboard(@Req() req: Request & { user: { sub: string } }) {
    return this.service.getDashboard(req.user.sub);
  }

  //  GET SINGLE JOB
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @Get('my-jobs/:id')
  getMyJob(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.service.getMyJob(id, req.user.sub);
  }
}
