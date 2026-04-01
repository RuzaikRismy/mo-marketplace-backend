import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantsService } from './variants.service';
import { VariantsController } from './variants.controller';
import { VariantCombinationService } from './variant-combination.service';
import { Variant } from '../products/entities/variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Variant])],
  controllers: [VariantsController],
  providers: [VariantsService, VariantCombinationService],
  exports: [VariantsService, VariantCombinationService],
})
export class VariantsModule {}