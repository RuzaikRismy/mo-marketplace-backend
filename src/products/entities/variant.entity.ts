import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('variants')
@Unique(['combinationKey'])
export class Variant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  color: string;

  @Column()
  size: string;

  @Column()
  material: string;

  @Column()
  combinationKey: string;

  @Column({ default: 0 })
  stock: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


// What onDelete: 'CASCADE' means:
//_____________________________________
// When a Product is deleted from the database, all its Variants are automatically deleted
// This is enforced at the database level, not just in TypeORM