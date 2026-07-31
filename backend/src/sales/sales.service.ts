import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, MovementType } from '@prisma/client';

export class CreateSaleItemDto {
  productId: string;
  quantity: number;
}

export class CreateSaleDto {
  storeId: string;
  userId?: string;
  paymentMethod: PaymentMethod;
  items: CreateSaleItemDto[];
  notes?: string;
}

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: { storeId?: string }) {
    const where = params?.storeId ? { storeId: params.storeId } : {};
    return this.prisma.sale.findMany({
      where,
      include: {
        store: true,
        user: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        store: true,
        user: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Venta ${id} no encontrada`);
    }

    return sale;
  }

  async createSale(dto: CreateSaleDto) {
    const { storeId, userId, paymentMethod, items, notes } = dto;

    if (!items || items.length === 0) {
      throw new BadRequestException('La venta debe contener al menos un producto');
    }

    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException(`Sucursal ${storeId} no encontrada`);
    }

    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const saleItemsToCreate: {
        productId: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }[] = [];

      // 1. Validar productos, calcular precios y verificar stock
      for (const item of items) {
        if (item.quantity <= 0) {
          throw new BadRequestException('La cantidad debe ser mayor a 0');
        }

        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || !product.active) {
          throw new NotFoundException(`Producto ${item.productId} no disponible`);
        }

        // Determinar precio según método de pago (Contado vs Lista)
        const isCashOrTransfer =
          paymentMethod === PaymentMethod.CASH || paymentMethod === PaymentMethod.TRANSFER;
        const unitPrice = isCashOrTransfer ? Number(product.priceCash) : Number(product.priceList);

        const subtotal = unitPrice * item.quantity;
        totalAmount += subtotal;

        saleItemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });

        // Verificar e ingresar movimiento de inventario
        const inv = await tx.inventory.findUnique({
          where: { productId_storeId: { productId: product.id, storeId } },
        });

        const currentQty = inv ? inv.quantity : 0;
        if (currentQty < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name} en esta sucursal. Stock disponible: ${currentQty}`,
          );
        }

        // Actualizar inventario
        await tx.inventory.update({
          where: { productId_storeId: { productId: product.id, storeId } },
          data: { quantity: currentQty - item.quantity },
        });
      }

      // 2. Generar número de venta correlativo
      const count = await tx.sale.count();
      const saleNumber = `VTA-${new Date().getFullYear()}-${(count + 1).toString().padStart(6, '0')}`;

      // 3. Crear registro de Venta
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          storeId,
          userId,
          paymentMethod,
          totalAmount,
          notes,
          items: {
            create: saleItemsToCreate,
          },
        },
        include: {
          items: { include: { product: true } },
          store: true,
        },
      });

      // 4. Crear movimientos de inventario asociados
      for (const item of saleItemsToCreate) {
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: MovementType.SALE,
            quantity: -item.quantity,
            reason: `Venta ${sale.saleNumber}`,
            userId,
            saleId: sale.id,
          },
        });
      }

      return sale;
    });
  }
}
