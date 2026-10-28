import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('restaurants/:restaurantId/reviews')
  @ApiOperation({ summary: 'List restaurant reviews' })
  findByRestaurant(@Param('restaurantId', ParseUUIDPipe) restaurantId: string) {
    return this.reviewsService.findByRestaurant(restaurantId);
  }

  @Post('reviews')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a review for a restaurant' })
  create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }
}
