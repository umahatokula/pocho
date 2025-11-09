import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateMealRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty()
  @IsInt()
  @Min(100)
  budgetMinKobo!: number;

  @ApiProperty()
  @IsInt()
  @Min(100)
  budgetMaxKobo!: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  desiredAt?: string;

  @ApiProperty()
  @IsNumber()
  deliveryLat!: number;

  @ApiProperty()
  @IsNumber()
  deliveryLng!: number;

  @ApiProperty()
  @IsString()
  addressLine!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  maxVendorOffers = 10;
}
