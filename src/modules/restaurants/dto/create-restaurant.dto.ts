import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ description: 'Restaurant name', example: 'Phở Hà Nội' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Description of the restaurant' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL for the restaurant' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Street address', example: '123 Lê Lợi, Quận 1, TP.HCM' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ description: 'Contact phone number', example: '028-3823-4567' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ description: 'Food category', example: 'Vietnamese' })
  @IsString()
  @IsNotEmpty()
  category!: string;
}
