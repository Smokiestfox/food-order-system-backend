import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepo.create({
      userId,
      restaurantId: dto.restaurantId,
      orderId: dto.orderId ?? null,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });
    const saved = await this.reviewRepo.save(review);

    // Update restaurant average rating
    await this.updateRestaurantRating(dto.restaurantId);

    return saved;
  }

  async findByRestaurant(restaurantId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { restaurantId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  private async updateRestaurantRating(restaurantId: string): Promise<void> {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.restaurant_id = :restaurantId', { restaurantId })
      .getRawOne();

    const avg = parseFloat(result?.avg ?? '0');
    await this.restaurantsService.updateRating(restaurantId, avg);
  }
}
