import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('menu_items')
export class MenuItem {
  @ApiProperty({ description: 'Menu item UUID' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Restaurant ID this item belongs to' })
  @Column({ type: 'uuid', name: 'restaurant_id' })
  restaurantId!: string;

  @ApiProperty({ description: 'Item name', example: 'Phở Bò Tái' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Item description', nullable: true })
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ApiProperty({ description: 'Price in VND', example: 55000 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @ApiProperty({ description: 'Image URL', nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_url' })
  imageUrl!: string | null;

  @ApiProperty({ description: 'Whether this item is currently available' })
  @Column({ type: 'boolean', default: true, name: 'is_available' })
  isAvailable!: boolean;

  @ApiProperty({ description: 'Item category', example: 'Noodle Soup' })
  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;
}
