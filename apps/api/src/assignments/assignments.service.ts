import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { technicianId: string; serviceRequestId: string }) {
    const existing = await this.prisma.serviceAssignment.findFirst({
      where: {
        serviceRequestId: data.serviceRequestId,
      },
    });

    if (existing) {
      throw new ConflictException({
        message: 'Request already assigned',
        code: 'ALREADY_ASSIGNED',
      });
    }

    const assignment = await this.prisma.serviceAssignment.create({
      data: {
        technicianId: data.technicianId,
        serviceRequestId: data.serviceRequestId,
      },
      include: {
        technician: true,
        serviceRequest: true,
      },
    });

    // LOG ASSIGNMENT
    await this.prisma.activityLog.create({
      data: {
        userId: assignment.technicianId,
        action: 'REQUEST_ASSIGN',
        entity: 'SERVICE_REQUEST',
        entityId: assignment.serviceRequestId,
        message: `Assigned request to ${assignment.technician.name}`,
      },
    });

    return assignment;
  }

  async reassign(data: { technicianId: string; serviceRequestId: string }) {
    const existing = await this.prisma.serviceAssignment.findFirst({
      where: {
        serviceRequestId: data.serviceRequestId,
      },
    });

    if (!existing) {
      throw new NotFoundException({
        message: 'No existing assignment',
        code: 'NO_ASSIGNMENT',
      });
    }

    const reassignment = await this.prisma.serviceAssignment.update({
      where: {
        id: existing.id,
      },
      data: {
        technicianId: data.technicianId,
      },
      include: {
        technician: true,
        serviceRequest: true,
      },
    });

    // LOG REASSIGNMENT
    await this.prisma.activityLog.create({
      data: {
        userId: reassignment.technicianId,
        action: 'REQUEST_REASSIGN',
        entity: 'SERVICE_REQUEST',
        entityId: reassignment.serviceRequestId,
        message: `Reassigned request to ${reassignment.technician.name}`,
      },
    });

    return reassignment;
  }

  async autoAssign(serviceRequestId: string) {
    const existing = await this.prisma.serviceAssignment.findFirst({
      where: { serviceRequestId },
    });

    if (existing) {
      throw new ConflictException({
        message: 'Request already assigned',
        code: 'ALREADY_ASSIGNED',
      });
    }

    const technicians = await this.prisma.user.findMany({
      where: { role: 'technician' },
      select: { id: true, name: true },
    });

    if (technicians.length === 0) {
      throw new NotFoundException({
        message: 'No technicians available',
        code: 'NO_TECHNICIANS',
      });
    }

    const assignments = await this.prisma.serviceAssignment.findMany({
      include: { serviceRequest: true },
    });

    const workloadMap: Record<string, number> = {};

    technicians.forEach((t) => {
      workloadMap[t.id] = 0;
    });

    assignments.forEach((a) => {
      if (a.serviceRequest.status !== 'completed') {
        workloadMap[a.technicianId] += 1;
      }
    });

    let selectedTech = technicians[0];
    let minJobs = workloadMap[selectedTech.id];

    technicians.forEach((t) => {
      if (workloadMap[t.id] < minJobs) {
        selectedTech = t;
        minJobs = workloadMap[t.id];
      }
    });

    const autoAssignment = await this.prisma.serviceAssignment.create({
      data: {
        technicianId: selectedTech.id,
        serviceRequestId,
      },
      include: {
        technician: true,
        serviceRequest: true,
      },
    });

    // LOG AUTO ASSIGN
    await this.prisma.activityLog.create({
      data: {
        userId: autoAssignment.technicianId,
        action: 'REQUEST_AUTO_ASSIGN',
        entity: 'SERVICE_REQUEST',
        entityId: autoAssignment.serviceRequestId,
        message: `Auto-assigned request to ${autoAssignment.technician.name}`,
      },
    });

    return autoAssignment;
  }

  async getTechnicianWorkload() {
    const technicians = await this.prisma.user.findMany({
      where: { role: 'technician' },
      select: { id: true, name: true },
    });

    const assignments = await this.prisma.serviceAssignment.findMany({
      include: { serviceRequest: true },
    });

    const workloadMap: Record<
      string,
      { technicianId: string; technicianName: string; activeJobs: number }
    > = {};

    technicians.forEach((tech) => {
      workloadMap[tech.id] = {
        technicianId: tech.id,
        technicianName: tech.name,
        activeJobs: 0,
      };
    });

    assignments.forEach((a) => {
      if (a.serviceRequest.status !== 'completed') {
        const techId = a.technicianId;

        if (workloadMap[techId]) {
          workloadMap[techId].activeJobs += 1;
        }
      }
    });

    return Object.values(workloadMap);
  }

  async findAll() {
    return this.prisma.serviceAssignment.findMany({
      include: {
        technician: true,
        serviceRequest: true,
      },
    });
  }
}
