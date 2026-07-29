import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SubscriptionsScheduler {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {
    this.handleSubscriptions();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSubscriptions() {
    const today = new Date();

    // ==========================================================
    // LOAD ACTIVE TECHNICIANS
    // ==========================================================

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
      console.log(
        'No active technicians available for maintenance scheduling.',
      );
      return;
    }

    // Track workloads in memory
    const technicianWorkloads = technicians.map((technician) => ({
      id: technician.id,
      name: technician.name,
      workload: technician._count.assignedMaintenanceVisits,
    }));

    // ==========================================================
    // GET DUE SUBSCRIPTIONS
    // ==========================================================

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'active',
        nextVisitDate: {
          lte: today,
        },
      },
      include: {
        plan: true,
      },
    });

    for (const subscription of subscriptions) {
      // ==========================================================
      // EXPIRE OVERDUE SUBSCRIPTIONS
      // ==========================================================

      if (today > subscription.currentPeriodEnd) {
        await this.prisma.subscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            status: 'expired',
          },
        });

        continue;
      }

      // ==========================================================
      // DETERMINE NEXT VISIT NUMBER
      // ==========================================================

      const lastVisit = await this.prisma.maintenanceVisit.findFirst({
        where: {
          subscriptionId: subscription.id,
        },
        orderBy: {
          visitNumber: 'desc',
        },
      });

      const nextVisitNumber = lastVisit ? lastVisit.visitNumber + 1 : 1;

      // ==========================================================
      // PREVENT DUPLICATE VISITS
      // ==========================================================

      const existingVisit = await this.prisma.maintenanceVisit.findFirst({
        where: {
          subscriptionId: subscription.id,
          visitNumber: nextVisitNumber,
        },
      });

      if (existingVisit) {
        continue;
      }

      // ==========================================================
      // SELECT THE LEAST BUSY TECHNICIAN
      // RANDOMLY PICK IF THERE IS A TIE
      // ==========================================================

      const lowestWorkload = Math.min(
        ...technicianWorkloads.map((t) => t.workload),
      );

      const availableTechnicians = technicianWorkloads.filter(
        (t) => t.workload === lowestWorkload,
      );

      const selectedTechnician =
        availableTechnicians[
          Math.floor(Math.random() * availableTechnicians.length)
        ];

      // ==========================================================
      // CREATE MAINTENANCE VISIT
      // ==========================================================

      await this.prisma.maintenanceVisit.create({
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
          companyId: subscription.companyId,
          equipmentId: subscription.equipmentId,

          technicianId: selectedTechnician.id,

          scheduledDate: subscription.nextVisitDate,

          assignedAt: new Date(),

          status: 'assigned',

          visitNumber: nextVisitNumber,
        },
      });

      // ==========================================================
      // UPDATE IN-MEMORY WORKLOAD
      // ==========================================================

      selectedTechnician.workload++;

      // ==========================================================
      // CALCULATE NEXT VISIT DATE
      // ==========================================================

      const nextVisitDate = new Date(subscription.nextVisitDate);

      nextVisitDate.setMonth(
        nextVisitDate.getMonth() + subscription.plan.intervalMonths,
      );

      // ==========================================================
      // UPDATE SUBSCRIPTION
      // ==========================================================

      await this.prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          nextVisitDate,
        },
      });

      // Notification can be added later once the NotificationsService
      // supports maintenance scheduling notifications.
    }
  }
}
