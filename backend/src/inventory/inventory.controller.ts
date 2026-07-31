import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InventoryService, CreateMovementDto } from './inventory.service';

@Controller('api/v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getInventory(@Query('storeId') storeId?: string) {
    return this.inventoryService.getInventory(storeId);
  }

  @Get('movements')
  getMovements(@Query('productId') productId?: string) {
    return this.inventoryService.getMovements(productId);
  }

  @Post('movements')
  registerMovement(@Body() createMovementDto: CreateMovementDto) {
    return this.inventoryService.registerMovement(createMovementDto);
  }
}
