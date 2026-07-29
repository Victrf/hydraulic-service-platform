import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Patch, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AssignTechnicianDto } from './dto/assign-technician.dto';

import { MaintenanceVisitsService } from './maintenance-visits.service';
import { CompleteMaintenanceVisitDto } from './dto/complete-maintenance-visit.dto';

@Controller('maintenance-visits')
@UseGuards(JwtAuthGuard)
export class MaintenanceVisitsController {
  constructor(private readonly service: MaintenanceVisitsService) {}

  // ==========================================================
  // ADMIN
  // GET DASHBOARD
  // ==========================================================
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('dashboard')
  getDashboard() {
    return this.service.getDashboard();
  }

  // ==========================================================
  // ADMIN
  // GET ALL VISITS
  // ==========================================================
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  getAllVisits() {
    return this.service.getAllVisits();
  }

  // ==========================================================
  // TECHNICIAN
  // MY ASSIGNED VISITS
  // ==========================================================
  @UseGuards(RolesGuard)
  @Roles('technician')
  @Get('my')
  getMyAssignedVisits(@Req() req: Request) {
    const user = req.user as any;

    return this.service.getMyAssignedVisits(user.id);
  }

  // ==========================================================
  // CUSTOMER
  // GET MAINTENANCE HISTORY FOR EQUIPMENT
  // ==========================================================
  @Get('equipment/:equipmentId')
  getEquipmentHistory(@Param('equipmentId') equipmentId: string) {
    return this.service.getEquipmentHistory(equipmentId);
  }

  // ==========================================================
  // GET SINGLE VISIT
  // ==========================================================
  @Get(':id')
  getVisitById(@Param('id') id: string) {
    return this.service.getVisitById(id);
  }

  // ==========================================================
  // ADMIN
  // ASSIGN TECHNICIAN
  // ==========================================================
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id/assign')
  assignTechnician(@Param('id') id: string, @Body() body: AssignTechnicianDto) {
    return this.service.assignTechnician(id, body.technicianId);
  }

  // ==========================================================
  // TECHNICIAN
  // ACCEPT VISIT
  // ==========================================================
  @UseGuards(RolesGuard)
  @Roles('technician')
  @Patch(':id/accept')
  acceptVisit(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;

    return this.service.acceptVisit(id, user.id);
  }

  // ==========================================================
  // TECHNICIAN
  // START VISIT
  // ==========================================================
  @UseGuards(RolesGuard)
  @Roles('technician')
  @Patch(':id/start')
  startVisit(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;

    return this.service.startVisit(id, user.id);
  }
  // ==========================================================
  // TECHNICIAN
  // COMPLETE VISIT
  // ==========================================================
  @UseGuards(RolesGuard)
  @Roles('technician')
  @Patch(':id/complete')
  completeVisit(
    @Param('id') id: string,
    @Body() body: CompleteMaintenanceVisitDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    return this.service.completeVisit(id, user.id, body.notes);
  }

  // ==========================================================
  // TECHNICIAN
  // MARK VISIT AS MISSED
  // ==========================================================
  @UseGuards(RolesGuard)
  @Roles('technician')
  @Patch(':id/missed')
  markMissed(
    @Param('id') id: string,
    @Body() body: CompleteMaintenanceVisitDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    return this.service.markMissed(id, user.id, body.notes);
  }
}
