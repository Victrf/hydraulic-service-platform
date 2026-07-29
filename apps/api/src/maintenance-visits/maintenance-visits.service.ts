import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ServiceRequestsService } from '../service-requests/service-requests.service';

@Injectable()
export class MaintenanceVisitsService {
  constructor(
    private prisma: PrismaService,
    private serviceRequestsService: ServiceRequestsService,
  ) {}

  // ==========================================================
  // ADMIN
  // GET ALL MAINTENANCE VISITS
  // ==========================================================
  async getAllVisits() {
    return this.prisma.maintenanceVisit.findMany({
      include: {
        company: true,
        equipment: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        technician: true,
        serviceRequest: {
          include: {
            report: true,
            assignment: {
              include: {
                technician: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledDate: 'desc',
      },
    });
  }

  // ==========================================================
  // GET SINGLE VISIT
  // ==========================================================
  async getVisitById(id: string) {
    const visit = await this.prisma.maintenanceVisit.findUnique({
      where: { id },
      include: {
        company: true,
        equipment: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        technician: true,
        findings: {
          include: {
            photos: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },

        serviceRequest: {
          include: {
            report: true,
            assignment: {
              include: {
                technician: true,
              },
            },
            events: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException('Maintenance visit not found.');
    }

    return visit;
  }

  // ==========================================================
  // DASHBOARD
  // ==========================================================
  async getDashboard() {
    const [
      total,
      scheduled,
      assigned,
      inProgress,
      completed,
      missed,
      cancelled,
    ] = await Promise.all([
      this.prisma.maintenanceVisit.count(),
      this.prisma.maintenanceVisit.count({ where: { status: 'scheduled' } }),
      this.prisma.maintenanceVisit.count({ where: { status: 'assigned' } }),
      this.prisma.maintenanceVisit.count({ where: { status: 'in_progress' } }),
      this.prisma.maintenanceVisit.count({ where: { status: 'completed' } }),
      this.prisma.maintenanceVisit.count({ where: { status: 'missed' } }),
      this.prisma.maintenanceVisit.count({ where: { status: 'cancelled' } }),
    ]);

    return {
      total,
      scheduled,
      assigned,
      inProgress,
      completed,
      missed,
      cancelled,
    };
  }

  // ==========================================================
  // ASSIGN TECHNICIAN
  // ==========================================================
  async assignTechnician(visitId: string, technicianId: string) {
    const visit = await this.prisma.maintenanceVisit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new NotFoundException('Maintenance visit not found.');
    }

    const technician = await this.prisma.user.findUnique({
      where: { id: technicianId },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found.');
    }

    if (technician.role !== 'technician') {
      throw new NotFoundException('Selected user is not a technician.');
    }

    if (technician.companyId !== visit.companyId) {
      throw new NotFoundException(
        'Technician does not belong to this company.',
      );
    }

    return this.prisma.maintenanceVisit.update({
      where: { id: visitId },
      data: {
        technicianId,
        status: 'assigned',
      },
      include: {
        technician: true,
        equipment: true,
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });
  }

  // ==========================================================
  // TECHNICIAN
  // GET MY ASSIGNED VISITS
  // ==========================================================
  async getMyAssignedVisits(userId: string) {
    return this.prisma.maintenanceVisit.findMany({
      where: {
        technicianId: userId,
      },
      include: {
        company: true,
        equipment: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        serviceRequest: true,
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });
  }

  // ==========================================================
  // TECHNICIAN
  // ACCEPT MAINTENANCE VISIT
  // ==========================================================
  async acceptVisit(visitId: string, technicianId: string) {
    const visit = await this.prisma.maintenanceVisit.findUnique({
      where: {
        id: visitId,
      },
    });

    console.log('==============================');
    console.log('Visit ID:', visitId);
    console.log('Visit technicianId:', visit?.technicianId);
    console.log('Authenticated technicianId:', technicianId);
    console.log('==============================');

    if (!visit) {
      throw new NotFoundException('Maintenance visit not found.');
    }

    if (visit.technicianId !== technicianId) {
      throw new NotFoundException('This visit is not assigned to you.');
    }

    if (!visit) {
      throw new NotFoundException('Maintenance visit not found.');
    }

    if (visit.technicianId !== technicianId) {
      throw new NotFoundException('This visit is not assigned to you.');
    }

    if (visit.status !== 'assigned') {
      throw new BadRequestException('Only assigned visits can be accepted.');
    }

    return this.prisma.maintenanceVisit.update({
      where: {
        id: visitId,
      },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
      include: {
        company: true,
        equipment: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        technician: true,
      },
    });
  }

  // ==========================================================
  // TECHNICIAN
  // START MAINTENANCE VISIT
  // ==========================================================
  async startVisit(visitId: string, technicianId: string) {
    const visit = await this.prisma.maintenanceVisit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new NotFoundException('Maintenance visit not found.');
    }

    if (visit.technicianId !== technicianId) {
      throw new NotFoundException('This visit is not assigned to you.');
    }

    if (visit.status !== 'assigned' && visit.status !== 'accepted') {
      throw new BadRequestException(
        'Only assigned or accepted visits can be started.',
      );
    }

    return this.prisma.maintenanceVisit.update({
      where: { id: visitId },
      data: {
        status: 'in_progress',
      },
      include: {
        company: true,
        equipment: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        technician: true,
      },
    });
  }

  // ==========================================================
  // TECHNICIAN
  // COMPLETE MAINTENANCE VISIT
  // ==========================================================
  async completeVisit(visitId: string, technicianId: string, notes?: string) {
    const visit = await this.prisma.maintenanceVisit.findUnique({
      where: { id: visitId },
      include: {
        subscription: true,
      },
    });

    if (!visit) {
      throw new NotFoundException('Maintenance visit not found.');
    }

    if (visit.technicianId !== technicianId) {
      throw new NotFoundException('This visit is not assigned to you.');
    }

    if (visit.status !== 'in_progress') {
      throw new NotFoundException('Only visits in progress can be completed.');
    }

    const completedVisit = await this.prisma.maintenanceVisit.update({
      where: { id: visitId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        notes,
      },
      include: {
        company: true,
        equipment: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        technician: true,
      },
    });

    await this.prisma.subscription.update({
      where: { id: visit.subscriptionId },
      data: {
        totalVisitsCompleted: {
          increment: 1,
        },
      },
    });

    return completedVisit;
  }

  // ==========================================================
  // TECHNICIAN
  // MARK VISIT AS MISSED
  // ==========================================================
  async markMissed(visitId: string, technicianId: string, notes?: string) {
    const visit = await this.prisma.maintenanceVisit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new NotFoundException('Maintenance visit not found.');
    }

    if (visit.technicianId !== technicianId) {
      throw new NotFoundException('This visit is not assigned to you.');
    }

    if (visit.status !== 'assigned' && visit.status !== 'in_progress') {
      throw new NotFoundException('This visit cannot be marked as missed.');
    }

    return this.prisma.maintenanceVisit.update({
      where: { id: visitId },
      data: {
        status: 'missed',
        notes,
      },
      include: {
        company: true,
        equipment: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        technician: true,
      },
    });
  }

  // ==========================================================
  // CREATE SERVICE REQUEST FROM VISIT
  // ==========================================================
  async createServiceRequest(
    visitId: string,
    technicianId: string,
    data: {
      description: string;
    },
  ) {
    return this.serviceRequestsService.createFromMaintenanceVisit(
      visitId,
      technicianId,
      data.description,
    );
  }

  // ==========================================================
  // GET MAINTENANCE HISTORY FOR EQUIPMENT
  // ==========================================================
  async getEquipmentHistory(equipmentId: string) {
    return this.prisma.maintenanceVisit.findMany({
      where: {
        equipmentId,
      },

      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },

        findings: {
          select: {
            id: true,
          },
        },

        serviceRequest: {
          select: {
            id: true,
            status: true,
          },
        },

        subscription: {
          include: {
            plan: true,
          },
        },
      },

      orderBy: {
        scheduledDate: 'desc',
      },
    });
  }
}
