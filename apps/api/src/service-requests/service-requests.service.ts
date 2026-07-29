import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class ServiceRequestsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async getCreateContext(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        availableEquipment: {
          include: {
            equipment: true,
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    return {
      companyId: user.companyId,
      equipment: user.availableEquipment.map((e) => e.equipment),
    };
  }

  async create(
    userId: string,
    data: {
      description: string;
      equipmentId?: string;
      location?: string;
    },
    files: Express.Multer.File[] = [],
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!user.companyId) {
      throw new ForbiddenException('User is not linked to a company');
    }

    const userEquipment = await this.prisma.userEquipmentAccess.findMany({
      where: { userId },
    });

    let equipmentId = data.equipmentId;

    if (!equipmentId && userEquipment.length === 1) {
      equipmentId = userEquipment[0].equipmentId;
    }

    if (!equipmentId) {
      throw new ForbiddenException('Equipment selection required');
    }

    const hasAccess = await this.prisma.userEquipmentAccess.findFirst({
      where: {
        userId,
        equipmentId,
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this equipment');
    }

    const request = await this.prisma.serviceRequest.create({
      data: {
        description: data.description,
        location: data.location,
        userId: user.id, // ✅ NEW
        companyId: user.companyId,
        equipmentId,
      },
    });
    if (files.length > 0) {
      await this.prisma.serviceRequestImage.createMany({
        data: files.map((file) => ({
          requestId: request.id,
          url: file.filename,
        })),
      });
    }

    await this.prisma.serviceRequestEvent.create({
      data: {
        requestId: request.id,
        type: 'created',
        message: 'Service request created',
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'REQUEST_CREATE',
        entity: 'SERVICE_REQUEST',
        entityId: request.id,
        message: `Created service request`,
      },
    });
    this.notificationsGateway.broadcast('request.created', request);

    return request;
  }

  async createFromMaintenanceVisit(
    maintenanceVisitId: string,
    technicianId: string,
    description: string,
  ) {
    const visit = await this.prisma.maintenanceVisit.findUnique({
      where: {
        id: maintenanceVisitId,
      },
      include: {
        serviceRequest: true,
      },
    });

    if (!visit) {
      throw new NotFoundException('Maintenance visit not found');
    }

    if (visit.technicianId !== technicianId) {
      throw new ForbiddenException(
        'This maintenance visit is not assigned to you',
      );
    }

    if (visit.serviceRequest) {
      throw new ForbiddenException(
        'A service request already exists for this maintenance visit',
      );
    }

    const request = await this.prisma.serviceRequest.create({
      data: {
        userId: visit.userId,
        companyId: visit.companyId,
        equipmentId: visit.equipmentId,
        maintenanceVisitId: visit.id,

        description,
        type: 'maintenance',
        status: 'pending',
      },
    });

    await this.prisma.serviceRequestEvent.create({
      data: {
        requestId: request.id,
        type: 'created',
        message: 'Service request created from maintenance visit',
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId: technicianId,
        action: 'REQUEST_CREATE',
        entity: 'SERVICE_REQUEST',
        entityId: request.id,
        message: `Created service request from maintenance visit`,
      },
    });
    this.notificationsGateway.broadcast('request.created', request);

    return request;
  }

  async findAll(status?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where: status ? { status } : {},
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          company: true,
          equipment: true,
          assignment: {
            include: {
              technician: true,
            },
          },
          report: true,
          images: true,
        },
      }),

      this.prisma.serviceRequest.count({
        where: status ? { status } : {},
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        company: true,
        equipment: true,
        assignment: {
          include: {
            technician: true,
          },
        },
        report: true,
        images: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async updateStatus(
    id: string,
    status: string,
    userId: string,
    userRole: string,
  ) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        assignment: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const currentStatus = request.status;

    const validTransitions: Record<string, string[]> = {
      pending: ['in-progress'],
      'in-progress': ['completed'],
      completed: [],
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      throw new ForbiddenException(
        `Invalid status transition: ${currentStatus} → ${status}`,
      );
    }

    if (userRole === 'admin') {
      const updated = await this.prisma.serviceRequest.update({
        where: { id },
        data: { status },
      });
      this.notificationsGateway.broadcast('request.updated', updated);

      await this.prisma.activityLog.create({
        data: {
          userId,
          action:
            status === 'completed'
              ? 'REQUEST_COMPLETE'
              : 'REQUEST_STATUS_UPDATE',
          entity: 'SERVICE_REQUEST',
          entityId: updated.id,
          message: `Updated request status to ${status}`,
        },
      });

      return updated;
    }

    if (userRole === 'technician') {
      if (!request.assignment) {
        throw new ForbiddenException('Request is not assigned');
      }

      if (request.assignment.technicianId !== userId) {
        throw new ForbiddenException('You are not assigned to this request');
      }
    }

    const updated = await this.prisma.serviceRequest.update({
      where: { id },
      data: { status },
    });
    this.notificationsGateway.broadcast('request.updated', updated);

    await this.prisma.activityLog.create({
      data: {
        userId,
        action:
          status === 'completed' ? 'REQUEST_COMPLETE' : 'REQUEST_STATUS_UPDATE',
        entity: 'SERVICE_REQUEST',
        entityId: updated.id,
        message: `Updated request status to ${status}`,
      },
    });
    this.notificationsGateway.broadcast('request.created', request);
    return updated;
  }

  // ✅ NEW: HIDE REQUEST (USER SOFT DELETE)
  async hideRequest(id: string, userId: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.companyId !== request.companyId) {
      throw new ForbiddenException('Access denied');
    }

    if (request.status !== 'completed') {
      throw new ForbiddenException('Only completed requests can be removed');
    }

    const updated = await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        isHiddenByUser: true,
        hiddenAt: new Date(),
      },
    });

    await this.prisma.serviceRequestEvent.create({
      data: {
        requestId: id,
        type: 'hidden_by_user',
        message: 'Request hidden by user',
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'REQUEST_HIDE',
        entity: 'SERVICE_REQUEST',
        entityId: updated.id,
        message: `Request hidden by user`,
      },
    });

    return updated;
  }

  // ✅ NEW: RESTORE REQUEST
  async restoreRequest(id: string, userId: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.companyId !== request.companyId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        isHiddenByUser: false,
        hiddenAt: null,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'REQUEST_RESTORE',
        entity: 'SERVICE_REQUEST',
        entityId: updated.id,
        message: `Request restored by user`,
      },
    });

    return updated;
  }

  // ✅ UPDATED: SUPPORT VIEW FILTER
  async getRequestsByUser(
    userId: string,
    page = 1,
    limit = 10,
    view: 'active' | 'completed' | 'history' = 'active',
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.companyId) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          lastPage: 0,
        },
      };
    }

    const skip = (page - 1) * limit;

    let where: any = {
      userId: user.id,
    };

    if (view === 'active') {
      where = {
        ...where,
        status: {
          in: ['pending', 'accepted', 'in-progress'],
        },
        isHiddenByUser: false,
      };
    }

    if (view === 'completed') {
      where = {
        ...where,
        status: 'completed',
        isHiddenByUser: false,
      };
    }

    if (view === 'history') {
      where = {
        ...where,
        isHiddenByUser: true,
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          assignment: {
            include: {
              technician: true,
            },
          },
          equipment: true,
          company: true,
          images: true,
          report: true,
        },
      }),
      this.prisma.serviceRequest.count({
        where,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async getEvents(requestId: string) {
    return this.prisma.serviceRequestEvent.findMany({
      where: { requestId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getAdminStats() {
    const [total, pending, inProgress, completed, unassigned] =
      await this.prisma.$transaction([
        this.prisma.serviceRequest.count(),
        this.prisma.serviceRequest.count({
          where: { status: 'pending' },
        }),
        this.prisma.serviceRequest.count({
          where: { status: 'in-progress' },
        }),
        this.prisma.serviceRequest.count({
          where: { status: 'completed' },
        }),
        this.prisma.serviceRequest.count({
          where: {
            assignment: {
              is: null,
            },
          },
        }),
      ]);

    return {
      total,
      pending,
      inProgress,
      completed,
      unassigned,
    };
  }

  async getRequestsForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // CUSTOMER
    if (user.role === 'customer') {
      const requests = await this.prisma.serviceRequest.findMany({
        where: {
          userId: user.id,
        },
        include: {
          company: true,
          equipment: true,
          assignment: {
            include: {
              technician: true,
            },
          },
          report: true,
          images: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        role: 'customer',
        requests,
      };
    }

    // TECHNICIAN
    if (user.role === 'technician') {
      const requests = await this.prisma.serviceRequest.findMany({
        where: {
          assignment: {
            technicianId: user.id,
          },
        },
        include: {
          company: true,
          equipment: true,
          assignment: {
            include: {
              technician: true,
            },
          },
          report: true,
          images: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        role: 'technician',
        requests,
      };
    }

    // ADMIN
    const requests = await this.prisma.serviceRequest.findMany({
      include: {
        company: true,
        equipment: true,
        assignment: {
          include: {
            technician: true,
          },
        },
        report: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      role: 'admin',
      requests,
    };
  }

  async getAssignedRequests(technicianId: string) {
    return this.prisma.serviceRequest.findMany({
      where: {
        assignment: {
          technicianId,
        },
      },
      include: {
        equipment: true,
        company: true,
        assignment: {
          include: {
            technician: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async attachImage(requestId: string, filename: string) {
    return this.prisma.serviceRequestImage.create({
      data: {
        requestId,
        url: filename,
      },
    });
  }
}
