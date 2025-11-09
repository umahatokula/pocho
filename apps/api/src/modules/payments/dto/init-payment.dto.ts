import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentProvider } from '../payments.service';

export class InitPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ enum: PaymentProvider, default: PaymentProvider.PAYSTACK })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider = PaymentProvider.PAYSTACK;
}
