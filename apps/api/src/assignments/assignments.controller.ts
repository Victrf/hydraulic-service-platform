import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('assignments')
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() body: CreateAssignmentDto) {
    return this.assignmentsService.create(body);
  }

  // ✅ NEW: REASSIGN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('reassign')
  reassign(@Body() body: { technicianId: string; serviceRequestId: string }) {
    return this.assignmentsService.reassign(body);
  }

  // ✅ EXISTING: AUTO ASSIGN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('auto-assign')
  autoAssign(@Body() body: { serviceRequestId: string }) {
    return this.assignmentsService.autoAssign(body.serviceRequestId);
  }

  @Get()
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get('workload')
  getWorkload() {
    return this.assignmentsService.getTechnicianWorkload();
  }
}
