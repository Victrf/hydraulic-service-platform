import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('plans')
export class PlansController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.prisma.plan.findMany({
      orderBy: { intervalMonths: 'asc' },
    });
  }
}
