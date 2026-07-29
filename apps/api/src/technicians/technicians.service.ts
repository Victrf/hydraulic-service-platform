import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class TechniciansService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  // ✅ GET ALL JOBS (WITH FILTER)
  async getMyJobs(technicianId: string, status?: string) {
    return this.prisma.serviceRequest.findMany({
      where: {
        assignment: {
          technicianId,
        },
        ...(status && { status }),
      },
      include: {
        equipment: true,
        company: true,
        assignment: {
          include: {
            technician: true,
          },
        },
        report: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ✅ ACCEPT JOB
  async acceptJob(requestId: string, technicianId: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        assignment: true,
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (!request.assignment) {
      throw new Error('Request is not assigned');
    }

    if (request.assignment.technicianId !== technicianId) {
      throw new Error('Unauthorized');
    }

    // ✅ Change status to accepted
    const updatedRequest = await this.prisma.serviceRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: 'accepted',
      },
    });

    // ✅ Create timeline event
    await this.prisma.serviceRequestEvent.create({
      data: {
        requestId: request.id,
        type: 'accepted',
        message: 'Technician accepted the assigned job.',
      },
    });

    // ✅ Notify customer in real time
    this.notificationsGateway.notifyUser(
      request.userId,
      'request.updated',
      updatedRequest,
    );

    this.notificationsGateway.broadcast('request.updated', updatedRequest);

    return this.getMyJob(request.id, technicianId);
  }

  // ✅ START JOB
  async startJob(requestId: string, technicianId: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        assignment: true,
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (!request.assignment) {
      throw new Error('Request is not assigned');
    }

    if (request.assignment.technicianId !== technicianId) {
      throw new Error('Unauthorized');
    }

    const updatedRequest = await this.prisma.serviceRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: 'in-progress',
      },
    });

    await this.prisma.serviceRequestEvent.create({
      data: {
        requestId,
        type: 'in-progress',
        message: 'Technician started work.',
      },
    });

    // ✅ Notify customer in real time
    this.notificationsGateway.notifyUser(
      request.userId,
      'request.updated',
      updatedRequest,
    );

    this.notificationsGateway.broadcast('request.updated', updatedRequest);

    return this.getMyJob(requestId, technicianId);
  }

  // ✅ GET SINGLE JOB
  async getMyJob(requestId: string, technicianId: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        equipment: true,
        company: true,
        assignment: {
          include: {
            technician: true,
          },
        },
        report: true,
        events: true,
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (!request.assignment) {
      throw new Error('Request is not assigned');
    }

    if (request.assignment.technicianId !== technicianId) {
      throw new Error('Unauthorized');
    }

    return request;
  }

  // ✅ TECHNICIAN COMPLETED JOB SUMMARY
  async getCompletedSummary(technicianId: string) {
    return this.prisma.serviceRequest.findMany({
      where: {
        status: 'completed',
        assignment: {
          technicianId,
        },
      },
      include: {
        company: true,
        equipment: true,
        report: true,
        assignment: {
          include: {
            technician: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ✅ TECHNICIAN DASHBOARD
  async getDashboard(technicianId: string) {
    const [
      pendingJobs,
      acceptedJobs,
      activeJobs,
      completedJobs,
      reportsSubmitted,
    ] = await Promise.all([
      this.prisma.serviceRequest.count({
        where: {
          assignment: {
            technicianId,
          },
          status: 'pending',
        },
      }),

      this.prisma.serviceRequest.count({
        where: {
          assignment: {
            technicianId,
          },
          status: 'accepted',
        },
      }),

      this.prisma.serviceRequest.count({
        where: {
          assignment: {
            technicianId,
          },
          status: 'in-progress',
        },
      }),

      this.prisma.serviceRequest.count({
        where: {
          assignment: {
            technicianId,
          },
          status: 'completed',
        },
      }),

      this.prisma.serviceReport.count({
        where: {
          serviceRequest: {
            assignment: {
              technicianId,
            },
          },
        },
      }),
    ]);

    return {
      pendingJobs,
      acceptedJobs,
      activeJobs,
      completedJobs,
      reportsSubmitted,
    };
  }
}
