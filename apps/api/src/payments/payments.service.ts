import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private mailService: MailService,
  ) {}

  private async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();

    const latestPayment = await this.prisma.payment.findFirst({
      where: {
        receiptNumber: {
          startsWith: `PAY-${year}-`,
        },
      },
      orderBy: {
        receiptNumber: 'desc',
      },
      select: {
        receiptNumber: true,
      },
    });

    let nextNumber = 1;

    if (latestPayment?.receiptNumber) {
      const lastNumber = Number(latestPayment.receiptNumber.split('-')[2]);

      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `PAY-${year}-${nextNumber.toString().padStart(6, '0')}`;
  }

  // ==========================================================
  // CREATE PENDING PAYMENTs
  async createPayment(adminId: string, dto: CreatePaymentDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        id: dto.subscriptionId,
      },
      include: {
        company: true,
        equipment: true,
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    if (subscription.status !== 'active') {
      throw new ForbiddenException(
        'Payments can only be recorded for active subscriptions.',
      );
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        subscriptionId: subscription.id,
        paymentDate: {
          gte: subscription.currentPeriodStart,
          lte: subscription.currentPeriodEnd,
        },
        status: 'success',
      },
    });

    const admin = await this.prisma.user.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    if (admin.role !== 'admin') {
      throw new ForbiddenException('Only administrators can record payments.');
    }

    if (dto.amount <= 0) {
      throw new ForbiddenException('Payment amount must be greater than zero.');
    }

    if (existingPayment) {
      throw new ForbiddenException(
        'A payment has already been recorded for this subscription period.',
      );
    }

    const receiptNumber = await this.generateReceiptNumber();

    const payment = await this.prisma.payment.create({
      data: {
        companyId: subscription.companyId,
        equipmentId: subscription.equipmentId,
        planId: subscription.planId,
        subscriptionId: subscription.id,

        amount: dto.amount,

        method: dto.method,

        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),

        transactionReference: dto.transactionReference,
        receiptNumber,

        notes: dto.notes,

        status: 'success',

        recordedById: adminId,
      },
      include: {
        company: true,
        equipment: true,
        plan: true,
        subscription: true,
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    try {
      const receipt = await this.getReceipt(payment.id);

      await this.mailService.sendPaymentReceipt(receipt);
    } catch (error) {
      console.error('Receipt email could not be sent:', error);
    }

    return payment;
  }

  // ==========================================================
  // PAYMENT SUCCESS
  async markPaymentSuccessful(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        plan: true,
        company: {
          include: {
            users: {
              where: {
                role: 'customer',
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    const customer = payment.company.users[0];

    if (!customer) {
      throw new NotFoundException('No customer found for this company.');
    }

    if (payment.status === 'success') {
      return payment;
    }

    const now = new Date();

    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setMonth(
      currentPeriodEnd.getMonth() + payment.plan.intervalMonths,
    );

    const subscription = await this.prisma.subscription.create({
      data: {
        userId: customer.id,
        companyId: payment.companyId,
        equipmentId: payment.equipmentId,
        planId: payment.planId,

        startDate: now,
        currentPeriodStart: now,
        currentPeriodEnd,

        nextVisitDate: currentPeriodEnd,

        status: 'active',
      },
    });

    const updatedPayment = await this.prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: 'success',
        subscriptionId: subscription.id,
      },
      include: {
        subscription: true,
        equipment: true,
        plan: true,
      },
    });

    if (customer.email) {
      await this.notifications.sendPaymentSuccess(customer.email);
    }

    return updatedPayment;
  }

  async getReceipt(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        company: true,
        equipment: true,
        plan: true,
        subscription: true,
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    return {
      receiptNumber: payment.receiptNumber,
      paymentId: payment.id,

      company: {
        id: payment.company.id,
        name: payment.company.name,
        logoUrl: payment.company.logoUrl,
        email: payment.company.email,
        address: payment.company.address,
        phone: payment.company.phone,
      },

      equipment: {
        id: payment.equipment.id,
        name: payment.equipment.name,
      },

      plan: {
        id: payment.plan.id,
        name: payment.plan.name,
      },

      subscriptionId: payment.subscriptionId,

      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      paymentDate: payment.paymentDate,
      transactionReference: payment.transactionReference,
      notes: payment.notes,

      recordedBy: payment.recordedBy,
    };
  }

  // ==========================================================
  // PAYMENT FAILED
  async markPaymentFailed(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    return this.prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: 'failed',
      },
    });
  }
  // ==========================================================
  // CUSTOMER PAYMENTS
  // ==========================================================
  async getMyPayments(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user?.companyId) {
      throw new ForbiddenException('User has no company.');
    }

    return this.prisma.payment.findMany({
      where: {
        companyId: user.companyId,
      },
      include: {
        equipment: true,
        plan: true,
        subscription: true,
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  // ==========================================================
  // ADMIN PAYMENTS
  // ==========================================================
  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        company: true,
        equipment: true,
        plan: true,
        subscription: true,
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async getSubscriptionPayments(subscriptionId: string) {
    return this.prisma.payment.findMany({
      where: {
        subscriptionId,
      },
      include: {
        company: true,
        equipment: true,
        plan: true,
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });
  }
}
