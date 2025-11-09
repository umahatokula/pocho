import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateVendorDto {
  @ApiProperty()
  @IsString()
  displayName!: string;

  @ApiProperty({ default: 5 })
  @IsNumber()
  @Min(1)
  @Max(50)
  kmServiceArea = 5;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}
