import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({ description: 'Order item UUID' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Order ID' })
  @Column({ type: 'uuid', name: 'order_id' })
  orderId!: string;

  @ApiProperty({ description: 'Original menu item ID' })
  @Column({ type: 'uuid', name: 'menu_item_id' })
  menuItemId!: string;

  @ApiProperty({ description: 'Snapshot of item name at time of order' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Snapshot of item price at time of order' })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @ApiProperty({ description: 'Quantity ordered', example: 2 })
  @Column({ type: 'int' })
  quantity!: number;

  // Relations
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @ManyToOne(() => MenuItem, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem!: MenuItem;
}
