import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    serialNumber: string;
    companyId: string;
    brand?: string;
    model?: string;
    installationDate?: Date;
    warrantyExpiry?: Date;
  }) {
    return await this.prisma.equipment.create({
      data,
    });
  }

  async findAll() {
    return await this.prisma.equipment.findMany({
      include: {
        company: true,
        assignedUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                companyId: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllForUser(userId: string) {
    return await this.prisma.equipment.findMany({
      where: {
        assignedUsers: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        company: true,
        assignedUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                companyId: true,
              },
            },
          },
        },
      },
    });
  }

  // ✅ UPDATE
  async update(
    id: string,
    data: {
      name?: string;
      serialNumber?: string;
      brand?: string;
      model?: string;
      companyId?: string;
      installationDate?: Date;
      warrantyExpiry?: Date;
    },
  ) {
    const existing = await this.prisma.equipment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Equipment not found');
    }

    return await this.prisma.equipment.update({
      where: { id },
      data,
    });
  }

  // ✅ SAFE DELETE
  async delete(id: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: {
        assignedUsers: true,
      },
    });

    if (!equipment) {
      throw new Error('Equipment not found');
    }

    if (equipment.assignedUsers.length > 0) {
      throw new Error(
        'Cannot delete equipment assigned to users. Remove assignments first.',
      );
    }

    return await this.prisma.equipment.delete({
      where: { id },
    });
  }
}