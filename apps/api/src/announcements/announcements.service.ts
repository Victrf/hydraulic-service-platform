import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { title: string; content: string }) {
    return this.prisma.announcement.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  async update(
    id: string,
    data: {
      title?: string;
      content?: string;
    },
  ) {
    const existing = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Announcement not found');
    }

    return this.prisma.announcement.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Announcement not found');
    }

    return this.prisma.announcement.delete({
      where: { id },
    });
  }
}
