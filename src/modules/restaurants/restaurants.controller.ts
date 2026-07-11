import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { QueryRestaurantDto } from './dto/query-restaurant.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List restaurants with search and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of active restaurants' })
  async findAll(@Query() query: QueryRestaurantDto) {
    return this.restaurantsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant detail with menu' })
  @ApiResponse({ status: 200, description: 'Restaurant details with menu items' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('restaurant_owner', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new restaurant (restaurant_owner only)' })
  @ApiResponse({ status: 201, description: 'Restaurant created' })
  @ApiResponse({ status: 403, description: 'Forbidden — not a restaurant owner' })
  async create(@Body() createDto: CreateRestaurantDto, @CurrentUser() user: User) {
    return this.restaurantsService.create(createDto, user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('restaurant_owner', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a restaurant (owner only)' })
  @ApiResponse({ status: 200, description: 'Restaurant updated' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the owner' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateRestaurantDto,
    @CurrentUser() user: User,
  ) {
    return this.restaurantsService.update(id, updateDto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('restaurant_owner', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft-delete a restaurant (owner only)' })
  @ApiResponse({ status: 200, description: 'Restaurant deactivated' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the owner' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.restaurantsService.remove(id, user.id);
    return { message: 'Restaurant deactivated successfully' };
  }
}
