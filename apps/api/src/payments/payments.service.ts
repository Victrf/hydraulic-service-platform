import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// ✅ ADD THIS
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,

    // ✅ ADD THIS
    private notifications: NotificationsService,
  ) {}

  async recordPayment(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.companyId) {
      throw new ForbiddenException('User has no company');
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        companyId: user.companyId,
      },
      include: { plan: true },
    });

    if (!subscription) {
      throw new ForbiddenException('No subscription found');
    }

    // ✅ RECORD PAYMENT
    await this.prisma.payment.create({
      data: {
        companyId: user.companyId,
        subscriptionId: subscription.id,
        amount,
        status: 'success',
        method: 'manual',
      },
    });

    // ✅ TRIGGER NOTIFICATION (ADD THIS)
    await this.notifications.sendPaymentSuccess(user.email || 'user@email.com');

    // ✅ RENEW SUBSCRIPTION
    const now = new Date();

    const newPeriodEnd = new Date(now);
    newPeriodEnd.setMonth(
      newPeriodEnd.getMonth() + subscription.plan.intervalMonths,
    );

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        currentPeriodEnd: newPeriodEnd,
        nextVisitDate: newPeriodEnd,
      },
    });
  }

  async getMyPayments(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.companyId) {
      throw new ForbiddenException('User has no company');
    }

    return this.prisma.payment.findMany({
      where: {
        companyId: user.companyId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ ADMIN: GET ALL PAYMENTS
  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        company: true,
        subscription: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
