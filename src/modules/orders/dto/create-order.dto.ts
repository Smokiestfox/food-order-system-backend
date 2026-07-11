import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Menu item ID', example: 'uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  menuItemId!: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Restaurant ID to order from' })
  @IsUUID()
  @IsNotEmpty()
  restaurantId!: string;

  @ApiProperty({ description: 'Delivery address', example: '123 Nguyễn Huệ, Quận 1, TP.HCM' })
  @IsString()
  @IsNotEmpty()
  deliveryAddress!: string;

  @ApiPropertyOptional({ description: 'Payment method', default: 'cash' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Order note' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ description: 'Delivery fee', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  deliveryFee?: number;

  @ApiProperty({ description: 'List of items to order', type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
