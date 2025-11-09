import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Accepted offer id' })
  @IsString()
  @IsOptional()
  offerId?: string;

  @ApiPropertyOptional({ description: 'Menu item id for direct order' })
  @IsString()
  @IsOptional()
  menuItemId?: string;

  @ApiProperty()
  @IsInt()
  @Min(100)
  amountKobo!: number;

  @ApiProperty()
  @IsNumber()
  deliveryLat!: number;

  @ApiProperty()
  @IsNumber()
  deliveryLng!: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  etaMinutes?: number;
}
