import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Variant } from './variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @OneToMany(() => Variant, (variant) => variant.product, {
    cascade: true,
    eager: true,
  })
  variants: Variant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// What cascade: true means:
// ___________________________________
// When you save a Product, all its Variants are automatically saved too
// When you delete a Product, all its Variants are automatically deleted

// What eager: true means:
//_____________________________________
// When you fetch a Product, its Variants are automatically loaded
// Without eager: false (default), you'd need to explicitly load variants: