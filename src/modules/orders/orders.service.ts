import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
  ) {}

  async create(customerId: string, dto: CreateOrderDto): Promise<Order> {
    // Validate all menu items belong to the same restaurant
    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const menuItems = await this.menuItemRepo.findByIds(menuItemIds);

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('One or more menu items not found');
    }

    const invalidItems = menuItems.filter(
      (m) => m.restaurantId !== dto.restaurantId || !m.isAvailable,
    );
    if (invalidItems.length > 0) {
      throw new BadRequestException(
        'Some items are unavailable or from a different restaurant',
      );
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = dto.items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
      const lineTotal = Number(menuItem.price) * item.quantity;
      subtotal += lineTotal;
      return { menuItem, quantity: item.quantity, name: menuItem.name, price: menuItem.price };
    });

    const deliveryFee = dto.deliveryFee ?? 15000;
    const total = subtotal + deliveryFee;

    // Create order
    const order = this.orderRepo.create({
      customerId,
      restaurantId: dto.restaurantId,
      deliveryAddress: dto.deliveryAddress,
      paymentMethod: dto.paymentMethod ?? 'cash',
      note: dto.note ?? null,
      subtotal,
      deliveryFee,
      total,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepo.save(order);

    // Create order items
    const items = this.orderItemRepo.create(
      orderItemsData.map((d) => ({
        orderId: savedOrder.id,
        menuItemId: d.menuItem.id,
        name: d.name,
        price: d.price,
        quantity: d.quantity,
      })),
    );
    await this.orderItemRepo.save(items);

    return this.findOne(savedOrder.id);
  }

  async findAll(userId: string, userRole: UserRole): Promise<Order[]> {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.restaurant', 'restaurant')
      .orderBy('order.createdAt', 'DESC');

    if (userRole === UserRole.CUSTOMER) {
      qb.where('order.customer_id = :userId', { userId });
    } else if (userRole === UserRole.RESTAURANT_OWNER) {
      // Join restaurant to check ownership
      qb.innerJoin(
        'restaurants',
        'r',
        'r.id = order.restaurant_id AND r.owner_id = :userId',
        { userId },
      );
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'restaurant', 'customer'],
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // Verify ownership for restaurant owners
    if (userRole === UserRole.RESTAURANT_OWNER) {
      const restaurant = await order.restaurant;
      if ((restaurant as any).ownerId !== userId) {
        throw new ForbiddenException('Not your restaurant order');
      }
    }

    order.status = dto.status;
    await this.orderRepo.save(order);
    return this.findOne(id);
  }

  async cancel(id: string, customerId: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.customerId !== customerId) {
      throw new ForbiddenException('Not your order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Only pending orders can be cancelled',
      );
    }

    order.status = OrderStatus.CANCELLED;
    await this.orderRepo.save(order);
    return this.findOne(id);
  }
}
