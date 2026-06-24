import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(data: {
    name: string;
    description?: string;
    price?: number;
    images?: string[]; // 🔥 UPDATED
    inStock?: boolean;
    quantity?: number;
    categoryId: string;
  }) {
    // 🔥 VALIDATE CATEGORY
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.cacheManager.del('products:1:10');

    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        inStock: data.inStock,
        quantity: data.quantity,
        categoryId: data.categoryId,

        // 🔥 SAVE MULTIPLE IMAGES
        images: data.images || [],
      },
    });
  }

  async findAll(page: number, limit: number) {
    const cacheKey = `products:${page}:${limit}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: true,
        },
      }),
      this.prisma.product.count(),
    ]);

    const result = {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };

    await this.cacheManager.set(cacheKey, result, 60);

    return result;
  }

  async findOne(id: string) {
    const cacheKey = `product:${id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.cacheManager.set(cacheKey, product, 60);

    return product;
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      images?: string[]; // 🔥 UPDATED
      inStock?: boolean;
      quantity?: number;
      categoryId?: string;
    },
  ) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    // 🔥 VALIDATE CATEGORY
    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    await this.cacheManager.del(`product:${id}`);
    await this.cacheManager.del('products:1:10');

    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        inStock: data.inStock,
        quantity: data.quantity,
        categoryId: data.categoryId,

        // 🔥 ONLY UPDATE IMAGES IF PROVIDED
        ...(data.images && { images: data.images }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.cacheManager.del(`product:${id}`);
    await this.cacheManager.del('products:1:10');

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findGrouped() {
    return this.prisma.category.findMany({
      include: {
        products: true,
      },
    });
  }
}