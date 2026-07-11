import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { QueryRestaurantDto } from './dto/query-restaurant.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantsRepository: Repository<Restaurant>,
  ) {}

  /**
   * Create a new restaurant owned by the given user.
   */
  async create(createDto: CreateRestaurantDto, owner: User): Promise<Restaurant> {
    const restaurant = this.restaurantsRepository.create({
      ...createDto,
      ownerId: owner.id,
    });
    return this.restaurantsRepository.save(restaurant);
  }

  /**
   * Paginated search/filter for restaurants.
   */
  async findAll(query: QueryRestaurantDto) {
    const { search, category, page = 1, limit = 10 } = query;

    const qb = this.restaurantsRepository
      .createQueryBuilder('restaurant')
      .where('restaurant.is_active = :isActive', { isActive: true });

    if (search) {
      qb.andWhere(
        '(LOWER(restaurant.name) LIKE LOWER(:search) OR LOWER(restaurant.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (category) {
      qb.andWhere('LOWER(restaurant.category) = LOWER(:category)', { category });
    }

    qb.orderBy('restaurant.rating', 'DESC')
      .addOrderBy('restaurant.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single restaurant by ID with its menu items.
   */
  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id },
      relations: ['menuItems', 'owner'],
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }

    return restaurant;
  }

  /**
   * Update a restaurant (owner only).
   */
  async update(id: string, updateDto: UpdateRestaurantDto, userId: string): Promise<Restaurant> {
    const restaurant = await this.findOne(id);

    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own restaurant');
    }

    Object.assign(restaurant, updateDto);
    return this.restaurantsRepository.save(restaurant);
  }

  /**
   * Soft-delete a restaurant by setting isActive to false (owner only).
   */
  async remove(id: string, userId: string): Promise<void> {
    const restaurant = await this.findOne(id);

    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own restaurant');
    }

    restaurant.isActive = false;
    await this.restaurantsRepository.save(restaurant);
  }

  /**
   * Find all restaurants owned by a specific user.
   */
  async findByOwner(ownerId: string): Promise<Restaurant[]> {
    return this.restaurantsRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update restaurant rating (called after a new review).
   */
  async updateRating(restaurantId: string, averageRating: number): Promise<void> {
    await this.restaurantsRepository.update(restaurantId, {
      rating: averageRating,
    });
  }
}
