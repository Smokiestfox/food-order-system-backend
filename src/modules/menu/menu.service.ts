import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemsRepository: Repository<MenuItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepository: Repository<Restaurant>,
  ) {}

  /**
   * Get all menu items for a restaurant.
   */
  async findByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    // Verify restaurant exists
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${restaurantId}" not found`);
    }

    return this.menuItemsRepository.find({
      where: { restaurantId },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Create a new menu item for a restaurant (owner only).
   */
  async create(
    restaurantId: string,
    createDto: CreateMenuItemDto,
    userId: string,
  ): Promise<MenuItem> {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${restaurantId}" not found`);
    }

    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('You can only add menu items to your own restaurant');
    }

    const menuItem = this.menuItemsRepository.create({
      ...createDto,
      restaurantId,
    });

    return this.menuItemsRepository.save(menuItem);
  }

  /**
   * Update a menu item (owner of the restaurant only).
   */
  async update(id: string, updateDto: UpdateMenuItemDto, userId: string): Promise<MenuItem> {
    const menuItem = await this.menuItemsRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    if (menuItem.restaurant.ownerId !== userId) {
      throw new ForbiddenException('You can only update menu items in your own restaurant');
    }

    Object.assign(menuItem, updateDto);
    return this.menuItemsRepository.save(menuItem);
  }

  /**
   * Delete a menu item (owner of the restaurant only).
   */
  async remove(id: string, userId: string): Promise<void> {
    const menuItem = await this.menuItemsRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    if (menuItem.restaurant.ownerId !== userId) {
      throw new ForbiddenException('You can only delete menu items in your own restaurant');
    }

    await this.menuItemsRepository.remove(menuItem);
  }

  /**
   * Find a single menu item by ID.
   */
  async findOne(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemsRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    return menuItem;
  }
}
