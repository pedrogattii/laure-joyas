import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [PrismaModule, ProductsModule, InventoryModule, SalesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
