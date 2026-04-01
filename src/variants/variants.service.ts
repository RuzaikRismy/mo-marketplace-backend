import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Variant } from '../products/entities/variant.entity';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(Variant)
    private variantRepository: Repository<Variant>,
  ) {}

  async findAll(): Promise<Variant[]> {
    return this.variantRepository.find({
      relations: ['product'],
    });
  }

  async findOne(id: string): Promise<Variant> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }

    return variant;
  }

  async updateStock(updateStockDto: UpdateStockDto): Promise<Variant> {
    const { variantId, quantity } = updateStockDto;
    
    const variant = await this.findOne(variantId);

    if (variant.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${variant.stock}, Requested: ${quantity}`
      );
    }

    variant.stock -= quantity;
    await this.variantRepository.save(variant);

    return variant;
  }

  async checkStock(variantId: string, quantity: number): Promise<boolean> {
    const variant = await this.findOne(variantId);
    return variant.stock >= quantity;
  }

  async getAvailableVariants(): Promise<Variant[]> {
    return this.variantRepository.find({
      where: { stock: 0 },
      relations: ['product'],
    });
  }

  async getLowStockVariants(threshold: number = 10): Promise<Variant[]> {
    return this.variantRepository
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.product', 'product')
      .where('variant.stock <= :threshold', { threshold })
      .andWhere('variant.stock > 0')
      .orderBy('variant.stock', 'ASC')
      .getMany();
  }
}