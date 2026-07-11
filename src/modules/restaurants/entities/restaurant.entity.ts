import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { Order } from '../../orders/entities/order.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('restaurants')
export class Restaurant {
  @ApiProperty({ description: 'Restaurant UUID' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Owner user ID' })
  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId!: string;

  @ApiProperty({ description: 'Restaurant name', example: 'Phở Hà Nội' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Description', nullable: true })
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ApiProperty({ description: 'Image URL', nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_url' })
  imageUrl!: string | null;

  @ApiProperty({ description: 'Street address' })
  @Column({ type: 'varchar', length: 500 })
  address!: string;

  @ApiProperty({ description: 'Contact phone' })
  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @ApiProperty({ description: 'Average rating (0-5)', example: 4.5 })
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating!: number;

  @ApiProperty({ description: 'Whether the restaurant is active' })
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @ApiProperty({ description: 'Restaurant category', example: 'Vietnamese' })
  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.restaurant)
  menuItems!: MenuItem[];

  @OneToMany(() => Order, (order) => order.restaurant)
  orders!: Order[];

  @OneToMany(() => Review, (review) => review.restaurant)
  reviews!: Review[];
}
