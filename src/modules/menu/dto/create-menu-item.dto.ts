import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty({ description: 'Item name', example: 'Phở Bò Tái' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Item description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price (in VND)', example: 55000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Category', example: 'Noodle Soup' })
  @IsString()
  @IsNotEmpty()
  category!: string;
}
