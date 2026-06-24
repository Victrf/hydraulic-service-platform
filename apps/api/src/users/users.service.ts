import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './create-user.dto';
import { mapUserProfile, userProfileInclude } from './user-response';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    const equipmentIds = Array.from(new Set(data.equipmentIds ?? []));
    let companyId = data.companyId;

    if (equipmentIds.length > 0) {
      const equipment = await this.prisma.equipment.findMany({
        where: {
          id: {
            in: equipmentIds,
          },
        },
      });

      if (equipment.length !== equipmentIds.length) {
        throw new BadRequestException(
          'One or more selected equipment records do not exist',
        );
      }

      if (companyId && equipment.some((item) => item.companyId !== companyId)) {
        throw new BadRequestException(
          'All assigned equipment must belong to the selected company',
        );
      }

      if (!companyId) {
        const companyIds = Array.from(
          new Set(equipment.map((item) => item.companyId)),
        );

        if (companyIds.length > 1) {
          throw new BadRequestException(
            'Assigned equipment must belong to the same company',
          );
        }

        companyId = companyIds[0];
      }
    }

    const hash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hash,
        role: data.role,
        companyId,
        availableEquipment: {
          create: equipmentIds.map((equipmentId) => ({
            equipment: {
              connect: { id: equipmentId },
            },
          })),
        },
      },
      include: userProfileInclude,
    });

    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'USER_CREATE',
        entity: 'USER',
        entityId: user.id,
        message: `Created user ${user.name}`,
      },
    });

    return mapUserProfile(user);
  }

  async getUsers() {
    const users = await this.prisma.user.findMany({
      include: userProfileInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map(mapUserProfile);
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: userProfileInclude,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return mapUserProfile(user);
  }

  // ✅ UPDATE USER
  async updateUser(
    userId: string,
    data: {
      name?: string;
      email?: string;
      role?: 'admin' | 'technician' | 'customer';
      companyId?: string;
      password?: string;
    },
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new BadRequestException('User not found');
    }

    let passwordHash = existing.passwordHash;

    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        companyId: data.companyId,
        passwordHash,
      },
      include: userProfileInclude,
    });

    await this.prisma.activityLog.create({
      data: {
        userId: updated.id,
        action: 'USER_UPDATE',
        entity: 'USER',
        entityId: updated.id,
        message: `Updated user ${updated.name}`,
      },
    });

    return mapUserProfile(updated);
  }

  // ✅ DELETE USER (SAFE)
  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // 🔒 Remove equipment relations first
    await this.prisma.userEquipmentAccess.deleteMany({
      where: { userId },
    });

    // ✅ Delete user
    const deletedUser = await this.prisma.user.delete({
      where: { id: userId },
    });

    await this.prisma.activityLog.create({
      data: {
        userId: deletedUser.id,
        action: 'USER_DELETE',
        entity: 'USER',
        entityId: deletedUser.id,
        message: `Deleted user ${deletedUser.name}`,
      },
    });

    return deletedUser;
  }

  // ✅ UPDATE USER EQUIPMENT
  async updateUserEquipment(userId: string, equipmentIds: string[]) {
    const uniqueIds = Array.from(new Set(equipmentIds));

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const equipment = await this.prisma.equipment.findMany({
      where: {
        id: { in: uniqueIds },
        companyId: user.companyId ?? undefined,
      },
    });

    if (equipment.length !== uniqueIds.length) {
      throw new BadRequestException(
        'Invalid equipment selection for this user/company',
      );
    }

    await this.prisma.userEquipmentAccess.deleteMany({
      where: { userId },
    });

    await this.prisma.userEquipmentAccess.createMany({
      data: uniqueIds.map((equipmentId) => ({
        userId,
        equipmentId,
      })),
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: userProfileInclude,
    });

    if (!updatedUser) {
      throw new BadRequestException('User not found after update');
    }

    return mapUserProfile(updatedUser);
  }

  async getUserActivity(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const logs = await this.prisma.activityLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return logs;
  }
}
