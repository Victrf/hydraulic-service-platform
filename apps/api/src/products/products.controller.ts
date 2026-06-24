import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';

import { Request } from 'express';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { FilesInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import { extname, join } from 'path';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // 🔒 ADMIN ONLY (CREATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(
    FilesInterceptor('image', 3, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, join(process.cwd(), 'src/uploads/products'));
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
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  create(
    @Req() req: Request & { user: { role: string } },
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateProductDto,
  ) {
    // 🔥 DEBUG (remove later)
    console.log('FILES:', files);

    return this.productsService.create({
      name: body.name,
      description: body.description,
      price: body.price,
      inStock: body.inStock,
      quantity: body.quantity,
      categoryId: body.categoryId,

      // 🔥 SAVE ALL IMAGES
      images: files?.map((file) => file.filename) || [],
    });
  }

  // ✅ LIST
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.productsService.findAll(parseInt(page), parseInt(limit));
  }

  // ✅ SINGLE
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // 🔒 ADMIN ONLY (UPDATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('image', 3, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, join(process.cwd(), 'src/uploads/products'));
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
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  update(
    @Req() req: Request & { user: { role: string } },
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.update(id, {
      name: body.name,
      description: body.description,
      price: body.price,
      inStock: body.inStock,
      quantity: body.quantity,
      categoryId: body.categoryId,

      // 🔥 ONLY UPDATE IMAGES IF PROVIDED
      ...(files?.length && {
        images: files.map((file) => file.filename),
      }),
    });
  }

  // 🔒 DELETE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(
    @Req() req: Request & { user: { role: string } },
    @Param('id') id: string,
  ) {
    return this.productsService.remove(id);
  }
}
