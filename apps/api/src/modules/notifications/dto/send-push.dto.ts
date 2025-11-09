import { ApiProperty } from '@nestjs/swagger';
import { Channel } from '@prisma/client';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class SendPushDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiProperty({ required: false, type: Object })
  @IsObject()
  @IsOptional()
  meta?: Record<string, unknown>;

  readonly channel: Channel = Channel.PUSH;
}
