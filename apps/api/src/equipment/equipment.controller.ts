import {
  Controller,
  Post,
  Get,
  Patch, // ✅ NEW
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { EquipmentService } from './equipment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

type CreateEquipmentDto = {
  name: string;
  serialNumber: string;
  companyId: string;
  brand?: string;
  model?: string;
  installationDate?: Date;
  warrantyExpiry?: Date;
};

@Controller('equipment')
export class EquipmentController {
  constructor(private equipmentService: EquipmentService) {}

  @Post()
  create(@Body() body: CreateEquipmentDto) {
    return this.equipmentService.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: AuthRequest) {
    const user = req.user;

    if (user.role === 'admin') {
      return this.equipmentService.findAll();
    }

    return this.equipmentService.findAllForUser(user.id);
  }

  // ✅ UPDATE EQUIPMENT
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: Partial<CreateEquipmentDto>,
    @Req() req: AuthRequest,
  ) {
    const user = req.user;

    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admin can update equipment');
    }

    return this.equipmentService.update(id, body);
  }

  // ✅ DELETE EQUIPMENT
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: AuthRequest) {
    const user = req.user;

    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admin can delete equipment');
    }

    return this.equipmentService.delete(id);
  }
}
