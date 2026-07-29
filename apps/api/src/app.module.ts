import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { ReportsModule } from './reports/reports.module';
import { EquipmentModule } from './equipment/equipment.module';
import { ProductsModule } from './products/products.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { MaintenanceVisitsModule } from './maintenance-visits/maintenance-visits.module';
import { MaintenanceFindingsModule } from './maintenance-findings/maintenance-findings.module';

// ✅ SUBSCRIPTIONS
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

// ✅ PAYMENTS
import { PaymentsModule } from './payments/payments.module';

// ✅ NOTIFICATIONS
import { NotificationsModule } from './notifications/notifications.module';

// ✅ COMPANIES
import { CompaniesModule } from './companies/companies.module';

// 🔥 CATEGORY CONTROLLER
import { CategoriesController } from './categories/categories.controller';

// ✅ SCHEDULER
import { ScheduleModule } from '@nestjs/schedule';

// ✅ STATIC FILES
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// ✅ RATE LIMITING
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// ✅ CACHE
import { CacheModule } from '@nestjs/cache-manager';

// ✅ PLANS
import { PlansModule } from './plans/plans.module';

// ✅ TECHNICIANS
import { TechniciansModule } from './technicians/technicians.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // ✅ CRON
    ScheduleModule.forRoot(),

    // ✅ RATE LIMIT
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 60 seconds in milliseconds
          limit: 20,
        },
      ],
    }),

    // ✅ CACHE
    CacheModule.register({
      isGlobal: true,
      ttl: 60,
    }),

    // ✅ STATIC FILE SERVING
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        fallthrough: false,
      },
    }),

    PrismaModule,
    UsersModule,
    AssignmentsModule,
    AuthModule,
    ServiceRequestsModule,
    ReportsModule,
    EquipmentModule,
    ProductsModule,
    AnnouncementsModule,

    // ✅ Business Modules
    CompaniesModule,
    PlansModule,
    PaymentsModule,
    SubscriptionsModule,
    MaintenanceVisitsModule,
    MaintenanceFindingsModule,

    // ✅ Notifications
    NotificationsModule,

    // ✅ Technician Management
    TechniciansModule,

    MailModule,
  ],

  controllers: [CategoriesController],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
