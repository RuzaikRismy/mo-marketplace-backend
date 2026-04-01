import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Variant } from './entities/variant.entity';
import { CreateProductDto, CreateVariantDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Variant)
    private variantRepository: Repository<Variant>,
  ) {}

  private generateCombinationKey(variant: CreateVariantDto): string {
    return `${variant.color}-${variant.size}-${variant.material}`.toLowerCase();
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { variants, ...productData } = createProductDto;

    // Check for duplicate variants within the same product
    const variantKeys = variants.map((v) => this.generateCombinationKey(v));
    const hasDuplicates = new Set(variantKeys).size !== variantKeys.length;
    if (hasDuplicates) {
      throw new ConflictException('Duplicate variant combinations found in request');
    }

    // Check if any variant combination already exists in database
    for (const variantDto of variants) {
      const combinationKey = this.generateCombinationKey(variantDto);
      const existingVariant = await this.variantRepository.findOne({
        where: { combinationKey },
      });
      
      if (existingVariant) {
        throw new ConflictException(
          `Variant combination ${combinationKey} already exists. Please use different color/size/material combination.`,
        );
      }
    }

    // Create product
    const product = this.productRepository.create(productData);
    await this.productRepository.save(product);

    // Create variants
    const variantEntities = variants.map((variantDto) => {
      const variant = this.variantRepository.create({
        ...variantDto,
        combinationKey: this.generateCombinationKey(variantDto),
        product,
      });
      return variant;
    });

    await this.variantRepository.save(variantEntities);
    product.variants = variantEntities;

    return product;
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['variants'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Update product fields
    Object.assign(product, updateProductDto);
    await this.productRepository.save(product);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  // Add this method to find variants by combination key
  async findVariantByCombinationKey(combinationKey: string): Promise<Variant> {
    const variant = await this.variantRepository.findOne({
      where: { combinationKey },
      relations: ['product'],
    });

    if (!variant) {
      throw new NotFoundException(`Variant with combination key ${combinationKey} not found`);
    }

    return variant;
  }
}