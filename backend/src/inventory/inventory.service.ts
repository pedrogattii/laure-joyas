import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@prisma/client';

export class CreateMovementDto {
  productId: string;
  storeId: string;
  type: MovementType;
  quantity: number; // Siempre valor positivo ingresado por el usuario
  reason?: string;
  userId?: string;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getInventory(storeId?: string) {
    const where = storeId ? { storeId } : {};
    return this.prisma.inventory.findMany({
      where,
      include: {
        product: {
          include: { category: true, material: true, images: true },
        },
        store: true,
      },
    });
  }

  async getMovements(productId?: string, limit = 50) {
    const where = productId ? { productId } : {};
    return this.prisma.inventoryMovement.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
        user: true,
      },
    });
  }

  async registerMovement(dto: CreateMovementDto) {
    const { productId, storeId, type, quantity, reason, userId } = dto;

    if (quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Producto ${productId} no encontrado`);
    }

    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException(`Sucursal ${storeId} no encontrada`);
    }

    // Calcular cambio neto en stock
    const isIncrement = type === MovementType.IN;
    const stockChange = isIncrement ? quantity : -quantity;

    return this.prisma.$transaction(async (tx) => {
      // 1. Buscar o crear registro de inventario
      const currentInventory = await tx.inventory.findUnique({
        where: {
          productId_storeId: { productId, storeId },
        },
      });

      const currentQty = currentInventory ? currentInventory.quantity : 0;
      const newQty = currentQty + stockChange;

      if (newQty < 0) {
        throw new BadRequestException(
          `Stock insuficiente para el producto ${product.name}. Stock actual: ${currentQty}`,
        );
      }

      const updatedInventory = await tx.inventory.upsert({
        where: {
          productId_storeId: { productId, storeId },
        },
        update: {
          quantity: newQty,
        },
        create: {
          productId,
          storeId,
          quantity: newQty,
        },
      });

      // 2. Registrar el movimiento
      const movement = await tx.inventoryMovement.create({
        data: {
          productId,
          type,
          quantity: stockChange,
          reason: reason || `Movimiento de tipo ${type}`,
          userId,
        },
      });

      return {
        inventory: updatedInventory,
        movement,
      };
    });
  }
}
