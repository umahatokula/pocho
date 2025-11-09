import { ApiProperty } from '@nestjs/swagger';
import { Channel } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendSmsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body!: string;

  readonly channel: Channel = Channel.SMS;
}
