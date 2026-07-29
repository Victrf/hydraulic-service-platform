import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // ==========================================================
  // CREATE SUBSCRIPTION
  // ==========================================================
  async createSubscription(
    userId: string,
    equipmentId: string,
    planId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.companyId) {
      throw new ForbiddenException('User has no company.');
    }

    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found.');
    }

    if (equipment.companyId !== user.companyId) {
      throw new ForbiddenException(
        'Equipment does not belong to your company.',
      );
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found.');
    }

    const existing = await this.prisma.subscription.findFirst({
      where: {
        equipmentId,
        status: 'active',
      },
    });

    if (existing) {
      throw new ForbiddenException(
        'Equipment already has an active subscription.',
      );
    }

    const startDate = new Date();

    const currentPeriodEnd = new Date(startDate);
    currentPeriodEnd.setMonth(
      currentPeriodEnd.getMonth() + plan.intervalMonths,
    );

    return this.prisma.subscription.create({
      data: {
        userId: user.id,
        companyId: user.companyId,
        equipmentId,
        planId,
        startDate,
        currentPeriodStart: startDate,
        currentPeriodEnd,
        nextVisitDate: currentPeriodEnd,
        status: 'active',
      },
      include: {
        equipment: true,
        plan: true,
      },
    });
  }

  // ==========================================================
  // MY SUBSCRIPTIONS
  // ==========================================================
  async getMySubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.companyId) {
      throw new ForbiddenException('User has no company.');
    }

    return this.prisma.subscription.findMany({
      where: {
        companyId: user.companyId,
        status: 'active',
      },
      include: {
        equipment: true,
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  // ==========================================================
  // CANCEL
  // ==========================================================
  async cancelSubscription(
    userId: string,
    subscriptionId: string,
    reason: string,
    notes?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.companyId) {
      throw new ForbiddenException('User has no company.');
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: {
        id: subscriptionId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    if (subscription.companyId !== user.companyId) {
      throw new ForbiddenException('Access denied.');
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledReason: reason,
        cancellationNotes: notes,
        cancelledById: userId,
      },
      include: {
        company: true,
        equipment: true,
        plan: true,
      },
    });

    try {
      await this.mailService.sendSubscriptionCancellationEmail(
        updatedSubscription,
      );
    } catch (error) {
      console.error(
        'Subscription cancellation email could not be sent:',
        error,
      );
    }

    return updatedSubscription;
  }

  // ==========================================================
  // ADMIN
  // ==========================================================
  async getAllSubscriptions() {
    return this.prisma.subscription.findMany({
      include: {
        company: true,
        equipment: true,
        plan: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async cancelAdminSubscription(
    adminId: string,
    subscriptionId: string,
    reason: string,
    notes?: string,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        id: subscriptionId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    if (subscription.status === 'cancelled') {
      throw new ForbiddenException('Subscription is already cancelled.');
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledReason: reason,
        cancellationNotes: notes,
        cancelledById: adminId,
      },
      include: {
        company: true,
        equipment: true,
        plan: true,
      },
    });

    try {
      await this.mailService.sendSubscriptionCancellationEmail(
        updatedSubscription,
      );
    } catch (error) {
      console.error(
        'Subscription cancellation email could not be sent:',
        error,
      );
    }

    return updatedSubscription;
  }

  async createAdminSubscription(
    companyId: string,
    userId: string,
    equipmentId: string,
    planId: string,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.companyId !== companyId) {
      throw new ForbiddenException(
        'User does not belong to the selected company.',
      );
    }

    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found.');
    }

    if (equipment.companyId !== companyId) {
      throw new ForbiddenException(
        'Equipment does not belong to the selected company.',
      );
    }

    const hasAccess = await this.prisma.userEquipmentAccess.findFirst({
      where: {
        userId,
        equipmentId,
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException(
        'This equipment is not assigned to the selected customer.',
      );
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found.');
    }

    const existing = await this.prisma.subscription.findFirst({
      where: {
        equipmentId,
        status: 'active',
      },
    });

    if (existing) {
      throw new ForbiddenException(
        'Equipment already has an active subscription.',
      );
    }

    const startDate = new Date();

    const currentPeriodEnd = new Date(startDate);
    currentPeriodEnd.setMonth(
      currentPeriodEnd.getMonth() + plan.intervalMonths,
    );

    return this.prisma.subscription.create({
      data: {
        userId,
        companyId,
        equipmentId,
        planId,
        startDate,
        currentPeriodStart: startDate,
        currentPeriodEnd,
        nextVisitDate: currentPeriodEnd,
        status: 'active',
      },
      include: {
        company: true,
        equipment: true,
        user: true,
        plan: true,
      },
    });
  }

  async renewSubscription(subscriptionId: string, planId: string) {
    const oldSubscription = await this.prisma.subscription.findUnique({
      where: {
        id: subscriptionId,
      },
      include: {
        company: true,
        equipment: true,
        user: true,
        plan: true,
      },
    });

    if (!oldSubscription) {
      throw new NotFoundException('Subscription not found.');
    }

    if (oldSubscription.status === 'active') {
      throw new ForbiddenException('Active subscriptions cannot be renewed.');
    }

    const existingActive = await this.prisma.subscription.findFirst({
      where: {
        equipmentId: oldSubscription.equipmentId,
        status: 'active',
      },
    });

    if (existingActive) {
      throw new ForbiddenException(
        'Equipment already has an active subscription.',
      );
    }

    const plan = await this.prisma.plan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found.');
    }

    const startDate = new Date();

    const currentPeriodEnd = new Date(startDate);

    currentPeriodEnd.setMonth(
      currentPeriodEnd.getMonth() + plan.intervalMonths,
    );

    const newSubscription = await this.prisma.subscription.create({
      data: {
        companyId: oldSubscription.companyId,
        userId: oldSubscription.userId,
        equipmentId: oldSubscription.equipmentId,
        planId,

        startDate,

        currentPeriodStart: startDate,
        currentPeriodEnd,

        nextVisitDate: currentPeriodEnd,

        status: 'active',
      },

      include: {
        company: true,
        equipment: true,
        user: true,
        plan: true,
      },
    });
    try {
      await this.mailService.sendSubscriptionRenewalEmail(newSubscription);
    } catch (error) {
      console.error('Subscription renewal email could not be sent:', error);
    }

    return newSubscription;
  }
}
