import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { SalesService, CreateSaleDto } from './sales.service';

@Controller('api/v1/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll(@Query('storeId') storeId?: string) {
    return this.salesService.findAll({ storeId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  createSale(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.createSale(createSaleDto);
  }
}
