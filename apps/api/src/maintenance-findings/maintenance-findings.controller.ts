import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { MaintenanceFindingsService } from './maintenance-findings.service';
import { CreateMaintenanceFindingDto } from './dto/create-maintenance-finding.dto';
import { UpdateMaintenanceFindingDto } from './dto/update-maintenance-finding.dto';

@UseGuards(JwtAuthGuard)
@Controller('maintenance-findings')
export class MaintenanceFindingsController {
  constructor(
    private readonly maintenanceFindingsService: MaintenanceFindingsService,
  ) {}

  // ==========================================================
  // CREATE FINDING
  // ==========================================================
  @Post('visit/:visitId')
  create(
    @Param('visitId') visitId: string,
    @Body() dto: CreateMaintenanceFindingDto,
  ) {
    return this.maintenanceFindingsService.create(visitId, dto);
  }

  // ==========================================================
  // GET FINDINGS FOR A VISIT
  // ==========================================================
  @Get('visit/:visitId')
  findByVisit(@Param('visitId') visitId: string) {
    return this.maintenanceFindingsService.findByVisit(visitId);
  }

  // ==========================================================
  // GET SINGLE FINDING
  // ==========================================================
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceFindingsService.findOne(id);
  }

  // ==========================================================
  // UPDATE FINDING
  // ==========================================================
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMaintenanceFindingDto) {
    return this.maintenanceFindingsService.update(id, dto);
  }

  // ==========================================================
  // DELETE FINDING
  // ==========================================================
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintenanceFindingsService.remove(id);
  }

  // ==========================================================
  // UPLOAD FINDING PHOTOS
  // ==========================================================
  @Post(':id/photos')
  @UseInterceptors(
    FilesInterceptor('photos', 5, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, join(process.cwd(), 'src/uploads/maintenance-findings'));
        },
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);

          callback(null, uniqueName + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new Error('Only image files are allowed'), false);
        }

        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) {
      throw new BadRequestException('No photos uploaded.');
    }

    return Promise.all(
      files.map((file) =>
        this.maintenanceFindingsService.uploadPhoto(id, file.filename),
      ),
    );
  }

  // ==========================================================
  // DELETE PHOTO
  // ==========================================================
  @Delete('photos/:photoId')
  deletePhoto(@Param('photoId') photoId: string) {
    return this.maintenanceFindingsService.deletePhoto(photoId);
  }
}
