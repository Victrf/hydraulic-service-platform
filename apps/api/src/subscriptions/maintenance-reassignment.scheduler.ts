import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaintenanceReassignmentScheduler {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async reassignUnacceptedVisits() {
    const cutoff = new Date();

    cutoff.setHours(cutoff.getHours() - 24);

    const staleVisits = await this.prisma.maintenanceVisit.findMany({
      where: {
        status: 'assigned',
        assignedAt: {
          lte: cutoff,
        },
      },
    });

    if (staleVisits.length === 0) {
      return;
    }

    const technicians = await this.prisma.user.findMany({
      where: {
        role: 'technician',
        active: true,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            assignedMaintenanceVisits: {
              where: {
                status: {
                  in: ['assigned', 'in_progress'],
                },
              },
            },
          },
        },
      },
    });

    if (technicians.length === 0) {
      return;
    }

    const technicianWorkloads = technicians.map((technician) => ({
      id: technician.id,
      name: technician.name,
      workload: technician._count.assignedMaintenanceVisits,
    }));

    for (const visit of staleVisits) {
      const availableTechnicians = technicianWorkloads.filter(
        (t) => t.id !== visit.technicianId,
      );

      if (availableTechnicians.length === 0) {
        continue;
      }

      const lowestWorkload = Math.min(
        ...availableTechnicians.map((t) => t.workload),
      );

      const candidates = availableTechnicians.filter(
        (t) => t.workload === lowestWorkload,
      );

      const selected =
        candidates[Math.floor(Math.random() * candidates.length)];

      await this.prisma.maintenanceVisit.update({
        where: {
          id: visit.id,
        },
        data: {
          technicianId: selected.id,
          assignedAt: new Date(),
          acceptedAt: null,
        },
      });

      selected.workload++;
    }
  }
}
