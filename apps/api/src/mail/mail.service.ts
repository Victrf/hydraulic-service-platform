import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as puppeteer from 'puppeteer';
import { paymentReceiptTemplate } from './templates/payment-receipt.template';
import { subscriptionCancelledTemplate } from './templates/subscription-cancelled.template';
import { subscriptionRenewedTemplate } from './templates/subscription-renewed.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: Number(this.configService.get<number>('MAIL_PORT')),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
    attachments: nodemailer.SendMailOptions['attachments'] = [],
  ) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to,
        subject,
        html,
        attachments,
      });

      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  async generateReceiptPdf(receipt: any): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage();

      const html = paymentReceiptTemplate(receipt);

      await page.setContent(html, {
        waitUntil: 'load',
      });

      await page.waitForNetworkIdle();

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async sendPaymentReceipt(receipt: any) {
    if (!receipt.company?.email) {
      this.logger.warn(
        `Company ${receipt.company?.name} has no email address.`,
      );
      return;
    }

    const pdf = await this.generateReceiptPdf(receipt);

    const html = `
    <h2>Payment Receipt</h2>

    <p>Dear ${receipt.company.name},</p>

    <p>
      Thank you for your payment.
      Please find your payment receipt attached.
    </p>

    <table cellpadding="6">
      <tr>
        <td><strong>Receipt Number</strong></td>
        <td>${receipt.receiptNumber}</td>
      </tr>

      <tr>
        <td><strong>Amount</strong></td>
        <td>₹${Number(receipt.amount).toLocaleString('en-IN')}</td>
      </tr>

      <tr>
        <td><strong>Equipment</strong></td>
        <td>${receipt.equipment.name}</td>
      </tr>

      <tr>
        <td><strong>Maintenance Plan</strong></td>
        <td>${receipt.plan.name}</td>
      </tr>
    </table>

    <br/>

    <p>
      Regards,<br/>
      Hydraulic Service Platform
    </p>
  `;

    await this.sendMail(
      receipt.company.email,
      `Payment Receipt - ${receipt.receiptNumber}`,
      html,
      [
        {
          filename: `${receipt.receiptNumber}.pdf`,
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    );
  }
  async sendSubscriptionCancellationEmail(subscription: any) {
    if (!subscription.company?.email) {
      this.logger.warn(
        `Company ${subscription.company?.name} has no email address.`,
      );
      return;
    }

    const html = subscriptionCancelledTemplate(subscription);

    await this.sendMail(
      subscription.company.email,
      `Subscription Cancelled - ${subscription.company.name}`,
      html,
    );
  }

  async sendSubscriptionRenewalEmail(subscription: any) {
    if (!subscription.company?.email) {
      this.logger.warn(
        `Company ${subscription.company?.name} has no email address.`,
      );
      return;
    }

    const html = subscriptionRenewedTemplate(subscription);

    await this.sendMail(
      subscription.company.email,
      `Subscription Renewed - ${subscription.company.name}`,
      html,
    );
  }
}
