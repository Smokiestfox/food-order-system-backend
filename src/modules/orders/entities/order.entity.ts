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
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @ApiProperty({ description: 'Order UUID' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Customer user ID' })
  @Column({ type: 'uuid', name: 'customer_id' })
  customerId!: string;

  @ApiProperty({ description: 'Restaurant ID' })
  @Column({ type: 'uuid', name: 'restaurant_id' })
  restaurantId!: string;

  @ApiProperty({ description: 'Order status', enum: OrderStatus })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @ApiProperty({ description: 'Delivery address' })
  @Column({ type: 'varchar', length: 500, name: 'delivery_address' })
  deliveryAddress!: string;

  @ApiProperty({ description: 'Subtotal before delivery fee', example: 150000 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: number;

  @ApiProperty({ description: 'Delivery fee', example: 15000 })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'delivery_fee' })
  deliveryFee!: number;

  @ApiProperty({ description: 'Total amount', example: 165000 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total!: number;

  @ApiProperty({ description: 'Payment method', example: 'cash' })
  @Column({ type: 'varchar', length: 50, default: 'cash', name: 'payment_method' })
  paymentMethod!: string;

  @ApiProperty({ description: 'Order note', nullable: true })
  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: User;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items!: OrderItem[];
}
