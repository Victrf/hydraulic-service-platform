import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  // ✅ CREATE / REPLACE / BLOCK LOGIC
  async createSubscription(userId: string, planId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.companyId) {
      throw new ForbiddenException('User has no company');
    }

    const newPlan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!newPlan) {
      throw new ForbiddenException('Invalid plan');
    }

    const existing = await this.prisma.subscription.findFirst({
      where: {
        companyId: user.companyId,
        status: 'active',
      },
    });

    // ✅ CALCULATE PERIOD + VISIT DATE
    const now = new Date();

    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setMonth(
      currentPeriodEnd.getMonth() + newPlan.intervalMonths,
    );

    const nextVisitDate = new Date(currentPeriodEnd);

    if (existing) {
      if (existing.planId === planId) {
        throw new ForbiddenException('You are already subscribed to this plan');
      }

      // 🔁 REPLACE PLAN
      return this.prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId: newPlan.id,
          currentPeriodEnd,
          nextVisitDate,
        },
      });
    }

    // ✅ CREATE NEW
    return this.prisma.subscription.create({
      data: {
        companyId: user.companyId,
        planId: newPlan.id,
        currentPeriodEnd,
        nextVisitDate,
        status: 'active',
      },
    });
  }

  // ✅ GET CURRENT SUBSCRIPTION
  async getMySubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.companyId) {
      throw new ForbiddenException('User has no company');
    }

    return this.prisma.subscription.findFirst({
      where: {
        companyId: user.companyId,
        status: 'active',
      },
      include: {
        plan: true,
      },
    });
  }

  // ✅ CANCEL SUBSCRIPTION
  async cancelSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.companyId) {
      throw new ForbiddenException('User has no company');
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        companyId: user.companyId,
        status: 'active',
      },
    });

    if (!subscription) {
      throw new ForbiddenException('No active subscription found');
    }

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
      },
    });
  }

  // ✅ ADMIN: GET ALL SUBSCRIPTIONS (NEW)
  async getAllSubscriptions() {
    return this.prisma.subscription.findMany({
      include: {
        company: true,
        plan: true,
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
