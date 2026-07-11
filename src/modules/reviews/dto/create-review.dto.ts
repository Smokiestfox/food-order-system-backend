import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'uuid-of-restaurant' })
  @IsUUID()
  restaurantId!: string;

  @ApiPropertyOptional({ example: 'uuid-of-order' })
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: 'Đồ ăn ngon, giao nhanh!' })
  @IsString()
  @IsOptional()
  comment?: string;
}
