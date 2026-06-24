import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ✅ SECURE CREATE REPORT
  async create(
    data: { serviceRequestId: string; notes?: string },
    userId: string,
    role: string,
  ) {
    // 1. fetch request with assignment + report
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

    // 🔒 role check (extra safety)
    if (role !== 'technician') {
      throw new Error('Only technicians can submit reports');
    }

    // ❌ must be assigned
    if (!request.assignment) {
      throw new Error('Request is not assigned');
    }

    // ❌ must belong to technician
    if (request.assignment.technicianId !== userId) {
      throw new Error('Unauthorized: not your assignment');
    }

    // ❌ prevent duplicate reports
    if (request.report) {
      throw new Error('Report already submitted for this request');
    }

    // ✅ create report
    const report = await this.prisma.serviceReport.create({
      data: {
        serviceRequestId: data.serviceRequestId,
        notes: data.notes,
      },
      include: {
        serviceRequest: true,
      },
    });

    // ✅ OPTIONAL: auto-complete request
    await this.prisma.serviceRequest.update({
      where: { id: data.serviceRequestId },
      data: {
        status: 'completed',
      },
    });

    return report;
  }

  async findAll() {
    return await this.prisma.serviceReport.findMany({
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
  }

  async findOne(id: string) {
    return await this.prisma.serviceReport.findUnique({
      where: { id },
      include: {
        serviceRequest: true,
      },
    });
  }

  async getReportByRequest(requestId: string) {
    return this.prisma.serviceReport.findFirst({
      where: {
        serviceRequestId: requestId,
      },
    });
  }
}
