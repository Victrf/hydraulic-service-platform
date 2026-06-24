import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendPaymentSuccess(email: string) {
    console.log(`📩 Payment success → ${email}`);
  }

  async sendSubscriptionExpired(email: string) {
    console.log(`⚠️ Subscription expired → ${email}`);
  }

  async sendServiceRequestCreated(email: string) {
    console.log(`🛠️ New service request → ${email}`);
  }
}
