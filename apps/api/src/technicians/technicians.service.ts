import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TechniciansService {
  constructor(private prisma: PrismaService) {}

  // ✅ GET ALL JOBS (WITH FILTER)
  async getMyJobs(technicianId: string, status?: string) {
    return this.prisma.serviceRequest.findMany({
      where: {
        assignment: {
          technicianId,
        },
        ...(status && { status }), // ✅ dynamic filter
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

  // ✅ GET SINGLE JOB
  async getMyJob(requestId: string, technicianId: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
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
}
