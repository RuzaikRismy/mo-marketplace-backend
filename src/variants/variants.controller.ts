import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VariantsService } from './variants.service';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Variant } from '../products/entities/variant.entity';

@ApiTags('variants')
@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all variants' })
  @ApiResponse({ status: 200, description: 'Return all variants' })
  findAll(): Promise<Variant[]> {
    return this.variantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a variant by id' })
  @ApiResponse({ status: 200, description: 'Return the variant' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  findOne(@Param('id') id: string): Promise<Variant> {
    return this.variantsService.findOne(id);
  }

  @Patch('stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update variant stock (deduct quantity)' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  updateStock(@Body() updateStockDto: UpdateStockDto): Promise<Variant> {
    return this.variantsService.updateStock(updateStockDto);
  }

  @Get('check-stock/:variantId/:quantity')
  @ApiOperation({ summary: 'Check if variant has sufficient stock' })
  @ApiResponse({ status: 200, description: 'Return stock availability' })
  async checkStock(
    @Param('variantId') variantId: string,
    @Param('quantity') quantity: string,
  ): Promise<{ available: boolean; stock: number }> {
    const available = await this.variantsService.checkStock(
      variantId,
      parseInt(quantity, 10),
    );
    const variant = await this.variantsService.findOne(variantId);
    
    return {
      available,
      stock: variant.stock,
    };
  }

  @Get('low-stock/:threshold')
  @ApiOperation({ summary: 'Get variants with low stock' })
  @ApiResponse({ status: 200, description: 'Return low stock variants' })
  getLowStockVariants(@Param('threshold') threshold: string): Promise<Variant[]> {
    return this.variantsService.getLowStockVariants(parseInt(threshold, 10));
  }
}