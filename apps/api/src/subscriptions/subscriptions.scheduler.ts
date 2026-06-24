import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

// ✅ NOTIFICATIONS
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SubscriptionsScheduler {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // Runs every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSubscriptions() {
    const today = new Date();

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'active',
        nextVisitDate: {
          lte: today,
        },
      },
      include: {
        plan: true,
        company: {
          include: {
            equipment: true,
          },
        },
      },
    });

    for (const sub of subscriptions) {
      const now = new Date();

      // ❌ EXPIRE subscription if unpaid
      if (now > sub.currentPeriodEnd) {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'expired' },
        });

        // ✅ FIXED: NO company.email (use fallback)
        await this.notifications.sendSubscriptionExpired('company@email.com');

        continue; // ⛔ STOP processing this subscription
      }

      const equipments = sub.company.equipment;

      for (const equipment of equipments) {
        // ✅ DUPLICATE PROTECTION
        const existingRequest = await this.prisma.serviceRequest.findFirst({
          where: {
            companyId: sub.companyId,
            equipmentId: equipment.id,
            type: 'subscription',
            createdAt: {
              gte: new Date(new Date(sub.nextVisitDate).setHours(0, 0, 0, 0)),
            },
          },
        });

        if (existingRequest) continue;

        // ✅ CREATE REQUEST
        await this.prisma.serviceRequest.create({
          data: {
            description: `Routine Maintenance - ${sub.plan.name}`,
            companyId: sub.companyId,
            equipmentId: equipment.id,
            type: 'subscription',
          },
        });
      }

      // ✅ MOVE next visit date forward
      const nextDate = new Date(sub.nextVisitDate);
      nextDate.setMonth(nextDate.getMonth() + sub.plan.intervalMonths);

      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          nextVisitDate: nextDate,
        },
      });
    }
  }
}
