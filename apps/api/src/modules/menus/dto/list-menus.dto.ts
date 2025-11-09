import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListMenusDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  vendorId?: string;
}
