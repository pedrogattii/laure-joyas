import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateProductDto {
  name: string;
  description?: string;
  priceList: number;
  priceCash: number;
  categoryId: string;
  materialId: string;
  code?: string;
  images?: string[];
}

export class UpdateProductDto {
  name?: string;
  description?: string;
  priceList?: number;
  priceCash?: number;
  categoryId?: string;
  materialId?: string;
  active?: boolean;
  images?: string[];
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: { categoryId?: string; materialId?: string; search?: string }) {
    const { categoryId, materialId, search } = params || {};
    const where: any = { active: true };

    if (categoryId) where.categoryId = categoryId;
    if (materialId) where.materialId = materialId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        material: true,
        images: true,
        inventory: {
          include: { store: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        material: true,
        images: true,
        inventory: {
          include: { store: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    let productCode = dto.code;

    if (!productCode) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      const material = await this.prisma.material.findUnique({ where: { id: dto.materialId } });

      const catPrefix = category?.codePrefix || 'GEN';
      const matPrefix = material?.codePrefix || 'GEN';

      const count = await this.prisma.product.count();
      const numStr = (count + 1).toString().padStart(6, '0');
      productCode = `${catPrefix}-${matPrefix}-${numStr}`;
    }

    return this.prisma.product.create({
      data: {
        code: productCode,
        name: dto.name,
        description: dto.description,
        priceList: dto.priceList,
        priceCash: dto.priceCash,
        categoryId: dto.categoryId,
        materialId: dto.materialId,
        images: dto.images
          ? {
              create: dto.images.map((url, index) => ({
                url,
                isPrimary: index === 0,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        material: true,
        images: true,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        priceList: dto.priceList,
        priceCash: dto.priceCash,
        categoryId: dto.categoryId,
        materialId: dto.materialId,
        active: dto.active,
      },
      include: {
        category: true,
        material: true,
        images: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }
}
