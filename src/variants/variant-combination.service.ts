import { Injectable } from '@nestjs/common';
import { CreateVariantDto } from '../products/dto/create-product.dto';

@Injectable()
export class VariantCombinationService {
  /**
   * Generate a unique combination key for a variant
   * Format: color-size-material (all lowercase, spaces replaced with hyphens)
   */
  generateCombinationKey(variant: CreateVariantDto): string {
    const normalize = (str: string) => {
      return str.toLowerCase().trim().replace(/\s+/g, '-');
    };

    return `${normalize(variant.color)}-${normalize(variant.size)}-${normalize(variant.material)}`;
  }

  /**
   * Parse a combination key back into its components
   */
  parseCombinationKey(combinationKey: string): { color: string; size: string; material: string } {
    const [color, size, material] = combinationKey.split('-');
    return { color, size, material };
  }

  /**
   * Check if two variants are the same combination
   */
  areSameCombination(variant1: CreateVariantDto, variant2: CreateVariantDto): boolean {
    return this.generateCombinationKey(variant1) === this.generateCombinationKey(variant2);
  }

  /**
   * Validate variant attributes
   */
  validateVariantAttributes(variant: CreateVariantDto): boolean {
    const validColors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple'];
    const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const validMaterials = ['cotton', 'polyester', 'wool', 'leather', 'silk', 'denim'];

    return (
      validColors.includes(variant.color.toLowerCase()) &&
      validSizes.includes(variant.size.toUpperCase()) &&
      validMaterials.includes(variant.material.toLowerCase())
    );
  }
}