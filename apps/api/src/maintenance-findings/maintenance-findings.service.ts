import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateMaintenanceFindingDto } from './dto/create-maintenance-finding.dto';
import { UpdateMaintenanceFindingDto } from './dto/update-maintenance-finding.dto';

@Injectable()
export class MaintenanceFindingsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================================
  // CREATE FINDING
  // ==========================================================
  async create(visitId: string, dto: CreateMaintenanceFindingDto) {
    const visit = await this.prisma.maintenanceVisit.findUnique({
      where: {
        id: visitId,
      },
    });

    if (!visit) {
      throw new NotFoundException('Maintenance visit not found');
    }

    return this.prisma.maintenanceFinding.create({
      data: {
        maintenanceVisitId: visitId,
        ...dto,
      },
    });
  }

  // ==========================================================
  // GET FINDINGS FOR A VISIT
  // ==========================================================
  async findByVisit(visitId: string) {
    return this.prisma.maintenanceFinding.findMany({
      where: {
        maintenanceVisitId: visitId,
      },
      include: {
        photos: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // ==========================================================
  // GET SINGLE FINDING
  // ==========================================================
  async findOne(id: string) {
    const finding = await this.prisma.maintenanceFinding.findUnique({
      where: {
        id,
      },
      include: {
        photos: true,
      },
    });

    if (!finding) {
      throw new NotFoundException('Finding not found');
    }

    return finding;
  }

  // ==========================================================
  // UPDATE FINDING
  // ==========================================================
  async update(id: string, dto: UpdateMaintenanceFindingDto) {
    await this.findOne(id);

    return this.prisma.maintenanceFinding.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  // ==========================================================
  // DELETE FINDING
  // ==========================================================
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.maintenanceFinding.delete({
      where: {
        id,
      },
    });
  }
  // ==========================================================
  // UPLOAD PHOTO
  // ==========================================================
  async uploadPhoto(findingId: string, filename: string) {
    const finding = await this.findOne(findingId);

    const visit = await this.prisma.maintenanceVisit.findUnique({
      where: {
        id: finding.maintenanceVisitId,
      },
    });

    if (!visit) {
      throw new NotFoundException('Maintenance visit not found');
    }

    if (visit.status === 'completed') {
      throw new ForbiddenException(
        'Completed maintenance visits cannot be modified.',
      );
    }

    return this.prisma.maintenanceFindingImage.create({
      data: {
        findingId,
        url: filename,
      },
    });
  }

  // ==========================================================
  // DELETE PHOTO
  // ==========================================================
  async deletePhoto(photoId: string) {
    const photo = await this.prisma.maintenanceFindingImage.findUnique({
      where: {
        id: photoId,
      },
      include: {
        finding: true,
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    const visit = await this.prisma.maintenanceVisit.findUnique({
      where: {
        id: photo.finding.maintenanceVisitId,
      },
    });

    if (!visit) {
      throw new NotFoundException('Maintenance visit not found');
    }

    if (visit.status === 'completed') {
      throw new ForbiddenException(
        'Completed maintenance visits cannot be modified.',
      );
    }

    return this.prisma.maintenanceFindingImage.delete({
      where: {
        id: photoId,
      },
    });
  }
}
