import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Menu')
@Controller()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Public()
  @Get('restaurants/:restaurantId/menu')
  @ApiOperation({ summary: 'Get menu items for a restaurant' })
  @ApiResponse({ status: 200, description: 'List of menu items' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async findByRestaurant(@Param('restaurantId', ParseUUIDPipe) restaurantId: string) {
    return this.menuService.findByRestaurant(restaurantId);
  }

  @Post('restaurants/:restaurantId/menu')
  @UseGuards(RolesGuard)
  @Roles('restaurant_owner', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a menu item to a restaurant (owner only)' })
  @ApiResponse({ status: 201, description: 'Menu item created' })
  @ApiResponse({ status: 403, description: 'Not the restaurant owner' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async create(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Body() createDto: CreateMenuItemDto,
    @CurrentUser() user: User,
  ) {
    return this.menuService.create(restaurantId, createDto, user.id);
  }

  @Patch('menu/:id')
  @UseGuards(RolesGuard)
  @Roles('restaurant_owner', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a menu item (owner only)' })
  @ApiResponse({ status: 200, description: 'Menu item updated' })
  @ApiResponse({ status: 403, description: 'Not the restaurant owner' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateMenuItemDto,
    @CurrentUser() user: User,
  ) {
    return this.menuService.update(id, updateDto, user.id);
  }

  @Delete('menu/:id')
  @UseGuards(RolesGuard)
  @Roles('restaurant_owner', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a menu item (owner only)' })
  @ApiResponse({ status: 200, description: 'Menu item deleted' })
  @ApiResponse({ status: 403, description: 'Not the restaurant owner' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.menuService.remove(id, user.id);
    return { message: 'Menu item deleted successfully' };
  }
}
