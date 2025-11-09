import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mealRequestId!: string;

  @ApiProperty()
  @IsInt()
  @Min(100)
  priceKobo!: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  details?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  prepMinutes?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  slotFrom?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  slotTo?: string;
}
