import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { Variant } from './entities/variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Variant])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, TypeOrmModule], // Export TypeOrmModule so other modules can use Variant entity
})
export class ProductsModule {}

// 1. TypeOrmModule.forFeature([Product, Variant]): This line registers the Product and Variant entities with TypeORM, allowing us to inject repositories for these entities in our service.
// 2. controllers: [ProductsController]: This line registers the ProductsController, which will handle incoming HTTP requests related to products.
// 3. providers: [ProductsService]: This line registers the ProductsService, which contains the business logic for managing products and their variants.
// 4. exports: [ProductsService, TypeOrmModule]: This line exports the ProductsService and TypeOrmModule so that they can be used in other modules, such as the VariantsModule, which may need to access the Variant repository.