import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  // ✅ SECURE CREATE REPORT
  async create(data: CreateReportDto, userId: string, role: string) {
    // 1. Fetch request with assignment + existing report
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: data.serviceRequestId },
      include: {
        assignment: true,
        report: true,
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    // 🔒 Only technicians can submit reports
    if (role !== 'technician') {
      throw new Error('Only technicians can submit reports');
    }

    // ❌ Request must be assigned
    if (!request.assignment) {
      throw new Error('Request is not assigned');
    }

    // ❌ Technician must own assignment
    if (request.assignment.technicianId !== userId) {
      throw new Error('Unauthorized: not your assignment');
    }

    // ❌ Prevent duplicate reports
    if (request.report) {
      throw new Error('Report already submitted for this request');
    }

    // ✅ Create Service Completion Report
    const report = await this.prisma.serviceReport.create({
      data: {
        serviceRequestId: data.serviceRequestId,

        // Inspection
        findings: data.findings,
        rootCause: data.rootCause,
        workPerformed: data.workPerformed,
        recommendations: data.recommendations,

        // Completion Checklist
        equipmentTested: data.equipmentTested ?? false,
        operational: data.operational ?? false,
        customerInformed: data.customerInformed ?? false,
        areaCleaned: data.areaCleaned ?? false,
        safetyChecks: data.safetyChecks ?? false,
        customerAccepted: data.customerAccepted ?? false,

        // Time Tracking
        startedAt: data.startedAt,
        completedAt: data.completedAt,
      },

      include: {
        serviceRequest: {
          include: {
            equipment: true,
            company: true,
            assignment: {
              include: {
                technician: true,
              },
            },
          },
        },
      },
    });

    // ✅ Automatically mark request as completed
    const updatedRequest = await this.prisma.serviceRequest.update({
      where: { id: data.serviceRequestId },
      data: {
        status: 'completed',
      },
    });

    await this.prisma.serviceRequestEvent.create({
      data: {
        requestId: data.serviceRequestId,
        type: 'completed',
        message: 'Technician completed the service and submitted the report.',
      },
    });

    // ✅ Notify customer in real time
    this.notificationsGateway.notifyUser(
      request.userId,
      'request.updated',
      updatedRequest,
    );

    return report;
  }

  // ✅ Admin - All Reports
  async findAll() {
    return this.prisma.serviceReport.findMany({
      include: {
        serviceRequest: {
          include: {
            equipment: true,

            company: true,

            assignment: {
              include: {
                technician: true,
              },
            },

            images: true,

            events: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });
  }

  // ✅ Single Report
  async findOne(id: string) {
    return this.prisma.serviceReport.findUnique({
      where: { id },
      include: {
        serviceRequest: {
          include: {
            equipment: true,

            company: true,

            assignment: {
              include: {
                technician: true,
              },
            },

            images: true,

            events: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });
  }

  // ✅ Customer/Admin Report by Request
  async getReportByRequest(requestId: string) {
    return this.prisma.serviceReport.findFirst({
      where: {
        serviceRequestId: requestId,
      },
      include: {
        serviceRequest: {
          include: {
            equipment: true,

            company: true,

            assignment: {
              include: {
                technician: true,
              },
            },

            images: true,

            events: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });
  }
}
