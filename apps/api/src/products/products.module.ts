import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

// ✅ ADD THIS
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, // ✅ REQUIRED
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
