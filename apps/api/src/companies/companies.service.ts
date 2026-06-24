import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    logoUrl?: string;

    email?: string;
    address?: string;
    phone?: string;

    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactPosition?: string;

    escalatingName?: string;
    escalatingEmail?: string;
    escalatingPhone?: string;
    escalatingPosition?: string;
  }) {
    const company = await this.prisma.company.create({
      data,
    });

    // LOG COMPANY CREATE
    await this.prisma.activityLog.create({
      data: {
        action: 'COMPANY_CREATE',
        entity: 'COMPANY',
        entityId: company.id,
        message: `Created company ${company.name}`,
      },
    });

    return company;
  }

  async findAll() {
    return await this.prisma.company.findMany({
      include: {
        users: true,
        equipment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: true,
        equipment: true,
      },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    return company;
  }

  // ✅ UPDATE COMPANY
  async update(
    id: string,
    data: {
      name?: string;
      logoUrl?: string;

      email?: string;
      address?: string;
      phone?: string;

      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
      contactPosition?: string;

      escalatingName?: string;
      escalatingEmail?: string;
      escalatingPhone?: string;
      escalatingPosition?: string;
    },
  ) {
    try {
      const updatedCompany = await this.prisma.company.update({
        where: { id },
        data,
      });

      // LOG COMPANY UPDATE
      await this.prisma.activityLog.create({
        data: {
          action: 'COMPANY_UPDATE',
          entity: 'COMPANY',
          entityId: updatedCompany.id,
          message: `Updated company ${updatedCompany.name}`,
        },
      });

      return updatedCompany;
    } catch (error) {
      throw new BadRequestException('Failed to update company');
    }
  }

  // ✅ DELETE COMPANY (SAFE)
  async remove(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: true,
        equipment: true,
      },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    if (company.users.length > 0 || company.equipment.length > 0) {
      throw new BadRequestException(
        'Cannot delete company with assigned users or equipment',
      );
    }

    const deletedCompany = await this.prisma.company.delete({
      where: { id },
    });

    // LOG COMPANY DELETE
    await this.prisma.activityLog.create({
      data: {
        action: 'COMPANY_DELETE',
        entity: 'COMPANY',
        entityId: deletedCompany.id,
        message: `Deleted company ${deletedCompany.name}`,
      },
    });

    return deletedCompany;
  }
}
