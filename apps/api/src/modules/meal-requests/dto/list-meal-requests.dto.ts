import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum MealRequestStatusFilter {
  OPEN = 'OPEN',
  EXPIRED = 'EXPIRED',
}

export class ListMealRequestsDto {
  @ApiPropertyOptional({ description: 'lat,lng format' })
  @IsString()
  @IsOptional()
  near?: string;

  @ApiPropertyOptional({ enum: MealRequestStatusFilter })
  @IsEnum(MealRequestStatusFilter)
  @IsOptional()
  status?: MealRequestStatusFilter;
}
